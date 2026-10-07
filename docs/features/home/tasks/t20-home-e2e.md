---
id: T20
title: "Verify the first phone screen, the sections, touch targets and the scripts-off page end to end"
layer: "tests"
deps: ["T15"]
acs: ["AC-01", "AC-02", "AC-03", "AC-04", "AC-05", "AC-07", "AC-08", "AC-11", "AC-32"]
files_hint: ["tests/e2e/home.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T20 — Verify the first phone screen, the sections, touch targets and the scripts-off page end to end

## Why

AC-01 to AC-05, AC-07, AC-08, AC-11, AC-32 ([spec §5](../spec.md)); spec §6 "First screen on a phone", "Touch targets"; [sad §6 First view and key facts, Sections below the hero](../sad.md).

## What

- `tests/e2e/home.spec.ts`, with reduced motion emulated by default and a `javaScriptEnabled: false` context for AC-32.

## Definition of Done

- [ ] First screen at 390 × 844, Dag and Natt (AC-01)
- [ ] Portrait position at 834 and 1440, image role and name, no layout shift (AC-02)
- [ ] Now line without brackets (AC-03); no projects entry points (AC-04, AC-11)
- [ ] Key facts, About, experience by pointer and keyboard (AC-05, AC-07, AC-08)
- [ ] Touch targets ≥ 44 × 44 at 390 for the page content
- [ ] Scripts off: everything readable and usable, no script-only control shown (AC-32)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- Runs on the desktop and mobile projects as the existing specs do.
- A failure that passes on rerun is recorded in `docs/backlog.md` with its output before any push.
