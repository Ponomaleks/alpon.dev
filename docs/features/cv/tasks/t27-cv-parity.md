---
id: T27
title: "Switch on the CV parity items with their reworded behaviour"
layer: "tests"
deps: ["T20", "T21", "T22"]
acs: ["AC-28"]
files_hint: ["tests/e2e/parity.spec.ts", "docs/stub-parity.md"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T27 — Switch on the CV parity items with their reworded behaviour

## Why

AC-28 ([spec §5](../spec.md)); spec §1.4 (the wording of each item and what answers it); `CLAUDE.md` Workflow, Parity gate.

## What

- `docs/stub-parity.md`: reword P-30 (two links), P-31 (hand-off, no `replaceState` clause), P-32 (the CV page replaces the viewer), P-33 (page images at every width), P-34 (download in the selected CV language, page images open the file in a new tab, the meta line), P-51; extend P-15.
- `tests/e2e/parity.spec.ts`: flip the six items from `test.fixme` to `test` with the reworded checks; extend P-15.

## Definition of Done

- [ ] `tests/e2e/parity.spec.ts`: 0 `test.fixme`; P-30 to P-34 and P-51 pass; P-15 passes for the three page addresses and the four page images; P-10 passes with no change to its body
- [ ] The parity ids in the spec file equal the ids in `docs/stub-parity.md`, and both equal the set at the start of the feature
- [ ] `npm run test` green

## Notes

- Phase 5a. KPI of spec §7: open parity items go from 6 to 0.
- Lane with T2 on both files.
- Parity items are reworded, never deleted.
