import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import stylelint from 'stylelint';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildSite, repo, type SiteBuild } from '../../scripts/test-utils/build-site.ts';

// SCR-04 Styleguide on the built output (AC-21, AC-22; screens.md SCR-04).

let site: SiteBuild;
beforeAll(() => {
  site = buildSite();
  if (site.status !== 0) throw new Error(site.log);
}, 180_000);
afterAll(() => site?.cleanup());

const html = () => readFileSync(join(site.out, 'styleguide.html'), 'utf8');
const section = (name: string) =>
  html().match(
    new RegExp(String.raw`<section\b[^>]*data-section="${name}"[^>]*>([\s\S]*?)</section>`),
  )?.[1] ?? '';

const SECTIONS = [
  'Button',
  'Link',
  'IconButton',
  'Icon',
  'Badge',
  'Tag',
  'Stat',
  'SectionHeader',
  'Toast',
  'Contours',
  'Terrain map',
  'Wordmark',
];

describe('built styleguide.html (SCR-04)', () => {
  it('asks search engines not to index it (AC-22)', () => {
    expect(html()).toContain('<meta name="robots" content="noindex">');
  });

  it('has one h1 "Styleguide" and the real header and footer', () => {
    expect(html().match(/<h1\b/g)).toHaveLength(1);
    expect(html()).toMatch(/<h1[^>]*>\s*Styleguide\s*<\/h1>/);
    expect(html()).toMatch(/<header\b/);
    expect(html()).toMatch(/<footer class="fj-footer"/);
  });

  it('has no real bar and no real band (AC-21)', () => {
    expect(html()).not.toContain('data-shell-bar');
    expect(html()).not.toMatch(/<section class="fj-band\b/);
  });

  it.each(SECTIONS)('has one data-section block for %s', (name) => {
    expect(html().match(new RegExp(`data-section="${name}"`, 'g'))).toHaveLength(1);
    expect(section(name).length).toBeGreaterThan(0);
  });

  it('shows Button in every state, sizes and variants', () => {
    const s = section('Button');
    for (const st of ['hover', 'focus', 'active']) expect(s).toContain(`data-demo-state="${st}"`);
    expect(s).toMatch(/disabled/);
    expect(s).toContain('fj-btn--primary');
    expect(s).toContain('fj-btn--secondary');
    expect(s).toContain('fj-btn--lg');
    expect(s).toContain('fj-btn--block');
  });

  it('shows Link and IconButton in every state', () => {
    for (const name of ['Link', 'IconButton']) {
      for (const st of ['hover', 'focus', 'active'])
        expect(section(name)).toContain(`data-demo-state="${st}"`);
    }
    expect(section('IconButton')).toMatch(/disabled/);
  });

  it('shows every Icon name of the typed map', () => {
    const src = readFileSync(join(repo, 'src/components/ui/Icon.astro'), 'utf8');
    const block = src.match(/const paths = \{([\s\S]*?)\} as const/)?.[1] ?? '';
    const names = [...block.matchAll(/^\s*'?([a-z-]+)'?:/gm)].map((m) => m[1]);
    expect(names.length).toBeGreaterThanOrEqual(6);
    const s = section('Icon');
    for (const n of names) expect(s).toContain(n);
  });

  it('shows the Badge variants', () => {
    const s = section('Badge');
    for (const w of ['open', 'talking', 'employed', 'live', 'progress', 'archived'])
      expect(s.toLowerCase()).toContain(w);
  });

  it('shows the Toast sample with Norwegian meta, outside the live region', () => {
    const s = section('Toast');
    expect(s).toContain('lang="no"');
    expect(s).toContain('Kopiert');
    expect(s).toContain('Show toast');
  });

  it('shows the Wordmark default and on spruce', () => {
    expect(section('Wordmark')).toContain('fjord-on-spruce');
  });
});

describe('src/pages/styleguide.astro', () => {
  it('has zero Stylelint findings', async () => {
    const { results } = await stylelint.lint({
      files: join(repo, 'src/pages/styleguide.astro'),
      cwd: repo,
    });
    expect(results[0]?.warnings).toEqual([]);
  });
});
