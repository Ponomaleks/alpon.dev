---
id: T16
title: "Build the CV head"
layer: "ui"
deps: ["T4", "T7", "T8", "T11"]
acs: ["AC-01", "AC-02", "AC-05", "AC-06"]
files_hint: ["src/components/cv/CvHead.astro", "src/components/cv/head.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T16 — Build the CV head

## Why

AC-01, AC-02, AC-05, AC-06 ([spec §5](../spec.md)); screens SCR-05 `head`, `head, below 1024`, `head, 1024 and wider`, `meta line`, `download`; SCR-06 `head`; wireframes W-1, W-2; spec §1.3 D-01, D-08, D-10.

## What

- Reuses: `ui/Breadcrumbs`, `ui/LangSwitch` (large), `ui/Button` (primary, secondary), `ui/Icon` (`file-down`), `cv/CvMeta` (T11); `contact.links` for the contact place and the CV pages.
- `cv/CvHead` (page section): the name block and the tools; below 1024 the tools follow the name block, from 1024 they sit at the end side.

## Definition of Done

- [ ] `src/components/cv/head.test.ts`: one `h1` "Alexander Ponomarenko"; breadcrumbs "alpon.dev / CV"; role and location lines from the CV data
- [ ] Same file: exactly one primary button, "Download PDF" ("Last ned PDF"), with `download` and the file name of the CV language
- [ ] Same file: the contact button is "Get in touch" on the English page and "Ta kontakt" on the Norwegian one, secondary, to the contact place
- [ ] Same file: the switch marks the CV language of the page; the meta line is present
- [ ] Stylelint 0 findings (tokens only)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. "Print" is not built here; T30 adds it in phase 5b.
- Lane with T30 on `src/components/cv/CvHead.astro`.
