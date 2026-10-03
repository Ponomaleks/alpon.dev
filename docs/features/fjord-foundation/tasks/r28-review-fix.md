---
id: R28
title: "Upload the Lighthouse reports only when Lighthouse ran"
layer: "wiring"
deps: []
acs: []
files_hint: [".github/workflows/ci.yml"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R28 — Upload the Lighthouse reports only when Lighthouse ran

## Why

Review round 4, S2-12. The upload step (`.github/workflows/ci.yml:79`, `:87`) uses `if: always()` with `if-no-files-found: error`. When lint, unit, build or Playwright fails, or the run is cancelled, Lighthouse never runs, `.lighthouseci/` does not exist, and the upload errors with "No files were found", so the log points at the wrong step.

## Definition of Done

- [ ] The Lighthouse CI step has id: lhci and the upload step runs with if: ${{ !cancelled() && steps.lhci.outcome != 'skipped' }}; include-hidden-files and if-no-files-found: error stay. The next green CI run still uploads the `lighthouse` artifact.
- [ ] `npm run lint` and `npm run test:unit` green
