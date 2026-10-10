---
id: T12
title: "Build the side column: contents list, contact list and the second download"
layer: "ui"
deps: ["T4", "T7"]
acs: ["AC-02", "AC-04"]
files_hint: ["src/components/cv/CvAside.astro", "src/components/cv/aside.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T12 — Build the side column: contents list, contact list and the second download

## Why

AC-04, AC-02 ([spec §5](../spec.md)); screens SCR-05 `side column, 1024 and wider`, `side column, below 1024`, `contents link activated`, `copy offered / success / refused / not offered`; SCR-06 `side column, 1024 and wider`; [screens C-1, C-3](../screens.md); spec §1.3 D-01.

## What

- Reuses: `ui/CopyButton`, `ui/Link`, `ui/Button` (secondary), `ui/Icon` (`file-down`), the ContactList look of `home/ContactBlock`; facts from `src/data/contact.ts`.
- `cv/CvAside` (page section) with NEW ContentsList inside it (TrailNav tracks the section with a script; this is a plain numbered list of links).
- The column is in the HTML at every width and displayed from 1024 (C-1); sticky under the header.

## Definition of Done

- [ ] `src/components/cv/aside.test.ts`: one link per section passed in, numbered, `href` is the shared id
- [ ] Same file: every contact value equals `contact.ts`; "Nittedal, Norge" is marked Norwegian; no `.vcf` link and no QR
- [ ] Same file: "Copy" carries `data-needs-script`; with Norwegian labels the row labels are those of C-3 and the button says "Kopier"
- [ ] Same file: "Download PDF" is secondary, has `download` with the file name of AC-05
- [ ] Stylelint 0 findings (tokens only)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. The copy behaviour is T13; the wiring on the page is T20.
- The download here is never primary (D-01).
