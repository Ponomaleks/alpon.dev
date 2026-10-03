---
id: R11
title: "Remove the stray screenshots and ignore mangled temp paths"
layer: "wiring"
deps: []
acs: []
files_hint: ["UsersUserAppDataLocalTemp/", ".gitignore"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R11 — Remove the stray screenshots and ignore mangled temp paths

## Why

Review follow-up F-07 ([review-2026-10-02](../_review/review-2026-10-02.md)).

## Definition of Done

- [ ] UsersUserAppDataLocalTemp/ is removed from the repo and a .gitignore rule keeps such mangled Windows temp paths out.
- [ ] `npm run lint` and `npm run test:unit` green
