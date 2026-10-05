---
id: T5
title: "Give the Sticky action bar its actions from a page option, all secondary"
layer: "ui"
deps: ["T3"]
acs: ["AC-34", "AC-38"]
files_hint: ["src/data/shell-actions.ts", "src/components/layout/MobileBar.astro", "src/components/layout/bar.test.ts", "src/layouts/BaseLayout.astro", "src/layouts/BaseLayout.test.ts", "tests/e2e/action-bar.spec.ts", "tests/e2e/primary-count.spec.ts", "tests/e2e/not-found.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T5 — Give the Sticky action bar its actions from a page option, all secondary

## Why

AC-34, AC-38 ([spec §5](../spec.md)); spec §1.3 D-10; [ADR-0002](../adr/0002-pass-shell-actions-as-typed-descriptors-through-page-options.md); [screens.md Shell state changes bar-open, SCR-02](../screens.md).

## What

- Reuses: `layout/MobileBar`, `ui/Button` (secondary), `ui/Icon` (`file-text`, `download`).
- `src/data/shell-actions.ts`: the `BarAction` type (label, href, icon, optional `download`; no style field) and the default pair "View CV" and "Save contact (.vcf)".
- `MobileBar.astro` renders the pair it is given, always in the secondary style. `BaseLayout` gains `mobileBarActions` with the default pair.
- The existing e2e specs that expect "Get in touch" in the bar are changed to the new pair; `src/pages/404.astro` is not edited.

## Definition of Done

- [ ] `src/components/layout/bar.test.ts`: default pair, custom pair, no primary variant possible (a `BarAction` with a style field does not type-check: `// @ts-expect-error` in the test)
- [ ] `src/layouts/BaseLayout.test.ts`: `mobileBarActions` reaches the bar; the default gives the default pair
- [ ] `tests/e2e/action-bar.spec.ts` and `tests/e2e/not-found.spec.ts`: the new pair on the Not-found page at 390; "Save contact" downloads the `.vcf`
- [ ] `tests/e2e/primary-count.spec.ts`: 0 primary buttons inside the bar on every Visitor page
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- The `BandAction` type is added to the same file by T8 (lane on `shell-actions.ts`).
- From this task the Not-found visual baseline at 390 is stale until T25: see `_epic.md` hard rule on pushes.
- ADR-0002 names the language switch as a later extension for step 5; do not build it here.
