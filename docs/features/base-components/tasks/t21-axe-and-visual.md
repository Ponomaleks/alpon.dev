---
id: T21
title: "Add axe checks for the three pages and the open menu, and the Styleguide and Not-found visual baselines"
layer: "tests"
deps: ["T15", "T17"]
acs: ["AC-21", "AC-04", "AC-17"]
files_hint: ["tests/a11y/", "tests/visual/", ".github/workflows/ci.yml", ".github/workflows/visual-baselines.yml"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T21 — Add axe checks for the three pages and the open menu, and the Styleguide and Not-found visual baselines

## Why

AC-21, AC-04, AC-17 ([spec §5](../spec.md)); [spec §6 Accessibility, Visual regression](../spec.md); [sad §10 QG-2, QG-3; §11 baselines risk](../sad.md).

## What

- `tests/a11y/`: extend the smoke spec or add `shell.spec.ts` for the four targets × two themes.
- `tests/visual/styleguide.spec.ts`: follows the mode switch of `tests/visual/not-found.spec.ts` (`FJORD_VISUAL=compare|write`, Linux only); one capture per section element; the footer section masks the year.
- `tests/visual/not-found.spec.ts`: same six names, new baselines; mask the year.
- Workflow step names and artifact paths if they still say "Not-found" only.

## Definition of Done

- [ ] `npm run test` passes the axe specs locally
- [ ] The `visual-baselines` PR label run produced the Linux baselines; the Owner reviewed the Not-found set against `design/screenshots/` before they were committed
- [ ] CI visual job passes with `maxDiffPixelRatio: 0.001`
- [ ] `npm run lint` green

## Notes

- Never commit Windows snapshots (sad §11). Never update baselines locally. This is the first push since T13 (`_epic.md` hard rule "No push between T13 and T21"): push once, expect the visual check red, then stop and ask the Owner to add the `visual-baselines` label. The Owner reviews the Linux baselines before anything else continues.
- Parallel to T20 and T22.
