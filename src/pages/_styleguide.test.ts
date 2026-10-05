import { readdirSync, readFileSync } from 'node:fs';
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

describe('Hover and focus demo states of shell controls (AC-21, SCR-04)', () => {
  const css = () => {
    const dir = join(site.out, '_astro');
    return readdirSync(dir)
      .filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(join(dir, f), 'utf8'))
      .join('\n');
  };

  it('shows a hover and a focus theme switch segment sample', () => {
    const s = section('Theme switch');
    expect(s).toMatch(/<button\b[^>]*data-demo-state="hover"/);
    expect(s).toMatch(/<button\b[^>]*data-demo-state="focus"/);
  });

  it('shows a hover and a focus header link sample', () => {
    const s = section('Header variants');
    expect(s).toMatch(/<a\b[^>]*data-demo-state="hover"/);
    expect(s).toMatch(/<a\b[^>]*data-demo-state="focus"/);
  });

  it('carries [data-demo-state] selectors for segments and header links in the built CSS', () => {
    const c = css();
    expect(c).toMatch(/\.theme-toggle__segment[^{}]*\[data-demo-state=["']?hover["']?\]/);
    expect(c).toMatch(/\.theme-toggle__segment[^{}]*\[data-demo-state=["']?focus["']?\]/);
    expect(c).toMatch(/\.header__nav a\[data-demo-state=["']?hover["']?\]/);
    expect(c).toMatch(/\.header__nav a\[data-demo-state=["']?focus["']?\]/);
  });
});

describe('src/pages/styleguide.astro', () => {
  it('frames the phone samples at the 390 width of the page design', () => {
    const source = readFileSync(join(repo, 'src/pages/styleguide.astro'), 'utf8');
    expect(source).toMatch(/\.sg__phone\s*\{[^}]*max-inline-size:\s*390px/);
  });

  it('has zero Stylelint findings', async () => {
    const { results } = await stylelint.lint({
      files: join(repo, 'src/pages/styleguide.astro'),
      cwd: repo,
    });
    expect(results[0]?.warnings).toEqual([]);
  });
});

// T16: the home component sections (AC-02, AC-05, AC-07, AC-08, AC-13, AC-17; screens.md SCR-04
// "New sections"). Every sample is static: the home scripts do not run here (sad.md §11, T-3).
const HOME_SECTIONS = [
  'Portrait',
  'Motion control',
  'Key facts',
  'Quick facts',
  'Experience list',
  'Contact list',
  'QR tile',
  'Mail-link sentence',
];

describe('home component sections (T16, SCR-04)', () => {
  it.each(HOME_SECTIONS)('has one data-section block for %s', (name) => {
    expect(html().match(new RegExp(`data-section="${name}"`, 'g'))).toHaveLength(1);
    expect(section(name).length).toBeGreaterThan(0);
  });

  it('shows the Portrait as a round frame at 200 and at 340', () => {
    const s = section('Portrait');
    expect(s.match(/<div\b[^>]*class="portrait\b/g)).toHaveLength(2);
    expect(s).toContain('data-sample-size="200"');
    expect(s).toContain('data-sample-size="340"');
  });

  it('shows the Motion control named "Pause animation" and "Play animation" in every state', () => {
    const s = section('Motion control');
    expect(s).toContain('aria-label="Pause animation"');
    expect(s).toContain('aria-label="Play animation"');
    for (const st of ['hover', 'focus', 'active']) expect(s).toContain(`data-demo-state="${st}"`);
    expect(s).toContain('data-motion-icon="pause"');
    expect(s).toContain('data-motion-icon="play"');
  });

  it('shows the Key facts panel with the four final numbers and no counting copy', () => {
    const s = section('Key facts');
    expect(s.match(/<li\b[^>]*class="stat\b/g)).toHaveLength(4);
    for (const n of ['3+', '~40', '~2000', '100+']) expect(s).toContain(n);
    expect(s).not.toContain('data-count-to');
    expect(s).not.toContain('stat__count');
  });

  it('shows the four Quick facts rows', () => {
    const s = section('Quick facts');
    expect(s.match(/<dt\b/g)).toHaveLength(4);
    for (const k of ['Based in', 'Focus', 'Stack', 'Languages']) expect(s).toContain(`>${k}<`);
  });

  it('shows the Experience list: open, closed, current, and an entry without points and tags', () => {
    const s = section('Experience list');
    expect(s.match(/<details\b[^>]*\sopen\b/g)?.length ?? 0).toBeGreaterThanOrEqual(1);
    expect(s.match(/<details\b(?![^>]*\sopen\b)[^>]*>/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(s).toContain('xp--current');
    const entries = s.match(/<li\b[^>]*class="xp\b/g)?.length ?? 0;
    expect(entries).toBeGreaterThanOrEqual(3);
    expect(s.match(/<ul\b[^>]*class="xp__points/g)?.length ?? 0).toBeLessThan(entries);
    expect(s.match(/<div\b[^>]*class="xp__body[^"]*"[\s\S]*?<\/div>/g)?.length ?? 0).toBe(entries);
    expect(s).toMatch(/<summary\b[^>]*data-demo-state="hover"/);
    expect(s).toMatch(/<summary\b[^>]*data-demo-state="focus"/);
  });

  it('shows the Contact list: five rows, Copy in three states, Save contact', () => {
    const s = section('Contact list');
    expect(s.match(/<dt\b/g)).toHaveLength(5);
    expect(s).toContain('Copy');
    for (const st of ['default', 'hover', 'focus'])
      expect(s).toMatch(new RegExp(String.raw`data-copy-state="${st}"|data-demo-state="${st}"`));
    expect(s).toContain('Save contact (.vcf)');
    expect(s).toContain('href="/alexander-ponomarenko.vcf"');
    expect(s).toMatch(/<span\b[^>]*lang="no"[^>]*>\s*Oslo, Norge/);
  });

  it('shows the QR tile with the Dag and the Natt asset and "Skann meg"', () => {
    const s = section('QR tile');
    expect(s).toContain('src="/qr/qr-vcard-dag.svg"');
    expect(s).toContain('src="/qr/qr-vcard-natt.svg"');
    expect(s).toMatch(/lang="no"[^>]*>\s*Skann meg/);
    expect(s.match(/<img\b[^>]*alt="[^"]+"/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it('shows the Mail-link sentence with the link in default, hover and focus', () => {
    const s = section('Mail-link sentence');
    expect(s).toContain('Hiring?');
    expect(s).toContain('about the role is the');
    expect(s).toMatch(/<a\b[^>]*href="mailto:[^"]+"[^>]*>\s*A short email/);
    expect(s).toMatch(/<a\b[^>]*data-demo-state="hover"/);
    expect(s).toMatch(/<a\b[^>]*data-demo-state="focus"/);
  });

  it('shows no whole-hero sample (T-3)', () => {
    expect(html()).not.toMatch(/class="[^"]*\bhero\b/);
    expect(html()).not.toContain('data-motion=');
  });

  it('loads no page-own home script (sad.md §11)', () => {
    const srcs = [...html().matchAll(/<script\b[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1] ?? '');
    expect(srcs.length).toBeGreaterThan(0);
    for (const src of srcs)
      expect(src).not.toMatch(
        /KeyFacts|Hero|ContactBlock|Portrait|MotionControl|home|count-up|copy-email|parallax|motion/i,
      );
  });
});
