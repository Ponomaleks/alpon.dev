---
id: T7
title: "Add the ghost Button variant and the icons the CV page needs"
layer: "ui"
deps: []
acs: ["AC-06", "AC-24"]
files_hint: ["src/components/ui/Button.astro", "src/components/ui/Icon.astro", "src/components/ui/actions.test.ts", "scripts/contrast-pairs.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T7 — Add the ghost Button variant and the icons the CV page needs

## Why

AC-06, AC-24 ([spec §5](../spec.md)); [screens C-2](../screens.md); screens SCR-05 `head`, `preview closed`; SCR-04 changed sections Button and Icon.

## What

- Reuses: `ui/Button` (adds a variant, no new component), `ui/Icon` (typed path map).
- `Button.astro`: `variant: 'ghost'`, from the site copy of the design system (`design/handoff/site/project/_ds/…/components/actions/`).
- `Icon.astro`: `file-down`, `eye`, `arrow-up`.
- `scripts/contrast-pairs.ts`: the ghost text, hover and focus-ring pairs in Dag, Natt and on spruce.

## Definition of Done

- [ ] `src/components/ui/actions.test.ts`: ghost default and small, with and without an icon; never the primary class; no `style` attribute
- [ ] Same file: the three icons render `aria-hidden` with the stroke width token
- [ ] `npm run check:contrast` green with the new pairs
- [ ] Stylelint 0 findings (tokens only)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. The Styleguide rows for the variant and the icons are T24.
- A ghost button is never a primary button (AC-06).
