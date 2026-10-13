import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { contact } from '../data/contact';
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
    // One stylesheet per page (home T19): the global styles (tokens, fonts, base), the Shell's
    // components and the page's own styles are joined after the build, in that order, into the one
    // file at position 5. Each link is a request before the first paint.
    expect(order.filter((i) => i === 'link:stylesheet')).toHaveLength(1);
    const sheets = [...head(page).matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(
      (m) => m[1] ?? '',
    );
    expect(sheets[0]).toMatch(/^\/_astro\/page\.[0-9a-f]{8}\.css$/);
    expect(firstOf('meta:description')).toBeGreaterThan(firstOf('title'));
    expect(firstOf('link:icon')).toBeGreaterThan(firstOf('meta:description'));
    expect(order).not.toContain('style');
  });

  it('gets the Shell styles after the global ones in its one stylesheet, and no other file is left', () => {
    const href = head(page).match(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/)?.[1] ?? '';
    const css = readFileSync(join(out, 'dist', href), 'utf8');
    expect(css.indexOf('--fjord-color-bg')).toBeGreaterThanOrEqual(0);
    expect(css.indexOf('.skip-link')).toBeGreaterThan(css.indexOf(':focus-visible'));
    // Every CSS file of the build is the one stylesheet of some page.
    const linked = new Set(
      readdirSync(join(out, 'dist'), { recursive: true, encoding: 'utf8' })
        .filter((file) => file.endsWith('.html'))
        .flatMap((file) =>
          [
            ...readFileSync(join(out, 'dist', file), 'utf8').matchAll(
              /<link rel="stylesheet" href="\/_astro\/([^"]+)"/g,
            ),
          ].map((m) => m[1] ?? ''),
        ),
    );
    const built = readdirSync(join(out, 'dist', '_astro')).filter((file) => file.endsWith('.css'));
    expect(built.sort()).toEqual([...linked].sort());
  });

  it('has a plain viewport with no viewport-fit (no safe-area padding yet, review F-18)', () => {
    expect(head(page)).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
    );
  });

  it('inlines the bootstrap verbatim as the first and only inline script', () => {
    // The Shell's behaviour is external module bundles (`src=`); inline code is the bootstrap only.
    const scripts = [...html(page).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(
      ([, attrs = '']) => !/\ssrc=/.test(` ${attrs}`) && !/ld\+json/.test(attrs),
    );
    expect(scripts).toHaveLength(1);
    expect(scripts[0]?.[1]?.trim()).toBe('');
    expect(scripts[0]?.[2]).toBe(bootstrap);
  });

  it('preloads exactly the two variable brand files as crossorigin woff2', () => {
    const preloads = [...head(page).matchAll(/<link\b[^>]*rel="preload"[^>]*>/g)].map(
      ([tag]) => tag,
    );
    expect(preloads).toHaveLength(2);
    expect(preloads[0]).toContain('href="/fonts/schibsted-grotesk-wght.woff2"');
    expect(preloads[1]).toContain('href="/fonts/jetbrains-mono-wght.woff2"');
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

// release-1 AC-01, D-01: the script of the Cloudflare dashboard, as issued, ends the body.
describe.each(['fixture.html', '404.html'])('the Web Analytics script on %s (AC-01)', (page) => {
  type Element = DefaultTreeAdapterMap['element'];
  const SRC = 'https://static.cloudflareinsights.com/beacon.min.js';
  const elementsOf = (node: DefaultTreeAdapterMap['node']): Element[] =>
    'childNodes' in node
      ? node.childNodes.flatMap((child) => ('tagName' in child ? [child] : []))
      : [];
  const all = (node: Element): Element[] => [node, ...elementsOf(node).flatMap(all)];
  const root = () => elementsOf(parse(html(page))).find((el) => el.tagName === 'html') as Element;

  it('is the last element of the body, with the attributes of spec D-01 and no body', () => {
    const body = elementsOf(root()).find((el) => el.tagName === 'body') as Element;
    const last = elementsOf(body).at(-1);
    expect(last?.tagName).toBe('script');
    expect(Object.fromEntries((last?.attrs ?? []).map((a) => [a.name, a.value]))).toEqual({
      type: 'module',
      src: SRC,
      'data-cf-beacon': '{"token": "145a994b908a49539c57bf82ca84fb4f"}',
    });
    expect(last?.childNodes).toEqual([]);
  });

  it('is on the page once', () => {
    const scripts = all(root()).filter(
      (el) => el.tagName === 'script' && el.attrs.some((a) => a.name === 'src' && a.value === SRC),
    );
    expect(scripts).toHaveLength(1);
  });
});

// release-1 AC-06, D-06 (a): the Shell's behaviour is one file, one request, on every page.
describe('the Shell scripts (release-1 AC-06)', () => {
  const ownScripts = (page: string) =>
    [...html(page).matchAll(/<script\b[^>]*\ssrc="(\/[^"]+)"/g)].map((m) => m[1] ?? '');
  const pages = () =>
    readdirSync(join(out, 'dist'), { recursive: true, encoding: 'utf8' })
      .filter((file) => file.endsWith('.html'))
      .map((file) => file.split(sep).join('/'));

  it('a page with no script of its own loads exactly one script file of the site', () => {
    expect(ownScripts('fixture.html')).toHaveLength(1);
  });

  it('every page loads that one file, once, and at most one more of its own', () => {
    const [shell] = ownScripts('fixture.html');
    expect(pages().length).toBeGreaterThanOrEqual(5);
    for (const page of pages()) {
      const scripts = ownScripts(page);
      expect(
        scripts.filter((src) => src === shell),
        page,
      ).toHaveLength(1);
      expect(scripts.length, page).toBeLessThanOrEqual(2);
    }
  });

  it('the one file wires the header, the menu, the theme switch, the action bar and the Toast', () => {
    const [shell = ''] = ownScripts('fixture.html');
    const code = readFileSync(join(out, 'dist', shell), 'utf8');
    for (const hook of [
      'data-header-sentinel',
      'mobile-menu',
      'data-theme-button',
      'data-shell-bar',
      '--fjord-duration-toast',
    ])
      expect(code, hook).toContain(hook);
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
  it('the data points the CV link at the canonical English page', () => {
    expect(contact.links.cv).toBe('/cv/en');
  });

  it.each([
    ['current-cv', contact.links.cv],
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

describe('page option headerOverHero (AC-33, ADR-0001)', () => {
  it('true renders data-over-hero on the header', () => {
    expect(headerTag(opt('over-hero'))).toMatch(/\sdata-over-hero(?:=""|\s|>)/);
  });

  it('false is the same as leaving it out: no attribute on the header', () => {
    expect(headerTag(opt('over-hero-off'))).toBe(headerTag(html('fixture.html')));
    expect(headerTag(html('fixture.html'))).not.toContain('data-over-hero');
    expect(headerTag(html('404.html'))).not.toContain('data-over-hero');
  });

  it('does not change the header call to action: no secondary hook is set for it', () => {
    expect(headerTag(opt('over-hero'))).not.toContain('data-cta');
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

describe('page option backToTop (AC-21, AC-22, sad §5)', () => {
  /** The BackToTop link: a link to #top. */
  const backToTop = (source: string) => tag(source, /<a\b(?=[^>]*\bhref="#top")[^>]*>/);

  it('is rendered by default, after the footer, as a link named "Back to top"', () => {
    const source = html('fixture.html');
    expect(backToTop(source)).not.toBe('');
    expect(count(source, /\bhref="#top"/g)).toBe(1);
    const link = source.match(/<a\b(?=[^>]*\bhref="#top")[^>]*>[\s\S]*?<\/a>/)?.[0] ?? '';
    expect(link.replace(/<[^>]+>/g, ' ')).toMatch(/Back to top/);
    expect(source.indexOf('href="#top"')).toBeGreaterThan(source.indexOf('</main>'));
  });

  it('true is the same as the default', () => {
    expect(backToTop(opt('back-to-top-on'))).not.toBe('');
    expect(backToTop(opt('back-to-top-on'))).toBe(backToTop(html('fixture.html')));
  });

  it('false leaves it out and keeps the rest of the Shell', () => {
    const source = opt('back-to-top-off');
    expect(source).not.toContain('href="#top"');
    expect(source).toContain('class="fj-band');
    expect(source).toContain('<footer');
  });

  it('is marked English on a Norwegian page and carries no lang on an English one', () => {
    expect(backToTop(html('fixture-no.html'))).toMatch(/\slang="en"/);
    expect(backToTop(html('fixture.html'))).not.toContain('lang=');
  });

  it('is on the home page and the Not-found page', () => {
    for (const page of ['index.html', '404.html']) expect(html(page)).toContain('href="#top"');
  });

  // The link hides at the top while it still has focus, and where "#top" named no element the
  // next Tab did not reach the skip link in about one run of fifteen. An explicit target before the
  // skip link is where the browser starts the next Tab from.
  it('targets one empty element with the id "top", the first in the body, before the skip link', () => {
    for (const page of ['fixture.html', 'index.html', '404.html']) {
      const source = html(page);
      expect(count(source, /\sid="top"/g)).toBe(1);
      expect(source).toMatch(/<body[^>]*>\s*<span id="top"><\/span>\s*<a\b[^>]*class="skip-link"/);
    }
  });

  it('leaves the target out with the link', () => {
    expect(html('fixture-opt/back-to-top-off.html')).not.toMatch(/\sid="top"/);
  });
});

describe('page option mobileBarActions (AC-38, ADR-0002)', () => {
  /** The anchors inside the bar's root element. */
  const barAnchors = (source: string) => {
    const bar = source.match(/<details[^>]*data-shell-bar[^>]*>([\s\S]*?)<\/details>/)?.[1] ?? '';
    return [...bar.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
  };

  it('the default gives "View CV" and "Add to contacts", both secondary', () => {
    const [cv, save, ...rest] = barAnchors(html('fixture.html'));
    expect(rest).toEqual([]);
    expect(cv).toContain(`href="${contact.links.cv}"`);
    expect(cv).toContain('View CV');
    expect(save).toContain('href="/alexander-ponomarenko.vcf"');
    expect(save).toContain('Add to contacts');
    expect(save).toMatch(/\sdownload(?:=""|\s|>)/);
    for (const anchor of [cv, save]) {
      expect(anchor).toContain('fj-btn--secondary');
      expect(anchor).not.toContain('fj-btn--primary');
    }
  });

  it('a page option reaches the bar: its pair replaces the default one', () => {
    const [first, second, ...rest] = barAnchors(opt('bar-custom'));
    expect(rest).toEqual([]);
    expect(first).toContain('href="/projects/example"');
    expect(first).toContain('Read the case study');
    expect(second).toContain('href="/brief.pdf"');
    expect(second).toContain('Get the brief');
    for (const anchor of [first, second]) expect(anchor).toContain('fj-btn--secondary');
    expect(opt('bar-custom')).not.toContain('Add to contacts');
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

describe('page option ctaBandActions (AC-40, ADR-0002)', () => {
  /** The anchors inside the closing band. */
  const bandAnchors = (source: string) => {
    const band =
      source.match(/<section\s[^>]*class="fj-band[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? '';
    return [...band.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
  };

  it('a page option reaches the band: its pair replaces the default one, variants kept', () => {
    const source = opt('band-custom');
    const [first, second, ...rest] = bandAnchors(source);
    expect(rest).toEqual([]);
    expect(first).toContain('href="/projects/example"');
    expect(first).toContain('Read the case study');
    expect(first).toContain('fj-btn--primary');
    expect(second).toContain('href="/brief.pdf"');
    expect(second).toContain('Get the brief');
    expect(second).toContain('fj-btn--secondary');
    expect(second).toMatch(/\sdownload(?:=""|\s|>)/);
    // The header keeps its own "Get in touch", so only the band's anchors are checked.
    const band = bandAnchors(source).join('');
    expect(band).not.toContain('Get in touch');
    expect(band).not.toContain('-cv-en.pdf');
  });

  it('without the option the band has the default pair: "Get in touch" primary, then "Download CV"', () => {
    const [first, second, ...rest] = bandAnchors(html('fixture.html'));
    expect(rest).toEqual([]);
    expect(first).toContain('Get in touch');
    expect(first).toContain('fj-btn--primary');
    expect(second).toContain('Download CV');
    expect(second).toContain('fj-btn--secondary');
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

describe('page option canonical (AC-16)', () => {
  it('sets the canonical link and og:url to the given site path', () => {
    const page = 'fixture-opt/canonical.html';
    expect(canonicalTag(page)).toContain('href="https://alpon.dev/cv/en"');
    expect(metaContent(page, 'og:url')).toBe('https://alpon.dev/cv/en');
  });

  it('the default is still the page own path', () => {
    const page = 'fixture-opt/bar-on.html';
    expect(canonicalTag(page)).toContain('href="https://alpon.dev/fixture-opt/bar-on"');
    expect(metaContent(page, 'og:url')).toBe('https://alpon.dev/fixture-opt/bar-on');
  });
});

describe('page option alternates (AC-17)', () => {
  const alternates = (page: string) =>
    [...head(page).matchAll(/<link\b[^>]*rel="alternate"[^>]*>/g)].map(([m]) => m);

  it('renders one link per entry with its hreflang and absolute address', () => {
    const links = alternates('fixture-opt/alternates.html');
    expect(links).toHaveLength(3);
    const pairs = links.map((l) => [
      l.match(/hreflang="([^"]*)"/)?.[1],
      l.match(/href="([^"]*)"/)?.[1],
    ]);
    expect(pairs).toEqual([
      ['en', 'https://alpon.dev/cv/en'],
      ['no', 'https://alpon.dev/cv/no'],
      ['x-default', 'https://alpon.dev/cv/en'],
    ]);
  });

  it('renders none by default', () => {
    expect(alternates('fixture.html')).toEqual([]);
    expect(alternates('fixture-opt/bar-on.html')).toEqual([]);
  });
});

describe('a Norwegian page marks the Shell English (AC-02, AC-20)', () => {
  const source = () => html('fixture-no.html');
  const body = () => source().match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? '';

  it('has <html lang="no"> and a main without a lang of its own', () => {
    expect(source()).toMatch(/<html lang="no"/);
    expect(tag(body(), /<main\b[^>]*>/)).not.toContain('lang=');
  });

  it.each([
    ['skip link', /<a\b[^>]*class="skip-link[^>]*>/],
    ['header', /<header\b[^>]*>/],
    ['menu panel', /<dialog\b[^>]*id="mobile-menu"[^>]*>/],
    ['closing band', /<section\b[^>]*class="fj-band[^>]*>/],
    ['footer', /<footer\b[^>]*>/],
    ['bar frame', /<details\b[^>]*data-shell-bar[^>]*>/],
    ['Toast region', /<[^>]*data-toast-region[^>]*>/],
  ])('the %s carries lang="en"', (_name, pattern) => {
    const found = tag(body(), pattern);
    expect(found).not.toBe('');
    expect(found).toMatch(/\slang="en"/);
  });

  it('the CV link of header and menu follows cvLang, and the band downloads the NO PDF', () => {
    const marked = [...body().matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)].map(([a]) => a);
    expect(marked).toHaveLength(2);
    for (const anchor of marked) expect(anchor).toContain(`href="${contact.links.cvPages.no}"`);
    expect(bandDownload(source())).toContain('href="/cv/alexander-ponomarenko-cv-no.pdf"');
  });

  it('an English page leaves the Shell without a lang of its own', () => {
    expect(tag(html('fixture.html'), /<header\b[^>]*>/)).not.toContain('lang=');
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

// Head meta and structured data (AC-26, T4; sad §8).

const metaTags = (page: string) => [...head(page).matchAll(/<meta\b[^>]*>/g)].map(([m]) => m);
/** The content of the meta tag whose property or name is `key`, or undefined. */
const metaContent = (page: string, key: string) =>
  metaTags(page)
    .find((m) => new RegExp(`\\b(?:property|name)="${key}"`).test(m))
    ?.match(/\bcontent="([^"]*)"/)?.[1];
const canonicalTag = (page: string) => head(page).match(/<link\b[^>]*rel="canonical"[^>]*>/)?.[0];
const ldBlocks = (page: string) => [
  ...head(page).matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
];

describe.each([
  ['fixture.html', 'https://alpon.dev/fixture', 'Fixture page'],
  ['index.html', 'https://alpon.dev/', undefined],
])('head meta of the indexable %s (AC-26)', (page, url, title) => {
  it('has the canonical address from the site and the page address', () => {
    expect(canonicalTag(page)).toContain(`href="${url}"`);
  });

  it('has og:title, og:description and og:url', () => {
    expect(metaContent(page, 'og:title')).toBe(
      title ?? head(page).match(/<title>([^<]*)<\/title>/)?.[1],
    );
    expect(metaContent(page, 'og:description')).toBe(metaContent(page, 'description'));
    expect(metaContent(page, 'og:url')).toBe(url);
  });

  it('has og:image at 1200 x 630 and the large Twitter card', () => {
    expect(metaContent(page, 'og:image')).toBe('https://alpon.dev/og.png');
    expect(metaContent(page, 'og:image:width')).toBe('1200');
    expect(metaContent(page, 'og:image:height')).toBe('630');
    expect(metaContent(page, 'twitter:card')).toBe('summary_large_image');
  });
});

describe('head meta of the noindex 404 page (AC-26)', () => {
  it('has no canonical, no og tags and no Twitter card, and keeps noindex', () => {
    expect(canonicalTag('404.html')).toBeUndefined();
    expect(
      metaTags('404.html').filter((m) => /(?:property|name)="(?:og|twitter):/.test(m)),
    ).toEqual([]);
    expect(head('404.html')).toContain('<meta name="robots" content="noindex">');
  });
});

describe('structuredData (AC-26)', () => {
  const expected = { '@type': 'Person', name: 'A </script><b>x</b> & <i>', list: [1, 'two'] };

  it('renders exactly one ld+json block in the head that parses back to the object', () => {
    const blocks = ldBlocks('fixture-structured.html');
    expect(blocks).toHaveLength(1);
    expect(JSON.parse(blocks[0]?.[1] ?? '')).toEqual(expected);
  });

  it('escapes "<" so a value with </script> cannot close the block', () => {
    const body = ldBlocks('fixture-structured.html')[0]?.[1] ?? '';
    expect(body).not.toContain('<');
    expect(body).toContain('\\u003c');
  });

  it('renders no block when the page passes none, and the build passes the CSP integration', () => {
    expect(ldBlocks('fixture.html')).toHaveLength(0);
    expect(readFileSync(join(out, 'dist', '_headers'), 'utf8')).toContain("script-src 'self'");
  });
});

describe('main rules in base.css (AC-26, B-18)', () => {
  const css = () => {
    const dir = join(out, 'dist/_astro');
    return readdirSync(dir)
      .filter((file) => file.endsWith('.css'))
      .map((file) => readFileSync(join(dir, file), 'utf8'))
      .join('\n');
  };
  const rule = (selector: string) =>
    [...css().matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter((m) => (m[1] ?? '').split(',').some((s) => s.trim() === selector))
      .map((m) => m[2])
      .join(';');

  // The design value, as a literal: tokens.css has no size for it and sizes are outside the token
  // rule (base-components ADR-0004).
  it('gives main the minimum height of the page design', () => {
    expect(rule('main')).toMatch(/min-height:s*60vh/);
  });

  it('shows no outline on a focused main', () => {
    expect(rule('main:focus')).toMatch(/outline:\s*(?:none|0)/);
  });
});
