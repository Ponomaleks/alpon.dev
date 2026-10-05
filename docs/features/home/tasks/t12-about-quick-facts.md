---
id: T12
title: "Build the About section with the QuickFacts list"
layer: "ui"
deps: ["T2"]
acs: ["AC-07"]
files_hint: ["src/components/home/About.astro", "src/components/home/QuickFacts.astro", "src/components/home/about.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T12 — Build the About section with the QuickFacts list

## Why

AC-07 ([spec §5](../spec.md)); [screens.md SCR-01 about, New components](../screens.md).

## What

- Reuses: `ui/SectionHeader`. NEW: `home/QuickFacts` (a mono description list with a fixed key column and hairline rows; no existing primitive fits, see screens.md §New components).
- `home/About.astro`: SectionHeader with the number it is given, "Frontend-focused, full stack.", the introduction, QuickFacts with four rows; one column below 1024, 7 / 5 from 1024.

## Definition of Done

- [ ] `src/components/home/about.test.ts`: the assertions above, on the built HTML
- [ ] The section number comes from a prop, not a literal
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- QuickFacts is registered in `docs/design-system.md` by T26.
