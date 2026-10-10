import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contact } from '../../data/contact';

// AC-04, AC-05, AC-02, AC-28 (T11): the MobileMenu markup (SCR-03 "open") and its CSS. A real
// production build of a throwaway fixture page; the test reads the built HTML and CSS. Script
// behaviour is src/scripts/shell/menu.test.ts, focus and axe in a browser are T19 and T21.

const repo = fileURLToPath(new URL('../../../', import.meta.url));
const layout = (name: string) => join(repo, 'src/components/layout', name).replaceAll('\\', '/');
let out = '';
let page = '';
let css = '';
let cssOnly = '';

const fixture = `---
import MobileMenu from '${layout('MobileMenu.astro')}';
---
<html lang="en"><head><title>menu</title></head><body>
<div data-case="plain"><MobileMenu /></div>
<div data-case="cv"><MobileMenu current="cv" /></div>
<div data-case="cv-no"><MobileMenu current="cv" cvLang="no" /></div>
<div data-case="no-current-no"><MobileMenu cvLang="no" /></div>
<div data-case="sample"><MobileMenu sample /></div>
</body></html>
`;

beforeAll(() => {
  out = mkdtempSync(join(tmpdir(), 'fjord-menu-'));
  const src = join(out, 'fixture');
  mkdirSync(src);
  writeFileSync(join(src, 'MenuPage.astro'), fixture);
  const config = join(src, 'astro.menu.config.mjs');
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
      name: 'menu-fixture',
      hooks: {
        'astro:config:setup': ({ injectRoute }) =>
          injectRoute({
            pattern: '/menu-fixture',
            entrypoint: ${JSON.stringify(pathToFileURL(join(src, 'MenuPage.astro')).href)},
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
  const dist = join(out, 'dist');
  page = readFileSync(join(dist, 'menu-fixture.html'), 'utf8');
  const assets = join(dist, '_astro');
  let files: string[];
  try {
    files = readdirSync(assets).filter((f) => f.endsWith('.css'));
  } catch {
    files = [];
  }
  const sheets = files.map((f) => readFileSync(join(assets, f), 'utf8')).join('\n');
  const inline = [...page.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? '');
  css = page + sheets;
  // Only stylesheets and <style> contents: SVG attributes such as transform="translate(...)" are not CSS.
  cssOnly = [sheets, ...inline].join('\n');
}, 180_000);

afterAll(() => {
  if (out) rmSync(out, { recursive: true, force: true });
});

/** The markup of one fixture case, up to the next case or the end of the body. */
function made(name: string): string {
  const m = page.match(
    new RegExp(`<div data-case="${name}">([\\s\\S]*?)\\s*(?=<div data-case|</body>)`),
  );
  if (!m) throw new Error(`fixture case ${name} is missing from the built page`);
  return m[1] ?? '';
}
const SVG_TAG = /<svg\b[^>]*>/;
const anchors = (html: string) => [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const classesOf = (tag: string) => (tag.match(/\bclass="([^"]*)"/)?.[1] ?? '').split(/\s+/);

describe('MobileMenu: SCR-03 open content (AC-04)', () => {
  it('is a <dialog id="mobile-menu"> that is closed in the markup', () => {
    const html = made('plain');
    const tag = html.match(/<dialog\b[^>]*>/)?.[0] ?? '';
    expect(tag).toMatch(/id="mobile-menu"/);
    expect(tag).not.toMatch(/\bopen\b/);
  });

  it('has a close button labelled "Close menu"', () => {
    expect(made('plain')).toMatch(/<button\b[^>]*aria-label="Close menu"/);
  });

  it('has the wordmark link to "/" at the top of the panel, before the navigation', () => {
    const html = made('plain');
    const [first] = anchors(html);
    expect(first).toContain('href="/"');
    expect(first).toMatch(/class="[^"]*wordmark/);
    expect(text(first ?? '')).toMatch(/alpon\s*\.dev/);
    expect(html.indexOf('wordmark')).toBeLessThan(html.indexOf('menu__nav'));
  });

  it('has the numbered navigation links "01 CV" and "02 Contact" first, to the contact.ts targets', () => {
    const html = made('plain');
    const nav = html.match(/<[a-z]+\b[^>]*data-menu-nav[^>]*>([\s\S]*?)<\/(?:ul|nav)>/)?.[1] ?? '';
    const [cv, contactLink] = anchors(nav);
    expect(text(cv ?? '')).toMatch(/01\s*CV/);
    expect(cv).toContain(`href="${contact.links.cv}"`);
    expect(text(contactLink ?? '')).toMatch(/02\s*Contact/);
    expect(contactLink).toContain(`href="${contact.links.contact}"`);
    expect(anchors(nav)).toHaveLength(2);
  });

  it('has the ridge Contours at the bottom left, hidden from assistive technology', () => {
    const html = made('plain');
    const wrap = html.match(/<div\b[^>]*class="[^"]*\bcontours\b[^"]*"[^>]*>/)?.[0] ?? '';
    expect(wrap).toMatch(/data-variant="ridge"/);
    expect(wrap).toMatch(/contours--bottom-left/);
    expect(wrap).toMatch(/aria-hidden="true"/);
    const svg = html.match(SVG_TAG)?.[0] ?? '';
    expect(svg).toMatch(/viewBox="0 0 85 55"/);
    expect(svg).toMatch(/aria-hidden="true"/);
  });

  it('has email and phone as links with the contact.ts values, after the numbered links', () => {
    const all = anchors(made('plain'));
    const mail = all.findIndex((a) => a.includes(`href="mailto:${contact.email}"`));
    const tel = all.findIndex((a) => a.includes(`href="tel:${contact.phone.replaceAll(' ', '')}"`));
    expect(mail).toBeGreaterThan(2);
    expect(tel).toBeGreaterThan(2);
    expect(text(all[mail] ?? '')).toContain(contact.email);
    expect(text(all[tel] ?? '')).toContain(contact.phone);
  });

  it('shows the work region with lang="no"', () => {
    const m = made('plain').match(
      new RegExp(`<[a-z]+\\b[^>]*lang="no"[^>]*>\\s*${contact.workRegion}\\s*<`),
    );
    expect(m, 'work region element').not.toBeNull();
  });

  it('has the theme switch and one primary "Get in touch" with an arrow, last', () => {
    const html = made('plain');
    expect(html).toMatch(/role="group"[^>]*aria-label="Theme"/);
    const all = anchors(html);
    const cta = all[all.length - 1] ?? '';
    expect(text(cta)).toMatch(/Get in touch/);
    expect(classesOf(cta)).toEqual(expect.arrayContaining(['fj-btn', 'fj-btn--primary']));
    expect(cta).toContain(`href="${contact.links.contact}"`);
    expect(cta).toMatch(/<svg\b[^>]*aria-hidden="true"/);
    expect(html.match(/fj-btn--primary/g)).toHaveLength(1);
  });

  it('has no "Projects" and no search (D-02)', () => {
    const html = made('plain');
    expect(text(html)).not.toMatch(/projects/i);
    expect(html).not.toMatch(/search/i);
  });

  it('current="cv" marks the CV link only', () => {
    const marked = anchors(made('cv')).filter((a) => /aria-current="page"/.test(a));
    expect(marked).toHaveLength(1);
    expect(text(marked[0] ?? '')).toMatch(/CV/);
    expect(made('plain')).not.toMatch(/aria-current/);
  });
});

describe('MobileMenu: CV link follows cvLang (AC-02)', () => {
  it('current="cv" with cvLang="no" leads to the Norwegian CV page and is marked', () => {
    const marked = anchors(made('cv-no')).filter((a) => /aria-current="page"/.test(a));
    expect(marked).toHaveLength(1);
    expect(text(marked[0] ?? '')).toMatch(/CV/);
    expect(marked[0]).toContain(`href="${contact.links.cvPages.no}"`);
  });

  it('without `current` no link is marked, whatever cvLang is', () => {
    expect(made('no-current-no')).not.toMatch(/aria-current/);
  });
});

describe('MobileMenu: on spruce, as the page design (AC-04, AC-21)', () => {
  for (const name of ['plain', 'sample']) {
    it(`the ${name} panel root carries fjord-on-spruce and its Contours the spruce tone`, () => {
      const html = made(name);
      const root = html.match(/<(?:dialog|div)\b[^>]*class="[^"]*\bmenu\b[^"]*"[^>]*>/)?.[0] ?? '';
      expect(classesOf(root)).toContain('fjord-on-spruce');
      const wrap = html.match(/<div\b[^>]*class="[^"]*\bcontours\b[^"]*"[^>]*>/)?.[0] ?? '';
      expect(classesOf(wrap)).toContain('contours--spruce');
    });
  }
});

describe('MobileMenu: sample variant (SCR-04)', () => {
  it('renders the same content as a static block, not a <dialog>', () => {
    const html = made('sample');
    expect(html).not.toMatch(/<dialog\b/);
    expect(text(html)).toMatch(/01\s*CV/);
    expect(text(html)).toContain(contact.email);
    expect(text(html)).toContain(contact.workRegion);
  });
});

describe('MobileMenu: built CSS (G-3, AC-28)', () => {
  it('has the scroll-lock rule on the root while a dialog is open', () => {
    expect(css).toMatch(/:has\(\s*dialog\[open\]\s*\)\s*\{[^}]*overflow:\s*hidden/);
  });

  it('has no slide distance outside a motion token (translate uses a var)', () => {
    const translates = [...cssOnly.matchAll(/translate(?:[XY]|3d)?\(([^)]*)\)/g)].map(
      (m) => m[1] ?? '',
    );
    for (const arg of translates) expect(arg).toMatch(/var\(--fjord-/);
  });

  it('slides in with transform, as the design sheet does, by a token distance', () => {
    const slide = cssOnly.match(/@keyframes menu-in\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(slide).toMatch(/transform:\s*translateY\(calc\([^;]*var\(--fjord-space-2\)/);
    expect(slide).not.toMatch(/(?<![-\w])translate\s*:/);
  });

  it('spaces the contact lines as the design does', () => {
    const contacts = cssOnly.match(/\.menu__contacts\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(contacts).toMatch(/gap:\s*var\(--fjord-space-1-5\)/);
  });

  it('moves only inside a no-preference or a reduced-motion guard', () => {
    expect(css).toMatch(/dialog\[open\]|\.menu\[open\]|\[open\]/);
    expect(css).toMatch(/prefers-reduced-motion/);
  });
});

describe('MobileMenu: the current-link marker (AC-20, B-05)', () => {
  const rules = () =>
    [...cssOnly.matchAll(/([^{}]*aria-current[^{}]*)\{([^}]*)\}/g)].filter((m) =>
      /\.menu__nav/.test(m[1] ?? ''),
    );

  it('follows aria-current="page", not a class a script adds', () => {
    expect(rules().length).toBeGreaterThan(0);
    expect(cssOnly).not.toMatch(/\.menu__nav\s+a\.[\w-]*current/);
    expect(cssOnly).not.toMatch(/\.menu__nav\s+a\.is-/);
  });

  it('differs from the other links by more than colour: an accent rule, and no weight of its own', () => {
    const body = rules()
      .map((m) => m[2])
      .join(';');
    // Every link keeps the weight of the page design (Owner, 2026-10-09).
    expect(body).not.toMatch(/font-weight/);
    expect(body).toMatch(/(border-inline-start|box-shadow|background)[^;]*var\(--fjord-/);
    expect(body).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });
});
