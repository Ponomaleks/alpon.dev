import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contact } from '../../data/contact';

// AC-01, AC-02, AC-03, AC-23, AC-33 (T10, T7): the Header markup and its CSS. A real production build of a
// throwaway fixture page (outside the repo); the test reads the built HTML and CSS. Scroll border
// behaviour is src/scripts/shell/header.test.ts, the browser checks are T20's.

const repo = fileURLToPath(new URL('../../../', import.meta.url));
const layout = (name: string) => join(repo, 'src/components/layout', name).replaceAll('\\', '/');
let out = '';
let page = '';
let css = '';
let sheet = '';

const fixture = `---
import Header from '${layout('Header.astro')}';
---
<html lang="en"><head><title>header</title></head><body>
<div data-case="plain"><Header /></div>
<div data-case="cv"><Header current="cv" /></div>
<div data-case="contact"><Header current="contact" /></div>
<div data-case="spruce"><Header variant="on-spruce" /></div>
<div data-case="secondary"><Header cta="secondary" /></div>
<div data-case="sample"><Header sample /></div>
<div data-case="over-hero"><Header overHero /></div>
<div data-case="not-over-hero"><Header overHero={false} /></div>
</body></html>
`;

beforeAll(() => {
  out = mkdtempSync(join(tmpdir(), 'fjord-header-'));
  const src = join(out, 'fixture');
  mkdirSync(src);
  writeFileSync(join(src, 'HeaderPage.astro'), fixture);
  const config = join(src, 'astro.header.config.mjs');
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
      name: 'header-fixture',
      hooks: {
        'astro:config:setup': ({ injectRoute }) =>
          injectRoute({
            pattern: '/header-fixture',
            entrypoint: ${JSON.stringify(pathToFileURL(join(src, 'HeaderPage.astro')).href)},
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
  page = readFileSync(join(dist, 'header-fixture.html'), 'utf8');
  const assets = join(dist, '_astro');
  let files: string[];
  // The stylesheet of the fixture page (one per page; other pages repeat the Shell rules in theirs).
  const linked = [...page.matchAll(/<link rel="stylesheet" href="\/_astro\/([^"]+)"/g)].map(
    (m) => m[1] ?? '',
  );
  try {
    files = readdirSync(assets).filter((f) => linked.includes(f));
  } catch {
    files = [];
  }
  // Style rules only: Astro may inline small sheets into the page as <style>.
  sheet = [...page.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1] ?? '')
    .concat(files.map((f) => readFileSync(join(assets, f), 'utf8')))
    .join('\n');
  css = page + files.map((f) => readFileSync(join(assets, f), 'utf8')).join('\n');
}, 180_000);

afterAll(() => {
  if (out) rmSync(out, { recursive: true, force: true });
});

/** One fixture case up to its closing </header> (the header holds nested divs). */
function header(name: string): string {
  const m = page.match(new RegExp(`<div data-case="${name}">([\\s\\S]*?</header>)`));
  if (!m) throw new Error(`no <header> in fixture case ${name}`);
  return m[1] ?? '';
}
const root = (html: string) => html.match(/<header\b[^>]*>/)?.[0] ?? '';
const anchors = (html: string) => [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
const classesOf = (tag: string) => (tag.match(/\bclass="([^"]*)"/)?.[1] ?? '').split(/\s+/);
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const named = (html: string, name: string) =>
  anchors(html).filter((a) =>
    new RegExp(`>\\s*(?:<svg[\\s\\S]*?</svg>\\s*)?${name}\\s*(?:<svg[\\s\\S]*?</svg>\\s*)?<`).test(
      a,
    ),
  );

describe('Header: content (AC-01, AC-02)', () => {
  it('is a <header> with the wordmark home link', () => {
    const html = header('plain');
    expect(root(html)).toMatch(/^<header\b/);
    expect(anchors(html).some((a) => /href="\/"/.test(a) && /alpon/.test(a))).toBe(true);
  });

  it('has the links "CV" and "Contact" pointing at the contact.ts targets', () => {
    const html = header('plain');
    const [cv] = named(html, 'CV');
    const [contactLink] = named(html, 'Contact');
    expect(cv).toContain(`href="${contact.links.cv}"`);
    expect(contactLink).toContain(`href="${contact.links.contact}"`);
  });

  it('has one "Get in touch" call to action with an arrow', () => {
    const ctas = named(header('plain'), 'Get in touch');
    expect(ctas).toHaveLength(1);
    expect(classesOf(ctas[0] ?? '')).toContain('fj-btn');
    expect(ctas[0]).toContain(`href="${contact.links.contact}"`);
    expect(ctas[0]).toMatch(/<svg\b[^>]*aria-hidden="true"/);
  });

  it('has the theme switch', () => {
    expect(header('plain')).toMatch(/role="group"[^>]*aria-label="Theme"/);
  });

  it('has no "Projects" and no search trigger (D-01, D-02)', () => {
    const html = header('plain');
    expect(text(html)).not.toMatch(/projects/i);
    expect(text(html)).not.toMatch(/search/i);
    expect(html).not.toMatch(/aria-label="[^"]*(search|projects)/i);
    expect(html).not.toMatch(/type="search"|Ctrl/);
  });

  it('has a menu button behind the scripts-off gate with aria-controls and aria-expanded (H-1)', () => {
    const html = header('plain');
    const button = [...html.matchAll(/<button\b[^>]*>/g)]
      .map((m) => m[0])
      .find((b) => /aria-label="[^"]*menu/i.test(b));
    expect(button, 'menu button').toBeDefined();
    expect(button).toMatch(/aria-controls="[^"]+"/);
    expect(button).toMatch(/aria-expanded="false"/);
    // the button itself or a wrapper opened before it carries data-needs-script
    const before = html.slice(0, html.indexOf(button ?? ''));
    const wrapped = /<[a-z]+\b[^>]*data-needs-script[^>]*>[^<]*$/.test(before);
    expect(/data-needs-script/.test(button ?? '') || wrapped).toBe(true);
  });
});

describe('Header: current page (AC-01)', () => {
  it('marks nothing without `current`', () => {
    expect(header('plain')).not.toMatch(/aria-current/);
  });

  it('current="cv" marks the CV link only', () => {
    const marked = anchors(header('cv')).filter((a) => /aria-current="page"/.test(a));
    expect(marked).toHaveLength(1);
    expect(marked[0]).toMatch(/>\s*CV\s*</);
  });

  it('current="contact" marks the Contact link only', () => {
    const marked = anchors(header('contact')).filter((a) => /aria-current="page"/.test(a));
    expect(marked).toHaveLength(1);
    expect(marked[0]).toMatch(/>\s*Contact\s*</);
  });
});

describe('Header: variants (AC-23, AC-24)', () => {
  it('on-spruce and secondary set root attributes the styles read', () => {
    expect(root(header('spruce'))).toMatch(/data-variant="on-spruce"/);
    expect(root(header('secondary'))).toMatch(/data-cta="secondary"/);
  });

  it('the default header sets neither', () => {
    const r = root(header('plain'));
    expect(r).not.toMatch(/on-spruce/);
    expect(r).not.toMatch(/data-cta="secondary"/);
  });

  it('the call to action is styled by CSS only: no secondary class in the markup', () => {
    for (const name of ['plain', 'secondary']) {
      const cta = named(header(name), 'Get in touch')[0] ?? '';
      expect(classesOf(cta)).not.toContain('fj-btn--secondary');
    }
  });

  it('a live header has the scroll sentinel; a sample does not and is marked', () => {
    expect(header('plain')).toMatch(/data-header-sentinel/);
    expect(header('sample')).not.toMatch(/data-header-sentinel/);
    expect(root(header('sample'))).toMatch(/data-sample/);
    expect(root(header('plain'))).not.toMatch(/data-sample/);
  });
});

describe('Header: built CSS', () => {
  it('has no rule that depends on the Sticky action bar (D-14, AC-33)', () => {
    // The header's own rules: the Toast clearance and the scroll padding of base.css keep theirs.
    const headerRules = [...sheet.matchAll(/([^{}]+)[{][^{}]*[}]/g)]
      .map(([, selector = '']) => selector)
      .filter((selector) => selector.includes('.header') || selector.includes('[data-header]'))
      .join(',');
    expect(headerRules.length, 'the header rules were found').toBeGreaterThan(0);
    expect(headerRules).not.toContain('data-shell-bar');
    expect(headerRules).not.toMatch(/:has[(][^)]*inert/);
    expect(sheet.length, 'the header CSS was found').toBeGreaterThan(0);
    expect(sheet).toMatch(/\.header__cta/);
  });

  it('an outlined call to action still answers to hover and press, like a secondary Button', () => {
    const hover = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([, sel = '']) =>
      /\.header__cta[^,{]*\.fj-btn:hover/.test(sel),
    );
    const selectors = hover.map(([, sel = '']) => sel).join(',');
    // The outlined style is forced by the page only; no bar rule is left (D-14).
    expect(selectors).toMatch(/\[data-cta=["']?secondary["']?\][^,]*\.fj-btn:hover/);
    expect(selectors).not.toMatch(/data-shell-bar/);
    expect(selectors).toMatch(/\.fj-btn:active/);
    for (const [, , body = ''] of hover) {
      expect(body).toMatch(/background-color:\s*var\(--fjord-color-accent-soft\)/);
      expect(body).toMatch(/border-color:\s*var\(--fjord-color-text\)/);
    }
    expect(hover.length).toBeGreaterThan(0);
  });

  it('marks the current link with the inset line of the design, not a border', () => {
    const marker =
      css.match(/\.header__nav[^{},]*\[aria-current=["']?page["']?\][^{},]*\{([^}]*)\}/)?.[1] ?? '';
    expect(marker).toMatch(/box-shadow:\s*inset 0 calc\([^;]*var\(--fjord-border-width\)[^;]*\) 0/);
    expect(marker).not.toMatch(/border-(block-end|bottom)\s*:/);
  });

  it('styles the scroll border from data-scrolled (AC-03)', () => {
    expect(css).toMatch(/\[data-scrolled\]/);
  });
});

describe('Header: over the hero (AC-33, ADR-0001)', () => {
  it('renders data-over-hero only when asked for it', () => {
    expect(root(header('over-hero'))).toMatch(/\sdata-over-hero(?:=""|\s|>)/);
    for (const name of ['plain', 'cv', 'contact', 'spruce', 'secondary', 'sample', 'not-over-hero'])
      expect(root(header(name)), name).not.toMatch(/data-over-hero/);
  });

  it('keeps the scroll hook and the single call to action in the over-hero header', () => {
    const html = header('over-hero');
    expect(root(html)).toMatch(/\sdata-header(?:=""|\s|>)/);
    expect(named(html, 'Get in touch')).toHaveLength(1);
  });

  it('every selector that reads data-over-hero is scoped to :root[data-theme] or a sample theme', () => {
    const rules = [...sheet.matchAll(/([^{}@]+)\{[^{}]*\}/g)].filter(([, sel = '']) =>
      /data-over-hero/.test(sel),
    );
    expect(rules.length, 'over-hero rules').toBeGreaterThan(0);
    for (const [, sel = ''] of rules)
      for (const one of sel.split(',').filter((part) => /data-over-hero/.test(part)))
        expect(one, one.trim()).toMatch(
          /:root\[data-theme=["']?(dag|natt)["']?\]|\[data-sample\]\[data-over-hero\]\[data-sample-theme(=["']?(dag|natt)["']?)?\]/,
        );
  });

  it('takes the Dag over-hero colours from the on-spruce rule of tokens.css, with no copy of its own', () => {
    // The fixture page links the header's styles only; the tokens are read from their source.
    const tokens = readFileSync(join(repo, 'src/styles/tokens.css'), 'utf8');
    const rules = [...`${tokens}\n${sheet}`.matchAll(/([^{}@]+)[{]([^{}]*)[}]/g)].filter(
      ([, sel = '']) => /data-over-hero/.test(sel),
    );
    // The one rule that sets on-spruce values for the header is the generated one, shared with the class.
    const setters = rules.filter(([, , body = '']) => /--fjord-color-bg\s*:/.test(body));
    expect(setters).toHaveLength(1);
    expect(setters[0]?.[1]).toMatch(/\.fjord-on-spruce\s*,/);
    expect(setters[0]?.[1]).toMatch(/:root\[data-theme=["']?dag["']?\] \.header\[data-over-hero\]/);
    // The header's own over-hero rules redefine one token at most: the border it does not draw.
    const redefined = rules
      .filter((rule) => rule !== setters[0])
      .flatMap(([, , body = '']) => body.match(/--fjord-[a-z0-9-]+(?=\s*:)/g) ?? []);
    expect([...new Set(redefined)]).toEqual(['--fjord-color-border']);
  });

  it('has over-hero rules for both Dag and Natt', () => {
    expect(sheet).toMatch(/:root\[data-theme=["']?dag["']?\][^{},]*\[data-over-hero\]/);
    expect(sheet).toMatch(/:root\[data-theme=["']?natt["']?\][^{},]*\[data-over-hero\]/);
  });

  it('Dag over the hero draws no border even when scrolled', () => {
    const rules = [...sheet.matchAll(/([^{}@]+)\{([^{}]*)\}/g)].filter(
      ([, sel = '']) =>
        /data-theme=["']?dag/.test(sel) && /data-over-hero/.test(sel) && !/__cta/.test(sel),
    );
    expect(rules.map(([, , body = '']) => body).join(';')).toMatch(
      /border-(block-end-)?(color|width)\s*:|border-block-end\s*:/,
    );
  });
});
