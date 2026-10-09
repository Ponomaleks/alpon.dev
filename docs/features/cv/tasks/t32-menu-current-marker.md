---
id: T32
title: "Mark the current link in the mobile menu and check the header's marker on the rendered page"
layer: "ui"
deps: ["T28"]
acs: ["AC-20", "AC-29"]
files_hint: ["src/components/layout/MobileMenu.astro", "src/components/layout/menu.test.ts", "tests/e2e/menu.spec.ts", "tests/e2e/header-states.spec.ts", "scripts/contrast-pairs.ts", "src/pages/styleguide.astro", "src/pages/_styleguide.test.ts", "docs/backlog.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T32 — Mark the current link in the mobile menu and check the header's marker on the rendered page

## Why

AC-20, AC-29 ([spec §5](../spec.md)); backlog B-05; [sad §8 Current page](../sad.md); screens SCR-03 `open, current link`, `open, no current link`, `open on SCR-06` and its wireframe; SCR-04 changed section Mobile menu panel.

## What

- Reuses: `layout/MobileMenu`, the header's existing marker.
- `MobileMenu.astro`: the current link gets an accent rule at the start of its row and the semibold weight.
- e2e on the rendered page for both markers (B-05); the Styleguide's menu sample shows the new form; `docs/backlog.md`: close B-05.

## Definition of Done

- [ ] `src/components/layout/menu.test.ts`: the marker follows `aria-current="page"`, not a class a script adds
- [ ] `tests/e2e/header-states.spec.ts`: computed style of the header's "CV" on `/cv/en` and `/cv/no`; no marked link on `/` and on the Not-found page
- [ ] `tests/e2e/menu.spec.ts`: at 390 on both CV pages the current link differs from "Contact" in weight and has the rule; on the home page no link has it; on `/cv/no` the panel is marked English
- [ ] `npm run check:contrast` green with the rule's pair
- [ ] `src/pages/_styleguide.test.ts`: the menu sample has a current link
- [ ] Stylelint 0 findings (tokens only)
- [ ] `npm run lint` and `npm run test:unit` green
- [ ] `npm run test` green

## Notes

- Phase 5b. The link's address and `aria-current` come from T14; this task adds the look and the rendered checks.
- The marker differs by more than colour (AC-20).
- Lanes: `MobileMenu.astro` and `menu.test.ts` with T14; `styleguide.astro`; `scripts/contrast-pairs.ts`.
