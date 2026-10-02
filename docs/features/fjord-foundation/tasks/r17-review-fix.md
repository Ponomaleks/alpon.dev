---
id: R17
title: "Disallow container-query units and restrict viewport heights by value"
layer: "tests"
deps: []
acs: ["AC-11"]
files_hint: ["stylelint.config.js", "scripts/lint/fixtures/", "scripts/lint/stylelint.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R17 — Disallow container-query units and restrict viewport heights by value

## Why

Review follow-up S2-04 ([review-2026-10-02-2](../_review/review-2026-10-02-2.md)).

## Definition of Done

- [ ] stylelint.config.js disallows cqw/cqh/cqi/cqb/cqmin/cqmax; height, min-height and max-height accept only tokens, auto, % and 100vh/100svh/100lvh/100dvh. Fixtures with 50cqi and 73vh fail, naming file and line; src/ still lints clean.
- [ ] `npm run lint` and `npm run test:unit` green
