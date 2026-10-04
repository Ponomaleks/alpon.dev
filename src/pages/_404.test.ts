import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import stylelint from 'stylelint';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildSite, repo, type SiteBuild } from '../../scripts/test-utils/build-site.ts';

// SCR-02 Fjord Not-found page on the built output (AC-17, AC-18; screens.md SCR-02).

let site: SiteBuild;
beforeAll(() => {
  site = buildSite();
  if (site.status !== 0) throw new Error(site.log);
}, 180_000);
afterAll(() => site?.cleanup());

const html = () => readFileSync(join(site.out, '404.html'), 'utf8');
const body = () => html().match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? '';
// The Shell (header, footer, bar) has its own links; the page's content is what is inside main.
const content = () => body().match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
const text = () =>
  body()
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

describe('built 404.html (SCR-02)', () => {
  it('shows the code line with "Ikke funnet" marked Norwegian', () => {
    expect(body()).toMatch(/<b[^>]*>404<\/b> \/ <span lang="no"[^>]*>Ikke funnet<\/span>/);
  });

  it('sets the code number "404" in the link colour, as the design eyebrow does', () => {
    const assets = join(site.out, '_astro');
    const css = readdirSync(assets)
      .filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(join(assets, f), 'utf8'))
      .join('\n');
    const rule = css.match(/\.code[^{},]*\sb[^{},]*\{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toMatch(/color:\s*var\(--fjord-color-link\)/);
  });

  it('has the h1 "This page is off the map." and the design body copy', () => {
    expect(body()).toMatch(/<h1[^>]*>\s*This page is off the map\.\s*<\/h1>/);
    expect(text()).toContain('The link may be old, or the page has moved.');
    expect(body().match(/<h1\b/g)).toHaveLength(1);
  });

  it('offers exactly one action inside main, "Back to home", linking to /', () => {
    const links = [...content().matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
    expect(links).toHaveLength(1);
    expect(links[0]?.[1]).toMatch(/href="\/"/);
    expect(
      links[0]?.[2]
        ?.replace(/<svg[\s\S]*?<\/svg>/, '')
        .replace(/<[^>]+>/g, '')
        .trim(),
    ).toBe('Back to home');
  });

  it('never offers "See projects" or a projects path (AC-08)', () => {
    expect(text()).not.toMatch(/see projects/i);
    expect(body()).not.toMatch(/href="\/projects/);
    expect(content()).not.toMatch(/href="\/projects/);
  });

  it('asks search engines not to index it', () => {
    expect(html()).toContain('<meta name="robots" content="noindex">');
  });

  it('has no inline style, style attribute or handler attribute', () => {
    expect(html()).not.toMatch(/<style\b|\sstyle=|\son[a-z]+=/i);
  });
});

describe('src/pages/404.astro', () => {
  it('has zero Stylelint findings', async () => {
    const { results } = await stylelint.lint({
      files: join(repo, 'src/pages/404.astro'),
      cwd: repo,
    });
    expect(results[0]?.warnings).toEqual([]);
  });
});
