---
id: T20
title: "Verify the Sticky action bar, the one-primary rule, the Toast position and reduced motion"
layer: "tests"
deps: ["T15"]
acs: ["AC-07", "AC-08", "AC-09", "AC-23", "AC-28", "AC-30"]
files_hint: ["tests/e2e/action-bar.spec.ts", "tests/e2e/primary-count.spec.ts", "tests/e2e/reduced-motion.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T20 — Verify the Sticky action bar, the one-primary rule, the Toast position and reduced motion

## Why

AC-07, AC-08, AC-09, AC-23, AC-28, AC-30 ([spec §5](../spec.md)); [spec §6 Primary buttons](../spec.md); [sad §6 critical flow 2; §8 One primary, Toast, Testing; §10 QG-2](../sad.md); [screens.md §Shell states bar-*, toast-shown; G-4, G-5](../screens.md).

## What

- `action-bar.spec.ts`: geometry at 390 (bar bottom edge, last footer line above the bar at the end of the page, a focused footer link not covered); motion-allowed tests for bar-away and bar-returned including G-4 and G-5; scripts-off and reduced-motion contexts for bar-static; not displayed at 768.
- `primary-count.spec.ts`: counts by the primary style hook of `Button`, in `main` and in the viewport; the header action is secondary with the bar on screen and primary once it has scrolled away (motion allowed).
- `reduced-motion.spec.ts`: with `reducedMotion: "reduce"` no running animation and no transform change on the listed parts; Toast via a dispatched `fjord:toast` on `/` at 390: above the bar, `role="status"`, gone after its duration.

## Definition of Done

- [ ] The three specs pass on the desktop and mobile projects
- [ ] The "bar scrolled away" cases run with motion allowed, the others with reduced motion or scripts off (sad §8 Testing)
- [ ] `npm run lint` green

## Notes

- Needs both Visitor pages in their final form, hence after T15.
