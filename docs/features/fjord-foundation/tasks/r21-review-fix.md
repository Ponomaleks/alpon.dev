---
id: R21
title: "Fix baseline-run concurrency, document the label and download, then run CI and the label flow"
layer: "wiring"
deps: ["R20", "R22"]
acs: ["AC-01", "AC-05", "AC-07"]
files_hint: [".github/workflows/visual-baselines.yml", "README.md", "docs/features/fjord-foundation/tasks/t16-ci-lighthouse-protection.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "in_progress"
---

# R21 — Fix baseline-run concurrency, document the label and download, then run CI and the label flow

## Why

Review follow-up S1-06, S1-07, S1-08 ([review-2026-10-02-3](../_review/review-2026-10-02-3.md)).

## Definition of Done

- [ ] visual-baselines.yml sets concurrency on the baselines job, not the workflow; the README and T16 include `gh label create visual-baselines` and `gh run download <id> -n visual-baselines-linux -D tests/visual/__screenshots__/linux`; the Owner pushes the branch, `check` is green (run ID recorded), the label flow produces the baselines, they are committed, and `visual` is green (run ID recorded).
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Done in code: `concurrency` moved into the `baselines` job; the README and T16 carry `gh label create visual-baselines` and the `gh run download … -D tests/visual/__screenshots__/linux` command.
- Awaiting the Owner: push the branch, record the green `check` run ID, run the label flow, commit the baselines, record the green `visual` run ID. The label run is also the first real check that another label no longer cancels a running baseline job.
