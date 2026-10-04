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
    new RegExp(
      String.raw`<section\b[^>]*data-section="${name}"[^>]*>([\s\S]*?)(?=<section\b[^>]*data-section=|</main>)`,
    ),
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
  'Skip link',
  'Theme switch',
  'Header variants',
  'Mobile menu panel',
  'Sticky action bar',
  'Closing band',
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
    // only the closing-band samples (each wrapped in data-sample) may exist, never a real band
    const bands = html().match(/<section class="fj-band\b/g) ?? [];
    expect(bands).toHaveLength(section('Closing band').match(/<div data-sample/g)?.length ?? 0);
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

const opening = (tag: string, name: string) =>
  [...section(name).matchAll(new RegExp(String.raw`<${tag}\b[^>]*>`, 'g'))].map((m) => m[0]);

describe('Shell samples (AC-21, SCR-04)', () => {
  it('shows the skip link sample in the flow, marked as a sample', () => {
    const s = section('Skip link');
    expect(s).toContain('Skip to content');
    expect(s).toMatch(/data-sample/);
  });

  it('shows the theme switch with Light selected and with Dark selected, both fixed', () => {
    const s = section('Theme switch');
    expect(s.match(/data-sample/g)?.length).toBe(2);
    expect(s).toContain('data-selected="dag"');
    expect(s).toContain('data-selected="natt"');
    expect(s).not.toContain('data-needs-script');
  });

  it('shows five sample headers: default, bordered, on spruce, secondary cta, current link', () => {
    const headers = opening('header', 'Header variants');
    expect(headers).toHaveLength(5);
    for (const h of headers) expect(h).toContain('data-sample');
    expect(headers.filter((h) => h.includes('data-scrolled'))).toHaveLength(1);
    expect(headers.filter((h) => h.includes('data-variant="on-spruce"'))).toHaveLength(1);
    expect(headers.filter((h) => h.includes('data-cta="secondary"'))).toHaveLength(1);
    expect(section('Header variants').match(/aria-current="page"/g)).toHaveLength(1);
    expect(section('Header variants')).not.toContain('data-header-sentinel');
  });

  it('shows the mobile menu panel as a static sample with a current link, no dialog', () => {
    const s = section('Mobile menu panel');
    expect(s).toMatch(/class="[^"]*menu--sample/);
    expect(s).toContain('data-sample');
    expect(s).toContain('aria-current="page"');
    expect(s).not.toMatch(/<dialog\b/);
    expect(html().match(/<dialog\b/g) ?? []).toHaveLength(1);
  });

  it('shows the sticky action bar sample, not the live bar', () => {
    const s = section('Sticky action bar');
    expect(s).toMatch(/class="[^"]*mobile-bar/);
    expect(s).toContain('data-sample');
    expect(s).toContain('View CV');
    expect(s).not.toContain('data-shell-bar');
  });

  it('shows the closing band as samples: default and on spruce', () => {
    const s = section('Closing band');
    expect((s.match(/fj-band\b/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(s).toContain('Let’s build something good together.');
    expect(s).toContain('data-sample');
  });

  it('marks every sample root with data-sample', () => {
    for (const name of [
      'Skip link',
      'Theme switch',
      'Header variants',
      'Mobile menu panel',
      'Sticky action bar',
      'Closing band',
    ])
      expect(section(name)).toContain('data-sample');
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
