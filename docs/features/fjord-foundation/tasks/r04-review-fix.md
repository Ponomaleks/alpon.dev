---
id: R4
title: "Close the token-only lint gaps: shorthands, units, size and radius, unknown tokens"
layer: "tests"
deps: []
acs: ["AC-11"]
files_hint: ["stylelint.config.js", "scripts/lint/", "src/styles/", "src/pages/"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R4 — Close the token-only lint gaps: shorthands, units, size and radius, unknown tokens

## Why

Review follow-up F-04, F-09 ([review-2026-10-02](../_review/review-2026-10-02.md)).

## Definition of Done

- [ ] Fixtures for border-radius, size (font-size/width), keyword easing inside transition/animation, raw values in font/border shorthands, pt and other absolute units, viewport units outside the allowlist, and an undeclared var(--fjord-*) each fail naming file and line; token-only.css uses only declared tokens and passes; viewport units allowed only through an explicit property allowlist (e.g. min-height: 100dvh); npm run lint is clean on src/.
- [ ] `npm run lint` and `npm run test:unit` green
