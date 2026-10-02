---
id: R6
title: "Make reduced-motion tokens fail loudly and add the base reduced-motion guard"
layer: "wiring"
deps: ["R4"]
acs: ["AC-14"]
files_hint: ["scripts/tokens/generate.ts", "scripts/tokens/build.test.ts", "src/styles/tokens.css", "src/styles/base.css", "scripts/lint/base-css.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R6 — Make reduced-motion tokens fail loudly and add the base reduced-motion guard

## Why

Review follow-up F-15, F-16 ([review-2026-10-02](../_review/review-2026-10-02.md)).

## Definition of Done

- [ ] The generator matches motion tokens by an anchored name pattern, throws on a matched value that is not a plain number, and resets scale tokens by how the handoff uses them (factor -> 1, delta -> 0); a unit test asserts no reduced-motion token can make an element invisible; base.css under prefers-reduced-motion: reduce sets animation-iteration-count: 1 and scroll-behavior: auto on all elements; tokens:check, lint, unit green.
- [ ] `npm run lint` and `npm run test:unit` green
