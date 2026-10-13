---
id: T17
title: "Compose CvPage, give the three pages their head and list them in the sitemap"
layer: "wiring"
deps: ["T2", "T5", "T6", "T9", "T10", "T11", "T12", "T14", "T15", "T16"]
acs: ["AC-01", "AC-02", "AC-04", "AC-17", "AC-20"]
files_hint: ["src/components/cv/CvPage.astro", "src/pages/cv.astro", "src/pages/cv/en.astro", "src/pages/cv/no.astro", "src/pages/_cv.test.ts", "public/sitemap.xml"]
owner: "Alexander Ponomarenko"
estimate: "L"
status: "todo"
---

# T17 — Compose CvPage, give the three pages their head and list them in the sitemap

## Why

AC-01, AC-02, AC-04, AC-17, AC-20 ([spec §5](../spec.md)); [sad §4 item 2](../sad.md); [sad §5](../sad.md); screens SCR-05 `default`, `sections`, `side column, 1024 and wider`, `side column, below 1024`, `Dag / Natt`; SCR-06 `default`, `sections`, `header and menu CV link`; wireframes W-1, W-2.

## What

- Reuses: `BaseLayout` with the options of T14 and the bar pair of T15; every component of T9 to T12 and T16; data of T4 to T6.
- `cv/CvPage` (page section): head, preview control, the sections the CV data has in order, the side column; the grid of the page design (8 and 4 of 12 parts from 1024).
- The three page files render `CvPage` with a CV language and pass `lang`, `cvLang`, `current`, `canonical`, `alternates` (`en`, `no`, `x-default`) and `mobileBarActions`; `noindex` from T2 is removed.
- `public/sitemap.xml`: `/cv/en` and `/cv/no`.

## Definition of Done

- [ ] `src/pages/_cv.test.ts`: structure of the three built files: one `h1`, `h2` in order, ids from `sections.ts`, numbers without a gap on the Norwegian page
- [ ] Same file: `<html lang>`; title and description per CV language; `og:` data with the site's preview image; canonical; three alternates on each of the three files
- [ ] Same file: the header's "CV" has `aria-current="page"` and leads to the page being read; the bar pair is the switch and the download with `lang="no"` on the Norwegian page
- [ ] Same file: the side column is in the HTML of all three files; the build passes the CSP integration with no inline style
- [ ] `public/sitemap.xml` lists `/cv/en` and `/cv/no` and not `/cv`
- [ ] Stylelint 0 findings (tokens only)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. No script is loaded yet (T20) and no print styles yet (T30).
- After each UI change compare with `design/screenshots/{dag,natt}_cv.png` and the standalone design at 390 and 834 (`CLAUDE.md` Workflow); differences other than D-01 to D-10 go to the Owner.
- Lanes: the page files with T2; `CvPage.astro` with T20 and T30.
