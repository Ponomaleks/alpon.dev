import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contact } from '../../data/contact';
import { defaultBarActions, type BarAction } from '../../data/shell-actions';

// AC-34, AC-38 (home T5, ADR-0002): the Sticky action bar renders the pair it is given, always
// secondary. Markup of AC-07, D-11 (T12): the Sticky action bar. A real production build of a throwaway
// fixture page (outside the repo); the test reads the built HTML. Scroll behaviour is in
// src/scripts/shell/action-bar.test.ts, the browser checks are T20's.

const repo = fileURLToPath(new URL('../../../', import.meta.url));
const layout = (name: string) => join(repo, 'src/components/layout', name).replaceAll('\\', '/');
let out = '';
let page = '';

const actionsModule = join(repo, 'src/data/shell-actions').replaceAll('\\', '/');
const custom: BarAction[] = [
  { label: 'Read the case study', href: '/projects/example', icon: 'file-text' },
  { label: 'Get the brief', href: '/brief.pdf', icon: 'download', download: true },
];

const fixture = `---
import MobileBar from '${layout('MobileBar.astro')}';
import { defaultBarActions } from '${actionsModule}';
const custom = ${JSON.stringify(custom)};
---
<html lang="en"><head><title>bar</title></head><body>
<div data-case="live"><MobileBar actions={defaultBarActions} /></div>
<div data-case="custom"><MobileBar actions={custom} /></div>
<div data-case="sample"><MobileBar actions={defaultBarActions} sample /></div>
</body></html>
`;

beforeAll(() => {
  out = mkdtempSync(join(tmpdir(), 'fjord-bar-'));
  const src = join(out, 'fixture');
  mkdirSync(src);
  writeFileSync(join(src, 'BarPage.astro'), fixture);
  const config = join(src, 'astro.bar.config.mjs');
  writeFileSync(
    config,
    `import base from ${JSON.stringify(pathToFileURL(join(repo, 'astro.config.mjs')).href)};
export default {
  ...base,
  root: ${JSON.stringify(repo)},
  outDir: ${JSON.stringify(join(out, 'dist'))},
  integrations: [
    ...(base.integrations ?? []),
    {
      name: 'bar-fixture',
      hooks: {
        'astro:config:setup': ({ injectRoute }) =>
          injectRoute({
            pattern: '/bar-fixture',
            entrypoint: ${JSON.stringify(pathToFileURL(join(src, 'BarPage.astro')).href)},
          }),
      },
    },
  ],
};
`,
  );
  const astro = join(repo, 'node_modules/astro/bin/astro.mjs');
  const build = spawnSync(process.execPath, [astro, 'build', '--config', relative(repo, config)], {
    cwd: repo,
    encoding: 'utf8',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  });
  if (build.status !== 0)
    throw new Error(`astro build failed:
${build.stdout}
${build.stderr}`);
  page = readFileSync(join(out, 'dist', 'bar-fixture.html'), 'utf8');
}, 180_000);

afterAll(() => {
  if (out) rmSync(out, { recursive: true, force: true });
});

/** The markup of one fixture case. */
function made(name: string): string {
  const m = page.match(
    new RegExp(`<div data-case="${name}">([\\s\\S]*?)</div>\\s*(?=<div data-case|</body>)`),
  );
  if (!m) throw new Error(`fixture case ${name} is missing from the built page`);
  return m[1] ?? '';
}
const anchors = (html: string) => [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
const classesOf = (tag: string) => (tag.match(/\bclass="([^"]*)"/)?.[1] ?? '').split(/\s+/);

describe('MobileBar: live', () => {
  it('has the bar hook data-shell-bar on its root (H-2) and is not inert at first', () => {
    const html = made('live');
    expect(html).toMatch(/data-shell-bar\b/);
    expect(html).not.toMatch(/\binert\b/);
    expect(html).not.toMatch(/data-sample/);
  });

  it('has exactly two actions: "View CV" then "Save contact (.vcf)"', () => {
    const [cv, save, ...rest] = anchors(made('live'));
    expect(rest).toEqual([]);
    expect(cv).toMatch(/>\s*(?:<svg[\s\S]*?<\/svg>\s*)?View CV\s*</);
    expect(save).toMatch(/Save contact \(\.vcf\)/);
    expect(made('live')).not.toMatch(/Get in touch/);
  });

  it('View CV has the file icon and the contact.ts CV target', () => {
    const cv = anchors(made('live'))[0] ?? '';
    expect(cv).toMatch(/<svg\b[^>]*aria-hidden="true"/);
    expect(cv).toContain(`href="${contact.links.cv}"`);
    expect(cv).not.toMatch(/\sdownload\b/);
  });

  it('Save contact (.vcf) is a download of the contact card', () => {
    const save = anchors(made('live'))[1] ?? '';
    expect(save).toContain('href="/alexander-ponomarenko.vcf"');
    expect(save).toMatch(/\sdownload(?:=""|\s|>)/);
    expect(save).toMatch(/<svg\b[^>]*aria-hidden="true"/);
  });

  it('both actions are secondary and none is primary', () => {
    for (const anchor of anchors(made('live'))) {
      expect(classesOf(anchor)).toEqual(expect.arrayContaining(['fj-btn', 'fj-btn--secondary']));
      expect(classesOf(anchor)).not.toContain('fj-btn--primary');
    }
  });
});

describe('MobileBar: collapsible (AC-39, D-11)', () => {
  const root = () => made('live').match(/<details\b[^>]*>[\s\S]*<\/details>/)?.[0] ?? '';
  const openTag = () => root().match(/^<details\b[^>]*>/)?.[0] ?? '';
  const summary = () => root().match(/<summary\b[^>]*>[\s\S]*?<\/summary>/)?.[0] ?? '';

  it('the hook element is a native <details open>', () => {
    expect(openTag()).toMatch(/\bdata-shell-bar\b/);
    expect(openTag()).toMatch(/\sopen(?:=""|\s|>)/);
  });

  it('has a <summary> named "Quick actions" with a chevron icon', () => {
    expect(summary()).toMatch(/Quick actions/);
    expect(summary()).toMatch(/<svg\b[^>]*aria-hidden="true"/);
  });

  it('keeps both actions inside the details element, after the summary', () => {
    const html = root();
    expect(html.indexOf('<summary')).toBeGreaterThanOrEqual(0);
    expect(anchors(html)).toHaveLength(2);
    expect(html.indexOf('View CV')).toBeGreaterThan(html.indexOf('</summary>'));
    expect(html.indexOf('Save contact (.vcf)')).toBeGreaterThan(html.indexOf('</summary>'));
    expect(summary()).not.toMatch(/<a\b/);
  });
});

describe('MobileBar: custom pair', () => {
  it('renders the pair it is given, in order, and not the default one', () => {
    const [first, second, ...rest] = anchors(made('custom'));
    expect(rest).toEqual([]);
    expect(first).toContain('href="/projects/example"');
    expect(first).toMatch(/Read the case study/);
    expect(second).toContain('href="/brief.pdf"');
    expect(second).toMatch(/Get the brief/);
    expect(second).toMatch(/\sdownload(?:=""|\s|>)/);
    expect(first).not.toMatch(/\sdownload\b/);
    expect(made('custom')).not.toMatch(/View CV|Save contact|Get in touch/);
  });

  it('is secondary for both actions', () => {
    for (const anchor of anchors(made('custom'))) {
      expect(classesOf(anchor)).toContain('fj-btn--secondary');
      expect(classesOf(anchor)).not.toContain('fj-btn--primary');
    }
  });
});

describe('BarAction type and the default pair (ADR-0002)', () => {
  it('has no style field: a primary button in the bar cannot be written', () => {
    const styled: BarAction = {
      label: 'x',
      href: '/',
      // @ts-expect-error a BarAction has no style field
      variant: 'primary',
    };
    expect(styled.label).toBe('x');
    for (const action of defaultBarActions) expect(Object.keys(action)).not.toContain('variant');
  });

  it('the default pair is "View CV" and "Save contact (.vcf)" from contact.ts', () => {
    expect(defaultBarActions).toHaveLength(2);
    expect(defaultBarActions[0]).toMatchObject({ label: 'View CV', href: contact.links.cv });
    expect(defaultBarActions[1]).toMatchObject({
      label: 'Save contact (.vcf)',
      href: '/alexander-ponomarenko.vcf',
      // The design's add-to-contacts glyph (ContactList: icon "user-plus"), not the download arrow.
      icon: 'user-plus',
      download: true,
    });
  });
});

describe('MobileBar: layout (design .fj-actionbar)', () => {
  const source = () => readFileSync(join(repo, 'src/components/layout/MobileBar.astro'), 'utf8');
  const bar = () => source().match(/\.mobile-bar\s*\{([^}]*)\}/)?.[1] ?? '';

  it('is the two-column grid of the design', () => {
    expect(bar()).toMatch(/display:\s*grid/);
    expect(bar()).toMatch(/grid-template-columns:\s*1fr 1fr/);
    expect(bar()).toMatch(/gap:\s*var\(--fjord-space-2\)/);
    expect(source()).not.toMatch(/flex:\s*1 1 0/);
  });

  it('floats above the page with the design shadow', () => {
    expect(bar()).toMatch(/box-shadow:\s*var\(--fjord-shadow-float\)/);
  });

  it('slides away with transform, as in the design, under a no-preference guard', () => {
    expect(source()).toMatch(
      /\.mobile-bar\[inert\]\s*\{\s*transform:\s*translateY\(calc\(100% \+ var\(--fjord-space-2\)\)\)/,
    );
    expect(source()).toMatch(
      /prefers-reduced-motion: no-preference\)\s*\{\s*\.mobile-bar\s*\{\s*transition:\s*transform var\(--fjord-duration-320\) var\(--fjord-ease-out\)/,
    );
    expect(source()).not.toMatch(/(?<![-\w])translate\s*:/);
  });
});

describe('MobileBar: sample', () => {
  it('is not the live bar: no hook, marked as a sample, still two actions', () => {
    const html = made('sample');
    expect(html).not.toMatch(/data-shell-bar/);
    expect(html).toMatch(/data-sample/);
    expect(anchors(html)).toHaveLength(2);
  });
});
