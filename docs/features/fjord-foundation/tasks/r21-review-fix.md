---
id: R21
title: "Fix baseline-run concurrency, document the label and download, then run CI and the label flow"
layer: "wiring"
deps: ["R20", "R22"]
acs: ["AC-01", "AC-05", "AC-07"]
files_hint: [".github/workflows/visual-baselines.yml", "README.md", "docs/features/fjord-foundation/tasks/t16-ci-lighthouse-protection.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R21 — Fix baseline-run concurrency, document the label and download, then run CI and the label flow

## Why

Review follow-up S1-06, S1-07, S1-08 ([review-2026-10-02-3](../_review/review-2026-10-02-3.md)).

## Definition of Done

- [x] visual-baselines.yml sets concurrency on the baselines job, not the workflow; the README and T16 include `gh label create visual-baselines` and `gh run download <id> -n visual-baselines-linux -D tests/visual/__screenshots__/linux`; the Owner pushes the branch, `check` is green (run ID recorded), the label flow produces the baselines, they are committed, and `visual` is green (run ID recorded).
- [x] `npm run lint` and `npm run test:unit` green

## Notes

- Done in code: `concurrency` moved into the `baselines` job; the README and T16 carry `gh label create visual-baselines` and the `gh run download … -D tests/visual/__screenshots__/linux` command.
- `check` green before the baselines: CI run 37073211071 on `6b39d0d` (job `check` success; `visual` failed only because no baselines existed yet).

## Verification (2026-10-03)

- Visual baselines run 37122263716 (job 111200555446, `baselines`) on `6b39d0d`, triggered by `labeled visual-baselines` at 12:15:08Z: success, attempt 1.
- Baselines committed by the Owner in `7653cee`: 6 PNGs under `tests/visual/__screenshots__/linux/not-found.spec.ts/` (Dag and Natt at 390 / 834 / 1440). Label removed at 12:24:52Z.
- CI run 37122773367 on `7653cee`: job `check` 111202017550 success, job `visual` 111202017411 success (no `continue-on-error`). The IDs 37122773367 / 37122773383 given at first are run IDs, but 37122773383 is the second Visual baselines run on the same push (the label was still on), not the `visual` job.
- S1-08 (job-level concurrency): the label run completed without being cancelled, but no other label was added while it ran, so the scenario S1-08 describes was not exercised. The fix is in config; it is not verified by a run.
