---
id: T6
title: "Write the Norwegian CV data from the current Norwegian CV PDF"
layer: "domain"
deps: ["T1", "T4"]
acs: ["AC-02", "AC-03", "AC-26"]
files_hint: ["src/data/cv/no.ts", "src/data/cv/no.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T6 — Write the Norwegian CV data from the current Norwegian CV PDF

## Why

AC-02, AC-03, AC-26 ([spec §5](../spec.md)); spec §1.3 D-06, D-10; [screens SCR-06 and C-3, C-4](../screens.md).

## What

- `src/data/cv/no.ts`: content and page labels of the Norwegian CV page, written from `data.js` (`cv.no`) with every decision of T1 applied, so the section set follows the current Norwegian CV PDF.
- Labels: "Last ned PDF", "Ta kontakt", "Skriv ut", "På denne siden", "Se original-PDF", "Sist oppdatert", "PDF · 2 sider · A4", "Kopier" and "Kopiert", the group name "CV-språk", and the wordings of screens C-3.

## Definition of Done

- [ ] `src/data/cv/no.test.ts`: the section ids are a subset of `sections.ts` in its order; the labels above are present; levels "Øvre mellomnivå", "Mellomnivå", "Morsmål"; no `[…]` placeholder; no CEFR code
- [ ] Same file: title and description are not empty and differ from the English ones
- [ ] Every text that differs from `data.js` has its row in `owner-inputs.md`
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. Blocked until the Owner has decided every row of T1.
- The wordings proposed in screens C-3 that the Owner has not seen stay Claims rows until ticked.
