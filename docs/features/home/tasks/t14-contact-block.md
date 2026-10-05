---
id: T14
title: "Build the Contact block with the copy-email action, Save contact, the mail-link sentence and the QR tile"
layer: "ui"
deps: ["T1", "T3"]
acs: ["AC-13", "AC-14", "AC-15", "AC-16", "AC-17"]
files_hint: ["src/components/home/ContactBlock.astro", "src/components/brand/QrTile.astro", "src/components/home/contact-block.test.ts", "src/scripts/home/copy-email.ts", "src/scripts/home/copy-email.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T14 — Build the Contact block with the copy-email action, Save contact, the mail-link sentence and the QR tile

## Why

AC-13 to AC-17 ([spec §5](../spec.md)); spec §1.2 IS-03, §1.3 D-03, D-09; [sad §6 Copy the email address, §8 Copy email, Contact place](../sad.md); [screens.md SCR-01 contact, qr, copy states, wireframe H-3, T-6](../screens.md).

## What

- Builds SCR-01 states: contact, mail-link sentence, qr shown / hidden, copy offered / success / refused / not offered.
- Reuses: `ui/SectionHeader`, `ui/Link`, `ui/Button` (secondary, `download`), `ui/Icon` (`copy`), the Toast through `fjord:toast`, the `data-needs-script` gate; data only from `contact.ts`.
- `home/ContactBlock.astro`: the five rows (Email, Phone, LinkedIn, GitHub, Based in "Oslo, Norge" with `lang="no"`), "Copy" at the end of the email row, "Save contact (.vcf)", and the sentence "Hiring? A short email about the role is the quickest way to reach me." with "a short email" as the mail link.
- `brand/QrTile.astro`: the two static files `public/qr/qr-vcard-{dag,natt}.svg`, one shown per `data-theme`, caption "Skann meg" (`lang="no"`), a text alternative and the camera hint; displayed from 1024 only.
- `src/scripts/home/copy-email.ts`: exported `initCopyEmail()`; Clipboard API write, then `fjord:toast` with "Kopiert" (`lang: "no"`), the address as meta and the check icon; on refusal or a missing API the English Toast "Couldn't copy. Select the address to copy it." without an icon.

## Definition of Done

- [ ] `src/scripts/home/copy-email.test.ts`: success, rejection, no clipboard API
- [ ] `src/components/home/contact-block.test.ts`: rows, links, `lang`, gate, download, sentence, QR tile
- [ ] No primary button in the block; every target at least 44 × 44 in the styles
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- The QR files are static and are not regenerated; no QR library (`CLAUDE.md`).
- The section wrapper with `id="contact"`, `tabindex="-1"` and `scroll-margin-top` is placed by T15.
