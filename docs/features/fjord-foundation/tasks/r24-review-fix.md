---
id: R24
title: "Upload the Lighthouse reports and move upload-artifact to Node 24"
layer: "wiring"
deps: ["R21"]
acs: []
files_hint: [".github/workflows/ci.yml", ".github/workflows/visual-baselines.yml"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "review"
---

# R24 — Upload the Lighthouse reports and move upload-artifact to Node 24

## Why

Owner follow-up on CI run 37122773367 (2026-10-03). The `check` job warned "No files were found with the provided path: .lighthouseci/" and "Node.js 20 is deprecated … actions/upload-artifact@v4".

- Lighthouse CI itself ran and asserted: "Running Lighthouse 3 time(s)" on `/` and `/404`, "Checking assertions against 2 URL(s), 6 total run(s)", "All results processed!", "Dumping 6 reports to disk at …/.lighthouseci". Only the upload was lost: since upload-artifact v4.4 `include-hidden-files` defaults to `false`, and every file under the dot directory `.lighthouseci/` counts as hidden.
- `actions/upload-artifact` v4 and v5 declare `runs.using: node20`; v6 and v7 declare `node24`. `actions/checkout@v5` and `actions/setup-node@v5` already declare `node24`.

## Definition of Done

- [x] The Lighthouse upload sets `include-hidden-files: true` and `if-no-files-found: error`; every `actions/upload-artifact` use is `@v7` (v7 changes: ESM internals and an opt-in `archive: false`; the default stays a zipped artifact, so `gh run download -n <name>` is unchanged).
- [ ] The next CI run shows the `lighthouse` artifact and no Node.js 20 deprecation warning (run ID recorded).
- [x] `npm run lint` and `npm run test:unit` green
