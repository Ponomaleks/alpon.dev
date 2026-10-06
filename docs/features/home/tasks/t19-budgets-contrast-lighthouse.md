---
id: T19
title: "Split the script budgets, add the portrait and contrast checks and hold the Lighthouse budget on the home page"
layer: "tests"
deps: ["T15", "T17"]
acs: ["AC-02", "AC-33"]
files_hint: ["scripts/check-budgets.ts", "scripts/check-budgets.test.ts", "scripts/contrast-pairs.ts", "scripts/check-contrast.test.ts", "lighthouserc.cjs", "src/components/home/Portrait.astro"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "blocked"
---

# T19 — Split the script budgets, add the portrait and contrast checks and hold the Lighthouse budget on the home page

## Why

Spec §6 rows "Lighthouse", "LCP / CLS / TBT", "Initial JS", "Portrait", "Contrast"; AC-02 and AC-33 ([spec §5](../spec.md)); backlog B-09; [sad §8 Budgets, Portrait](../sad.md).

## What

- `check-budgets.ts`: a script file more than one built page loads is a Shell script (limit 5 KB gzip together), a file only one page loads is that page's own (home limit 10 KB gzip); total initial JS per page stays ≤ 50 KB. It also fails, naming the file, if one of the four portrait files is missing or above 40 KB.
- `contrast-pairs.ts`: the pairs of the new components in Dag, Natt and on spruce, including the header over the hero (text, the secondary and primary "Get in touch", the focus ring).
- Run `npm run lhci`; set the portrait `loading` and `fetchpriority` from the LCP element Lighthouse reports at 390 and 1440.

## Definition of Done

- [ ] `scripts/check-budgets.test.ts`: Shell and page-own scripts apart; each limit has a failing fixture; missing and oversized portrait
- [ ] `scripts/check-contrast.test.ts` and `npm run check:contrast`: every new pair meets 4.5:1 for body text and 3:1 for large text, control boundaries and the focus ring
- [ ] `npm run build && npm run check:budgets && npm run lhci` pass; the measured numbers go into the PR body
- [ ] The LCP element at 390 and 1440 is named in the task result
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- Budgets are reported, not bent: a home script above 10 KB or a failed Lighthouse number goes to the Owner before any limit changes.
- Closes B-09.
