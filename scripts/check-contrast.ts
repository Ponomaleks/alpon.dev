// Contrast check over the generated tokens (fjord-foundation AC-10, sad QG-3). Resolves every
// manifest pair per theme from src/styles/tokens.css, computes the WCAG ratio and fails naming
// pair · theme · ratio. Decorative pairs are measured and printed, never gated. Also asserts the no-JS Natt block equals [data-theme="natt"] (ADR-0001).
//
// Run from the repo root: node scripts/check-contrast.ts

import { readFileSync } from 'node:fs';
import { KNOWN_FAILURES, PAIRS, THRESHOLD, type Theme } from './contrast-pairs.ts';
import { parseCss, type Declaration, type Stylesheet } from './tokens/parse.ts';

type Rgba = [r: number, g: number, b: number, a: number];
type Tokens = Map<string, string>;

export interface Measured {
  fg: string;
  bg: string;
  theme: Theme;
  ratio: number;
  threshold: number;
}

export interface ContrastResult {
  failures: string[];
  /** Pairs in KNOWN_FAILURES that still fail: reported, not fatal. */
  known: string[];
  /** Pairs of kind 'decorative': reported with their ratio, never gated. */
  decorative: string[];
  /** The gated pairs. */
  measured: Measured[];
  checked: number;
}

// A rule may list several selectors (the on-spruce rule also names the header over the hero, the
// Natt rules also name a hero).
const names = (rule: { selector: string }, selector: string) =>
  rule.selector
    .split(',')
    .map((part) => part.trim())
    .includes(selector);

function ruleDeclarations(sheet: Stylesheet, selector: string): Declaration[] {
  const rule = sheet.rules.find((r) => names(r, selector));
  if (!rule) throw new Error(`tokens.css has no ${selector} block`);
  return rule.declarations;
}

function noJsNatt(sheet: Stylesheet): Declaration[] {
  const media = sheet.media.find((m) => m.query === '@media (prefers-color-scheme: dark)');
  const rule = media?.rules.find((r) => names(r, ':root:not([data-theme])'));
  if (!rule) throw new Error('tokens.css has no no-JS Natt block');
  return rule.declarations;
}

function parseColor(value: string): Rgba | null {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((d) => d + d).join('') : hex;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)).concat(1) as Rgba;
  }
  const rgba = value.match(/^rgba?\(([^)]+)\)$/)?.[1];
  if (rgba) {
    const [r = 0, g = 0, b = 0, a = 1] = rgba.split(',').map((n) => Number(n.trim()));
    return [r, g, b, a];
  }
  return null;
}

function resolve(tokens: Tokens, name: string, seen = new Set<string>()): Rgba {
  if (seen.has(name)) throw new Error(`circular token ${name}`);
  const value = tokens.get(name);
  if (value === undefined) throw new Error(`token ${name} is not defined`);
  const reference = value.match(/^var\((--[a-z0-9-]+)\)$/)?.[1];
  if (reference) return resolve(tokens, reference, seen.add(name));
  const color = parseColor(value);
  if (!color) throw new Error(`token ${name} is not a color: ${value}`);
  return color;
}

/** A translucent color over an opaque one. */
const over = ([r, g, b, a]: Rgba, [br, bg, bb]: Rgba): Rgba => [
  r * a + br * (1 - a),
  g * a + bg * (1 - a),
  b * a + bb * (1 - a),
  1,
];

function luminance([r, g, b]: Rgba): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(fg: Rgba, bg: Rgba): number {
  const [light, dark] = [luminance(fg), luminance(bg)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

export function checkContrast(css: string): ContrastResult {
  const sheet = parseCss(css);
  const root = ruleDeclarations(sheet, ':root');
  const natt = ruleDeclarations(sheet, '[data-theme="natt"]');
  const failures: string[] = [];

  const noJs = noJsNatt(sheet);
  if (JSON.stringify(noJs) !== JSON.stringify(natt)) {
    const differing = [...new Set([...natt, ...noJs].map(([p]) => p))].filter(
      (p) => natt.find(([q]) => q === p)?.[1] !== noJs.find(([q]) => q === p)?.[1],
    );
    failures.push(`no-JS Natt block differs from [data-theme="natt"]: ${differing.join(', ')}`);
  }

  const dag: Tokens = new Map([...root, ...ruleDeclarations(sheet, '[data-theme="dag"]')]);
  const themes: Record<Theme, Tokens> = {
    Dag: dag,
    Natt: new Map([...root, ...natt]),
    'on-spruce': new Map([...dag, ...ruleDeclarations(sheet, '.fjord-on-spruce')]),
  };

  const known: string[] = [];
  const decorative: string[] = [];
  const measured: Measured[] = [];
  for (const pair of PAIRS) {
    for (const theme of pair.themes) {
      const tokens = themes[theme];
      const background = over(resolve(tokens, pair.bg), resolve(tokens, '--fjord-color-bg'));
      const ratio = contrastRatio(over(resolve(tokens, pair.fg), background), background);
      const name = `${pair.fg} on ${pair.bg} · ${theme}`;
      if (pair.kind === 'decorative') {
        decorative.push(`${name} · ${ratio.toFixed(2)}:1 (decorative, not gated)`);
        continue;
      }
      const threshold = THRESHOLD[pair.kind];
      measured.push({ fg: pair.fg, bg: pair.bg, theme, ratio, threshold });
      const expected = KNOWN_FAILURES.find(
        (k) => k.fg === pair.fg && k.bg === pair.bg && k.theme === theme,
      );
      const line = `${name} · ${ratio.toFixed(2)}:1 (needs ${threshold}:1)`;
      if (ratio >= threshold) {
        if (expected)
          failures.push(`known failure ${name} now passes: move it out of KNOWN_FAILURES`);
      } else if (expected) known.push(`${line} · ${expected.note}`);
      else failures.push(line);
    }
  }
  return { failures, known, decorative, measured, checked: measured.length };
}

if (import.meta.main) {
  const { failures, known, decorative, measured } = checkContrast(
    readFileSync('src/styles/tokens.css', 'utf8'),
  );
  // Failing pairs are printed below, as known failures or as errors.
  for (const m of measured.filter((p) => p.ratio >= p.threshold))
    console.log(`${m.fg} on ${m.bg} · ${m.theme} · ${m.ratio.toFixed(2)}:1 (≥ ${m.threshold}:1)`);
  for (const k of known) console.log(k);
  for (const d of decorative) console.log(d);
  if (failures.length > 0) {
    console.error(`contrast check failed:\n  ${failures.join('\n  ')}`);
    process.exit(1);
  }
  console.log(
    `contrast: ${measured.length - known.length} pairs pass, ${known.length} known failure(s), ${decorative.length} decorative pair(s) not gated`,
  );
}
