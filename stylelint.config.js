// @ts-check
// Token-only styles (fjord-foundation ADR-0003): every color, size, space, radius, duration and
// easing in a page or component style comes from a --fjord-* token. Core rules only.

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

/** Values the token-only properties accept besides var(--fjord-*). */
const keywords = ['0', '100%', 'auto', 'none', 'inherit', 'currentColor', 'transparent'];

/** A space-separated sequence of Fjord tokens and allowlisted keywords. */
const sequence = (/** @type {string[]} */ extra) => {
  const term = String.raw`(?:var\(--fjord-[a-z0-9-]+\)|${[...keywords, ...extra].join('|')})`;
  return new RegExp(String.raw`^${term}(?:\s+${term})*$`);
};
const tokenOnly = sequence([]);

/** Border and outline shorthands: tokens plus the line styles (no thin / medium / thick). */
const lineShorthand = sequence(['solid', 'dashed', 'dotted', 'double']);

/** Keyword easings inside the transition and animation shorthands (tokens hold the curves). */
const keywordEasing = /(?<![\w-])(?:ease(?:-in|-out|-in-out)?|linear|step-start|step-end)(?![\w-])/;

/** Viewport-height units are allowed only where layout needs them (e.g. min-height: 100dvh). */
const viewportHeightUnits = ['vh', 'svh', 'lvh', 'dvh'];
const viewportHeightProperties = ['height', 'min-height', 'max-height'];

/**
 * Height values: tokens, auto, percentages, a full-viewport 100vh / 100svh / 100lvh / 100dvh, or
 * a calc() of tokens and plain numbers (e.g. calc(var(--fjord-space-1) * 105)). Any other
 * viewport height (73vh, calc(100dvh - ...)) is a magic number.
 */
const heightValue = sequence([
  String.raw`\d+(?:\.\d+)?%`,
  String.raw`100(?:s|l|d)?vh`,
  String.raw`calc\((?:var\(--fjord-[a-z0-9-]+\)|\d+(?:\.\d+)?|[-+*/()\s])+\)`,
]);

const tokenOnlyProperties = [
  'color',
  'background-color',
  '/^border(-(top|right|bottom|left|block|inline)(-(start|end))?)?-color$/',
  'outline-color',
  'fill',
  'stroke',
  'caret-color',
  'accent-color',
  'text-decoration-color',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  '/^margin/',
  '/^padding/',
  'gap',
  'row-gap',
  'column-gap',
  '/^inset/',
  'top',
  'right',
  'bottom',
  'left',
  '/^(border|outline)(-(top|right|bottom|left|block|inline)(-(start|end))?)?-width$/',
  'outline-offset',
  'box-shadow',
  '/^border(-.+)?-radius$/',
  'transition-duration',
  'transition-timing-function',
  'animation-duration',
  'animation-timing-function',
];

/** The four breakpoints from CLAUDE.md; media queries cannot use var(). */
const breakpoints = ['360px', '768px', '1024px', '1440px'];

/**
 * The only CSS functions styles may use; color and easing functions are tokens' job. clamp() lives
 * in the generated tokens.css and url() in fonts.css, both excluded below; a function is added
 * back only when real code under src/ needs it.
 */
const allowedFunctions = ['var', 'calc'];

/**
 * The only units styles may use: percentages, the viewport heights (see above) and px for the
 * breakpoints. This rule cannot scope px to media features, so unit-disallowed-list keeps
 * rejecting px everywhere except width media features.
 */
const allowedUnits = ['%', 'px', ...viewportHeightUnits];

/** @type {import('stylelint').Config} */
export default {
  ignoreFiles: ['src/styles/tokens.css', 'src/styles/fonts.css'],
  rules: {
    'color-no-hex': true,
    'color-named': 'never',
    // Container queries read a container's size, which skips the unit and breakpoint rules; a
    // feature that needs them lifts this ban and adds its own rule for the allowed widths.
    'at-rule-disallowed-list': ['container'],
    // Allow lists reject any new function or unit by default; the disallowed lists below stay
    // for their clearer messages.
    'function-allowed-list': allowedFunctions,
    'unit-allowed-list': allowedUnits,
    'function-disallowed-list': [
      'rgb',
      'rgba',
      'hsl',
      'hsla',
      'hwb',
      'oklch',
      'cubic-bezier',
      'steps',
    ],
    'unit-disallowed-list': [
      [
        ...['px', 'rem', 'em', 'ms', 's'],
        // Absolute and font-relative units: sizes come from tokens (measures are --fjord-measure*).
        ...['pt', 'pc', 'cm', 'mm', 'in', 'Q', 'ch', 'ex', 'cap', 'ic', 'lh', 'rlh'],
        // Viewport units other than the height ones allowed below.
        ...['vw', 'vi', 'vb', 'vmin', 'vmax'],
        ...['svw', 'lvw', 'dvw', 'svi', 'lvi', 'dvi', 'svb', 'lvb', 'dvb'],
        ...['svmin', 'lvmin', 'dvmin', 'svmax', 'lvmax', 'dvmax'],
        // Container-query units: sizes come from tokens, not from the container.
        ...['cqw', 'cqh', 'cqi', 'cqb', 'cqmin', 'cqmax'],
      ],
      { ignoreMediaFeatureNames: { px: ['width', 'min-width', 'max-width'] } },
    ],
    'declaration-property-unit-disallowed-list': {
      [`/^(?!(?:${viewportHeightProperties.join('|')})$)/`]: viewportHeightUnits,
    },
    'property-disallowed-list': ['font'],
    'declaration-property-value-disallowed-list': {
      '/.*/': [undeclaredToken],
      '/^(transition|animation)$/': [keywordEasing],
    },
    'media-feature-name-value-allowed-list': {
      width: breakpoints,
      'min-width': breakpoints,
      'max-width': breakpoints,
    },
    'declaration-property-value-allowed-list': {
      ...Object.fromEntries(tokenOnlyProperties.map((property) => [property, [tokenOnly]])),
      ...Object.fromEntries(viewportHeightProperties.map((property) => [property, [heightValue]])),
      '/^(border|outline)(-(top|right|bottom|left|block|inline)(-(start|end))?)?$/': [
        lineShorthand,
      ],
    },
  },
  overrides: [{ files: ['**/*.astro'], customSyntax: 'postcss-html' }],
};
