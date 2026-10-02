---
id: T14
title: "Verify the Not-found page and reduced motion end to end and flip P-41"
layer: "tests"
deps: ["T9"]
acs: ["AC-07", "AC-08", "AC-14"]
files_hint: ["tests/e2e/not-found.spec.ts", "tests/e2e/parity.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T14 — Verify the Not-found page and reduced motion end to end and flip P-41

## Why

AC-07, AC-08, AC-14; [screens.md SCR-02](../screens.md); [sad §6 flow 2 and Reduced motion flow](../sad.md); stub parity P-41.

## What

- Unknown path → status 404, text checks, robots meta, link count 1, click → `/`.
- Crafted path `/<b>x</b>-%3Cscript%3E` → body text does not contain it.
- `reducedMotion: 'reduce'`: `document.getAnimations()` is empty on `/` and the 404 page after hover/focus on the home-link.
- `parity.spec.ts`: P-41 `fixme` → `test`.

## Definition of Done

- [ ] All assertions above pass on desktop and mobile projects
- [ ] P-41 passes; parity `fixme` count is 11 after T12, T13 and T14 ([spec §7](../spec.md))
- [ ] `npm run test` green

## Notes

- None.
