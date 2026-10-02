---
id: R2
title: "Prove with a real rebuild that editing the bootstrap updates the delivered policy"
layer: "tests"
deps: ["R1"]
acs: ["AC-12"]
files_hint: ["src/integrations/csp.build.test.ts", "scripts/test-utils/build-site.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R2 — Prove with a real rebuild that editing the bootstrap updates the delivered policy

## Why

Review follow-up F-03 ([review-2026-10-02](../_review/review-2026-10-02.md)).

## Definition of Done

- [ ] A Vitest integration test copies the site sources into a temp root, changes one character of the bootstrap, runs astro build there, and asserts the new sha256 is in dist/_headers and the old one is not; no edits outside the temp root.
- [ ] `npm run lint` and `npm run test:unit` green
