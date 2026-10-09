---
id: T23
title: "Extend the contact check and the placeholder check to the built CV pages"
layer: "tests"
deps: ["T17"]
acs: ["AC-03", "AC-27"]
files_hint: ["scripts/check-contact.ts", "scripts/check-contact.test.ts", "scripts/check-placeholders.ts", "scripts/check-placeholders.test.ts", ".github/workflows/ci.yml"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T23 — Extend the contact check and the placeholder check to the built CV pages

## Why

AC-27, AC-03 ([spec §5](../spec.md)); [sad §10 QG-1](../sad.md); [screens C-1](../screens.md) (the side column is in the HTML at every width).

## What

- `scripts/check-contact.ts --built`: also reads the three CV files; compares the contact list of the side column with `contact.ts`; requires the town of the Residence in the location line.
- `scripts/check-placeholders.ts`: covers the three CV files.
- `.github/workflows/ci.yml`: the name of the built-page step says what it now covers.

## Definition of Done

- [ ] `scripts/check-contact.test.ts`: green on a fixture equal to `contact.ts`; red, naming the page and the fact, for each of the five facts changed; red when the location line lacks the town
- [ ] `scripts/check-placeholders.test.ts`: a `[placeholder]` in a CV fixture fails
- [ ] `npm run build && npm run check:placeholders && npm run check:contact:built` green
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. The printed contact line joins the check in T30.
- Lane with T30 on `scripts/check-contact.ts`; with T33 on `.github/workflows/ci.yml`.
