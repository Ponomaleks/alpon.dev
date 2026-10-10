---
id: T25
title: "Check the CV pages end to end: content, downloads, preview, primary count and targets"
layer: "tests"
deps: ["T17", "T20"]
acs: ["AC-01", "AC-02", "AC-03", "AC-04", "AC-05", "AC-06", "AC-09", "AC-10", "AC-16", "AC-23", "AC-24"]
files_hint: ["tests/e2e/cv.spec.ts", "tests/e2e/cv-preview.spec.ts", "tests/e2e/primary-count.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "L"
status: "todo"
---

# T25 — Check the CV pages end to end: content, downloads, preview, primary count and targets

## Why

AC-01 to AC-06, AC-09, AC-10, AC-16, AC-23, AC-24 ([spec §5](../spec.md)); spec §6 rows Page images, Touch targets, Primary buttons; backlog B-35; screens SCR-05 and SCR-06, every state not checked by T20, T22 and phase 5b.

## What

- `tests/e2e/cv.spec.ts`: content order and labels on both pages; the side column from 1024 and its absence below; contents links; the three downloads with their file names; the Shell's CV links and the band on a CV page; the same with JavaScript disabled.
- `tests/e2e/cv-preview.spec.ts`: the request log, open and close, the link names, a blocked page image.
- `tests/e2e/primary-count.spec.ts`: adds both CV pages at the top, in the middle and at the end; the "band keeps Get in touch" test runs against a CV page (B-35).

## Definition of Done

- [ ] `cv.spec.ts`: AC-01 and AC-02 order and labels; AC-03: no level code, no bracketed text; AC-04: side column at 1024 and 1440, not displayed at 390 and 834, a contents link puts the heading clear of the header
- [ ] `cv.spec.ts`: AC-05: `download` attribute and file name in the head, the side column and the band, the same CV date on both pages and not the footer date; AC-16: the Shell's CV links and the band
- [ ] `cv.spec.ts`: AC-23 with JavaScript disabled: sections, switch, downloads, preview and contact links work; "Copy" is not displayed
- [ ] `cv-preview.spec.ts`: 0 page-image requests before opening; two links with the names of AC-09; the expanded state; a blocked image keeps the link, the name and the box size (AC-10); the same with JavaScript disabled
- [ ] `primary-count.spec.ts`: 390 / 834 / 1440 × top / middle / end on both pages: visible ≤ 2, page content ≤ 1, bar 0
- [ ] `cv.spec.ts`: every interactive element of the page content ≥ 44 × 44 at 390, with the preview closed and open
- [ ] `npm run test` green

## Notes

- Phase 5a. Print, BackToTop and the menu marker have their own e2e in phase 5b.
- The request log is checked in the browsers Playwright runs; the manual check in Firefox and Safari is recorded in the PR (sad §11, T34).
