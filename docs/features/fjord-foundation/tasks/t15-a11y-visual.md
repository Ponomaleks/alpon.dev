---
id: T15
title: "Add axe checks in Dag and Natt and the Not-found visual baselines; capture the Natt references"
layer: "tests"
deps: ["T9"]
acs: ["AC-01", "AC-04", "AC-07"]
files_hint: ["tests/a11y/", "tests/visual/", "playwright.config.ts", "design/screenshots/"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T15 — Add axe checks in Dag and Natt and the Not-found visual baselines; capture the Natt references

## Why

NFR rows "Accessibility", "Visual regression", "Design match" ([spec §6](../spec.md)); [sad §10 supporting scenarios, §11 baseline risk](../sad.md); roadmap D1.

## What

- `tests/a11y/`: extend to both pages × Dag / Natt (seed `fjord-theme`).
- `tests/visual/not-found.spec.ts`: 6 screenshots, `maxDiffPixelRatio: 0.001`; snapshot path template per platform so only Linux baselines are committed; generate them in the official Playwright Docker image (or CI) — never on Windows.
- Capture Natt (and other missing) not-found references from `design/handoff/site/alpon.dev standalone.html` into `design/screenshots/` as new files only.
- Side-by-side screenshots + design-deviation list for the PR.

## Definition of Done

- [x] axe: 0 violations on 4 page × theme combinations
- [x] 6 Linux baselines committed; visual spec green in CI
- [x] New Natt reference files present in `design/screenshots/`; no existing file there changed
- [x] `npm run test` green

## Notes

- `design/` is read-only apart from adding the D1 screenshots the roadmap assigns to this feature.

## Verification (2026-10-03)

- 6 Linux baselines in `7653cee`; CI run 37122773367, job `visual` 111202017411 green; job `check` 111202017550 (Playwright e2e + axe) green.
- Natt references `design/screenshots/natt_not_found_{390,834,1440}.png` present.
