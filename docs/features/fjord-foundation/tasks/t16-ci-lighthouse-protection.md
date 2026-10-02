---
id: T16
title: "Run Lighthouse on both pages with the Roboto-only runner and protect v2 and main"
layer: "wiring"
deps: ["T9", "T10"]
acs: ["AC-05", "AC-06"]
files_hint: [".github/workflows/ci.yml", "lighthouserc.cjs"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T16 — Run Lighthouse on both pages with the Roboto-only runner and protect v2 and main

## Why

NFR rows CLS / LCP / TBT / Lighthouse ([spec §6](../spec.md)); [sad §7 What gates what, §11 risks](../sad.md).

## What

- `ci.yml`: install `fonts-roboto`, assert no Arial (`fc-list`), before Playwright and Lighthouse.
- `lighthouserc.cjs`: confirm both `/` and `/404.html` are collected (the existing matrix already relaxes SEO on 404).
- Branch protection: propose the exact `gh api` command (required check `check`, no direct pushes to `main`, also on `v2`); the Owner runs or approves it — it is an outward-facing repository setting.
- Record the Lighthouse baseline of the unstyled skeleton and the final scores in the PR ([spec §7](../spec.md)).

## Definition of Done

- [ ] CI log shows Roboto installed and no Arial
- [ ] `npm run lhci` green: Performance, Accessibility, Best Practices, SEO ≥ 95 (SEO off on 404), LCP ≤ 2.0 s, CLS ≤ 0.02, TBT ≤ 100 ms
- [ ] Branch protection active on `v2` and `main` (verified with `gh api repos/:owner/:repo/branches/<b>/protection`)

## Notes

- Never apply the branch protection without the Owner's explicit confirmation in chat.
