---
id: T1
title: "Add the Work region coordinates to contact.ts and build the structured Person data from it"
layer: "domain"
deps: []
acs: ["AC-26", "AC-27"]
files_hint: ["src/data/contact.ts", "src/data/person.ts", "src/data/person.test.ts", "scripts/check-contact.ts", "scripts/check-contact.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# T1 — Add the Work region coordinates to contact.ts and build the structured Person data from it

## Why

AC-26, AC-27 ([spec §5](../spec.md)); [sad §8 Contact data, Structured data](../sad.md).

## What

- `src/data/contact.ts`: add `workRegionGeo` (locality, country code, latitude, longitude) next to `workRegion`; the Residence fields stay as they are.
- `src/data/person.ts`: a pure function that returns the schema.org Person object from `contact.ts` (name, job title "Software Engineer", email, phone, address, `sameAs` LinkedIn and GitHub).
- Source half of `scripts/check-contact.ts`: also compares the new address fields with the `ADR` line of the contact card. The built half is T18.

## Definition of Done

- [ ] `src/data/person.test.ts`: every Person field comes from `contact.ts`; address locality Oslo, country NO; `sameAs` holds both profile addresses
- [ ] `scripts/check-contact.test.ts`: a failing fixture for `workRegionGeo` against the contact card names the field; the repo itself passes
- [ ] The existing readers of `contact.ts` (Footer, MobileMenu, CtaBand) build unchanged
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- `public/alexander-ponomarenko.vcf` and the QR files are not edited (spec §1 Traceability).
- The hero coordinates are the Work region ones (59.91, 10.75); the footer keeps the Residence coordinates.
- Shared file with step 5 (`contact.ts`): lane rule of spec §1.
