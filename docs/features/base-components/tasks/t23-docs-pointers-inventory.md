---
id: T23
title: "Close the cross-document pointers and register the built components"
layer: "docs"
deps: ["T14", "T18", "T19", "T20", "T21", "T22"]
acs: ["AC-17", "AC-18", "AC-21"]
files_hint: ["docs/features/fjord-foundation/spec.md", "docs/backlog.md", "docs/design-system.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T23 — Close the cross-document pointers and register the built components

## Why

[spec §1 Traceability and §7 KPIs](../spec.md); [screens.md §New components](../screens.md); `CLAUDE.md` Review policy (each fact lives in one doc).

## What

- fjord-foundation `spec.md`: pointers only, no copied wording; OQ-02 closed with a reference to base-components AC-17, AC-07 and the Design match row.
- `docs/backlog.md`: B-01 marked done with the commit of T15.
- `docs/design-system.md`: register the built components with their files; `SkipLink` moves from pending to registered; retire the two page-local rows.

## Definition of Done

- [ ] `grep` finds no AC-07 / AC-08 wording left in the fjord-foundation spec besides the pointer
- [ ] Every "new" row of spec §1.1 has a matching row in `docs/design-system.md` whose file exists
- [ ] B-01 is done; no fact is copied between docs (IDs only)
- [ ] `npm run lint` green (Prettier over the docs)

## Notes

- `CLAUDE.md` already carries the three rule clarifications of spec §1; nothing to add there.
- OQ-02 is closed only if T15, T20 and T21 are done and the Design match review found 0 unlisted differences; otherwise leave it open and say why.
- Historical records (task results, past review rounds) are not edited.
