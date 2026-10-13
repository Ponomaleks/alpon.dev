---
id: R8
title: "Assert drawn brand fonts with scripts off and measure text runs in the font-swap test"
layer: "tests"
deps: ["R5"]
acs: ["AC-04", "AC-05"]
files_hint: ["tests/e2e/theme.spec.ts", "tests/e2e/fonts.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R8 — Assert drawn brand fonts with scripts off and measure text runs in the font-swap test

## Why

Review follow-up F-05, F-10 ([review-2026-10-02](../_review/review-2026-10-02.md)).

## Definition of Done

- [ ] The scripts-off e2e asserts via CDP CSS.getPlatformFontsForNode that h1 is drawn with the custom Schibsted Grotesk face; the font-swap test compares text-run rects (Range) and baselines, not block boxes; each strengthened assertion is shown to fail against a deliberately broken variant (fonts blocked / wrong size-adjust) before being kept.
- [ ] `npm run lint` and `npm run test:unit` green
