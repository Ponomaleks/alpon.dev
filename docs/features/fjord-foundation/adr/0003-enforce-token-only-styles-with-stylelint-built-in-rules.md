---
status: Accepted
owner: "Alexander Ponomarenko"
reviewers: []
updated_at: "2026-10-02"
feature_size: "S"
ticket: "roadmap step 2 — fjord-foundation"
---

# 0003 — Enforce token-only styles with Stylelint built-in rules

- **Status:** Accepted
- **Date:** 2026-10-02
- **Deciders:** Alexander Ponomarenko (Owner), with Claude during the design walk

## Context

Fjord tokens are the only allowed source of color, font, space, radius, duration and easing (`CONTEXT.md` invariant, `CLAUDE.md` design rules). AC-11 asks that a value written directly in a page or component style fails the checks and points to the file and line. Styles live in `.css` files under `src/styles/` and in `<style>` blocks inside `.astro` components. The allowed-literal list this check enforces is a contract every component of steps 3–7 has to follow.

## Decision drivers

- Spec AC-11 (file and line), KPI "visual values written outside Fjord tokens: 0 on every PR".
- `CLAUDE.md`: every new dependency is explained in its PR; prefer platform and built-in features; breakpoints are 360 / 768 / 1024 / 1440.
- The check must parse real CSS (comments, `calc()`, nesting, `@media`) inside `.astro` files without false positives.

## Considered options

1. **Stylelint with built-in rules only** — `stylelint` + `postcss-html` (parses `<style>` in `.astro`); the token rule is expressed with core rules.
2. **Stylelint with the `stylelint-declaration-strict-value` plugin** — the same base plus a plugin whose rule says "this property only takes variables or listed keywords".
3. **A custom script** (`scripts/check-tokens.ts`) — regex scan over `.css` and `.astro` `<style>` blocks, zero dependencies.

## Decision outcome

**Chosen:** Option 1, with two new devDependencies (`stylelint`, `postcss-html`). Core rules cover the contract; the plugin of option 2 is added only if a concrete gap remains after this, justified in its PR. Option 3 was rejected because regex CSS parsing misfires on comments, multi-line values, `calc()` and nesting, and gives no editor feedback.

**Rule set** (`stylelint.config.js`, run by `npm run lint` as `stylelint "src/**/*.{css,astro}"`, `customSyntax: 'postcss-html'` for `**/*.astro`):

| Rule | Setting | Catches |
|---|---|---|
| `color-no-hex` | `true` | `#24493D` |
| `color-named` | `"never"` | `red`, `white` |
| `function-disallowed-list` | `rgb`, `rgba`, `hsl`, `hsla`, `hwb`, `oklch`, `cubic-bezier`, `steps` | literal colors and easings |
| `unit-disallowed-list` | `px`, `rem`, `em`, `ms`, `s`, with `ignoreMediaFeatureNames: { px: ['width', 'min-width', 'max-width'] }` | literal sizes, spaces, radii, durations |
| `media-feature-name-value-allowed-list` | `width`, `min-width`, `max-width` → `360px`, `768px`, `1024px`, `1440px` | breakpoints outside the four in `CLAUDE.md` (media queries cannot use `var()`) |
| `declaration-property-value-allowed-list` | the properties below → a sequence of `var(--fjord-*)` and allowlisted keywords | unitless literals (`font-weight: 600`, `line-height: 1.2`) and anything the rules above miss |

Properties under `declaration-property-value-allowed-list`: color properties (`color`, `background-color`, `border*-color`, `outline-color`, `fill`, `stroke`, `caret-color`, `accent-color`, `text-decoration-color`), `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, `margin*`, `padding*`, `gap`, `row-gap`, `column-gap`, `inset*`, `border-radius`, `transition-duration`, `transition-timing-function`, `animation-duration`, `animation-timing-function`.

**Keyword allowlist:** `0`, `100%`, `auto`, `none`, `inherit`, `currentColor`, `transparent`.

**Excluded files:** `src/styles/tokens.css` (generated, ADR-0001) and `src/styles/fonts.css` (`@font-face` descriptors: family names, `src`, weights and fallback metric overrides).

## Consequences

**Positive**
- A literal value fails `npm run lint` locally, in the editor and in CI, with file and line (AC-11).
- Only two dependencies, both widely used; the contract is plain config readable in one file.

**Negative**
- Shorthands with literals (`border: 1px solid …`) must use tokens (`--fjord-border-width`), and porting the handoff `base.css` means tokenizing its few literals (`1px`, `2px`, `0.2em`, unitless weights and line-heights).
- `declaration-property-value-allowed-list` patterns are regexes; a new property or keyword means a config edit.

**Neutral**
- `calc()` over tokens is not allowed in the listed properties; a needed derived value becomes a token instead.
- Adding the strict-value plugin later is additive.

## Links

- Spec: [[../spec.md]] US-06, AC-11, §7 KPIs
- SAD: [[../sad.md]] §4 (pillar 4), §8 Token-only styles
- Related ADR: [[0001-pair-a-validating-theme-bootstrap-with-generated-natt-blocks]] (generates the excluded `tokens.css`)
