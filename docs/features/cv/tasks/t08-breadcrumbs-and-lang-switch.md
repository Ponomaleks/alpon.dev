---
id: T8
title: "Build Breadcrumbs and the LangSwitch as two links"
layer: "ui"
deps: []
acs: ["AC-01", "AC-07"]
files_hint: ["src/components/ui/Breadcrumbs.astro", "src/components/ui/LangSwitch.astro", "src/components/ui/navigation.test.ts", "scripts/contrast-pairs.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T8 — Build Breadcrumbs and the LangSwitch as two links

## Why

AC-01, AC-07 ([spec §5](../spec.md)); [sad §8 Language switch, Current page](../sad.md); screens SCR-05 `head`, `language switch`; SCR-06 `head`; [screens C-7 and §New components](../screens.md).

## What

- Reuses: `ui/Link`; the `.fj-crumbs` and `.fj-seg` looks from the site copy of the design system.
- NEW `ui/LangSwitch` (no existing primitive fits: the inventory's SegmentedControl is a radio group that needs a script): two links in one pill, sizes large and default, a group name prop, the hooks the CV page script reads.
- `ui/Breadcrumbs` (design-only inventory row, built here): a named `nav`, links, the current item.
- Contrast pairs of both components.

## Definition of Done

- [ ] `src/components/ui/navigation.test.ts`: LangSwitch: two `a` elements, group name, `aria-current="true"` on the current language, `lang="no"` on "NO", both sizes, a 44 by 44 target around each drawn segment (C-7)
- [ ] Same file: Breadcrumbs: named `nav`, two and three items, `aria-current="page"` on the last, a 44 by 44 target on the link
- [ ] `npm run check:contrast` green with the new pairs
- [ ] Stylelint 0 findings (tokens only)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. With scripts off the switch is two plain links (AC-07); no script is written here.
- State lives in attributes, not classes a script adds (base-components ADR-0003).
- Lane with T7 and T32 on `scripts/contrast-pairs.ts`.
