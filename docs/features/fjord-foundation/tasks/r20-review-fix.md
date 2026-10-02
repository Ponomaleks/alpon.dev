---
id: R20
title: "Make the measure tokens font-independent so text does not rewrap when the brand fonts swap in"
layer: "wiring"
deps: []
acs: ["AC-05"]
files_hint: ["scripts/tokens/generate.ts", "scripts/tokens/build.test.ts", "src/styles/tokens.css", "tests/e2e/fonts.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R20 — Make the measure tokens font-independent so text does not rewrap when the brand fonts swap in

## Why

Review follow-up S1-05 ([review-2026-10-02-3](../_review/review-2026-10-02-3.md)).

## Definition of Done

- [ ] The token generator emits --fjord-measure and --fjord-measure-narrow in rem, converted from the handoff ch values with the advance width of "0" in Schibsted Grotesk (taken from the font file's metrics, not a literal), with a unit test for the conversion; tokens:check stays in sync; the comment at tests/e2e/fonts.spec.ts:160-162 is corrected; the font-swap run-width tolerance stays at 5 %; the Not-found page looks the same at 390 / 834 / 1440.
- [ ] `npm run lint` and `npm run test:unit` green
