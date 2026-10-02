import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { generateTokens } from './generate.ts';
import { readSources, type Sources } from './sources.ts';

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
      '.fjord-on-spruce {',
      '@media (min-width: 768px) {',
      '@media (min-width: 1024px) {',
    ].map((part) => css.indexOf(part));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
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
