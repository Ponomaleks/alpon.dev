---
id: T29
title: "Emit the Print block that re-applies the Dag tokens"
layer: "wiring"
deps: ["T28"]
acs: ["AC-12"]
files_hint: ["scripts/tokens/generate.ts", "scripts/tokens/build.test.ts", "scripts/tokens/check.test.ts", "src/styles/tokens.css"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T29 — Emit the Print block that re-applies the Dag tokens

## Why

AC-12 ([spec §5](../spec.md)); [ADR-0002](../adr/0002-generate-a-print-block-that-reapplies-the-dag-tokens.md); [sad §4 item 5](../sad.md); [sad §11, the row on the print block](../sad.md).

## What

- `scripts/tokens/generate.ts`: emit the Print block of ADR-0002.
- `src/styles/tokens.css`: regenerated with `npm run tokens:build`, never edited by hand.

## Definition of Done

- [ ] `scripts/tokens/build.test.ts`: the block exists once, inside `@media print`; every token the Natt set overrides is set back to its Dag value; it wins over `data-theme="natt"` and over the No-JS Natt block
- [ ] `scripts/tokens/check.test.ts` and `npm run tokens:check` green
- [ ] `npm run check:contrast` still green
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5b.
- This changes how every page prints, as ADR-0002 accepts; no print styles are added to other pages.
- The theme on screen is not touched: the block is print media only.
