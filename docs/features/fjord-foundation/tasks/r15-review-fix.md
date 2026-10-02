---
id: R15
title: "Measure the font swap at phone width and assert the Mono labels and body face"
layer: "tests"
deps: []
acs: ["AC-05"]
files_hint: ["tests/e2e/fonts.spec.ts", "tests/e2e/platform-fonts.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R15 — Measure the font swap at phone width and assert the Mono labels and body face

## Why

Review follow-up S1-03, S1-04 ([review-2026-10-02-2](../_review/review-2026-10-02-2.md)).

## Definition of Done

- [ ] fonts.spec.ts creates its contexts from the project use settings (or measures explicitly at 390 and 1440), so the font-swap rows run at phone width. After document.fonts.ready on the Not-found page, platformFonts reports JetBrains Mono for .code and Schibsted Grotesk for main p.
- [ ] `npm run lint` and `npm run test:unit` green
