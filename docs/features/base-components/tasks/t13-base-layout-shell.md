---
id: T13
title: "Compose the Shell in BaseLayout from page options and keep the existing suites green"
layer: "wiring"
deps: ["T8", "T9", "T10", "T11", "T12"]
acs: ["AC-24", "AC-06", "AC-07", "AC-13", "AC-30"]
files_hint: ["src/layouts/BaseLayout.astro", "src/layouts/BaseLayout.test.ts", "src/layouts/fixtures/", "src/styles/base.css", "src/pages/index.astro", "src/pages/_404.test.ts", "tests/e2e/not-found.spec.ts", "tests/e2e/smoke.spec.ts", "tests/a11y/smoke.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T13 — Compose the Shell in BaseLayout from page options and keep the existing suites green

## Why

AC-24, AC-06, AC-07, AC-13, AC-30 ([spec §5](../spec.md)); [sad §4 pillar 5, §5 page options table, §8 Sticky action bar clearance](../sad.md); [screens.md SCR-01](../screens.md).

## What

- `BaseLayout.astro`: the six optional props of sad §5, passed on to `Header`, `MobileMenu`, `CtaBand`, `MobileBar`; renders the Toast region; `<main id="main" tabindex="-1">` wraps the slot. The head contract does not change.
- `base.css`: bar clearance at the end of the page and `scroll-padding-bottom` below 768, only when the page has the bar (hook H-2).
- `index.astro`: the placeholder content stays, now inside the Shell with default options (SCR-01).
- Existing tests that the Shell invalidates are scoped to the page content, not loosened: "exactly one link" in `src/pages/_404.test.ts` and `tests/e2e/not-found.spec.ts` becomes "one link inside `main`"; smoke and axe specs keep their assertions.

## Definition of Done

- [ ] `src/layouts/BaseLayout.test.ts`: element order; one fixture per option value; defaults give the full Shell; `mobileBar: false` and `ctaBand: false` leave the part out of the HTML
- [ ] Same test: head order and the two font preloads are as before; no inline style or script other than the bootstrap (the CSP integration passes the build)
- [ ] `npm run build` then `npm run test`: existing e2e and axe specs pass on `/` and the Not-found page
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Additive, optional props only: no existing caller breaks, so this is not a compile-coupled contract task.
- The Not-found visual baselines go stale here; they are rewritten in T21 after the rebuild (T15). Never commit Windows snapshots and never update baselines locally. Do not push from this task until T21 (`_epic.md` hard rule "No push between T13 and T21"): the CI visual check is red in between.
- After this task steps 4 and 5 must not need to edit this file (spec §7 KPI).
