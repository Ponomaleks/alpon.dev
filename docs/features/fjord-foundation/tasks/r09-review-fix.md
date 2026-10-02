---
id: R9
title: "Make missing visual baselines fail CI and add a manual baseline workflow"
layer: "wiring"
deps: []
acs: ["AC-01", "AC-07"]
files_hint: ["tests/visual/not-found.spec.ts", ".github/workflows/ci.yml", ".github/workflows/visual-baselines.yml"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R9 — Make missing visual baselines fail CI and add a manual baseline workflow

## Why

Review follow-up F-01 ([review-2026-10-02](../_review/review-2026-10-02.md)).

## Definition of Done

- [ ] In CI a missing Linux baseline fails the visual test instead of skipping (only an explicit write mode proceeds without one); a workflow_dispatch workflow builds the site, runs the visual suite in the official Playwright Docker image with --update-snapshots and uploads the PNGs as an artifact; the CI baseline step with continue-on-error is removed. Baselines themselves are committed by the Owner after reviewing them.
- [ ] `npm run lint` and `npm run test:unit` green
