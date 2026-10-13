---
id: T15
title: "Rebuild the Not-found page to its page design (SCR-02) and reword P-41"
layer: "ui"
deps: ["T13"]
acs: ["AC-17", "AC-18", "AC-19"]
files_hint: ["src/pages/404.astro", "src/pages/_404.test.ts", "tests/e2e/not-found.spec.ts", "tests/e2e/parity.spec.ts", "docs/stub-parity.md"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T15 — Rebuild the Not-found page to its page design (SCR-02) and reword P-41

## Why

AC-17, AC-18, AC-19 ([spec §5](../spec.md)); [screens.md SCR-02](../screens.md); page design `design/handoff/site/project/site/Misc.jsx` (`Lost`), `design/screenshots/{dag,natt}_not_found_{390,834,1440}.png`; spec §1.3 D-03, D-04; backlog B-01.

## What

- Reuse: `Button` (primary, arrow), `SectionHeader` Eyebrow style for the code line if it fits, `TerrainMap` (T6), `BaseLayout` with `noindex` and `ctaBand: false`; the bar stays.
- Remove the page-local `.home-link` and `.ridge-contours` and the header comment that B-01 names.
- Layout: 5 / 7 columns from 1024 with the text centred vertically; stacked below; top space from the not-found space token, bottom from the section token.
- Parity: reword P-41 to "404 / Ikke funnet" in the test title, the assertion and the `docs/stub-parity.md` row; it stays active.

## Definition of Done

- [ ] `tests/e2e/not-found.spec.ts`: the cases in the DoD sentence above, at 390, 834 and 1440; a crafted path with markup is not reflected
- [ ] `src/pages/_404.test.ts`: built `dist/404.html` has `noindex`, one link inside `main`, no `style=`
- [ ] Parity P-41 passes with the new wording; no other parity item changes here
- [ ] Side-by-side comparison with the six `design/screenshots/*_not_found_*` files; every difference is one of spec §1.3 or is listed for the PR
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Shares `tests/e2e/parity.spec.ts` and `docs/stub-parity.md` with T18, so `implement` runs the two in one lane.
- The Design match NFR (0 unlisted differences) is confirmed in the PR review; the visual baselines are T21.
