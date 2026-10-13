---
id: T9
title: "Build SkipLink, CtaBand and Footer from the contact data"
layer: "ui"
deps: ["T3", "T4", "T6"]
acs: ["AC-13", "AC-14", "AC-20"]
files_hint: ["src/components/layout/SkipLink.astro", "src/components/layout/CtaBand.astro", "src/components/layout/Footer.astro", "src/components/layout/static-parts.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T9 — Build SkipLink, CtaBand and Footer from the contact data

## Why

AC-13, AC-14, AC-20 ([spec §5](../spec.md)); [screens.md §Shell states skip-link, cta-band, footer; wireframes S-3, S-4, S-5; §New components](../screens.md); page design `App.jsx`, `site.css` (`.x-skip`, `.x-end`).

## What

- Reuse: `Button`, `Link` (T4), `Contours` (T6), `src/data/contact.ts` (T3), layer token for the skip link (T1).
- `SkipLink` (NEW, screens.md §New components): "Skip to content", revealed on focus, hidden again on blur.
- `CtaBand`: on spruce, heading as `h2`, the hiring line, primary "Get in touch", secondary "Download CV" for `cvLang`; static contours. `Footer`: slogan, three columns, base line; layouts at 390 / 834 / 1440 as in S-5.

## Definition of Done

- [ ] `src/components/layout/static-parts.test.ts`: every AC-14 fact is present and equals the value in `contact.ts`; no literal contact value in the component source
- [ ] Same test: `CtaBand` with `cvLang="no"` links to the Norwegian PDF, default to the English one, both with `download`; exactly one primary button in the band
- [ ] Same test: `SkipLink` is an `<a href="#main">`
- [ ] Stylelint 0 findings; one dark surface in the band
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- The copyright year is taken at build time (D-10); T21 masks it in visual tests.
- Parallel to T10 and T12.
