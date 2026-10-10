---
id: T4
title: "Add the CV data skeleton and the CV PDF checksum check to the lint gate"
layer: "domain"
deps: []
acs: ["AC-05", "AC-25"]
files_hint: ["src/data/cv/types.ts", "src/data/cv/sections.ts", "src/data/cv/index.ts", "src/data/cv/index.test.ts", "scripts/check-cv-pdf.ts", "scripts/check-cv-pdf.test.ts", "package.json"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T4 — Add the CV data skeleton and the CV PDF checksum check to the lint gate

## Why

AC-25, AC-05 ([spec §5](../spec.md)); [sad §4 item 3](../sad.md); [sad §8 Checksum gate](../sad.md); [sad §10 QG-1](../sad.md); [ADR-0001](../adr/0001-carry-the-section-across-the-language-switch-as-a-shared-fragment-id.md) for the section ids.

## What

- `src/data/cv/types.ts`: the types of sad §5 (`Cv`, `CvSection`, `CvJob`, `ClientProject`, `DatedRow`, `SkillGroup`, labels).
- `src/data/cv/sections.ts`: the eight shared section ids of sad §5, in order.
- `src/data/cv/index.ts`: `cvDate`, and `cvPdf { en, no }` with href, download name (AC-05), sha256 and the two page images with their width and height.
- `scripts/check-cv-pdf.ts`: hashes the two files with `node:crypto`, compares with the CV data, extracts no text. `package.json`: `check:cv`, called in `lint` before `astro check`.

## Definition of Done

- [ ] `scripts/check-cv-pdf.test.ts`: green on the recorded files; red on 2 of 2 changed fixture files; the message names the file and the CV page
- [ ] `src/data/cv/index.test.ts`: download names are `Alexander_Ponomarenko_CV_EN.pdf` and `Alexander_Ponomarenko_CV_NO.pdf`; the section ids are the eight of sad §5 in order; every page image file exists in `public/cv/`
- [ ] `package.json` diff: one new script, `lint` calls it, 0 new dependencies
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a.
- The CV date starts as 2026-09-30, the date of the two files; the Owner confirms it in the Claims list (T28).
- The check reads the path from the CV data and takes the directory as an argument, so the unit test runs it against fixture files.
