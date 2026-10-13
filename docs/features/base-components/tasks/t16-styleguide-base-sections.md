---
id: T16
title: "Build the Styleguide page with the base component sections (SCR-04)"
layer: "ui"
deps: ["T5", "T13"]
acs: ["AC-21", "AC-22"]
files_hint: ["src/pages/styleguide.astro", "src/pages/_styleguide.test.ts", "tests/e2e/styleguide.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T16 — Build the Styleguide page with the base component sections (SCR-04)

## Why

AC-21, AC-22 ([spec §5](../spec.md)); [screens.md SCR-04, section table rows Button to Wordmark](../screens.md); [sad §8 Styleguide states](../sad.md).

## What

- Reuse: every component of T4, T5, T6 and the Toast sample of T8; `BaseLayout` with `noindex`, `mobileBar: false`, `ctaBand: false`.
- `styleguide.astro`: `h1` "Styleguide"; one `<section data-section="…">` per row, stable for a per-section screenshot (nothing fixed or top-layer over it). States are shown with `data-demo-state` and `disabled`.
- Not linked from anywhere and not added to `public/sitemap.xml`.

## Definition of Done

- [ ] `src/pages/_styleguide.test.ts`: the twelve sections exist; each interactive sample appears in default, hover, focus, pressed and disabled where the component has it; every `Icon` name of the typed map is shown
- [ ] Same test: `<meta name="robots" content="noindex">`; no element with the bar hook outside a sample
- [ ] `tests/e2e/styleguide.spec.ts`: `/styleguide` answers 200; `/sitemap.xml` and the HTML of `/` and the Not-found page contain no link to it
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- T17 adds the Shell sections to the same file, so the two are one lane.
