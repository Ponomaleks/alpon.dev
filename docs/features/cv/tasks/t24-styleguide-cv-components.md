---
id: T24
title: "Show the components of phase 5a on the Styleguide with marked sample data"
layer: "ui"
deps: ["T7", "T8", "T9", "T10", "T11", "T12", "T15"]
acs: ["AC-29"]
files_hint: ["src/pages/styleguide.astro", "src/pages/_styleguide.test.ts", "src/data/samples.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T24 — Show the components of phase 5a on the Styleguide with marked sample data

## Why

AC-29 ([spec §5](../spec.md)); screens SCR-04 `default`, `sample data marked`, the tables New sections and Changed sections; [screens C-5](../screens.md).

## What

- Reuses: the Styleguide's section pattern and `src/data/samples.ts`; every component of T7 to T12 and T15.
- `src/data/samples.ts`: marked sample CV data.
- `styleguide.astro`: the eight new sections and the five changed ones listed in the DoD, in the states the manifest lists.

## Definition of Done

- [ ] `src/pages/_styleguide.test.ts`: each of the eight new sections exists with the states of the manifest's table
- [ ] Same file: Button shows the ghost variant; Icon shows the three new icons; the bar shows the CV pair; the contact list shows the CV form in English and Norwegian; the Toast shows "Kopiert" marked Norwegian
- [ ] Same file: every CV sample is inside `data-sample` with the visible label; no real CV text is used as a sample
- [ ] `tests/e2e/styleguide.spec.ts` and `tests/e2e/styleguide-components.spec.ts` still green
- [ ] Stylelint 0 findings (tokens only)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. No whole CV page sample (C-5). The sections for the print contact line, BackToTop and the menu's current link come with T30, T31 and T32.
- The CV page script does not run on the Styleguide.
- Lane on `src/pages/styleguide.astro`: T24, T30, T31, T32.
