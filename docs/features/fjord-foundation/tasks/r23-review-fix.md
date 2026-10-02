---
id: R23
title: "Amend ADR-0003 to match the stylelint rules added by R17"
layer: "docs"
deps: []
acs: ["AC-11"]
files_hint: ["docs/features/fjord-foundation/adr/0003-enforce-token-only-styles-with-stylelint-built-in-rules.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R23 — Amend ADR-0003 to match the stylelint rules added by R17

## Why

Review follow-up S2-08 ([review-2026-10-02-3](../_review/review-2026-10-02-3.md)).

## Definition of Done

- [x] ADR-0003 lists the container-query units among the disallowed units and the height properties with their value grammar (tokens, auto, %, 100vh/svh/lvh/dvh, calc(token * n)), and records the calc(token * n) exception for heights, citing the T09 420 px mapping.
- [x] `npm run lint` and `npm run test:unit` green
