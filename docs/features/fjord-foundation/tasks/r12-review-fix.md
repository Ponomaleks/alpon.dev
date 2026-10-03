---
id: R12
title: "Produce the visual baselines from a labelled PR and document the local Docker fallback"
layer: "wiring"
deps: []
acs: ["AC-01", "AC-07"]
files_hint: [".github/workflows/visual-baselines.yml", "README.md", "tests/visual/__screenshots__/linux/"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R12 — Produce the visual baselines from a labelled PR and document the local Docker fallback

## Why

Review follow-up S1-01, S2-01 ([review-2026-10-02-2](../_review/review-2026-10-02-2.md)).

## Definition of Done

- [x] visual-baselines.yml also runs on pull_request types [labeled, synchronize], only when the PR has the `visual-baselines` label; it builds, writes the baselines in the official Playwright image and uploads the PNGs as an artifact. The README documents the equivalent local docker run command (FJORD_VISUAL=write) as a fallback, not the main path. After the Owner reviews and commits the 6 PNGs under tests/visual/__screenshots__/linux/ and removes the label, the CI visual job is green without continue-on-error and T15 moves to done.
- [x] `npm run lint` and `npm run test:unit` green

## Verification (2026-10-03)

- Visual baselines run 37122263716 (job 111200555446, `baselines`) on `6b39d0d`, triggered by `labeled visual-baselines` at 12:15:08Z: success, attempt 1.
- Baselines committed by the Owner in `7653cee`: 6 PNGs under `tests/visual/__screenshots__/linux/not-found.spec.ts/` (Dag and Natt at 390 / 834 / 1440). Label removed at 12:24:52Z.
- CI run 37122773367 on `7653cee`: job `check` 111202017550 success, job `visual` 111202017411 success (no `continue-on-error`). The IDs 37122773367 / 37122773383 given at first are run IDs, but 37122773383 is the second Visual baselines run on the same push (the label was still on), not the `visual` job.
