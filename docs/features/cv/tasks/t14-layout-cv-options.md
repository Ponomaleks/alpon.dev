---
id: T14
title: "Add canonical, alternates and cvLang to BaseLayout and mark the Shell English on a Norwegian page"
layer: "wiring"
deps: ["T3"]
acs: ["AC-02", "AC-16", "AC-17", "AC-20"]
files_hint: ["src/layouts/BaseLayout.astro", "src/layouts/BaseLayout.test.ts", "src/layouts/fixtures/OptionsPage.astro", "src/layouts/fixtures/NorwegianPage.astro", "src/components/layout/Header.astro", "src/components/layout/MobileMenu.astro", "src/components/layout/CtaBand.astro", "src/components/layout/header.test.ts", "src/components/layout/menu.test.ts", "src/components/layout/static-parts.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T14 — Add canonical, alternates and cvLang to BaseLayout and mark the Shell English on a Norwegian page

## Why

AC-02, AC-16, AC-17, AC-20 ([spec §5](../spec.md)); [sad §5 Page options](../sad.md); [sad §8 Internationalisation, Current page](../sad.md); screens §Shell state changes `header-current, CV`, `header CV link`, `header on a CV page`, `Shell language on SCR-06`, `cta-band on a CV page`.

## What

- Reuses: `BaseLayout`, `layout/Header`, `layout/MobileMenu`, `layout/CtaBand`; addresses from `contact.links` (T3).
- `BaseLayout`: options `canonical`, `alternates`, `cvLang`; `lang: 'no'` marks every Shell part `lang="en"`.
- `Header` and `MobileMenu`: with `current="cv"` the "CV" link leads to `links.cvPages[cvLang]`.
- `CtaBand`: "Download CV" saves the CV PDF of `cvLang` with its download name.

## Definition of Done

- [ ] `src/layouts/BaseLayout.test.ts`: `canonical` sets `<link rel="canonical">` and `og:url`; the default is still the page's own path
- [ ] Same file: three `alternates` give three `<link rel="alternate" hreflang>`; none by default
- [ ] Same file: a `lang: 'no'` page has `<html lang="no">` and `lang="en"` on the skip link, header, menu panel, closing band, footer, bar frame and Toast region
- [ ] `header.test.ts`, `menu.test.ts`: `current="cv"` with `cvLang` gives the right address and `aria-current="page"`; without `current` no link is marked
- [ ] `static-parts.test.ts`: the band's download follows `cvLang`; English is the default on pages without a CV language
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. The `backToTop` option is T31; the menu marker is T32.
- Lane on `src/layouts/BaseLayout.astro`: T14, T15, T31.
