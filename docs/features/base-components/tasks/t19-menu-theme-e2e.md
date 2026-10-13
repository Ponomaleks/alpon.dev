---
id: T19
title: "Verify the mobile menu and the theme switch end to end"
layer: "tests"
deps: ["T13"]
acs: ["AC-04", "AC-05", "AC-10", "AC-11", "AC-12", "AC-29"]
files_hint: ["tests/e2e/menu.spec.ts", "tests/e2e/theme-switch.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T19 — Verify the mobile menu and the theme switch end to end

## Why

AC-04, AC-05, AC-10, AC-11, AC-12, AC-29 ([spec §5](../spec.md)); [spec §6 Wrong selection on the theme switch](../spec.md); [sad §6 critical flow 1 and Mobile menu; §10 QG-2](../sad.md); [screens.md SCR-03, G-1, G-2, G-3, G-6](../screens.md).

## What

- `menu.spec.ts` at 390 on `/`: the SCR-03 states "open", "closed by Escape or the close button", "closed by a link", "closed by width", "theme changed inside", "not reachable"; the panel content in Dag and in Natt.
- `theme-switch.spec.ts`: the matrix stored Dag / Natt / none × device light / dark; header switch and menu switch agree; `fjord-theme` holds only `dag` or `natt`; a storage that throws; a scripts-off context; one test with motion allowed that sees `startViewTransition` used from the header switch and not from inside the panel (G-6).

## Definition of Done

- [ ] `tests/e2e/menu.spec.ts` passes on the mobile project
- [ ] `tests/e2e/theme-switch.spec.ts` passes; the existing `tests/e2e/theme.spec.ts` still passes unchanged
- [ ] No console error in any case of either spec
- [ ] `npm run lint` green

## Notes

- Parallel to T14, T15, T16 and T18: new spec files only.
