---
id: T13
title: "Build the experience list from native details entries"
layer: "ui"
deps: ["T2", "T3"]
acs: ["AC-08"]
files_hint: ["src/components/home/ExperienceList.astro", "src/components/home/experience.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T13 — Build the experience list from native details entries

## Why

AC-08 ([spec §5](../spec.md)); [sad §8 Experience entries](../sad.md); [screens.md SCR-01 experience, on arrival and entry open / closed](../screens.md).

## What

- Reuses: `ui/SectionHeader`, `ui/Link` ("Full CV" to `/cv`), `ui/Tag`, `ui/Icon` (`chevron-down`).
- `home/ExperienceList.astro`: four entries on a timeline rail, each a native `<details>` whose `<summary>` always shows period, note, role and organisation; the first has `open`; the most recent has the filled marker; an entry without points or tags renders no empty list.

## Definition of Done

- [ ] `src/components/home/experience.test.ts`: the assertions above, on the built HTML
- [ ] Date ranges use the en dash of the design copy
- [ ] Opening and closing with pointer and keyboard, scripts on and off, is measured in T20
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- No script: the platform announces the state. The chevron turns through the `[open]` selector.
