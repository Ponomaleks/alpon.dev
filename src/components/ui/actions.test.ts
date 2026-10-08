import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// AC-25 (T4): Icon, Button, Link, IconButton and their interactive states. A real production
// build of a throwaway fixture page (outside the repo) that renders every variant of the
// screens.md Styleguide rows Button, Link, IconButton and Icon; the test reads the built HTML
// and CSS. The 44 px measurement itself is T18's, in a real browser; here the size is a token.

const repo = fileURLToPath(new URL('../../../', import.meta.url));
const ui = (name: string) => join(repo, 'src/components/ui', name).replaceAll('\\', '/');
const ICONS = [
  'arrow-right',
  'menu',
  'x',
  'file-text',
  'map-pin',
  // T3 (AC-14, AC-15): the icons the home page needs.
  'play',
  'pause',
  'check',
  'chevron-down',
  'chevron-up',
  'copy',
  'download',
  // Design fix (T14): "Save contact (.vcf)" uses the design's add-to-contacts glyph.
  'user-plus',
  'mail',
  'phone',
  'linkedin',
  'github',
] as const;
let out = '';
let page = '';
let css = '';

const fixture = `---
import Icon from '${ui('Icon.astro')}';
import Button from '${ui('Button.astro')}';
import Link from '${ui('Link.astro')}';
import IconButton from '${ui('IconButton.astro')}';
---
<html lang="en"><head><title>actions</title></head><body>
<div data-case="btn-primary"><Button href="/go">Go</Button></div>
<div data-case="btn-secondary"><Button href="/go" variant="secondary">Go</Button></div>
<div data-case="btn-large-block-arrow"><Button href="/go" size="lg" block arrow>Go</Button></div>
<div data-case="btn-icon"><Button href="/cv" variant="secondary" icon="file-text">View CV</Button></div>
<div data-case="btn-element"><Button>Press</Button></div>
<div data-case="btn-disabled"><Button disabled>Off</Button></div>
<div data-case="btn-disabled-link"><Button href="/go" disabled>Off</Button></div>
<div data-case="btn-demo-hover"><Button href="/go" data-demo-state="hover">H</Button></div>
<div data-case="link-default"><Link href="/about">About</Link></div>
<div data-case="link-external"><Link href="https://github.com/x" external>GitHub</Link></div>
<div data-case="link-new-tab"><Link href="https://github.com/x" external newTab>Code</Link></div>
<div data-case="link-new-tab-inside"><Link href="/about" newTab>About</Link></div>
<div data-case="link-standalone"><Link href="/cv" standalone>Full CV</Link></div>
<div data-case="link-demo-focus"><Link href="/about" data-demo-state="focus">F</Link></div>
<div data-case="iconbtn"><IconButton icon="menu" label="Open menu" /></div>
<div data-case="iconbtn-disabled"><IconButton icon="x" label="Close menu" disabled /></div>
<div data-case="iconbtn-demo-active"><IconButton icon="x" label="Close menu" data-demo-state="active" /></div>
${ICONS.map((n) => `<div data-case="icon-${n}"><Icon name="${n}" /></div>`).join('\n')}
</body></html>
`;

beforeAll(() => {
  out = mkdtempSync(join(tmpdir(), 'fjord-actions-'));
  const src = join(out, 'fixture');
  mkdirSync(src);
  writeFileSync(join(src, 'ActionsPage.astro'), fixture);
  const config = join(src, 'astro.actions.config.mjs');
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
      name: 'actions-fixture',
      hooks: {
        'astro:config:setup': ({ injectRoute }) =>
          injectRoute({
            pattern: '/actions-fixture',
            entrypoint: ${JSON.stringify(pathToFileURL(join(src, 'ActionsPage.astro')).href)},
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
  page = readFileSync(join(out, 'dist', 'actions-fixture.html'), 'utf8');
  css = [...page.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)]
    .map((m) => readFileSync(join(out, 'dist', m[1] ?? ''), 'utf8'))
    .join('\n');
}, 180_000);

afterAll(() => {
  if (out) rmSync(out, { recursive: true, force: true });
});

/** The markup of one fixture case. */
function made(name: string): string {
  const m = page.match(new RegExp(`<div data-case="${name}">([\\s\\S]*?)</div>`));
  if (!m) throw new Error(`fixture case ${name} is missing from the built page`);
  return m[1] ?? '';
}
const classesOf = (tag: string) => (tag.match(/\bclass="([^"]*)"/)?.[1] ?? '').split(/\s+/);

/** Every innermost CSS rule as [selector, body], quotes in attribute selectors removed. */
function rules(): [string, string][] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, sel = '', body = '']) => [
    sel.trim().replaceAll(/["']/g, ''),
    body,
  ]);
}

describe('Icon', () => {
  it.each(ICONS)(
    '%s is an inline SVG: 1.5 stroke, currentColor, hidden from assistive tech',
    (n) => {
      const svg = made(`icon-${n}`);
      expect(svg).toMatch(/^\s*<svg\b/);
      expect(svg).toMatch(/aria-hidden="true"/);
      expect(svg).toMatch(/stroke="currentColor"/);
      expect(svg).toMatch(/stroke-width="1\.5"/);
      expect(svg).toMatch(/fill="none"/);
      expect(svg).not.toMatch(/\sstyle=/);
      expect(svg).toMatch(/<path\sd="[^"]{8,}"/);
      expect(svg).toMatch(/<(path|line|circle|polyline|rect)\b/);
    },
  );

  it('draws a different shape per name', () => {
    const shapes = new Set(ICONS.map((n) => made(`icon-${n}`)));
    expect(shapes.size).toBe(ICONS.length);
  });
});

describe('Button', () => {
  it('a link with href is an <a>, primary by default', () => {
    const el = made('btn-primary');
    expect(el).toMatch(/^\s*<a\b/);
    expect(el).toContain('href="/go"');
    expect(classesOf(el)).toEqual(expect.arrayContaining(['fj-btn', 'fj-btn--primary']));
    expect(classesOf(el)).not.toContain('fj-btn--lg');
  });

  it('secondary replaces primary', () => {
    const c = classesOf(made('btn-secondary'));
    expect(c).toContain('fj-btn--secondary');
    expect(c).not.toContain('fj-btn--primary');
  });

  it('large, block and arrow render the matching class and a hidden arrow icon', () => {
    const el = made('btn-large-block-arrow');
    expect(classesOf(el)).toEqual(expect.arrayContaining(['fj-btn--lg', 'fj-btn--block']));
    expect(el).toMatch(/<svg\b[^>]*aria-hidden="true"/);
  });

  it('a leading icon renders a hidden svg before the label', () => {
    const el = made('btn-icon');
    expect(el.indexOf('<svg')).toBeGreaterThan(-1);
    expect(el.indexOf('<svg')).toBeLessThan(el.indexOf('View CV'));
    expect(el).toMatch(/aria-hidden="true"/);
  });

  it('without href it is a <button type="button">', () => {
    const el = made('btn-element');
    expect(el).toMatch(/^\s*<button\b[^>]*type="button"/);
    expect(el).not.toContain('href=');
  });

  it('disabled: the button element gets disabled, a link gets aria-disabled and no href', () => {
    expect(made('btn-disabled')).toMatch(/^\s*<button\b[^>]*\bdisabled\b/);
    const link = made('btn-disabled-link');
    expect(link).toMatch(/aria-disabled="true"/);
    expect(link).not.toContain('href=');
  });

  it('passes data-demo-state through', () => {
    expect(made('btn-demo-hover')).toContain('data-demo-state="hover"');
  });
});

describe('Link (TextLink)', () => {
  it('default is an <a> with the link class and no rel', () => {
    const el = made('link-default');
    expect(el).toMatch(/^\s*<a\b[^>]*href="\/about"/);
    expect(classesOf(el)).toContain('fj-link');
    expect(el).not.toMatch(/\brel=/);
  });

  it('external carries rel="noopener noreferrer", the external class and a hidden icon', () => {
    const el = made('link-external');
    expect(el).toContain('rel="noopener noreferrer"');
    expect(classesOf(el)).toContain('fj-link--external');
    expect(el).toMatch(/<svg\b[^>]*aria-hidden="true"/);
  });

  it('external stays in the tab unless it is asked to open a new one', () => {
    expect(made('link-external')).not.toMatch(/\starget=/);
    expect(made('link-external')).not.toContain('new tab');
  });

  it('newTab opens an external link in a new tab and says so to assistive technology', () => {
    const el = made('link-new-tab');
    expect(el).toMatch(/^\s*<a\b[^>]*\starget="_blank"/);
    expect(el).toContain('rel="noopener noreferrer"');
    expect(el).toMatch(
      /<span\b[^>]*class="fj-link__hint"[^>]*>\s*\(opens in a new tab\)\s*<\/span>/,
    );
    // The visible label stays first, the hint follows it.
    expect(el.indexOf('Code')).toBeLessThan(el.indexOf('fj-link__hint'));
  });

  it('newTab does nothing on a link inside the site', () => {
    const el = made('link-new-tab-inside');
    expect(el).not.toMatch(/\starget=/);
    expect(el).not.toContain('fj-link__hint');
  });

  it('hides the new-tab hint from sight only', () => {
    const hint = rules().find(([sel]) => sel.split(',').includes('.fj-link__hint'));
    expect(hint?.[1]).toMatch(/position:\s*absolute/);
    expect(hint?.[1]).toMatch(/clip-path:\s*inset\(50%\)/);
    expect(hint?.[1]).not.toMatch(/display:\s*none|visibility:\s*hidden/);
  });

  it('standalone stays in the tab and carries the standalone class and a hidden arrow', () => {
    const el = made('link-standalone');
    expect(el).toMatch(/^\s*<a\b[^>]*href="\/cv"/);
    expect(classesOf(el)).toContain('fj-link--standalone');
    expect(classesOf(el)).not.toContain('fj-link--external');
    expect(el).not.toMatch(/\b(rel|target)=/);
    expect(el).toMatch(/<span class="fj-link__icon"[^>]*>\s*<svg\b[^>]*aria-hidden="true"/);
    // The arrow-right path, not the external arrow.
    expect(el).toContain(made('icon-arrow-right').match(/\bd="([^"]+)"/)?.[1]);
  });

  it('passes data-demo-state through', () => {
    expect(made('link-demo-focus')).toContain('data-demo-state="focus"');
  });
});

describe('IconButton', () => {
  it('is a <button type="button"> named by its label, with a hidden icon', () => {
    const el = made('iconbtn');
    expect(el).toMatch(/^\s*<button\b[^>]*type="button"/);
    expect(el).toContain('aria-label="Open menu"');
    expect(classesOf(el)).toContain('fj-iconbtn');
    expect(el).toMatch(/<svg\b[^>]*aria-hidden="true"/);
  });

  it('disabled sets the disabled attribute; demo state passes through', () => {
    expect(made('iconbtn-disabled')).toMatch(/<button\b[^>]*\bdisabled\b/);
    expect(made('iconbtn-demo-active')).toContain('data-demo-state="active"');
  });

  it('the label is a required prop (type check)', () => {
    const source = readFileSync(join(repo, 'src/components/ui/IconButton.astro'), 'utf8');
    expect(source).toMatch(/\blabel\s*:\s*string\b/);
    expect(source).not.toMatch(/\blabel\s*\?\s*:/);
  });

  it('is a 44 x 44 box from the tap token, not a literal', () => {
    const box = rules().find(
      ([sel, body]) => /\.fj-iconbtn(?![-\w])/.test(sel) && /width/.test(body),
    );
    expect(box?.[1]).toMatch(/width:\s*var\(--fjord-tap-min\)/);
    expect(box?.[1]).toMatch(/height:\s*var\(--fjord-tap-min\)/);
  });
});

describe('interactive states in the built CSS', () => {
  const kinds = [
    ['hover', ':hover'],
    ['focus', ':focus-visible'],
    ['active', ':active'],
  ] as const;

  describe.each(['fj-btn', 'fj-iconbtn', 'fj-link'])('.%s', (cls) => {
    it.each(kinds)('has a [data-demo-state="%s"] selector', (state) => {
      const hit = rules().some(
        ([sel]) => sel.includes(`.${cls}`) && sel.includes(`[data-demo-state=${state}]`),
      );
      expect(hit).toBe(true);
    });

    it.each(kinds)(
      'every %s pseudo-class rule is paired with its demo selector',
      (state, pseudo) => {
        const own = rules().filter(
          ([sel]) =>
            sel.includes(`.${cls}`) && sel.includes(pseudo) && !sel.includes('data-demo-state'),
        );
        for (const [sel] of own) {
          // The same rule, or one declared with the same body, lists the demo selector.
          expect(
            rules().some(
              ([s, b]) =>
                s.includes(`[data-demo-state=${state}]`) &&
                b === rules().find(([ss]) => ss === sel)?.[1],
            ),
          ).toBe(true);
        }
      },
    );
  });

  it('hover never moves the control itself: only the arrow and the link icon nudge', () => {
    const hover = rules().filter(([sel]) => /:hover|\[data-demo-state=hover\]/.test(sel));
    expect(hover.length).toBeGreaterThan(0);
    for (const [sel, body] of hover) {
      if (!/transform\s*:/.test(body)) continue;
      for (const part of sel.split(','))
        expect(part.trim(), `${sel} { ${body} }`).toMatch(/\s\.(fj-btn__arrow|fj-link__icon)$/);
    }
  });

  // The design's press (actions.css): the Button sinks 1px (the hairline token) and shrinks, the
  // IconButton shrinks.
  // `transform` values are an accepted gap of ADR-0004, so the design literals are written as is.
  it.each([
    ['fj-btn', /transform:\s*translateY\(var\(--fjord-border-width\)\)\s*scale\(0?\.985\)/],
    ['fj-iconbtn', /transform:\s*scale\(0?\.94\)/],
  ] as const)(
    '.%s moves when pressed, as in the design, and in its pressed sample',
    (cls, move) => {
      const pressed = rules().filter(
        ([sel, body]) => new RegExp(`\\.${cls}(?![-\\w])[^,]*:active`).test(sel) && move.test(body),
      );
      expect(pressed.length).toBe(1);
      const [sel = ''] = pressed[0] ?? [];
      expect(sel).toContain(`.${cls}[data-demo-state=active]`);
      // A disabled control does not react to a press.
      const live = sel.split(',').find((part) => part.includes(':active')) ?? '';
      expect(live).toMatch(/:not\(:disabled\)|:not\(\[aria-disabled=true\]\)/);
    },
  );

  it('the button arrow nudges with transform, as in the design, on hover and keyboard focus', () => {
    const nudge = rules().find(([sel]) => sel.includes('.fj-btn:hover .fj-btn__arrow'));
    expect(nudge?.[0]).toContain('.fj-btn:focus-visible .fj-btn__arrow');
    // The build may shorten translateX(x) to translate(x).
    expect(nudge?.[1]).toMatch(/transform:\s*translateX?\(var\(--fjord-space-0-5\)\)/);
    const arrow = rules().filter(([sel]) => sel.includes('.fj-btn__arrow'));
    for (const [sel, body] of arrow) expect(`${sel} { ${body} }`).not.toMatch(/\bleft\s*:/);
    expect(arrow.map(([, b]) => b).join(';')).toMatch(
      /transition:\s*transform var\(--fjord-duration-200\) var\(--fjord-ease-out\)/,
    );
    const off = rules().find(([sel]) => sel.includes('[aria-disabled=true] .fj-btn__arrow'));
    expect(off?.[1]).toMatch(/transform:\s*none/);
  });

  it('the external link draws its underline on hover and nudges its icon up and right', () => {
    const base = rules().find(([sel]) => sel.split(',').includes('.fj-link--external'));
    expect(base?.[1]).toMatch(/text-decoration:\s*none/);
    expect(base?.[1]).toMatch(/linear-gradient\(currentcolor,\s*currentcolor\)/i);
    const grown = rules().find(([sel]) => sel.includes('.fj-link--external:hover'));
    expect(grown?.[0]).toContain('.fj-link--external:focus-visible');
    expect(grown?.[1]).toMatch(/background-size:\s*100% /);
    const nudge = rules().find(([sel]) => sel.includes('.fj-link--external:hover .fj-link__icon'));
    expect(nudge?.[1]).toMatch(
      /transform:\s*translate\(var\(--fjord-space-0-5\),\s*calc\([^;]*var\(--fjord-space-0-5\)[^;]*\)\)/,
    );
  });

  // Design (actions.css): the standalone link shares the growing line and its arrow moves 3px right.
  it('the standalone link draws its underline on hover and nudges its arrow to the right', () => {
    const base = rules().find(([sel]) => sel.split(',').includes('.fj-link--standalone'));
    expect(base?.[1]).toMatch(/text-decoration:\s*none/);
    expect(base?.[1]).toMatch(/linear-gradient\(currentcolor,\s*currentcolor\)/i);
    const grown = rules().find(([sel]) => sel.includes('.fj-link--standalone:hover'));
    expect(grown?.[0]).toContain('.fj-link--standalone:focus-visible');
    expect(grown?.[1]).toMatch(/background-size:\s*100% /);
    const nudge = rules().find(([sel]) =>
      sel.includes('.fj-link--standalone:hover .fj-link__icon'),
    );
    expect(nudge?.[0]).toContain('.fj-link--standalone[data-demo-state=hover] .fj-link__icon');
    // 3px from tokens (2px + the 1px hairline); the build may shorten translateX(x) to translate(x).
    expect(nudge?.[1]).toMatch(
      /transform:\s*translateX?\(calc\(var\(--fjord-space-0-5\)\s*\+\s*var\(--fjord-border-width\)\)\)/,
    );
  });

  it('the link underline follows the design: offset in em, colour mixed from the text colour', () => {
    const link = rules().find(([sel]) => sel === '.fj-link');
    expect(link?.[1]).toMatch(/text-underline-offset:\s*0?\.22em/);
    expect(link?.[1]).toMatch(/text-decoration-color:\s*color-mix\(in srgb,\s*currentcolor 45%/i);
  });

  it('nothing moves outside a no-preference guard (AC-28)', () => {
    const guarded =
      /@media[^{]*prefers-reduced-motion:\s*no-preference[^{]*\{(?:[^{}]*\{[^{}]*\})*\s*\}/g;
    expect(css).toMatch(guarded);
    const outside = css.replace(guarded, '');
    const moving = [...outside.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(
      ([, sel = '', body = '']) =>
        /\.fj-(btn|iconbtn|link)/.test(sel) && /transform\s*:|transition\s*:/.test(body),
    );
    expect(moving.map(([rule]) => rule)).toEqual([]);
  });

  it('keyboard focus shows the Fjord ring', () => {
    const ring = rules().filter(
      ([sel]) => sel.includes(':focus-visible') && sel.includes('.fj-btn'),
    );
    expect(ring.length).toBeGreaterThan(0);
    expect(ring.map(([, b]) => b).join(';')).toMatch(/--fjord-color-focus-ring/);
  });
});

describe('output hygiene', () => {
  it('has no style attribute anywhere', () => {
    expect(page).not.toMatch(/\sstyle=/);
  });
});
