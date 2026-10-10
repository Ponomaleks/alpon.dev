---
id: T19
title: "Teach the budget check that the three CV addresses are one page"
layer: "tests"
deps: []
acs: ["AC-23"]
files_hint: ["scripts/check-budgets.ts", "scripts/check-budgets.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T19 — Teach the budget check that the three CV addresses are one page

## Why

AC-23 ([spec §5](../spec.md)); [sad §8 Script budgets](../sad.md); [sad §11, the budget row](../sad.md); spec §6 Initial JS.

## What

- `scripts/check-budgets.ts`: page groups; `/cv`, `/cv/en` and `/cv/no` are one group. A file counts as a page's own when only pages of one group load it.

## Definition of Done

- [ ] `scripts/check-budgets.test.ts`: a file loaded by the three CV files is the CV page's own; a file loaded by home and a CV page is Shell; the limits 50 / 10 / 10 / 5 KB gzip are reported per group
- [ ] `npm run build && npm run check:budgets` green on the current site
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. A limit is reported, never bent: a number above its budget goes to the Owner.
