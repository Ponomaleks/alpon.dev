---
id: T34
title: "Write the pull request body with the Claims list and close the documents"
layer: "docs"
deps: ["T33"]
acs: ["AC-11", "AC-24", "AC-26"]
files_hint: ["docs/features/cv/pr-body.md", "docs/features/cv/owner-inputs.md", "docs/design-system.md"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T34 — Write the pull request body with the Claims list and close the documents

## Why

AC-26, AC-24, AC-11 ([spec §5](../spec.md)); spec §6 rows Design match and Print; [sad §11](../sad.md) (manual checks recorded in the PR); `CLAUDE.md` Workflow (PR description).

## What

- `docs/features/cv/pr-body.md`: the sections `CLAUDE.md` Workflow asks for, the Design match table against `design/screenshots/{dag,natt}_cv.png` and the standalone design at 390 and 834, the two lists of T1 with decisions, the Claims list, the manual-check records.
- `docs/design-system.md`: register BackToTop and PrintContactLine.
- `owner-inputs.md`: the final Claims rows (the print contact line, the titles and descriptions as built).

## Definition of Done

- [ ] `pr-body.md` has every section above; the Design match table lists 0 differences outside D-01 to D-10, or each extra one with the Owner's decision
- [ ] Every Claims row is ticked by the Owner; no CV page text is without a row in the lists of T1
- [ ] The manual print from Dag and Natt in two browsers and the page-image request check in Firefox and Safari are recorded with the browser versions
- [ ] The full gate is green in one run: `npm run lint && npm run test:unit && npm run build && npm run check:budgets && npm run check:placeholders && npm run check:contact:built && npm run test && npm run lhci`

## Notes

- Phase 5b, last task. The pull request is the draft opened in T33: its description is set from `pr-body.md`, and after this task it is marked ready for review (Owner, 2026-10-09); pushing follows the gate in the same command chain.
- The manual checks are the Owner's; `implement` prepares the table and stops for them.
- After the merge: run `/sdd:survey` (sad §11, stale architecture map).
