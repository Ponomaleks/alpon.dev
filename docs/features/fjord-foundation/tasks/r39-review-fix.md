---
id: R39
title: "Reject a media condition on @import in the token-only lint"
layer: "wiring"
deps: []
acs: ["AC-11"]
files_hint: ["stylelint.config.js", "scripts/lint/stylelint.test.ts", "scripts/lint/fixtures/", "docs/features/fjord-foundation/adr/0003-enforce-token-only-styles-with-stylelint-built-in-rules.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R39 — Reject a media condition on @import in the token-only lint

## Why

Review round 7, S2-19. The breakpoint rule (`media-feature-name-value-allowed-list`) and the unit rules inspect `@media` preludes only. A media condition on `@import` is not checked, so these lint clean against the config at `f395a5f`:

- `@import "x.css" (min-width: 800px);`
- `@import "x.css" screen and (MIN-WIDTH: 50em);`

Prettier does not rewrite them, so `npm run lint` passes too. No source uses the form today (`src/styles/global.css` has three plain string imports). It is the same class of bypass as S2-14 (`@container`) and S2-18 (case), and it is not a regression of R37: the config at `08297bd` behaves the same.

Owner's decision (2026-10-03): fix now. Prefer a built-in Stylelint rule or the existing config; use a script in `scripts/lint/` only if Stylelint cannot express it.

## Definition of Done

- [ ] No `@import` under `src/` may carry a media condition: the check fails on one. First choice is a built-in Stylelint rule in `stylelint.config.js`; if no core rule can express it, a check in `scripts/lint/` that runs in `npm run lint` or `npm run test:unit`. The result says which was used and why.
- [ ] A failing fixture with a conditional `@import` (lower-case and upper-case feature name), asserted by rule or check name. The fixture lints clean before the change, so the test is red first.
- [ ] The plain string imports in `src/styles/global.css` stay clean.
- [ ] ADR-0003 has one sentence next to the `@supports` note: a media condition on `@import` is rejected, and by which rule or check; `updated_at` is bumped if the date changes.
- [ ] `npm run lint` and `npm run test:unit` green
