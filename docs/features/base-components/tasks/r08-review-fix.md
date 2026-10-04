---
id: R8
title: "Re-apply the stored theme when a page comes back from the back/forward cache"
layer: "ui"
deps: []
acs: ["AC-10", "AC-11"]
files_hint: ["src/scripts/shell/theme.ts", "src/scripts/shell/theme.test.ts", "src/components/layout/ThemeToggle.astro", "tests/e2e/theme-switch.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R8 — Re-apply the stored theme when a page comes back from the back/forward cache

## Why

Review round 1 ([review-2026-10-04](../_review/review-2026-10-04.md)), S2-04. `data-theme` is set only by the head bootstrap at load and by a click. A page restored from bfcache does not re-run scripts, so after choosing Dark on page B and pressing Back, page A still shows Dag while the stored choice is Natt.

## Definition of Done

- [ ] `src/scripts/shell/theme.ts`: on `pageshow` with `event.persisted`, the script re-reads the stored theme with the same validation as the bootstrap (only `dag` or `natt`), sets `data-theme` and syncs `aria-pressed` on every live switch.
- [ ] With blocked storage the handler does nothing and throws nothing (unit test).
- [ ] e2e: choose Dark on `/styleguide`, go Back to `/`, the page is Natt and both switches agree. The test takes the two pages as parameters, so steps 4 and 5 are covered without editing the Shell.
- [ ] `npm run lint` and `npm run test:unit` green
