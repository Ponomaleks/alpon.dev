---
id: R6
title: "Verify keyboard activation and the 44 px targets of the open menu end to end"
layer: "tests"
deps: ["R3"]
acs: ["AC-25"]
files_hint: ["tests/e2e/shell.spec.ts", "tests/e2e/menu.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R6 — Verify keyboard activation and the 44 px targets of the open menu end to end

## Why

Review round 1 ([review-2026-10-04](../_review/review-2026-10-04.md)), S1-03, S1-04. AC-25 says buttons work with Enter and Space, but no test presses Space and Enter is pressed only on the skip link. The 44 x 44 test (`tests/e2e/shell.spec.ts`) never opens the mobile menu, so none of its targets are measured.

## Definition of Done

- [ ] One e2e at 390: the menu button opens the panel with Enter, a theme segment is toggled with Space, and the close button closes the panel with Space.
- [ ] The 44 x 44 box-plus-overlay loop also runs over `#mobile-menu :is(a[href], button)` with the panel open at 390.
- [ ] `npm run lint` and `npm run test:unit` green
