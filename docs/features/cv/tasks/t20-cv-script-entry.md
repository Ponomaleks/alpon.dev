---
id: T20
title: "Wire the CV page script and check the language switch and the copy action on the page"
layer: "app"
deps: ["T13", "T17", "T18", "T19"]
acs: ["AC-04", "AC-08", "AC-19", "AC-23"]
files_hint: ["src/scripts/cv/index.ts", "src/components/cv/CvPage.astro", "tests/e2e/cv-lang-switch.spec.ts", "tests/e2e/cv-copy.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T20 — Wire the CV page script and check the language switch and the copy action on the page

## Why

AC-08, AC-19, AC-04, AC-23 ([spec §5](../spec.md)); [ADR-0001](../adr/0001-carry-the-section-across-the-language-switch-as-a-shared-fragment-id.md); [sad §6 Critical flow 1 and Sticky action bar on a CV page](../sad.md); screens SCR-05 `language switch, other language, section in view`, `language switch, other language, no section`, `language switch, current language`, `language switch, other language, scripts off`, `arrived at a section`, `arrived with an unknown fragment`, `copy offered / success / refused / not offered`; SCR-06 `language switch`, `section missing on the other page`.

## What

- `src/scripts/cv/index.ts`: the one entry, imported by `CvPage.astro`: arrive, section in view, both switches, the shared copy-email module.
- e2e against `wrangler dev` for the switch (head at 1440, bar at 390) and for the copy action from 1024.

## Definition of Done

- [ ] `tests/e2e/cv-lang-switch.spec.ts`: per shared section in both directions: the address has the fragment, the heading is 0 px under the header, focus is at the section, one Back returns
- [ ] Same file: above the first section and for a section the other page lacks the page opens at its top; the current-language link causes no navigation; with JavaScript disabled the other page opens at its top
- [ ] Same file: an unknown fragment focuses nothing
- [ ] `tests/e2e/cv-copy.spec.ts`: "Copied" on `/cv/en`; "Kopiert" with the Toast message marked `lang="no"` on `/cv/no`; no "Copy" with JavaScript disabled
- [ ] `npm run build && npm run check:budgets`: the CV page's own scripts within 10 KB gzip, 50 KB in total, Shell within 5 KB
- [ ] `tests/contracts/csp.contract.json` is unchanged
- [ ] `npm run lint` and `npm run test:unit` green
- [ ] `npm run test` green

## Notes

- Phase 5a. "Print" joins the entry in T30.
- Lane with T17 and T30 on `CvPage.astro`; with T30 on `src/scripts/cv/index.ts`.
