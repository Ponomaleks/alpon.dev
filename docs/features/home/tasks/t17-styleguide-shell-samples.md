---
id: T17
title: "Update the changed Shell and base samples on the Styleguide"
layer: "ui"
deps: ["T6", "T7", "T8", "T16"]
acs: ["AC-14", "AC-33", "AC-38", "AC-39", "AC-40"]
files_hint: ["src/pages/styleguide.astro", "src/pages/_styleguide.test.ts", "tests/e2e/styleguide.spec.ts", "tests/e2e/styleguide-components.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T17 — Update the changed Shell and base samples on the Styleguide

## Why

Spec §1 Traceability ("the Shell's Styleguide samples and baselines change with them"); the visual reference for AC-14, AC-33, AC-38, AC-39, AC-40 ([spec §5](../spec.md)); [screens.md SCR-04 Changed sections](../screens.md).

## What

- Builds SCR-04 changed sections: Icon (new names), Stat (note on `countUp`), Toast (success with the check icon, the refusal message), Contours (corner shape), Header variants (over-hero Dag primary, Dag secondary, Natt secondary; the bar-dependent sample removed), Sticky action bar (bar-open with the tab, bar-collapsed), Closing band (default pair, home pair).

## Definition of Done

- [ ] `src/pages/_styleguide.test.ts`: the changed sections above
- [ ] `tests/e2e/styleguide*.spec.ts` pass after their expectations follow the new samples
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- The over-hero samples need the selectors to work on a static sample: use the existing `data-sample` pattern, not a second set of styles.
