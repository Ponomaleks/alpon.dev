---
id: T5
title: "Write the English CV data from the text the Owner confirmed"
layer: "domain"
deps: ["T1", "T4"]
acs: ["AC-01", "AC-03", "AC-26"]
files_hint: ["src/data/cv/en.ts", "src/data/cv/en.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T5 — Write the English CV data from the text the Owner confirmed

## Why

AC-01, AC-03, AC-26 ([spec §5](../spec.md)); [screens SCR-05, Content](../screens.md); the Owner's decisions in `docs/features/cv/owner-inputs.md` (T1).

## What

- `src/data/cv/en.ts`: content and page labels of the English CV page, typed by `types.ts`, written from `data.js` (`cv.en`) with every decision of T1 applied; the title and description of the page.
- Contact facts are not copied here; the page reads `src/data/contact.ts`.

## Definition of Done

- [ ] `src/data/cv/en.test.ts`: section ids and order; levels "Upper-intermediate", "Intermediate", "Native"; no `[…]` placeholder; no CEFR code; title and description are not empty
- [ ] Same file: the location line names the town of the Residence from `contact.ts`
- [ ] Every text that differs from `data.js` has its row in `owner-inputs.md`
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. Blocked until the Owner has decided every row of T1.
- The text of the CV PDF is cleared for publication and is repeated as it is; the client and its events are never named (spec §1 Non-disclosure).
- Dashes follow the CV copy (`CLAUDE.md` Content rules).
