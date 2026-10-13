---
id: T30
title: "Build the printed CV: print styles, the contact line and the Print button"
layer: "ui"
deps: ["T29"]
acs: ["AC-06", "AC-11", "AC-12", "AC-27", "AC-29"]
files_hint: ["src/components/cv/PrintContactLine.astro", "src/components/cv/print.test.ts", "src/components/cv/CvPage.astro", "src/components/cv/CvHead.astro", "src/components/cv/head.test.ts", "src/scripts/cv/print.ts", "src/scripts/cv/print.test.ts", "src/scripts/cv/index.ts", "scripts/check-contact.ts", "scripts/check-contact.test.ts", "tests/e2e/cv-print.spec.ts", "src/pages/styleguide.astro", "src/pages/_styleguide.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "L"
status: "todo"
---

# T30 — Build the printed CV: print styles, the contact line and the Print button

## Why

AC-11, AC-12, AC-27, AC-06, AC-29 ([spec §5](../spec.md)); [ADR-0002](../adr/0002-generate-a-print-block-that-reapplies-the-dag-tokens.md); [sad §8 Print, Script-only controls](../sad.md); [sad §10 QG-3](../sad.md); screens SCR-05 `print offered`, `print not offered`, `print (document)`, `contact line on screen`; SCR-06 `print (document)`; wireframe W-4; SCR-04 section Print contact line; spec §1.3 D-04.

## What

- Reuses: the ghost Button (T7), `ui/Icon` (`file-text`), the `data-needs-script` gate of `base.css`, the Print block (T29); facts from `src/data/contact.ts`.
- NEW `cv/PrintContactLine` (ContactList is a labelled list with actions for the screen): one line of email, phone, LinkedIn and GitHub, in the document only.
- `CvPage.astro`: one `@media print` block in the page's own stylesheet, as sad §8 Print describes it; no `@page` rule.
- `CvHead.astro`: "Print" ("Skriv ut"), ghost, behind `data-needs-script`. `src/scripts/cv/print.ts` and the entry: the button calls the browser's print.
- `scripts/check-contact.ts`: the printed contact line of both CV pages equals `contact.ts`.
- `styleguide.astro`: the section Print contact line, shown as it prints in a framed sample.

## Definition of Done

- [ ] `src/components/cv/print.test.ts`: the line holds the four facts from `contact.ts`; `head.test.ts`: "Print" is ghost, carries `data-needs-script`, and the head still has one primary button
- [ ] `src/scripts/cv/print.test.ts`: activating the button calls `print` once
- [ ] `tests/e2e/cv-print.spec.ts` in print media from Dag and from Natt: header, menu, breadcrumbs, switch, buttons, meta line, preview, side column, bar, closing band and footer are not rendered; the contact line is rendered once
- [ ] Same file: the sheet background is white and the text colour equals the Dag text token from both themes; the theme attribute on screen is unchanged after printing
- [ ] Same file: Playwright's PDF output on A4: no job, project, education or course entry is split across sheets and no section heading is last on a sheet; links to other sites show their address
- [ ] Same file: on screen the contact line is not displayed and not in the accessibility tree; with JavaScript disabled "Print" is not displayed and leaves no gap
- [ ] `scripts/check-contact.test.ts`: a printed line that differs from `contact.ts` fails naming the page
- [ ] `src/pages/_styleguide.test.ts`: the section exists inside `data-sample`
- [ ] Stylelint 0 findings (tokens only)
- [ ] `npm run lint` and `npm run test:unit` green
- [ ] `npm run test` green

## Notes

- Phase 5b. AC-11 and AC-12 are open until this task.
- A separate `<link media="print">` would escape the one-stylesheet merge (sad §2); the block stays in the page's stylesheet.
- The manual print in two browsers is recorded in the PR body (T34).
- Lanes: `CvPage.astro`, `CvHead.astro`, `src/scripts/cv/index.ts`, `scripts/check-contact.ts`, `styleguide.astro`.
