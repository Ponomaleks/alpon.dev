---
id: R39
title: "Reject a media condition on @import in the token-only lint"
layer: "wiring"
deps: []
acs: ["AC-11"]
files_hint: ["stylelint.config.js", "scripts/lint/stylelint.test.ts", "scripts/lint/fixtures/", "docs/features/fjord-foundation/adr/0003-enforce-token-only-styles-with-stylelint-built-in-rules.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R39 — Reject a media condition on @import in the token-only lint

## Why

Review round 7, S2-19. The breakpoint rule (`media-feature-name-value-allowed-list`) and the unit rules inspect `@media` preludes only. A media condition on `@import` is not checked, so these lint clean against the config at `f395a5f`:

- `@import "x.css" (min-width: 800px);`
- `@import "x.css" screen and (MIN-WIDTH: 50em);`

Prettier does not rewrite them, so `npm run lint` passes too. No source uses the form today (`src/styles/global.css` has three plain string imports). It is the same class of bypass as S2-14 (`@container`) and S2-18 (case), and it is not a regression of R37: the config at `08297bd` behaves the same.

Owner's decision (2026-10-03): fix now. Prefer a built-in Stylelint rule or the existing config; use a script in `scripts/lint/` only if Stylelint cannot express it.

## Definition of Done

- [x] No `@import` under `src/` may carry a media condition: the check fails on one. First choice is a built-in Stylelint rule in `stylelint.config.js`; if no core rule can express it, a check in `scripts/lint/` that runs in `npm run lint` or `npm run test:unit`. The result says which was used and why.
- [x] A failing fixture with a conditional `@import` (lower-case and upper-case feature name), asserted by rule or check name. The fixture lints clean before the change, so the test is red first.
- [x] The plain string imports in `src/styles/global.css` stay clean.
- [x] ADR-0003 has one sentence next to the `@supports` note: a media condition on `@import` is rejected, and by which rule or check; `updated_at` is bumped if the date changes.
- [x] `npm run lint` and `npm run test:unit` green

## Result

- **Where the check lives:** `scripts/lint/import-conditions.ts` (`conditionalImports`), with `scripts/lint/import-conditions.test.ts`, run by `npm run test:unit`. Stylelint 17.16.0 has no core rule that can restrict an `@import` prelude: `import-notation` only chooses string or `url()`, `at-rule-prelude-no-invalid` checks validity, and the `media-feature-*` rules read `@media` only. A custom plugin would break ADR-0003 ("built-in rules").
- **Wider than asked:** the check rejects anything after the file, so `supports()` and `layer` conditions fail too. This keeps the check to one pattern and fails closed; ADR-0003 records it.
- **Limit:** the check runs in the unit tests, not in the editor.
- **Red first:** the test failed with "Cannot find module ./import-conditions.ts"; the fixture `scripts/lint/fixtures/import-condition.css` has zero Stylelint warnings, and the test asserts that.
- **Gate:** see the commit; `npm run lint` and `npm run test:unit` green.
