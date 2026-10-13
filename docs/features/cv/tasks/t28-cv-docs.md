---
id: T28
title: "Record the CV update rule and bring the documents in step with phase 5a"
layer: "docs"
deps: ["T23", "T25", "T26", "T27"]
acs: ["AC-25", "AC-26"]
files_hint: ["CLAUDE.md", "README.md", "CONTEXT.md", "docs/roadmap.md", "docs/design-system.md", "docs/backlog.md", "docs/features/cv/owner-inputs.md"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T28 — Record the CV update rule and bring the documents in step with phase 5a

## Why

AC-25, AC-26 ([spec §5](../spec.md)); spec §1.1 rows `CLAUDE.md`, `README.md`, `docs/roadmap.md`, `CONTEXT.md`; [sad §5](../sad.md) (project structure); [screens §New components](../screens.md).

## What

- `CLAUDE.md` and `README.md`: the rule of AC-25 in its order (page, page images, CV date, checksum, Claims rows); `CLAUDE.md` Project structure gains `components/cv/`, `data/cv/`, `scripts/cv/`, `scripts/shared/`; the README route table.
- `CONTEXT.md`: check the six terms of spec §1.1 and add what is missing. `docs/roadmap.md`: the step 5 row, its zone, the two "Decisions so far" lines.
- `docs/design-system.md`: move Breadcrumbs, SkillGroup and LanguageList to "Built in the repo"; register LangSwitch, CvJob, DatedRows, ContentsList and OriginalPdfPreview; the ghost variant and the new icons.
- `docs/backlog.md`: close B-35. `owner-inputs.md`: complete the Claims rows.

## Definition of Done

- [ ] `CLAUDE.md` and `README.md` hold the rule with the "exists twice" note; the README lists `/cv`, `/cv/en`, `/cv/no`
- [ ] Every number and date rendered on `dist/cv/en.html` and `dist/cv/no.html` has a Claims row with the CV PDF and its page; the page count, the CV date, both titles and descriptions and the C-3 wordings have rows
- [ ] `docs/design-system.md` has a row with a path for every component phase 5a built
- [ ] `npm run lint` green (Prettier covers the documents)

## Notes

- Phase 5a, last task. No pull request is opened here: the one pull request is opened as a draft in T33 and marked ready for review after T34 (Owner, 2026-10-09).
- Historical records are not edited (`CLAUDE.md` Review policy).
