---
id: T18
title: "Write the pure modules of the CV page script"
layer: "app"
deps: ["T4"]
acs: ["AC-08"]
files_hint: ["src/scripts/cv/section-in-view.ts", "src/scripts/cv/section-in-view.test.ts", "src/scripts/cv/lang-switch.ts", "src/scripts/cv/lang-switch.test.ts", "src/scripts/cv/arrive.ts", "src/scripts/cv/arrive.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T18 — Write the pure modules of the CV page script

## Why

AC-08 ([spec §5](../spec.md)); [ADR-0001](../adr/0001-carry-the-section-across-the-language-switch-as-a-shared-fragment-id.md); [sad §6 Critical flow 1](../sad.md); [sad §8 Language switch](../sad.md); spec §6.1 (crafted fragment).

## What

- `section-in-view.ts`: which shared section id is in view under the header, or none above the first section.
- `lang-switch.ts`: keeps the fragment of every link to the other language (head and bar) in step with that id; prevents navigation on the link of the current language.
- `arrive.ts`: moves keyboard focus to the section the fragment names when it is a CV section of this page; anything else is ignored.

## Definition of Done

- [ ] `section-in-view.test.ts`: above the first section; each section; between two sections; the header offset
- [ ] `lang-switch.test.ts`: fragment set, replaced and cleared on both switches; the current-language link does not navigate; a link to another address is left alone
- [ ] `arrive.test.ts`: a known id is focused; an unknown id, an id of a non-section element and a crafted fragment are ignored
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. Pure modules with no entry; T20 wires them.
- Scripts add no class and no inline style (base-components ADR-0003).
- The browser does the arrival; the script only moves focus (ADR-0001).
