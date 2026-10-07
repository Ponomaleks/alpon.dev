---
id: T16
title: "Add the home component sections to the Styleguide"
layer: "ui"
deps: ["T9", "T11", "T12", "T13", "T14"]
acs: ["AC-02", "AC-05", "AC-07", "AC-08", "AC-13", "AC-17"]
files_hint: ["src/pages/styleguide.astro", "src/pages/_styleguide.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T16 — Add the home component sections to the Styleguide

## Why

Spec §1.1 "/styleguide"; the visual reference for AC-02, AC-05, AC-07, AC-08, AC-13, AC-17 ([spec §5](../spec.md)); [screens.md SCR-04 New sections, T-3](../screens.md).

## What

- Builds SCR-04 new sections: Portrait, Motion control, Key facts, Quick facts, Experience list, Contact list, QR tile, Mail-link sentence, each with the states of the manifest table.
- Reuses the components of T9 and T11 to T14 and the existing `data-section`, `data-sample` and `data-demo-state` conventions of the page.

## Definition of Done

- [ ] `src/pages/_styleguide.test.ts`: the eight new sections and their states
- [ ] No whole-hero sample (T-3)
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- Lane: `styleguide.astro` (T17, T29).
- The home scripts do not run here: every sample is static (sad §11).
