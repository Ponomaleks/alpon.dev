---
id: T11
title: "Build the key facts panel with the Stat count-up"
layer: "ui"
deps: ["T2"]
acs: ["AC-05", "AC-06"]
files_hint: ["src/components/ui/Stat.astro", "src/components/ui/content.test.ts", "src/components/home/KeyFacts.astro", "src/components/home/key-facts.test.ts", "src/scripts/home/count-up.ts", "src/scripts/home/count-up.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T11 — Build the key facts panel with the Stat count-up

## Why

AC-05, AC-06 ([spec §5](../spec.md)); [sad §8 Count-up](../sad.md); [screens.md SCR-01 key facts, key facts counting, key facts static](../screens.md).

## What

- Reuses: `ui/Stat`; data from `home.ts`.
- `Stat.astro` gains `countUp`: the final value stays the text assistive technology reads; a second copy, hidden from it, is what the script counts. Tabular numerals and a width reserved for the final value.
- `home/KeyFacts.astro`: the raised panel that overlaps the lower edge of the hero, two columns below 1024 and four from 1024.
- `src/scripts/home/count-up.ts`: exported `initCountUp()`; counts each value once when the panel first comes into view; does nothing under reduced motion or without `IntersectionObserver`.

## Definition of Done

- [ ] `src/scripts/home/count-up.test.ts`: once only, final value exact, prefixes and suffixes kept, reduced motion and missing observer leave the final value
- [ ] `src/components/ui/content.test.ts`: `countUp` markup; a Stat without it is unchanged
- [ ] `src/components/home/key-facts.test.ts`: four items from `home.ts`
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- Without the script only the final value is visible: the counting copy is shown by a state attribute the script sets, never hidden by script.
