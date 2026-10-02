---
id: R12
title: "Produce the visual baselines from a labelled PR and document the local Docker fallback"
layer: "wiring"
deps: []
acs: ["AC-01", "AC-07"]
files_hint: [".github/workflows/visual-baselines.yml", "README.md", "tests/visual/__screenshots__/linux/"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R12 — Produce the visual baselines from a labelled PR and document the local Docker fallback

## Why

Review follow-up S1-01, S2-01 ([review-2026-10-02-2](../_review/review-2026-10-02-2.md)).

## Definition of Done

- [ ] visual-baselines.yml also runs on pull_request types [labeled, synchronize], only when the PR has the `visual-baselines` label; it builds, writes the baselines in the official Playwright image and uploads the PNGs as an artifact. The README documents the equivalent local docker run command (FJORD_VISUAL=write) as a fallback, not the main path. After the Owner reviews and commits the 6 PNGs under tests/visual/__screenshots__/linux/ and removes the label, the CI visual job is green without continue-on-error and T15 moves to done.
- [ ] `npm run lint` and `npm run test:unit` green
