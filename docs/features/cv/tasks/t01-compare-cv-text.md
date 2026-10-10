---
id: T1
title: "Compare the design's CV text with the two CV PDFs and list the differences for the Owner"
layer: "docs"
deps: []
acs: ["AC-26"]
files_hint: ["docs/features/cv/owner-inputs.md"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T1 — Compare the design's CV text with the two CV PDFs and list the differences for the Owner

## Why

AC-26 ([spec §5](../spec.md)); [spec §1 Content source and the home-data rule](../spec.md); spec §1.3 D-06.

## What

- Read `design/handoff/site/project/site/data.js` (`cv.en`, `cv.no`) and the two files in `public/cv/` line by line. No text is extracted in the build (spec §3); this is a reading task.
- Write `docs/features/cv/owner-inputs.md` with three tables: (1) design text against the CV PDF, per CV language and section: the design's wording, the file's wording with its page, the proposed page wording, the Owner's decision; (2) facts that `src/data/home.ts` and a CV page state differently, with both wordings and sources; (3) the first Claims rows: every number and date of the CV, the page count, the CV date, the proposed title and description of each CV page, and the Norwegian wordings of [screens C-3](../screens.md).
- Stop and bring the lists to the Owner. Nothing under `src/` changes in this task.

## Definition of Done

- [ ] `docs/features/cv/owner-inputs.md` has the three tables; every section of both CV PDFs has a row or the line "no difference"
- [ ] Every row of table 1 has the Owner's decision before T5 or T6 starts
- [ ] `git diff --stat` shows no change under `src/` or `public/`
- [ ] `npx prettier --check docs/features/cv/owner-inputs.md` green

## Notes

- Phase 5a. `implement` stops after this task and waits for the Owner; T5 and T6 are blocked until the decisions are in.
- The Norwegian page follows the current Norwegian CV PDF, not the design's Norwegian copy (D-06).
- The home page data is only reported, never edited (spec §1).
- The client of the consulting employer is described as the CV PDF describes it and is never named (`CLAUDE.md` Content rules).
