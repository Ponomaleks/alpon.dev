---
id: T5
title: "Add the contrast check over the generated tokens"
layer: "tests"
deps: ["T3"]
acs: ["AC-10"]
files_hint: ["scripts/check-contrast.ts", "scripts/contrast-pairs.ts", "package.json"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T5 — Add the contrast check over the generated tokens

## Why

AC-10 ([spec §5](../spec.md)); NFR row "Contrast" ([spec §6](../spec.md)); [sad §5 decomposition and QG-3](../sad.md).

## What

- `scripts/contrast-pairs.ts`: the pair manifest (semantic text/background pairs at 4.5:1; large text, UI borders and focus ring at 3:1).
- `scripts/check-contrast.ts`: parse `tokens.css`, resolve each pair per theme (Dag, Natt, `.fjord-on-spruce`), compute the WCAG ratio, print failures as `pair · theme · ratio`; assert the two Natt blocks are identical.
- `package.json`: `check:contrast`, run by `lint`.
- `scripts/check-contrast.test.ts`.

## Definition of Done

- [ ] Vitest: a fixture tokens file with one pair below threshold fails and the message names pair, theme and ratio (two decimals)
- [ ] Vitest: a fixture where the no-JS Natt block differs fails
- [ ] The real `tokens.css` passes; `npm run lint` green
- [ ] If a real brand pair fails, stop and report it to the Owner (BRAND.md wins; never tweak a value to pass)

## Notes

- Parallel to T4 (different files apart from `package.json`, which serializes them in one lane).
