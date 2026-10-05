---
id: T21
title: "Verify the Contact block and head meta end to end and turn on P-20 to P-24"
layer: "tests"
deps: ["T15"]
acs: ["AC-13", "AC-14", "AC-15", "AC-16", "AC-17", "AC-26", "AC-35"]
files_hint: ["tests/e2e/contact.spec.ts", "tests/e2e/parity.spec.ts", "docs/stub-parity.md"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T21 — Verify the Contact block and head meta end to end and turn on P-20 to P-24

## Why

AC-13 to AC-17, AC-26, AC-35 ([spec §5](../spec.md)); [sad §6 Reach the contact place, Copy the email address](../sad.md); `docs/stub-parity.md` P-20 to P-24.

## What

- `tests/e2e/contact.spec.ts`: the Contact block rows and links, copy success with granted clipboard permission, copy refusal with the clipboard write rejected, "Save contact" download, the QR tile from 1024 in both themes and its absence below.
- `tests/e2e/parity.spec.ts`: P-20 to P-24 change from `test.fixme` to real tests; `docs/stub-parity.md` marks them done.

## Definition of Done

- [ ] `tests/e2e/contact.spec.ts`: rows and links (AC-13), copy success (AC-14), copy refusal (AC-15), download content (AC-16), QR tile (AC-17)
- [ ] `tests/e2e/parity.spec.ts`: P-20, P-21, P-22, P-23, P-24 are `test`, not `test.fixme`, and pass; P-24 checks title, description, canonical, og tags, Twitter card and the Person fields
- [ ] `docs/stub-parity.md`: the five rows updated
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- P-21 keeps "Oslo, Norge" in the Contact block (D-03).
- Lane: `parity.spec.ts` and `docs/stub-parity.md` with T23. Shared with step 5: lane rule of spec §1.
