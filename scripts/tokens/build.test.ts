import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { create } from 'fontkitten';
import { chToEm, generateTokens } from './generate.ts';
import {
  HANDOFF_DIR,
  HANDOFF_PROJECT,
  MEASURE_FONT,
  readSources,
  zeroAdvance as lookupZeroAdvance,
  zeroAdvanceEm,
  type Sources,
} from './sources.ts';

// ADR-0001 generator: tokens.css with Dag, Natt and the no-JS Natt block from one list of values
// (AC-01, AC-02, AC-04), failing on a brand vs handoff palette conflict (AC-10).

const root = fileURLToPath(new URL('../../', import.meta.url));
const real = () => readSources(root);

/** The body of the first rule whose prelude is exactly `selector`, braces balanced. */
function block(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no block ${selector}`);
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return css.slice(css.indexOf('{', start) + 1, i);
  }
  throw new Error(`unclosed block ${selector}`);
}

/** Declarations of a block body as [property, value] pairs, in order. */
function declarations(body: string): [string, string][] {
  return body
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const colon = d.indexOf(':');
      return [d.slice(0, colon).trim(), d.slice(colon + 1).trim()];
    });
}

const value = (body: string, property: string) =>
  declarations(body).find(([p]) => p === property)?.[1];

const NO_JS = ':root:not([data-theme])';
const nattBlock = (css: string) => block(css, '[data-theme="natt"]');
const noJsBlock = (css: string) => block(block(css, '@media (prefers-color-scheme: dark)'), NO_JS);

function withFile(sources: Sources, file: keyof Sources['handoff'], css: string): Sources {
  return { ...sources, handoff: { ...sources.handoff, [file]: css } };
}

describe('generateTokens', () => {
  it('writes the ADR-0001 block layout in order', () => {
    const css = generateTokens(real());
    expect(css.trimStart().startsWith('/*')).toBe(true);
    expect(css.slice(0, css.indexOf('*/'))).toMatch(/generated — do not edit/i);
    const order = [
      ':root {',
      '[data-theme="dag"] {',
      '[data-theme="natt"] {',
      `@media (prefers-color-scheme: dark) {`,
      '.fjord-on-spruce,',
      '@media (min-width: 768px) {',
      '@media (min-width: 1024px) {',
    ].map((part) => css.indexOf(part));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('the on-spruce values are written once, for the class and for the Dag header over the hero', () => {
    const css = generateTokens(real());
    // One rule, three selectors (home AC-33): the class, the live header over the hero in Dag and
    // its Styleguide sample. No second copy of the values anywhere.
    expect(css).toContain(
      [
        '.fjord-on-spruce,',
        ':root[data-theme="dag"] .header[data-over-hero],',
        '.header[data-sample][data-over-hero][data-sample-theme="dag"] {',
      ].join('\n'),
    );
    expect(css.match(/--fjord-color-cta-hover:/g)).toHaveLength(
      (css.match(/--fjord-color-cta-bg:/g) ?? []).length,
    );
    const body = block(css, '.header[data-sample][data-over-hero][data-sample-theme="dag"]');
    expect(value(body, '--fjord-color-bg')).toBe('var(--fjord-spruce)');
    expect(value(body, '--fjord-color-cta-hover')).toBeDefined();
    // Natt keeps its own header: the Natt override stays on the class alone.
    expect(css).toContain('[data-theme="natt"] .fjord-on-spruce {');
    expect(css).not.toMatch(/\[data-theme="natt"\][^{}]*\[data-over-hero\]/);
  });

  it(':root carries the brand palette, Dag semantics, non-color tokens and color-scheme light', () => {
    const rootBody = block(generateTokens(real()), ':root');
    const brand = real().brand.color;
    expect(value(rootBody, '--fjord-spruce')?.toUpperCase()).toBe(brand.spruce.hex);
    expect(value(rootBody, '--fjord-lichen')?.toUpperCase()).toBe(brand.lichen.hex);
    expect(value(rootBody, '--fjord-color-bg')).toBe('var(--fjord-stone)');
    expect(value(rootBody, '--fjord-space-4')).toBe('16px');
    expect(value(rootBody, '--fjord-text-body')).toMatch(/^clamp\(/);
    expect(value(rootBody, '--fjord-duration-200')).toBe('200ms');
    expect(value(rootBody, 'color-scheme')).toBe('light');
  });

  it('[data-theme="dag"] resets every token that Natt changes, with color-scheme light', () => {
    const css = generateTokens(real());
    const dag = declarations(block(css, '[data-theme="dag"]')).map(([p]) => p);
    const natt = declarations(nattBlock(css)).map(([p]) => p);
    expect(dag).toEqual(expect.arrayContaining(natt));
    expect(value(block(css, '[data-theme="dag"]'), 'color-scheme')).toBe('light');
    expect(value(block(css, '[data-theme="dag"]'), '--fjord-shadow-float')).toBe(
      value(block(css, ':root'), '--fjord-shadow-float'),
    );
  });

  it('the Natt block and the no-JS Natt block list identical declarations', () => {
    const css = generateTokens(real());
    const natt = declarations(nattBlock(css));
    expect(declarations(noJsBlock(css))).toEqual(natt);
    expect(Object.fromEntries(natt)).toMatchObject({
      '--fjord-color-bg': '#111A17',
      'color-scheme': 'dark',
    });
    expect(natt.map(([p]) => p)).toContain('--fjord-shadow-float');
  });

  it('a hero keeps the Natt ground: its selector shares the Natt rule and the no-JS Natt block', () => {
    const css = generateTokens(real());
    // Page design: `'x-hero' + (dark ? ' x-hero--natt' : ' fjord-on-spruce')`. The theme cannot
    // remove the class, so in Natt the hero takes the Natt values again, above the on-spruce ones.
    expect(css).toContain(':root[data-theme="natt"] [data-hero],\n[data-theme="natt"] {');
    expect(css).toContain('  :root:not([data-theme]) [data-hero],\n  :root:not([data-theme]) {');
    // No second copy of the Natt values.
    expect(css.match(/--fjord-color-bg: #111A17;/g)).toHaveLength(2);
    // Every token the on-spruce rules set is set again by the Natt rule, so nothing of spruce stays.
    const natt = declarations(nattBlock(css)).map(([p]) => p);
    const spruce = [
      ...declarations(block(css, '.header[data-sample][data-over-hero][data-sample-theme="dag"]')),
      ...declarations(block(css, '[data-theme="natt"] .fjord-on-spruce')),
    ]
      .map(([p]) => p)
      .filter((p) => p.startsWith('--') || p === 'color-scheme' || p === 'color');
    expect(natt).toEqual(expect.arrayContaining(spruce));
  });

  it('fails on a brand vs handoff palette conflict, naming the token and both values', () => {
    const sources = real();
    const colors = sources.handoff.colors.replace(
      '--fjord-spruce: #24493D',
      '--fjord-spruce: #24493E',
    );
    expect(colors).not.toBe(sources.handoff.colors);
    expect(() => generateTokens(withFile(sources, 'colors', colors))).toThrow(
      /--fjord-spruce.*#24493D.*#24493E/,
    );
  });

  it('a Natt-only token in any handoff file reaches both Natt blocks', () => {
    const sources = real();
    const motion = `${sources.handoff.motion}\n[data-theme="natt"] { --fjord-test-natt-only: 3px; }\n`;
    const css = generateTokens(withFile(sources, 'motion', motion));
    expect(value(nattBlock(css), '--fjord-test-natt-only')).toBe('3px');
    expect(value(noJsBlock(css), '--fjord-test-natt-only')).toBe('3px');
  });

  it('the committed src/styles/tokens.css is the generator output', () => {
    const committed = readFileSync(`${root}src/styles/tokens.css`, 'utf8');
    expect(committed.replace(/\r\n/g, '\n')).toBe(generateTokens(real()));
  });
});

describe('print block (cv ADR-0002, AC-12)', () => {
  const PRINT = '@media print';

  /** [selector list, body] of every rule directly inside the print media block, in order. */
  function printRules(css: string): [selectors: string[], body: string][] {
    const body = block(css, PRINT);
    const rules: [string[], string][] = [];
    let from = 0;
    for (let open = body.indexOf('{', from); open >= 0; open = body.indexOf('{', from)) {
      const close = body.indexOf('}', open);
      const prelude = body.slice(from, open).replace(/\/\*[\s\S]*?\*\//g, '');
      rules.push([
        prelude
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        body.slice(open + 1, close),
      ]);
      from = close + 1;
    }
    return rules;
  }
  /** What the block sets, later declarations replacing earlier ones. */
  const printed = (css: string) =>
    new Map(printRules(css).flatMap(([, body]) => declarations(body)));
  const selectors = (css: string) => printRules(css).flatMap(([s]) => s);

  it('exists once, as a print media block', () => {
    const css = generateTokens(real());
    expect(css.match(/@media print\b/g)).toHaveLength(1);
    expect(printRules(css).length).toBeGreaterThan(0);
  });

  it('is written after the Dag, Natt and no-JS Natt blocks, so it wins on order', () => {
    const css = generateTokens(real());
    const at = css.indexOf(PRINT);
    expect(at).toBeGreaterThan(css.indexOf('@media (prefers-color-scheme: dark) {'));
    expect(at).toBeGreaterThan(css.indexOf('[data-theme="natt"] {'));
    expect(at).toBeGreaterThan(css.indexOf('[data-theme="dag"] {'));
  });

  it('reaches every theme state: Dag, Natt, the no-JS root and a hero in Natt', () => {
    const list = selectors(generateTokens(real()));
    expect(list).toEqual(
      expect.arrayContaining([
        ':root',
        '[data-theme="dag"]',
        '[data-theme="natt"]',
        ':root:not([data-theme])',
        ':root[data-theme="natt"] [data-hero]',
        ':root:not([data-theme]) [data-hero]',
      ]),
    );
  });

  it('is not weaker than the Natt rules: no selector is less specific than its Natt twin', () => {
    // A print selector that is `:root` alone (0,1,0) is beaten by `[data-theme="natt"]` (0,1,0)
    // only by order, which the order test above pins; the compound ones must carry :root.
    const list = selectors(generateTokens(real()));
    expect(list).toContain(':root[data-theme="natt"]');
    expect(list).toContain(':root:not([data-theme])');
  });

  it('sets back to its Dag value every token the Natt set overrides', () => {
    const css = generateTokens(real());
    const dag = new Map(declarations(block(css, '[data-theme="dag"]')));
    const out = printed(css);
    const sheet = new Set(['--fjord-color-bg', '--fjord-color-text']);
    for (const [property] of declarations(nattBlock(css))) {
      if (sheet.has(property)) continue;
      expect(out.get(property), property).toBe(dag.get(property));
    }
  });

  it('takes the sheet background and text from the print primitives', () => {
    const out = printed(generateTokens(real()));
    expect(out.get('--fjord-color-bg')).toBe('var(--fjord-print-bg)');
    expect(out.get('--fjord-color-text')).toBe('var(--fjord-print-text)');
  });

  it('is colours only: nothing in the block sets a non-colour token', () => {
    const css = generateTokens(real());
    const natt = new Set(declarations(nattBlock(css)).map(([p]) => p));
    for (const [property] of printed(css)) expect(natt.has(property), property).toBe(true);
  });
});

describe('reduced motion (sad §8 Motion, AC-14)', () => {
  const REDUCE = '@media (prefers-reduced-motion: reduce)';
  const reduceBlock = (css: string) => block(block(css, REDUCE), ':root');

  it('collapses every movement distance and the count-up duration to zero', () => {
    const reduce = Object.fromEntries(declarations(reduceBlock(generateTokens(real()))));
    expect(reduce).toMatchObject({
      '--fjord-reveal-rise': '0px',
      '--fjord-parallax-max': '0px',
      '--fjord-duration-1200': '0ms',
    });
  });

  /** The reduced-motion :root of the tokens generated with extra lines in a handoff file. */
  const reduceWith = (extra: string) => {
    const sources = real();
    const css = generateTokens(
      withFile(sources, 'motion', `${sources.handoff.motion}\n${extra}\n`),
    );
    return Object.fromEntries(declarations(reduceBlock(css)));
  };
  /** A rule that uses `token` as a factor, the way the handoff scales (scale(.985), scale(.94)). */
  const asFactor = (token: string) => `.fjord-test-press { transform: scale(var(${token})); }`;
  /** A rule that uses `token` as a delta added to 1. */
  const asDelta = (token: string) =>
    `.fjord-test-grow { transform: scale(calc(1 + var(${token}))); }`;

  it('collapses slide distances to 0 and resets a factor, used as scale(var()), to 1', () => {
    const reduce = reduceWith(
      `:root { --fjord-slide-x: 24px; --fjord-press-scale: 0.985; }\n${asFactor('--fjord-press-scale')}`,
    );
    expect(reduce).toMatchObject({ '--fjord-slide-x': '0px', '--fjord-press-scale': '1' });
  });

  it('resets a delta, used as calc(1 + var()), to 0', () => {
    const reduce = reduceWith(
      `:root { --fjord-hover-scale: 0.015; }\n${asDelta('--fjord-hover-scale')}`,
    );
    expect(reduce).toMatchObject({ '--fjord-hover-scale': '0' });
  });

  it('classifies a scale token by its use in the component CSS, where the handoff scales', () => {
    const sources = real();
    const motion = `${sources.handoff.motion}\n:root { --fjord-press-scale: 0.985; }\n`;
    const usage = `${sources.handoff.usage}\n${asFactor('--fjord-press-scale')}\n`;
    const css = generateTokens(withFile(withFile(sources, 'motion', motion), 'usage', usage));
    expect(Object.fromEntries(declarations(reduceBlock(css)))).toMatchObject({
      '--fjord-press-scale': '1',
    });
  });

  it('reads the handoff component and base CSS as scale usage', () => {
    const { usage } = real().handoff;
    expect(usage).toMatch(/\.fj-btn:active[^{]*\{[^}]*scale\(/);
    expect(usage).toMatch(/@keyframes fjord-drift/);
  });

  it('fails on a scale token that the handoff uses neither as a factor nor as a delta', () => {
    const sources = real();
    const motion = `${sources.handoff.motion}\n:root { --fjord-press-scale: 0.985; }\n`;
    expect(() => generateTokens(withFile(sources, 'motion', motion))).toThrow(
      /--fjord-press-scale.*neither.*factor.*delta/,
    );
  });

  it.each([
    ['typography', '--fjord-type-scale', '1.25'],
    ['spacing', '--fjord-card-rise', '8px'],
    ['colors', '--fjord-hero-parallax', '12px'],
    ['spacing', '--fjord-slide-x', '24px'],
  ] as const)(
    'fails on a movement token declared outside motion.css (%s: %s)',
    (file, token, v) => {
      const sources = real();
      const css = `${sources.handoff[file]}\n:root { ${token}: ${v}; }\n`;
      expect(() => generateTokens(withFile(sources, file, css))).toThrow(
        new RegExp(`${token}.*${file}\\.css.*motion\\.css`),
      );
    },
  );

  it('fails loudly on a motion token that is not a plain number', () => {
    const sources = real();
    const motion = `${sources.handoff.motion}\n:root { --fjord-slide-x: clamp(8px, 2vw, 24px); }\n`;
    expect(() => generateTokens(withFile(sources, 'motion', motion))).toThrow(
      /--fjord-slide-x.*plain number/,
    );
  });

  it('no reduced-motion token can make an element invisible (no unitless 0)', () => {
    const reduce = reduceWith(
      `:root { --fjord-press-scale: 0.985; }\n${asFactor('--fjord-press-scale')}`,
    );
    for (const [property, v] of Object.entries(reduce))
      expect(v, `${property}: ${v}`).not.toMatch(/^-?0*\.?0+$/);
  });

  it('keeps a 200ms --fjord-duration-fade in both modes and leaves other durations intact', () => {
    const css = generateTokens(real());
    expect(value(block(css, ':root'), '--fjord-duration-fade')).toBe('200ms');
    const reduce = declarations(reduceBlock(css)).map(([p]) => p);
    expect(reduce).not.toContain('--fjord-duration-fade');
    expect(reduce.filter((p) => p.startsWith('--fjord-duration-'))).toEqual([
      '--fjord-duration-1200',
    ]);
  });

  it('marks the deliberate deviation from the handoff motion.css', () => {
    expect(block(generateTokens(real()), REDUCE)).toMatch(
      /deviation from the handoff motion\.css/i,
    );
  });
});

describe('font stacks (sad §8 Fonts, AC-05)', () => {
  const faceNames = () =>
    [
      ...readFileSync(`${root}src/styles/fonts.css`, 'utf8').matchAll(
        /font-family:\s*['"]([^'"]+)['"]/g,
      ),
    ].map((m) => m[1]);
  const stack = (property: string) =>
    value(block(generateTokens(real()), ':root'), property)
      ?.split(',')
      .map((name) => name.trim().replace(/^['"]|['"]$/g, ''));

  it.each([
    ['--fjord-font-sans', 'Schibsted Grotesk', 'sans-serif'],
    ['--fjord-font-mono', 'JetBrains Mono', 'monospace'],
  ])(
    '%s lists the brand face, its Arial and Roboto fallback faces, then the generic family',
    (token, family, generic) => {
      const names = stack(token);
      expect(names).toEqual([
        family,
        `${family} Fallback Arial`,
        `${family} Fallback Roboto`,
        generic,
      ]);
      for (const name of names?.slice(0, 3) ?? []) expect(faceNames()).toContain(name);
    },
  );
});

// Review 2026-10-02-3 S1-05: a `ch` measure depends on the face, so the box widened from 624 px
// (fallback) to 672 px (brand) and the text rewrapped on swap. The generator converts the handoff
// `ch` measures to `em` (font-size relative like `ch`, face independent) with the advance of "0"
// in Schibsted Grotesk, read from the font file.
describe('measure tokens (sad §8 Fonts, AC-05)', () => {
  const zeroAdvance = () => {
    const font = create(readFileSync(`${root}design/brand/fonts/SchibstedGrotesk-Regular.ttf`));
    if (!('glyphForCodePoint' in font)) throw new Error('font collection');
    return font.glyphForCodePoint(0x30).advanceWidth / font.unitsPerEm;
  };

  it('reads the advance of "0" from the Schibsted Grotesk Regular file', () => {
    expect(real().zeroAdvance).toBe(1252 / 2048);
  });

  it('reads the same advance as the font file reports', () => {
    expect(zeroAdvance()).toBe(1252 / 2048);
  });

  it('accepts a mapped glyph with an advance in (0, 1] em', () => {
    expect(zeroAdvanceEm(17, 1252, 2048)).toBe(1252 / 2048);
    expect(zeroAdvanceEm(17, 2048, 2048)).toBe(1);
  });

  it('fails loudly on a font without "0" (glyph id 0 is .notdef)', () => {
    expect(() => zeroAdvanceEm(0, 1024, 2048)).toThrow(/no "0"|\.notdef/);
  });

  // Review 2026-10-03-2 S2-16: through the real lookup, so a constant glyph id or a changed
  // fontkitten result for an unmapped code point fails here. U+4E00 is not in the Latin subset.
  it('fails loudly when the real measure font has no glyph for the code point', () => {
    expect(() => lookupZeroAdvance(`${root}${MEASURE_FONT}`, 0x4e00)).toThrow(/no "0"|\.notdef/);
  });

  it.each([
    ['zero', 0, 2048],
    ['negative', -1, 2048],
    ['wider than 1 em', 2049, 2048],
    ['NaN', Number.NaN, 2048],
    ['Infinity', Number.POSITIVE_INFINITY, 2048],
    ['zero units per em', 1252, 0],
  ])('fails loudly on a "0" advance that is %s', (_name, advance, unitsPerEm) => {
    expect(() => zeroAdvanceEm(17, advance, unitsPerEm)).toThrow(/advance/);
  });

  it.each([
    ['66ch', 0.5, '33em'],
    ['48ch', 1252 / 2048, '29.344em'],
    ['66ch', 1252 / 2048, '40.348em'],
    [' 12.5ch ', 0.6, '7.5em'],
  ])('converts %s with an advance of %d em to %s', (ch, advance, em) => {
    expect(chToEm(ch, advance)).toBe(em);
  });

  it.each(['48', '48em', '48ch 1px', 'var(--x)'])(
    'fails loudly on %s, which is not a ch length',
    (bad) => {
      expect(() => chToEm(bad, 0.6)).toThrow(/is not a ch length/);
    },
  );

  it.each([Number.NaN, Number.POSITIVE_INFINITY, 0, -0.6, 1.01])(
    'rejects an advance of %d em',
    (bad) => {
      expect(() => chToEm('48ch', bad)).toThrow(/advance/);
    },
  );

  it('emits both measures in em from the font metrics, never in ch', () => {
    const css = generateTokens(real());
    const rootBlock = block(css, ':root');
    expect(value(rootBlock, '--fjord-measure')).toBe(chToEm('66ch', zeroAdvance()));
    expect(value(rootBlock, '--fjord-measure-narrow')).toBe(chToEm('48ch', zeroAdvance()));
    expect(css).not.toMatch(/\d(?:\.\d+)?ch\b/);
  });

  it('follows the font metrics, not a literal', () => {
    const rootBlock = block(generateTokens({ ...real(), zeroAdvance: 0.5 }), ':root');
    expect(value(rootBlock, '--fjord-measure')).toBe('33em');
    expect(value(rootBlock, '--fjord-measure-narrow')).toBe('24em');
  });
});

// base-components T1 (AC-26, ADR-0001 of that feature): the generator reads the site copy of the
// design system and only adds declarations; no value that tokens.css had before changes.
describe('site copy of the design system (base-components AC-26)', () => {
  /** Every declaration as `selector path | property` -> value, with at-rule nesting in the key. */
  function flatten(css: string): Map<string, string> {
    const out = new Map<string, string>();
    const stack: string[] = [];
    let buffer = '';
    for (const ch of css.replace(/\/\*[\s\S]*?\*\//g, '')) {
      if (ch === '{') {
        stack.push(buffer.trim().replace(/\s+/g, ' '));
        buffer = '';
      } else if (ch === '}') {
        stack.pop();
        buffer = '';
      } else if (ch === ';') {
        const colon = buffer.indexOf(':');
        // A rule that lists several selectors holds the declaration for each of them.
        const rule = stack.at(-1) ?? '';
        const selectors = rule.startsWith('@') ? [rule] : rule.split(',').map((s) => s.trim());
        for (const selector of selectors)
          out.set(
            `${[...stack.slice(0, -1), selector].join(' > ')} | ${buffer.slice(0, colon).trim()}`,
            buffer.slice(colon + 1).trim(),
          );
        buffer = '';
      } else buffer += ch;
    }
    return out;
  }

  it('reads the token and usage files under design/handoff/site/project/_ds/', () => {
    expect(HANDOFF_PROJECT).toMatch(/^design\/handoff\/site\/project\/_ds\//);
    expect(HANDOFF_PROJECT).not.toContain('handoff/design-system/');
    expect(HANDOFF_DIR).toBe(`${HANDOFF_PROJECT}/tokens`);
  });

  it('keeps every declaration of the previous tokens.css with its value (added declarations only)', () => {
    const before = flatten(
      readFileSync(`${root}scripts/tokens/fixtures/tokens-before-base-components.css`, 'utf8'),
    );
    const after = flatten(generateTokens(real()));
    expect(before.size).toBeGreaterThan(100);
    const changed = [...before]
      .filter(([key, v]) => after.get(key) !== v)
      .map(([key, v]) => `${key}: ${v} -> ${after.get(key) ?? '(missing)'}`);
    expect(changed).toEqual([]);
  });

  it('emits the layer, space, UI text size, header and Toast duration tokens', () => {
    const rootBody = block(generateTokens(real()), ':root');
    const z = declarations(rootBody)
      .map(([p]) => p)
      .filter((p) => p.startsWith('--fjord-z-'));
    expect(z).toEqual(
      expect.arrayContaining([
        '--fjord-z-base',
        '--fjord-z-header',
        '--fjord-z-toast',
        '--fjord-z-skip',
      ]),
    );
    expect(value(rootBody, '--fjord-z-toast')).toBe('60');
    expect(value(rootBody, '--fjord-space-5')).toBe('20px');
    expect(value(rootBody, '--fjord-space-404')).toBe('clamp(40px, 6vw, 112px)');
    expect(value(rootBody, '--fjord-text-ui')).toBe('15px');
    expect(value(rootBody, '--fjord-text-ui-sm')).toBe('14px');
    expect(value(rootBody, '--fjord-header-height-compact')).toBe('60px');
    expect(value(rootBody, '--fjord-duration-toast')).toBe('4000ms');
  });

  it('both Natt blocks stay identical', () => {
    const css = generateTokens(real());
    expect(declarations(noJsBlock(css))).toEqual(declarations(nattBlock(css)));
  });
});
