---
id: T3
title: "Add src/data/contact.ts and the contact check against the vCard and the last-updated date"
layer: "domain"
deps: []
acs: ["AC-15", "AC-16"]
files_hint: ["src/data/contact.ts", "scripts/check-contact.ts", "scripts/check-contact.test.ts", "package.json"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T3 — Add src/data/contact.ts and the contact check against the vCard and the last-updated date

## Why

AC-15, AC-16 ([spec §5](../spec.md)); [sad §8 Contact data](../sad.md); `CLAUDE.md` Content rules (two locations, vCard title).

## What

- `src/data/contact.ts`: typed constants for email, phone, LinkedIn and GitHub URLs, Work region ("Oslo, Norge"), Residence ("Nittedal, Norge") with coordinates at two decimals (spec §1.3 D-05), `lastUpdated` (ISO date), and the Shell link targets (`/cv`, `/#contact`, the two CV PDFs).
- `scripts/check-contact.ts`: pure comparison functions plus a CLI entry; compares each field with the `.vcf` and validates `lastUpdated` against the day of the run.
- Add `check:contact` to `package.json` and call it from `npm run lint`.

## Definition of Done

- [ ] `scripts/check-contact.test.ts`: pass on the real files; a changed email, phone or URL fails and names the field
- [ ] Same test: `2026-02-30` and a date after the run day fail, each message shows the value and the rule
- [ ] Coordinates in `contact.ts` have at most two decimals (asserted in the test)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Do not touch the `.vcf` or the QR files (`CLAUDE.md`). No dependency on other tasks: can start with T1.
