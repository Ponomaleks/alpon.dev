---
id: R20
title: "Make the measure tokens font-independent so text does not rewrap when the brand fonts swap in"
layer: "wiring"
deps: []
acs: ["AC-05"]
files_hint: ["scripts/tokens/generate.ts", "scripts/tokens/build.test.ts", "src/styles/tokens.css", "tests/e2e/fonts.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R20 — Make the measure tokens font-independent so text does not rewrap when the brand fonts swap in

## Why

Review follow-up S1-05 ([review-2026-10-02-3](../_review/review-2026-10-02-3.md)).

## Definition of Done

- [x] The token generator emits --fjord-measure and --fjord-measure-narrow in rem, converted from the handoff ch values with the advance width of "0" in Schibsted Grotesk (taken from the font file's metrics, not a literal), with a unit test for the conversion; tokens:check stays in sync; the comment at tests/e2e/fonts.spec.ts:160-162 is corrected; the font-swap run-width tolerance stays at 5 %; the Not-found page looks the same at 390 / 834 / 1440.
- [x] `npm run lint` and `npm run test:unit` green

## Notes

- Emitted in `em`, not `rem` (deviation from the DoD wording): `ch` is relative to the element's own font size, and the Not-found paragraph uses the fluid `--fjord-text-lead` (19.1–23 px), so no single `rem` value reproduces `48ch` at both 834 and 1440. `em` keeps the font-size relation of `ch` and drops the dependence on the face.
- Box of the Not-found paragraph with the brand font (Linux, Chromium; old `48ch` → new `29.344em`): 390: 576 → 561 px (the container binds at 358 px either way); 834: 624 → 609 px; 1440: 672 → 675 px; 2 lines everywhere. Chromium rounds `1ch` to whole pixels, so the old box at 834 was 15 px wider than the exact advance gives.
- `tests/e2e/fonts.spec.ts` in the Playwright 1.63 noble image with Roboto only: 30 passed, including the 1440 Not-found swap that failed in CI run 36960347568.
