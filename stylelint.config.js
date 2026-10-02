// @ts-check
// Token-only styles (fjord-foundation ADR-0003): every color, size, space, radius, duration and
// easing in a page or component style comes from a --fjord-* token. Core rules only.

/** Values the token-only properties accept besides var(--fjord-*). */
const keywords = ['0', '100%', 'auto', 'none', 'inherit', 'currentColor', 'transparent'];

/** A space-separated sequence of Fjord tokens and allowlisted keywords. */
const term = String.raw`(?:var\(--fjord-[a-z0-9-]+\)|${keywords.join('|')})`;
const tokenOnly = new RegExp(String.raw`^${term}(?:\s+${term})*$`);

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
  '/^border(-.+)?-radius$/',
  'transition-duration',
  'transition-timing-function',
  'animation-duration',
  'animation-timing-function',
];

/** The four breakpoints from CLAUDE.md; media queries cannot use var(). */
const breakpoints = ['360px', '768px', '1024px', '1440px'];

/** @type {import('stylelint').Config} */
export default {
  ignoreFiles: ['src/styles/tokens.css', 'src/styles/fonts.css'],
  rules: {
    'color-no-hex': true,
    'color-named': 'never',
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
      ['px', 'rem', 'em', 'ms', 's'],
      { ignoreMediaFeatureNames: { px: ['width', 'min-width', 'max-width'] } },
    ],
    'media-feature-name-value-allowed-list': {
      width: breakpoints,
      'min-width': breakpoints,
      'max-width': breakpoints,
    },
    'declaration-property-value-allowed-list': Object.fromEntries(
      tokenOnlyProperties.map((property) => [property, [tokenOnly]]),
    ),
  },
  overrides: [{ files: ['**/*.astro'], customSyntax: 'postcss-html' }],
};
