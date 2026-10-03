---
id: R32
title: "Ban @container in the token-only lint until a feature needs container queries"
layer: "wiring"
deps: []
acs: ["AC-11"]
files_hint: ["stylelint.config.js", "scripts/lint/stylelint.test.ts", "scripts/lint/fixtures/", "docs/features/fjord-foundation/adr/0003-enforce-token-only-styles-with-stylelint-built-in-rules.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R32 — Ban @container in the token-only lint until a feature needs container queries

## Why

Review round 5, S2-14. `@container (min-width: 400px) { … }` and `@container (min-width: 40rch) { … }` lint clean: Stylelint's unit rules (`stylelint.config.js:107`, `:118-131`) and the breakpoint rule (`:140-144`) see declarations and `@media` only. ADR-0003 says new units are rejected by default and breakpoints are enforced, so a container query is a way around both. No `@container` exists under `src/` today.

Owner's decision (2026-10-03): ban `@container`; do not ban `@supports`.

## Definition of Done

- [ ] `stylelint.config.js` has `at-rule-disallowed-list: ['container']`.
- [ ] A fixture with an `@container` rule fails for that rule; the test asserts the rule name and line.
- [ ] ADR-0003 has a row for the ban. It says a later feature that needs container queries lifts the ban and adds its own rule for the allowed widths, and that `@supports` preludes are not checked on purpose: they only test support and set no values.
- [ ] `npm run lint` and `npm run test:unit` green
