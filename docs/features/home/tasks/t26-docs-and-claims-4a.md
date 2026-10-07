---
id: T26
title: "Close the document pointers, register the built components and draft the pull request with the Claims list"
layer: "docs"
deps: ["T18", "T19", "T20", "T21", "T22", "T23", "T24", "T25"]
acs: ["AC-29"]
files_hint: ["CLAUDE.md", "docs/design-system.md", "docs/backlog.md", "docs/roadmap.md", "docs/features/base-components/spec.md", "docs/features/home/pr-body.md"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "review"
---

# T26 — Close the document pointers, register the built components and draft the pull request with the Claims list

## Why

AC-29 ([spec §5](../spec.md)); spec §1 Traceability and §1.1 rows "CLAUDE.md", "base-components spec", "docs/roadmap.md"; [screens.md New components](../screens.md).

## What

- `CLAUDE.md` Project structure: `components/home/` and `scripts/home/`.
- `docs/features/base-components/spec.md`: one-line pointers to this spec at D-06, AC-03, AC-07, AC-08, AC-20, AC-23, AC-24 and the §6 "Primary buttons" row; no wording of its own is kept on those points.
- `docs/design-system.md`: Portrait, QrTile, ContactList, CopyButton, ExperienceItem / ExperienceList moved to "Built in the repo" with their paths; QuickFacts registered as new.
- `docs/backlog.md`: B-09, B-18 and B-25 closed. `docs/roadmap.md`: the step 4 row and zone.
- `docs/features/home/pr-body.md`: what changed, test results, the design-difference list (IS-01 to IS-03, D-01 to D-14), and the Claims list with one row per number and status and its source, each with a box for the Owner to tick.

## Definition of Done

- [ ] `docs/features/home/pr-body.md`: the Claims list is complete and every row is ticked by the Owner (AC-29); the feature is not done while one is open
- [ ] Pointers present at the eight places of the base-components spec; no copied values
- [ ] `CLAUDE.md`, `docs/design-system.md`, `docs/backlog.md`, `docs/roadmap.md` updated as listed
- [ ] The PR body lists the measured Lighthouse and budget numbers from T19 and the iPhone focus check from T23
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- Stop and ask the Owner to tick the Claims list; do not tick on the Owner's behalf.
- This task closes phase 4a: after it the branch can go to a pull request without phase 4b.
- Historical records (task results, past review rounds) are not edited.
