// @ts-check
// Token-only styles (base-components ADR-0004): colour, spacing, type size, radius, duration and
// easing in a page or component style come from a --fjord-* token. Colour literals are banned in
// every property; the properties listed below take tokens only. Everything else is standard CSS.

import { readFileSync } from 'node:fs';

/** Every --fjord-* token tokens.css declares; any other var(--fjord-*) is a typo. */
const declared = [
  ...new Set(
    readFileSync(new URL('./src/styles/tokens.css', import.meta.url), 'utf8').match(
      /(?<=^\s*)--fjord-[a-z0-9-]+(?=\s*:)/gm,
    ) ?? [],
  ),
];
const undeclaredToken = new RegExp(
  String.raw`var\(\s*--fjord-(?!(?:${declared.map((t) => t.slice('--fjord-'.length)).join('|')})\s*[,)])`,
);

/**
 * The strict-value rule checks a value part by part, split at spaces, so the patterns below
 * describe one part each. A part may end with the comma of a list (transition, background).
 */

/** One Fjord token, with no fallback value. */
const token = /^var\(--fjord-[a-z0-9-]+\),?$/;

/** Accepted on every enforced property besides a token. */
const everywhere = [token, '0', 'inherit', 'initial', 'unset', 'revert', 'revert-layer'];

/**
 * calc(), min(), max() and clamp() over tokens: at least one token, plain numbers as factors
 * (`calc(var(--fjord-space-2) * 2)`), no number with a unit or a percent sign.
 */
const tokenMath =
  /^(?=.*var\(--fjord-)(?:calc|min|max|clamp)\((?:var\(--fjord-[a-z0-9-]+\)|(?:calc|min|max|clamp)\(|-?\d*\.?\d+(?![\w%.])|[-+*/(),\s])+\),?$/;

/**
 * Colour values: the keywords and any function but var() (color-mix(), gradients, url()). A
 * literal colour inside a function is caught by the colour-literal rules below.
 */
const colour = ['transparent', /^currentcolor$/i, 'none', /^(?!var\()[a-z-]+\([\s\S]*\),?$/];

/** A number with or without a unit: the width in a border shorthand, a background position. */
const dimension = /^-?\d*\.?\d+[a-z%]*,?$/;

/** The parts of a border or outline shorthand that are not its colour. */
const lineParts = [
  dimension,
  /^(?:thin|medium|thick|auto)$/,
  /^(?:hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)$/,
];

/** The parts of a background shorthand that are not its colour. */
const backgroundParts = [
  dimension,
  '/',
  /^(?:left|right|top|bottom|center|auto|cover|contain),?$/,
  /^(?:repeat|repeat-x|repeat-y|no-repeat|space|round|scroll|fixed|local),?$/,
  /^(?:border-box|padding-box|content-box|text),?$/,
];

/**
 * Names in a transition or animation shorthand (property, animation name, `infinite`, `both`),
 * except the keyword easings: tokens hold the curves. A plain number is an iteration count.
 */
const motionParts = [
  /^(?!(?:ease(?:-in|-out|-in-out)?|linear|step-start|step-end),?$)-?[a-z_][a-z0-9_-]*,?$/i,
  /^\d+,?$/,
];

const sides = '(-(top|right|bottom|left|block|inline)(-(start|end))?)?';

/** Enforced properties, and what each group accepts besides a token and `everywhere`. */
const enforced = [
  { properties: ['/color$/', 'fill', 'stroke'], accepts: colour },
  { properties: [`/^border${sides}$/`, 'outline'], accepts: [...colour, ...lineParts] },
  { properties: ['background'], accepts: [...colour, ...backgroundParts] },
  {
    properties: ['/^margin/', '/^padding/', '/^(row-|column-)?gap$/'],
    accepts: ['auto', tokenMath],
  },
  { properties: ['font-size', 'line-height'], accepts: [tokenMath] },
  { properties: ['/^border(-.+)?-radius$/'], accepts: ['/', tokenMath] },
  { properties: ['/^(transition|animation)-(duration|timing-function)$/'], accepts: [] },
  { properties: ['transition', 'animation'], accepts: motionParts },
];

/** The four breakpoints from CLAUDE.md; media queries cannot use var(). */
const breakpoints = ['360px', '768px', '1024px', '1440px'];

/** @type {import('stylelint').Config} */
export default {
  ignoreFiles: ['src/styles/tokens.css', 'src/styles/fonts.css'],
  plugins: ['stylelint-declaration-strict-value'],
  rules: {
    // Colour literals, in any property.
    'color-no-hex': true,
    'color-named': 'never',
    'function-disallowed-list': [
      ...['rgb', 'rgba', 'hsl', 'hsla', 'hwb'],
      ...['lab', 'lch', 'oklab', 'oklch', 'color'],
    ],
    // Tokens only on the enforced properties. Variables and functions are not accepted as such:
    // the patterns above name the token and the function forms that are.
    'scale-unlimited/declaration-strict-value': [
      enforced.flatMap(({ properties }) => properties),
      {
        ignoreVariables: false,
        ignoreFunctions: false,
        ignoreValues: Object.fromEntries(
          enforced.flatMap(({ properties, accepts }) =>
            properties.map((property) => [property, [...everywhere, ...accepts].map(String)]),
          ),
        ),
        disableFix: true,
        message: 'Expected a --fjord-* token for "${value}" of "${property}"',
      },
    ],
    // The font shorthand hides a size and a line-height; use the longhands.
    'property-disallowed-list': ['font'],
    'declaration-property-value-disallowed-list': {
      '/.*/': [undeclaredToken],
    },
    // Container queries read a container's size, which skips the breakpoint rule; a feature that
    // needs them lifts this ban and adds its own rule for the allowed widths. CSS matches at-rule
    // and media-feature names case-insensitively, and so do these rules.
    'at-rule-disallowed-list': ['/^container$/i'],
    'media-feature-name-value-allowed-list': {
      '/^(min-|max-)?width$/i': breakpoints,
    },
  },
  overrides: [{ files: ['**/*.astro'], customSyntax: 'postcss-html' }],
};
