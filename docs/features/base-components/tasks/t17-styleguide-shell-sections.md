---
id: T17
title: "Add the Shell samples and the Toast trigger to the Styleguide"
layer: "ui"
deps: ["T16"]
acs: ["AC-21"]
files_hint: ["src/pages/styleguide.astro", "src/pages/_styleguide.test.ts", "tests/e2e/styleguide.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T17 — Add the Shell samples and the Toast trigger to the Styleguide

## Why

AC-21 ([spec §5](../spec.md)); [screens.md SCR-04, section table rows Skip link to Footer, the "samples are not live" rule, G-7](../screens.md); spec §1.2 IS-04.

## What

- Reuse: the `sample` variants of `SkipLink`, `ThemeToggle`, `Header`, `MobileMenu`, `MobileBar`, `CtaBand` (hook H-3). If a component lacks a needed sample prop, add it in that component in this task and say so in the commit.
- Header variants in the flow, not sticky; the bordered one sets `data-scrolled` in the markup. The menu panel sample sits in a phone-width frame with a current link.
- "Show toast": a `Button` with `data-needs-script` (G-7) whose page script dispatches `fjord:toast`.

## Definition of Done

- [ ] `src/pages/_styleguide.test.ts`: the six sections and their variants; every sample root has `data-sample`; the page has no second `<dialog>`
- [ ] `tests/e2e/styleguide.spec.ts`: the three behaviours in the DoD sentence above; after a theme change every live switch agrees with `data-theme` (AC-12 holds with samples on the page)
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- The footer section is the real footer at the end of the page; no sample is needed.
- Exempt from AC-23 and from the bar rule of AC-24 (spec AC-21).
