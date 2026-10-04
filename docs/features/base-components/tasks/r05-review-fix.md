---
id: R5
title: "Compare the Work region with the vCard ADR locality in the contact check"
layer: "domain"
deps: []
acs: ["AC-15"]
files_hint: ["scripts/check-contact.ts", "scripts/check-contact.test.ts", "docs/features/base-components/sad.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R5 — Compare the Work region with the vCard ADR locality in the contact check

## Why

Review round 1 ([review-2026-10-04](../_review/review-2026-10-04.md)), S1-02. `checkContact` compares email, phone, LinkedIn and GitHub only. `workRegion` is a contact fact shown in the menu, but the card's `ADR` line is never read, so a changed region passes `npm run lint` while the card keeps the old one.

## Definition of Done

- [ ] The check compares the locality part of `workRegion` ("Oslo") with the `ADR` locality in `public/alexander-ponomarenko.vcf` and names the field `workRegion` on mismatch.
- [ ] `scripts/check-contact.test.ts` has a failing-case row for the region.
- [ ] sad §8 notes that the QR vCard has no `ADR` line, so the region check covers the `.vcf` only.
- [ ] `npm run lint` and `npm run test:unit` green
