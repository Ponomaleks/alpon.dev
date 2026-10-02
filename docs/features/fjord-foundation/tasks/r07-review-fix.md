---
id: R7
title: "Keep the Dag warning pair visible as a named known contrast failure"
layer: "tests"
deps: []
acs: ["AC-10"]
files_hint: ["scripts/contrast-pairs.ts", "scripts/check-contrast.ts", "scripts/check-contrast.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R7 — Keep the Dag warning pair visible as a named known contrast failure

## Why

Review follow-up F-02 ([review-2026-10-02](../_review/review-2026-10-02.md)).

## Definition of Done

- [ ] warning on warning-soft and text on warning-soft are in the manifest; the check treats the warning pair as a named known failure (it must fail, by name, or the check errors) and prints pair, theme, ratio and 'known failure, fix before step 7 Callout' on every run; text on warning-soft passes normally; check:contrast and unit green.
- [ ] `npm run lint` and `npm run test:unit` green
