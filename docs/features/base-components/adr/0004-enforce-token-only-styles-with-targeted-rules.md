---
status: Accepted
owner: "Alexander Ponomarenko"
reviewers: []
updated_at: "2026-10-04"
feature_size: "S"
ticket: "roadmap step 3 (base-components)"
---

# 0004 — Enforce token-only styles with targeted rules

- **Status:** Accepted. Supersedes [fjord-foundation ADR-0003](../../fjord-foundation/adr/0003-enforce-token-only-styles-with-stylelint-built-in-rules.md)
- **Date:** 2026-10-04
- **Deciders:** Alexander Ponomarenko (Owner)

## Context

Fjord tokens are the only source of visual values (`CLAUDE.md` design rules, AC-26). fjord-foundation ADR-0003 enforced this with allow lists: a CSS function or unit was rejected unless it was listed, and about thirty properties took a token sequence only. The goal was met, but the lists also rejected CSS that carries no visual value, and the Shell styles had to be written around them:

- no `fr`, `minmax()` or `repeat()`, so no grid track sizing;
- no transform functions (`translate()`, `scale()`, `rotate()`) and no `deg`; only the `translate` property with token or percentage values was possible;
- no `ch`, `min()`, `max()`, `clamp()`, `url()` or `env()`; no `px`, `rem` or `em` in any property, including layout sizes;
- no `calc()` over tokens on the token-only properties, the height properties excepted.

Each of these is a difference from the page design or a workaround, and each new need meant a config edit, a reason row and a fixture. The Owner decided to keep the goal and change the method.

## Decision drivers

- AC-26: a raw visual value fails the checks with file and line.
- The page design wins over the lint method: standard CSS that sets no colour, space, type size, radius, duration or easing must pass without an entry anywhere.
- `CLAUDE.md`: a new dependency is explained; breakpoints are 360 / 768 / 1024 / 1440.

## Considered options

1. **Targeted rules** — ban colour literals in every property; require a token on a fixed list of properties; no function or unit list.
2. **Keep the allow lists and add entries** (`fr`, `minmax`, `repeat`, the transform functions, ...) — the fjord-foundation ADR-0003 method.
3. **Core rules only, per-property value patterns** — `declaration-property-value-allowed-list` for the enforced properties, without a plugin.

## Decision outcome

**Chosen:** Option 1, in `stylelint.config.js`, run by `npm run lint` over `src/**/*.{css,astro}`. `function-allowed-list`, `unit-allowed-list`, `unit-disallowed-list`, `declaration-property-unit-disallowed-list` and `declaration-property-value-allowed-list` are removed.

**Dependency:** `stylelint-declaration-strict-value` 1.12.1 (devDependency). It checks a value part by part, so `margin: 0 auto` and a two-layer `transition` are judged per part and the message names the offending part; option 3 needs one whole-value regex per property for the same result.

**Rule set**

| Group | Rule | Applies to | Rejects |
|---|---|---|---|
| Colour literals | `color-no-hex`, `color-named`, `function-disallowed-list` (`rgb`, `rgba`, `hsl`, `hsla`, `hwb`, `lab`, `lch`, `oklab`, `oklch`, `color`) | every property | `#24493d`, `red`, `rgb(0 0 0)`, also inside `color-mix()`, a gradient or a shadow |
| Colour properties | strict value | properties ending in `color`, `fill`, `stroke`, the `background`, `border*` and `outline` shorthands | anything that is not a token, `transparent`, `currentColor`, `none` or a function other than `var()` |
| Spacing | strict value | `margin*`, `padding*`, `gap`, `row-gap`, `column-gap` | any number with a unit, any percentage |
| Type | strict value; `property-disallowed-list` (`font`) | `font-size`, `line-height`; the `font` shorthand | sizes, percentages, unitless line heights, `normal`; the shorthand, which hides both |
| Radius | strict value | `border-radius` and its longhands | lengths and percentages |
| Motion | strict value | `transition`, `animation`, `transition-duration`, `transition-timing-function`, `animation-duration`, `animation-timing-function` | literal times, keyword easings (`ease*`, `linear`, `step-*`), `cubic-bezier()`, `steps()` |
| Breakpoints | `media-feature-name-value-allowed-list` | `width`, `min-width`, `max-width` in any case, legacy and range syntax | any value but `360px`, `768px`, `1024px`, `1440px` |
| Declared tokens | `declaration-property-value-disallowed-list` | every property | `var(--fjord-*)` naming a token that `tokens.css` does not declare |
| Container queries | `at-rule-disallowed-list` | `@container` in any case | the at-rule: its widths skip the breakpoint rule |

"Strict value" is `scale-unlimited/declaration-strict-value` with variables and functions switched off and the accepted forms given as patterns. On every enforced property a part is accepted when it is:

- one token, `var(--fjord-*)` with no fallback value (so `var(--local)` and `var(--fjord-space-4, 16px)` fail);
- `0`, or a CSS-wide keyword (`inherit`, `initial`, `unset`, `revert`, `revert-layer`);
- on spacing, `auto`.

**Decisions on the edge cases**

| Case | Decision |
|---|---|
| Numbers inside `calc()`, `min()`, `max()`, `clamp()` on spacing, type and radius | The function must reference at least one token. Plain numbers are factors and pass: `calc(var(--fjord-space-2) * 2)`, `calc(var(--fjord-space-2) * -1)`. Any number with a unit or a percent sign fails: `calc(4px + 1rem)`, `calc(var(--fjord-space-2) + 4px)`, `min(var(--fjord-space-4), 2vw)`, `calc(3 * 5)` |
| `0` and `auto` on spacing | allowed |
| Percentages on spacing, type and radius | rejected, bare or inside a math function. Spacing is on the 4px grid, and the percentage radii are tokens (`--fjord-radius-round`, `--fjord-radius-qr`). Percentages stay free in every other property |
| Unitless `line-height` | rejected. `tokens.css` has a `--fjord-leading-*` token for every value in use, including `1` (`--fjord-leading-none`); `normal` is rejected for the same reason |
| Colour functions on colour properties | any function but `var()` passes strict value (`color-mix()`, gradients, `url()`); the colour-literal rules reject a literal inside it, the declared-token rule a misspelled token |
| Shorthands `border*`, `outline`, `background` | the colour part follows the colour rule; widths, line styles, positions, sizes and repeat keywords pass as written |
| Shorthands `transition`, `animation` | every time is a token, the delay included, because a part cannot be told from a duration; names and keywords (`color`, `spin`, `infinite`, `both`, `none`) and an iteration count pass |

**Accepted gaps.** These pass, on purpose, because the Owner's list of enforced properties does not include them:

- `transform: translateX(4px)` and the `translate`, `scale`, `rotate` properties with literal values;
- sizes and positions: `width`, `height`, `inset*`, `top`/`right`/`bottom`/`left`, grid tracks, `flex-basis`, any unit in them (`px`, `rem`, `ch`, `fr`, viewport and container units);
- `font-family`, `font-weight`, `letter-spacing`;
- border and outline widths, `outline-offset`, the lengths in `box-shadow` (its colours are still checked);
- `transition-delay` and `animation-delay` as longhands;
- media features other than the width ones.

A property moves into the enforced list when a review finds raw values in it.

**Carried over from fjord-foundation ADR-0003, unchanged:** `customSyntax: 'postcss-html'` for `**/*.astro`; the excluded files `src/styles/tokens.css` (generated) and `src/styles/fonts.css` (only `@font-face` rules); case-insensitive patterns for the `@container` ban and the breakpoint rule; the conditional `@import` check outside Stylelint (`scripts/lint/import-conditions.ts`, run by `npm run test:unit`).

**Tests.** `scripts/lint/stylelint.test.ts` has one passing and one failing fixture per group in `scripts/lint/fixtures/`, asserts the exact findings of each failing fixture by line and rule, and has one fixture of standard CSS (`fr`, `%`, `ch`, `minmax()`, `repeat()`, `clamp()`, `min()`, `max()`, transform functions) that must have zero findings.

## Consequences

**Positive**
- Grid tracks, transforms and intrinsic sizing can be written as in the page design; no entry, reason row or fixture per function or unit.
- The config states what is enforced as a short list of property groups.
- A finding names the part and the property: `Expected a --fjord-* token for "12px" of "margin"`.

**Negative**
- The check is narrower than before: a raw value in a property outside the list passes (see "Accepted gaps"). Review and the visual tests are the guard there.
- One more devDependency, and it brings transitive packages into `package-lock.json`.
- The accepted forms are regular expressions on value parts; an unusual but valid value on an enforced property (for example a `background` keyword not in the list) needs a config edit.

**Neutral**
- No existing style under `src/` had to change.
- AC-26 still speaks of a "recorded allow list"; its wording is updated by the Owner, not here.

## Links

- Spec: [[../spec.md]] US-12, AC-26
- SAD: [[../sad.md]] §2, §8 Token-only styles
- Supersedes: [[../../fjord-foundation/adr/0003-enforce-token-only-styles-with-stylelint-built-in-rules]]
- Related ADR: [[0001-read-fjord-tokens-from-the-site-copy-of-the-design-system]] (the token source)
