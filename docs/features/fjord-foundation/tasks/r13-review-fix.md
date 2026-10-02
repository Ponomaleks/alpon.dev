---
id: R13
title: "Require both check and visual, and record the branch-protection commands"
layer: "wiring"
deps: ["R12"]
acs: ["AC-01", "AC-07"]
files_hint: ["docs/features/fjord-foundation/tasks/t16-ci-lighthouse-protection.md", ".github/workflows/ci.yml"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R13 — Require both check and visual, and record the branch-protection commands

## Why

Review follow-up S1-02 ([review-2026-10-02-2](../_review/review-2026-10-02-2.md)).

## Definition of Done

- [ ] T16 records the exact gh api commands: v2 requires check and visual now; main either now with enforce_admins false (a stub hotfix stays possible before Release 1) or as part of the Release 1 step, the Owner picks. ci.yml carries a comment that check and visual must have no path filters or job-level conditions on PRs into v2/main (a required check that never reports blocks the merge forever). The commands go into the PR; the Owner runs them.
- [ ] `npm run lint` and `npm run test:unit` green
