import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contact } from '../../data/contact';

// AC-07, D-11 (T12): the Sticky action bar markup. A real production build of a throwaway
// fixture page (outside the repo); the test reads the built HTML. Scroll behaviour is in
// src/scripts/shell/action-bar.test.ts, the browser checks are T20's.

const repo = fileURLToPath(new URL('../../../', import.meta.url));
const layout = (name: string) => join(repo, 'src/components/layout', name).replaceAll('\\', '/');
let out = '';
let page = '';

const fixture = `---
import MobileBar from '${layout('MobileBar.astro')}';
const { cv, contact } = ${JSON.stringify(contact.links)};
---
<html lang="en"><head><title>bar</title></head><body>
<div data-case="live"><MobileBar cvHref={cv} contactHref={contact} /></div>
<div data-case="sample"><MobileBar cvHref={cv} contactHref={contact} sample /></div>
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

  it('has exactly two actions: "View CV" then "Get in touch"', () => {
    const [cv, getInTouch, ...rest] = anchors(made('live'));
    expect(rest).toEqual([]);
    expect(cv).toMatch(/>\s*(?:<svg[\s\S]*?<\/svg>\s*)?View CV\s*</);
    expect(getInTouch).toMatch(/Get in touch/);
  });

  it('View CV is secondary with the file icon and the contact.ts CV target', () => {
    const cv = anchors(made('live'))[0] ?? '';
    expect(classesOf(cv)).toEqual(expect.arrayContaining(['fj-btn', 'fj-btn--secondary']));
    expect(classesOf(cv)).not.toContain('fj-btn--primary');
    expect(cv).toMatch(/<svg\b[^>]*aria-hidden="true"/);
    expect(cv).toContain(`href="${contact.links.cv}"`);
  });

  it('Get in touch is primary with the contact.ts contact target', () => {
    const cta = anchors(made('live'))[1] ?? '';
    expect(classesOf(cta)).toEqual(expect.arrayContaining(['fj-btn', 'fj-btn--primary']));
    expect(classesOf(cta)).not.toContain('fj-btn--secondary');
    expect(cta).toContain(`href="${contact.links.contact}"`);
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
