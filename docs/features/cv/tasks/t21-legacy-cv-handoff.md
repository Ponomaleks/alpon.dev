---
id: T21
title: "Hand the Legacy CV addresses over from the home page"
layer: "app"
deps: ["T3"]
acs: ["AC-13", "AC-14"]
files_hint: ["src/scripts/home/legacy-cv.ts", "src/scripts/home/legacy-cv.test.ts", "src/scripts/home/index.ts", "tests/e2e/legacy-cv.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T21 — Hand the Legacy CV addresses over from the home page

## Why

AC-13, AC-14 ([spec §5](../spec.md)); [sad §6 Legacy CV hand-off](../sad.md); screens SCR-01 `legacy hand-off, English`, `legacy hand-off, Norwegian`, `legacy address, scripts off`, `other fragment`; spec §6.1 (crafted fragment).

## What

- `src/scripts/home/legacy-cv.ts`: the exact map of the two Legacy CV addresses to `contact.links.cvPages`.
- `src/scripts/home/index.ts`: the first statement replaces the location when the map names a target.

## Definition of Done

- [ ] `src/scripts/home/legacy-cv.test.ts`: `#cv` and `#cv-no` map to `/cv/en` and `/cv/no`; `#CV`, `#cv-`, `#cv-no-x`, `#contact`, an empty fragment and a fragment with an address in it map to nothing
- [ ] `tests/e2e/legacy-cv.spec.ts`: from another page to `/#cv` and to `/#cv-no`: the CV page opens and one Back returns to that other page
- [ ] Same file: with JavaScript disabled the home page is shown and "View CV" on the first screen leads to the CV page; `/#contact` opens the contact place
- [ ] `npm run build && npm run check:budgets`: the home page's own scripts, the hand-off included, within 10 KB gzip
- [ ] `tests/contracts/csp.contract.json` and `public/_headers` are not changed by this task
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. Ends home IS-02; P-31 is switched on in T27.
- The home page may be seen for a moment before the hand-off; accepted in sad §11. No blocking script is added.
- Lane with T13 on `src/scripts/home/index.ts`.
