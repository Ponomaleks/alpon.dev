---
id: R37
title: "Match the @container ban and the breakpoint rule case-insensitively"
layer: "wiring"
deps: []
acs: ["AC-11"]
files_hint: ["stylelint.config.js", "scripts/lint/stylelint.test.ts", "scripts/lint/fixtures/", "docs/features/fjord-foundation/adr/0003-enforce-token-only-styles-with-stylelint-built-in-rules.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R37 — Match the @container ban and the breakpoint rule case-insensitively

## Why

Review round 6, S2-18. Stylelint compares at-rule and media-feature names as written, and CSS treats both as case-insensitive. With `'at-rule-disallowed-list': ['container']` (`stylelint.config.js:110`) and the breakpoint rule keyed on `width` (`:147-148`), these lint clean:

- `@CONTAINER (min-width: 400px) { … }`
- `@Container card (MIN-WIDTH: 40rch) { … }`
- `@media (MIN-WIDTH: 800px) { … }`

`npm run lint` still fails on them, because `prettier --check` runs first and Prettier lower-cases the names. The Stylelint layer alone (editor feedback, any file in `.prettierignore`) is exposed, and ADR-0003 promises that the rules fail in the editor.

Owner's decision (2026-10-03): fix the rules; do not rely on Prettier.

## Definition of Done

- [ ] `at-rule-disallowed-list` uses `'/^container$/i'`.
- [ ] The breakpoint rule (`media-feature-name-value-allowed-list`) is keyed as `'/^(min-|max-)?width$/i'`.
- [ ] One upper-case fixture row for each rule (`@CONTAINER …`, `@media (MIN-WIDTH: 800px)`), asserted by rule name and line.
- [ ] Range-syntax fixtures `@media (width >= 800px)` and `@media (WIDTH >= 800px)` are rejected by the breakpoint rule, asserted by rule name and line. If the upper-case range form is not rejected, the rule is extended until it is.
- [ ] An allowed breakpoint (for example `768px`) stays clean in lower and upper case.
- [ ] ADR-0003 notes that the rules match case-insensitively and do not depend on Prettier running first; `updated_at` is bumped if the date changes.
- [ ] `npm run lint` and `npm run test:unit` green
