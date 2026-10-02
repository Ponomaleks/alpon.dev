---
id: R16
title: "Make the no-global bootstrap test see top-level let bindings"
layer: "tests"
deps: []
acs: ["AC-02"]
files_hint: ["src/scripts/theme-bootstrap.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R16 — Make the no-global bootstrap test see top-level let bindings

## Why

Review follow-up S2-03 ([review-2026-10-02-2](../_review/review-2026-10-02-2.md)).

## Definition of Done

- [ ] theme-bootstrap.test.ts runs the snippet in a vm.createContext context and asserts typeof t is undefined there (or runs it twice in one context without error); an unwrapped `let t` variant fails the test.
- [ ] `npm run lint` and `npm run test:unit` green
