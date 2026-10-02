import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
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

describe.each(['fixture.html', 'index.html', '404.html'])('built %s', (page) => {
  it('has a language and the head in the contract order', () => {
    expect(html(page)).toMatch(/<html lang="en"/);
    const order = headOrder(page);
    const firstOf = (item: string) => order.indexOf(item);
    expect(order.slice(0, 3)).toEqual(['charset', 'meta:viewport', 'script']);
    expect(order.slice(3, 5)).toEqual(['link:preload', 'link:preload']);
    expect(order[5]).toBe('link:stylesheet');
    expect(firstOf('title')).toBe(6);
    // A page's own scoped styles are bundled by Astro into an external stylesheet appended
    // after the layout head; the fixture page has none, so it gets exactly the layout's one.
    if (page === 'fixture.html')
      expect(order.filter((i) => i === 'link:stylesheet')).toHaveLength(1);
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
    const scripts = [...html(page).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
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
