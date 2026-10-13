---
id: T15
title: "Let the Sticky action bar take a language switch and a link with a language"
layer: "ui"
deps: ["T8", "T14"]
acs: ["AC-19"]
files_hint: ["src/data/shell-actions.ts", "src/components/layout/MobileBar.astro", "src/components/layout/bar.test.ts", "src/layouts/BaseLayout.astro"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T15 — Let the Sticky action bar take a language switch and a link with a language

## Why

AC-19 ([spec §5](../spec.md)); home ADR-0002 (Shell actions as typed descriptors); [sad §5 Page options, `mobileBarActions`](../sad.md); screens §Shell state changes `bar-open on a CV page`; wireframe W-5; spec §1.3 D-05.

## What

- Reuses: `layout/MobileBar`, `ui/LangSwitch` (T8), `ui/Button` (secondary), `ui/Icon` (`file-down`).
- `src/data/shell-actions.ts`: `BarAction` becomes a link or a language switch; a link may carry `lang`. The type change and its one implementer land together (contract-task rule).
- `MobileBar.astro`: renders the switch slot at its own width at the start side; the frame and the tab stay English.

## Definition of Done

- [ ] `src/components/layout/bar.test.ts`: switch slot with "EN" current and with "NO" current; a link with `lang="no"`; both secondary
- [ ] Same file: the default pair of the home page and the Not-found page renders as before
- [ ] Same file: a `@ts-expect-error` case proves the type has no style field
- [ ] `tests/e2e/action-bar.spec.ts` still green
- [ ] Stylelint 0 findings (tokens only)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. The bar gets no script: the CV page script drives both switches through the same hooks (T20).
- The bar holds no primary button (home D-10).
