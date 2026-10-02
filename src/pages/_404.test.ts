import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import stylelint from 'stylelint';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildSite, repo, type SiteBuild } from '../../scripts/test-utils/build-site.ts';

// SCR-02 Fjord Not-found page on the built output (AC-07, AC-08; screens.md SCR-02).

let site: SiteBuild;
beforeAll(() => {
  site = buildSite();
  if (site.status !== 0) throw new Error(site.log);
}, 180_000);
afterAll(() => site?.cleanup());

const html = () => readFileSync(join(site.out, '404.html'), 'utf8');
const body = () => html().match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? '';
const text = () =>
  body()
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const css = () =>
  [...html().matchAll(/<link rel="stylesheet" href="([^"]+)"/g)]
    .map(([, href]) => readFileSync(join(site.out, href ?? ''), 'utf8'))
    .join('\n');

describe('built 404.html (SCR-02)', () => {
  it('shows the code line with "Ikke funnet" marked Norwegian', () => {
    expect(body()).toMatch(/404 · <span lang="no"[^>]*>Ikke funnet<\/span>/);
  });

  it('has the h1 "Page not found" and the design body copy', () => {
    expect(body()).toMatch(/<h1[^>]*>\s*Page not found\s*<\/h1>/);
    expect(text()).toContain(
      'This page is off the map. The link may be old, or the page has moved.',
    );
    expect(body().match(/<h1\b/g)).toHaveLength(1);
  });

  it('offers exactly one action, "Back to home", linking to /', () => {
    const links = [...body().matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
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
  });

  it('asks search engines not to index it', () => {
    expect(html()).toContain('<meta name="robots" content="noindex">');
  });

  it('has no inline style, style attribute or handler attribute', () => {
    expect(html()).not.toMatch(/<style\b|\sstyle=|\son[a-z]+=/i);
  });

  it('draws the ridge as a static, hidden inline SVG coloured from the contour token', () => {
    const ridge = body().match(/<svg\b[^>]*class="[^"]*ridge[^"]*"[^>]*>/)?.[0] ?? '';
    expect(ridge).toContain('aria-hidden="true"');
    expect(ridge).toContain('focusable="false"');
    expect(css()).toMatch(/stroke:\s*var\(--fjord-color-contour-line\)/);
    expect(css()).not.toMatch(/@keyframes|animation/);
  });

  it('draws the arrow as a hidden 1.5px currentColor line icon', () => {
    const arrow = body().match(/<a\b[\s\S]*?(<svg\b[^>]*>)/)?.[1] ?? '';
    expect(arrow).toContain('aria-hidden="true"');
    expect(arrow).toContain('stroke="currentColor"');
    expect(arrow).toContain('stroke-width="1.5"');
  });

  it('gives the home-link a 44px target that changes colour only on hover and focus', () => {
    const styles = css();
    expect(styles).toMatch(/height:\s*var\(--fjord-tap-min\)/);
    expect(styles).toMatch(/background-color:\s*var\(--fjord-color-cta-hover\)/);
    expect(styles).not.toMatch(/transform/);
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
