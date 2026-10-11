import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contact } from '../../data/contact';
import { defaultBarActions, type BarAction, type BarLangSwitch } from '../../data/shell-actions';

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

// AC-19: the CV page's pair: a language switch at the start and a link marked Norwegian.
const switchEn: [BarLangSwitch, BarAction] = [
  {
    kind: 'lang-switch',
    current: 'en',
    group: 'CV language',
    enHref: '/cv/en',
    noHref: '/cv/no',
  },
  { label: 'Download PDF', href: '/cv/en.pdf', icon: 'file-down', download: true },
];
const switchNo: [BarLangSwitch, BarAction] = [
  {
    kind: 'lang-switch',
    current: 'no',
    group: 'CV-språk',
    lang: 'no',
    enHref: '/cv/en',
    noHref: '/cv/no',
  },
  { label: 'Last ned PDF', href: '/cv/no.pdf', icon: 'file-down', download: true, lang: 'no' },
];

const fixture = `---
import MobileBar from '${layout('MobileBar.astro')}';
import { defaultBarActions } from '${actionsModule}';
const custom = ${JSON.stringify(custom)};
const switchEn = ${JSON.stringify(switchEn)};
const switchNo = ${JSON.stringify(switchNo)};
---
<html lang="en"><head><title>bar</title></head><body>
<div data-case="live"><MobileBar actions={defaultBarActions} /></div>
<div data-case="custom"><MobileBar actions={custom} /></div>
<div data-case="switch-en"><MobileBar actions={switchEn} /></div>
<div data-case="switch-no"><MobileBar actions={switchNo} lang="en" /></div>
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

  it('Save contact (.vcf) links to the contact card, with no download attribute', () => {
    const save = anchors(made('live'))[1] ?? '';
    expect(save).toContain('href="/alexander-ponomarenko.vcf"');
    expect(save).not.toMatch(/\sdownload\b/);
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
    });
    // No download: a phone that can show a contact card opens it (backlog B-58).
    expect(defaultBarActions[1]).not.toHaveProperty('download');
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

  it('keeps its height when collapsed, so the slide has the same distance in every browser', () => {
    expect(bar()).toMatch(/box-sizing:\s*border-box/);
    expect(bar()).toMatch(
      /min-block-size:\s*calc\(\s*var\(--fjord-tap-min\) \+ 2 \* var\(--fjord-space-3\) \+ var\(--fjord-border-width\)\s*\)/,
    );
  });

  it('draws the tab as part of the panel: same surface and line, open at the bottom, no shadow of its own', () => {
    const tab = source().match(/\.mobile-bar__tab\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(tab).toMatch(/background-color:\s*var\(--fjord-color-bg-raised\)/);
    expect(tab).toMatch(/border:\s*var\(--fjord-border-width\) solid var\(--fjord-color-border\)/);
    expect(tab).toMatch(/border-block-end-color:\s*transparent/);
    expect(tab).toMatch(/border-radius:\s*var\(--fjord-radius-md\) var\(--fjord-radius-md\) 0 0/);
    expect(source()).not.toMatch(/\.mobile-bar__tab[^{]*\{[^}]*box-shadow/);
  });

  it('slides away with transform, as in the design, under a no-preference guard', () => {
    // Away: the panel and the tab on top of it leave together.
    expect(source()).toMatch(
      /\.mobile-bar\[inert\]\s*\{\s*transform:\s*translateY\(\s*calc\(100% \+ var\(--fjord-tap-min\) \+ var\(--fjord-space-2\)\)\s*\)/,
    );
    // Collapsed: the same property, so one transition serves both; a strip of the panel stays.
    expect(source()).toMatch(
      /\.mobile-bar:not\(\[open\]\)\s*\{\s*transform:\s*translateY\(\s*calc\(100% - var\(--fjord-space-3\) - var\(--fjord-border-width\)\)\s*\)/,
    );
    expect(source()).toMatch(
      /prefers-reduced-motion: no-preference\)\s*\{\s*\.mobile-bar\s*\{\s*transition:\s*transform var\(--fjord-duration-320\) var\(--fjord-ease-out\)/,
    );
    // No transition outside that guard: with reduced motion the change is instant (AC-39).
    const unguarded = source().replace(
      /@media \(prefers-reduced-motion: no-preference\)\s*\{[\s\S]*?\n {2}\}\n/g,
      '',
    );
    expect(unguarded).not.toMatch(/\btransition\s*:|\banimation\s*:/);
    expect(source()).not.toMatch(/(?<![-\w])translate\s*:/);
  });
});

describe('MobileBar: language switch slot (AC-19)', () => {
  const group = (name: string) =>
    made(name).match(/<div\b[^>]*data-lang-switch[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';
  const switchLinks = (name: string) => anchors(group(name));
  const buttons = (name: string) => anchors(made(name)).filter((a) => /\bfj-btn\b/.test(a));

  it('renders the LangSwitch in its default size, before the download, with EN current', () => {
    const html = made('switch-en');
    expect(group('switch-en')).toMatch(/data-size="default"/);
    expect(group('switch-en')).toContain('aria-label="CV language"');
    expect(html.indexOf('data-lang-switch')).toBeLessThan(html.indexOf('Download PDF'));
    const [en, no, ...rest] = switchLinks('switch-en');
    expect(rest).toEqual([]);
    expect(en).toMatch(/href="\/cv\/en"/);
    expect(en).toMatch(/aria-current="true"/);
    expect(no).toMatch(/href="\/cv\/no"/);
    expect(no).not.toMatch(/aria-current/);
  });

  // Review R1-3 (AC-02, WCAG 3.1.2): the bar is marked English on a Norwegian page, so the
  // Norwegian name of the group needs its own language.
  it('marks a Norwegian group name as Norwegian inside the English bar', () => {
    const open = group('switch-no').match(/^<div\b[^>]*>/)?.[0] ?? '';
    expect(open).toContain('aria-label="CV-språk"');
    expect(open).toMatch(/\slang="no"/);
  });

  it('gives the group no lang when the slot has none', () => {
    expect(group('switch-en').match(/^<div\b[^>]*>/)?.[0]).not.toMatch(/\slang=/);
  });

  it('marks NO current when the Norwegian page gives the switch', () => {
    const [en, no] = switchLinks('switch-no');
    expect(no).toMatch(/aria-current="true"/);
    expect(en).not.toMatch(/aria-current/);
  });

  it('the download is the one Button of the pair, secondary, with the file-down icon', () => {
    const [only, ...rest] = buttons('switch-en');
    expect(rest).toEqual([]);
    expect(only).toMatch(/Download PDF/);
    expect(only).toContain('href="/cv/en.pdf"');
    expect(only).toMatch(/\sdownload(?:=""|\s|>)/);
    expect(classesOf(only ?? '')).toContain('fj-btn--secondary');
    expect(classesOf(only ?? '')).not.toContain('fj-btn--primary');
    expect(made('switch-en')).not.toMatch(/fj-btn--primary/);
  });

  it('a link with lang carries the attribute; the frame and the tab stay English', () => {
    const [only] = buttons('switch-no');
    expect(only).toMatch(/Last ned PDF/);
    expect(only).toMatch(/\slang="no"/);
    expect(classesOf(only ?? '')).toContain('fj-btn--secondary');
    expect(made('switch-no')).toMatch(/<details\b[^>]*\slang="en"/);
    expect(made('switch-en')).not.toMatch(/Download PDF[^<]*<\/a>[\s\S]*\slang="no"/);
  });

  it('a link without lang carries none', () => {
    expect(buttons('switch-en')[0]).not.toMatch(/\slang=/);
  });

  it('the type has no style field on a link or on a switch', () => {
    const link: BarAction = {
      label: 'x',
      href: '/',
      lang: 'no',
      // @ts-expect-error a link has no style field
      variant: 'primary',
    };
    const sw: BarLangSwitch = {
      kind: 'lang-switch',
      current: 'en',
      group: 'g',
      enHref: '/',
      noHref: '/',
      // @ts-expect-error a switch has no style field
      variant: 'primary',
    };
    expect(link.lang).toBe('no');
    expect(sw.kind).toBe('lang-switch');
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
