---
id: T2
title: "Extend the token-only allow lists for the Shell styles, one recorded entry per form"
layer: "wiring"
deps: ["T1"]
acs: ["AC-26"]
files_hint: ["stylelint.config.js", "scripts/lint/", "docs/features/fjord-foundation/adr/0003-enforce-token-only-styles-with-stylelint-built-in-rules.md"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T2 — Extend the token-only allow lists for the Shell styles, one recorded entry per form

## Why

AC-26 ([spec §5](../spec.md)); [spec §1 Traceability, Owner notes on the allow list](../spec.md); [fjord-foundation ADR-0003](../../fjord-foundation/adr/0003-enforce-token-only-styles-with-stylelint-built-in-rules.md); [sad §8 Token-only styles](../sad.md).

## What

- Audit what the Shell needs before adding anything: read the component styles of the site copy (`design/handoff/site/project/_ds/…/components/**/*.css`) and `site/site.css`, and list every function, unit and media form outside today's lists (sad §2).
- Add only what a token cannot cover. `color-mix()` enters with `var()` arguments only. `ch` stays rejected while a measure token covers the need. Each other candidate (for example the reduced-motion media feature, a safe-area inset, `@supports`) gets its own row or an explicit "not needed".
- One row per entry in fjord-foundation ADR-0003: the form, the reason, what it must still reject. Fixtures live in `scripts/lint/fixtures/`.

## Definition of Done

- [ ] `scripts/lint/stylelint.test.ts`: an accepting and a rejecting fixture per new entry; findings carry file and line
- [ ] Same test: `color-mix()` with a literal colour fails; a raw number inside an allowed function fails; `ch` fails; an unknown `--fjord-*` token fails
- [ ] fjord-foundation ADR-0003 lists every new entry with reason and rejection
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- A later task that finds a missing entry adds it here-style (row + two fixtures) in its own commit; it never loosens a rule without a row.
