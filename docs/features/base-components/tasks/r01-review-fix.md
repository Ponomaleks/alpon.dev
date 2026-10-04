---
id: R1
title: "Put the mobile menu panel on spruce, as the page design has it"
layer: "ui"
deps: []
acs: ["AC-04", "AC-21"]
files_hint: ["src/components/layout/MobileMenu.astro", "src/components/layout/ThemeToggle.astro", "src/components/brand/Wordmark.astro", "scripts/contrast-pairs.ts", "tests/e2e/menu.spec.ts", "src/components/layout/menu.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R1 — Put the mobile menu panel on spruce, as the page design has it

## Why

Review round 1 ([review-2026-10-04](../_review/review-2026-10-04.md)), S2-01. The page design renders the menu sheet on spruce in Dag and Natt (`_ds_bundle.js` `fj-sheet fjord-on-spruce`, Contours `tone: "spruce"`, wordmark size 17; `tokens/colors.css` names "menu sheet" as a spruce ground). The build renders it on the page ground. The Owner confirmed the design in the prototype at 390.

## Definition of Done

- [ ] The menu panel (live dialog and Styleguide sample) is on spruce in Dag and Natt through the existing on-spruce variants of the components (`fjord-on-spruce`, Contours `tone="spruce"`, the 17 px wordmark); no new colour is introduced. It shows snow text, a light primary "Get in touch" with arrow and spruce-tone contours.
- [ ] The on-spruce theme switch inside the panel has the corrected pill shape and a clearly visible selected segment.
- [ ] `scripts/contrast-pairs.ts` lists every pair the panel renders on spruce, and `npm run check:contrast` passes with no new known failure.
- [ ] `tests/e2e/menu.spec.ts` asserts the spruce ground and snow text in Dag and Natt; axe with the panel open stays at zero violations in both themes.
- [ ] The six `styleguide-mobile-menu-panel-*` baselines are regenerated through the `visual-baselines` PR label, not locally.
- [ ] `npm run lint` and `npm run test:unit` green
