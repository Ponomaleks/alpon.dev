---
id: T26
title: "Run axe and Lighthouse on both CV pages"
layer: "tests"
deps: ["T20", "T24"]
acs: ["AC-24"]
files_hint: ["tests/a11y/cv.spec.ts", "lighthouserc.cjs"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T26 — Run axe and Lighthouse on both CV pages

## Why

AC-24 ([spec §5](../spec.md)); spec §6 rows Lighthouse categories, LCP / CLS / TBT, Accessibility; [sad §10 QG-2](../sad.md).

## What

- `tests/a11y/cv.spec.ts`: axe on `/cv/en` and `/cv/no`: 2 themes × scripts on and off × preview closed and open, at 390 and 1440.
- `lighthouserc.cjs`: add `/cv/en` and `/cv/no` to the URLs under the same budget as the home page.

## Definition of Done

- [ ] `tests/a11y/cv.spec.ts`: 0 violations in all 16 combinations per page
- [ ] `npm run build && npm run lhci`: the four categories ≥ 95, LCP ≤ 2.0 s, CLS ≤ 0.02, TBT ≤ 100 ms on both CV pages
- [ ] `npm run test` green

## Notes

- Phase 5a. A failed Lighthouse number is reported to the Owner; the budget is not changed.
- The visual baselines are phase 5b (T33), after BackToTop changes every page from 768.
