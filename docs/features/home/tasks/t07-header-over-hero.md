---
id: T7
title: "Add the over-hero state to the header and drop the bar-dependent secondary rule"
layer: "ui"
deps: []
acs: ["AC-33", "AC-34"]
files_hint: ["src/components/layout/Header.astro", "src/components/layout/header.test.ts", "src/layouts/BaseLayout.astro", "src/layouts/BaseLayout.test.ts", "src/scripts/home/hero-header.ts", "src/scripts/home/hero-header.test.ts", "tests/e2e/primary-count.spec.ts", "tests/e2e/shell.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T7 — Add the over-hero state to the header and drop the bar-dependent secondary rule

## Why

AC-33, AC-34 ([spec §5](../spec.md)); spec §1.3 D-08, D-14; [ADR-0001](../adr/0001-mark-the-header-over-the-hero-with-a-server-rendered-state-attribute.md); [sad §6 Critical flow 1, §8 Header over the hero](../sad.md); [screens.md SCR-01 header states](../screens.md).

## What

- Reuses: `layout/Header`, `ui/Button` (primary, secondary, on-spruce), `brand/Wordmark` (on-spruce), `shell/header.ts` (scroll border).
- `BaseLayout` gains `headerOverHero`; the header renders `data-over-hero`. Styles apply it only under `:root[data-theme]`: Dag on spruce without a border, "Get in touch" primary below 768 and secondary from 768; Natt only turns "Get in touch" secondary from 768.
- Remove the `:has([data-shell-bar]:not([inert]))` rule: `headerCta: "auto"` is always primary outside the over-hero state.
- `src/scripts/home/hero-header.ts`: exported `initHeroHeader()`; removes and restores the attribute as the hero leaves and returns the area under the header, with a synchronous check at start and on `pageshow`. It is loaded by the home entry in T15.

## Definition of Done

- [ ] `src/scripts/home/hero-header.test.ts`: start at the top, start scrolled past the hero, scroll out and back, `pageshow` after a back-forward restore
- [ ] `src/components/layout/header.test.ts`: the attribute follows the option; the over-hero selectors are scoped to `:root[data-theme]`; the bar-dependent selector is gone
- [ ] `tests/e2e/primary-count.spec.ts` and `tests/e2e/shell.spec.ts`: the old "secondary while the bar is on screen" assertions are replaced by "always primary" on the Not-found page
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- The 18 header states on the home page are tested in T22, after the page exists.
- If the home script does not load, the header keeps the over-hero look: accepted in ADR-0001 and sad §11.
- Lane: `BaseLayout.astro` (T4, T5, T8) and `primary-count.spec.ts` (T5, T22).
