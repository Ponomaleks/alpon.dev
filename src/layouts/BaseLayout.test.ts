import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// BaseLayout head contract (sad §8, AC-13, AC-06): a real production build into a throwaway
// directory, with a fixture page injected that passes only a title and a description.

const repo = fileURLToPath(new URL('../../', import.meta.url));
const bootstrap = readFileSync(join(repo, 'src/scripts/theme-bootstrap.js'), 'utf8');
let out = '';

beforeAll(() => {
  out = mkdtempSync(join(tmpdir(), 'fjord-layout-'));
  const astro = join(repo, 'node_modules/astro/bin/astro.mjs');
  const config = 'src/layouts/fixtures/astro.fixture.config.mjs';
  const build = spawnSync(process.execPath, [astro, 'build', '--config', config], {
    cwd: repo,
    encoding: 'utf8',
    env: {
      ...process.env,
      ASTRO_TELEMETRY_DISABLED: '1',
      FJORD_FIXTURE_OUT_DIR: join(out, 'dist'),
    },
  });
  if (build.status !== 0)
    throw new Error(`astro build failed:
${build.stdout}
${build.stderr}`);
}, 180_000);

afterAll(() => {
  if (out) rmSync(out, { recursive: true, force: true });
});

const html = (page: string) => readFileSync(join(out, 'dist', page), 'utf8');
const head = (page: string) => html(page).match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? '';

/** The head's elements in order, each as a short descriptor. */
function headOrder(page: string): string[] {
  return [...head(page).matchAll(/<(meta|script|link|title|style)\b([^>]*)>/g)].map(
    ([, tag, attrs = '']) => {
      const attr = (name: string) => attrs.match(new RegExp(`${name}="([^"]*)"`))?.[1];
      if (tag === 'meta') return attrs.includes('charset') ? 'charset' : `meta:${attr('name')}`;
      if (tag === 'link') return `link:${attr('rel')}`;
      return tag ?? '';
    },
  );
}

describe.each([
  'fixture.html',
  'index.html',
  '404.html',
  'fixture-opt/bar-off.html',
  'fixture-opt/band-off.html',
])('built %s', (page) => {
  it('has a language and the head in the contract order', () => {
    expect(html(page)).toMatch(/<html lang="en"/);
    const order = headOrder(page);
    const firstOf = (item: string) => order.indexOf(item);
    expect(order.slice(0, 3)).toEqual(['charset', 'meta:viewport', 'script']);
    expect(order.slice(3, 5)).toEqual(['link:preload', 'link:preload']);
    expect(order[5]).toBe('link:stylesheet');
    expect(firstOf('title')).toBe(6);
    // The head contract fixes the order and says "stylesheets". The layout ships two: the global
    // one (tokens, fonts, base) at position 5, and the Shell's component bundle. A page's own
    // scoped styles would be a further sheet; the fixture page has none, so it gets exactly these.
    if (page === 'fixture.html') {
      expect(order.filter((i) => i === 'link:stylesheet')).toHaveLength(2);
      const sheets = [
        ...head(page).matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g),
      ].map((m) => m[1] ?? '');
      expect(sheets[0]).toMatch(/\/global\.[^/]*\.css$/);
      expect(sheets[1]).toMatch(/\/BaseLayout\.[^/]*\.css$/);
    }
    expect(firstOf('meta:description')).toBeGreaterThan(firstOf('title'));
    expect(firstOf('link:icon')).toBeGreaterThan(firstOf('meta:description'));
    expect(order).not.toContain('style');
  });

  it('has a plain viewport with no viewport-fit (no safe-area padding yet, review F-18)', () => {
    expect(head(page)).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
    );
  });

  it('inlines the bootstrap verbatim as the first and only inline script', () => {
    // The Shell's behaviour is external module bundles (`src=`); inline code is the bootstrap only.
    const scripts = [...html(page).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(
      ([, attrs = '']) => !/\ssrc=/.test(` ${attrs}`),
    );
    expect(scripts).toHaveLength(1);
    expect(scripts[0]?.[1]?.trim()).toBe('');
    expect(scripts[0]?.[2]).toBe(bootstrap);
  });

  it('preloads exactly Schibsted Grotesk 400 and 600 as crossorigin woff2', () => {
    const preloads = [...head(page).matchAll(/<link\b[^>]*rel="preload"[^>]*>/g)].map(
      ([tag]) => tag,
    );
    expect(preloads).toHaveLength(2);
    expect(preloads[0]).toContain('href="/fonts/schibsted-grotesk-400.woff2"');
    expect(preloads[1]).toContain('href="/fonts/schibsted-grotesk-600.woff2"');
    for (const tag of preloads) {
      expect(tag).toContain('as="font"');
      expect(tag).toContain('type="font/woff2"');
      expect(tag).toMatch(/\bcrossorigin\b/);
    }
  });

  it('links the stylesheet with tokens, then fonts, then base styles', () => {
    const hrefs = [...head(page).matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(
      (m) => m[1] ?? '',
    );
    expect(hrefs.length).toBeGreaterThan(0);
    const css = hrefs.map((href) => readFileSync(join(out, 'dist', href), 'utf8')).join('\n');
    const tokens = css.indexOf('--fjord-color-bg');
    const fonts = css.indexOf('@font-face');
    const base = css.indexOf(':focus-visible');
    expect([tokens, fonts, base].every((i) => i >= 0)).toBe(true);
    expect(tokens).toBeLessThan(fonts);
    expect(fonts).toBeLessThan(base);
  });
});

describe('page-specific head', () => {
  it('the fixture page gets its title and description with no other setup', () => {
    expect(head('fixture.html')).toContain('<title>Fixture page</title>');
    expect(head('fixture.html')).toContain('content="A page with only a title and a description."');
    expect(head('fixture.html')).not.toContain('noindex');
  });

  it('the 404 page keeps noindex', () => {
    expect(head('404.html')).toContain('<meta name="robots" content="noindex">');
  });
});

describe('Norwegian (review 2026-10-02 F-11, F-12)', () => {
  it('a Norwegian page is marked lang="no", the code the inline spans use', () => {
    expect(html('fixture-no.html')).toMatch(/<html lang="no"/);
  });

  it('home marks "Oslo, Norge" as Norwegian', () => {
    expect(html('index.html')).toMatch(/<span lang="no"[^>]*>Oslo, Norge<\/span>/);
  });
});

// The Shell and the page options of BaseLayout (AC-24, AC-06, AC-07, AC-13, AC-30; sad §5).

const opt = (name: string) => html(`fixture-opt/${name}.html`);
const tag = (source: string, pattern: RegExp) => source.match(pattern)?.[0] ?? '';
const headerTag = (source: string) => tag(source, /<header\b[^>]*>/);
const count = (source: string, pattern: RegExp) => source.match(pattern)?.length ?? 0;
const bandDownload = (source: string) =>
  tag(source, /<a\b[^>]*\bdownload\b[^>]*>(?=\s*Download CV)/);

describe('the Shell around a page (AC-06, AC-07, AC-24)', () => {
  it('puts skip link, header, main, band, footer, bar and Toast region in this order', () => {
    const source = html('fixture.html');
    const at = (needle: string | RegExp) => {
      const index = typeof needle === 'string' ? source.indexOf(needle) : source.search(needle);
      expect(index, String(needle)).toBeGreaterThan(-1);
      return index;
    };
    const order = [
      at('class="skip-link'),
      at(/<header\b/),
      at('<main id="main" tabindex="-1">'),
      at('</main>'),
      at('class="fj-band'),
      at(/<footer\b/),
      at('data-shell-bar'),
      at('data-toast-region'),
    ];
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('makes the skip link the first focusable element and points it at main', () => {
    const body = html('fixture.html').match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? '';
    const first = body.match(/<(a|button|input|select|textarea|dialog)\b[^>]*>/)?.[0] ?? '';
    expect(first).toContain('class="skip-link');
    expect(first).toContain('href="#main"');
  });

  it('wraps the page content in exactly one focusable <main id="main">', () => {
    const source = html('fixture.html');
    expect(count(source, /<main\b/g)).toBe(1);
    expect(source).toMatch(/<main id="main" tabindex="-1">\s*<h1>Fixture<\/h1>\s*<\/main>/);
  });

  it('renders the Toast region as one polite live region outside main', () => {
    const source = html('fixture.html');
    expect(count(source, /data-toast-region/g)).toBe(1);
    expect(tag(source, /<[^>]*data-toast-region[^>]*>/)).toContain('role="status"');
    expect(source.indexOf('data-toast-region')).toBeGreaterThan(source.indexOf('</main>'));
  });

  it('a page that passes only a title and a description gets the full Shell (defaults)', () => {
    const source = html('fixture.html');
    const header = headerTag(source);
    expect(header).not.toContain('data-cta');
    expect(header).not.toContain('data-variant="on-spruce"');
    expect(header).not.toContain('fjord-on-spruce');
    expect(source).toContain('data-shell-bar');
    expect(source).toContain('class="fj-band');
    expect(bandDownload(source)).toContain('href="/cv/alexander-ponomarenko-cv-en.pdf"');
    expect(source).not.toMatch(/aria-current="page"/);
    expect(source).toContain('id="mobile-menu"');
  });
});

describe('page option current', () => {
  it.each([
    ['current-cv', '/cv'],
    ['current-contact', '/#contact'],
  ])('%s marks the %s link in the header and in the menu', (name, href) => {
    const source = opt(name);
    const current = [...source.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)].map(([a]) => a);
    expect(current).toHaveLength(2);
    for (const anchor of current) expect(anchor).toContain(`href="${href}"`);
    expect(source.slice(source.indexOf('id="mobile-menu"'))).toMatch(/aria-current="page"/);
  });
});

describe('page option headerVariant', () => {
  it('on-spruce sets the on-spruce variant on the header', () => {
    const header = headerTag(opt('variant-on-spruce'));
    expect(header).toContain('data-variant="on-spruce"');
    expect(header).toContain('fjord-on-spruce');
  });

  it('default (explicit) is the same as leaving it out', () => {
    expect(headerTag(opt('variant-default'))).toBe(headerTag(html('fixture.html')));
  });
});

describe('page option headerCta', () => {
  it('secondary forces the outlined header call to action', () => {
    expect(headerTag(opt('cta-secondary'))).toContain('data-cta="secondary"');
  });

  it('auto (explicit) is the same as leaving it out', () => {
    expect(headerTag(opt('cta-auto'))).toBe(headerTag(html('fixture.html')));
    expect(headerTag(opt('cta-auto'))).not.toContain('data-cta');
  });
});

describe('page option mobileBar', () => {
  it('false leaves the Sticky action bar out of the HTML and keeps the rest of the Shell', () => {
    const source = opt('bar-off');
    expect(source).not.toContain('data-shell-bar');
    expect(source).not.toContain('mobile-bar');
    expect(source).toContain('class="fj-band');
    expect(source).toContain('data-toast-region');
  });

  it('true is the default', () => {
    expect(opt('bar-on')).toContain('data-shell-bar');
  });
});

describe('page option ctaBand', () => {
  it('false leaves the closing band out of the HTML and keeps the rest of the Shell', () => {
    const source = opt('band-off');
    expect(source).not.toContain('fj-band');
    expect(source).not.toContain('Let’s build something good together.');
    expect(source).toMatch(/<footer\b/);
    expect(source).toContain('data-shell-bar');
  });

  it('true is the default', () => {
    expect(opt('band-on')).toContain('class="fj-band');
  });
});

describe('page option cvLang', () => {
  it('en downloads the English PDF, as by default', () => {
    expect(bandDownload(opt('cvlang-en'))).toContain('href="/cv/alexander-ponomarenko-cv-en.pdf"');
  });

  it('no downloads the Norwegian PDF', () => {
    const anchor = bandDownload(opt('cvlang-no'));
    expect(anchor).toContain('href="/cv/alexander-ponomarenko-cv-no.pdf"');
    expect(anchor).not.toContain('-en.pdf');
  });
});

describe('bar clearance (AC-07, hook H-2)', () => {
  it('base.css reserves space below 768 only when the page has the bar', () => {
    const dir = join(out, 'dist/_astro');
    const css = readdirSync(dir)
      .filter((file) => file.endsWith('.css'))
      .map((file) => readFileSync(join(dir, file), 'utf8'))
      .join('\n');
    expect(css).toMatch(/scroll-padding-(bottom|block-end)\s*:/);
    expect(css).toMatch(/:has\(\[data-shell-bar\]/);
  });
});
