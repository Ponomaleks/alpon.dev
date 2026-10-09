# Tracker — cv

> Status of every task in the epic. `implement` updates `done` as it commits each task.
> States: `todo` · `in_progress` · `blocked` · `review` · `done`.

Estimates: S about a quarter of a day, M about half a day, L up to one day.

The two phases are a work order only: one branch, `feat/cv`, and one pull request, opened as a draft in T33 and marked ready for review after T34 ([_epic.md](./_epic.md), Phases).

## Phase 5a

| # | Task | Layer | Owner | Estimate | Blocked by | Status |
|---|---|---|---|---|---|---|
| T1 | [Compare the design's CV text with the two CV PDFs and list the differences for the Owner](./t01-compare-cv-text.md) | docs | Alexander Ponomarenko | M | — | done |
| T2 | [Serve the three CV addresses as pages and rewrite P-01 to P-03](./t02-cv-addresses-as-pages.md) | wiring | Alexander Ponomarenko | M | — | done |
| T3 | [Point every internal CV link at the canonical CV address through the contact data](./t03-internal-cv-links.md) | domain | Alexander Ponomarenko | S | T2 | done |
| T4 | [Add the CV data skeleton and the CV PDF checksum check to the lint gate](./t04-cv-data-and-checksum.md) | domain | Alexander Ponomarenko | M | — | done |
| T5 | [Write the English CV data from the text the Owner confirmed](./t05-cv-data-en.md) | domain | Alexander Ponomarenko | M | T1, T4 | done |
| T6 | [Write the Norwegian CV data from the current Norwegian CV PDF](./t06-cv-data-no.md) | domain | Alexander Ponomarenko | M | T1, T4 | done |
| T7 | [Add the ghost Button variant and the icons the CV page needs](./t07-button-ghost-and-icons.md) | ui | Alexander Ponomarenko | S | — | done |
| T8 | [Build Breadcrumbs and the LangSwitch as two links](./t08-breadcrumbs-and-lang-switch.md) | ui | Alexander Ponomarenko | M | — | done |
| T9 | [Build CvSection, SkillGroup, LanguageList and DatedRows](./t09-cv-section-parts.md) | ui | Alexander Ponomarenko | M | T4 | done |
| T10 | [Build CvJob and CvProjects](./t10-cv-job-and-projects.md) | ui | Alexander Ponomarenko | M | T4 | done |
| T11 | [Build the Original PDF preview and the meta line](./t11-original-pdf-preview.md) | ui | Alexander Ponomarenko | M | T4, T7 | done |
| T12 | [Build the side column: contents list, contact list and the second download](./t12-cv-aside.md) | ui | Alexander Ponomarenko | M | T4, T7 | done |
| T13 | [Move copy-email to scripts/shared and let it follow the language of the page](./t13-copy-email-shared.md) | app | Alexander Ponomarenko | M | — | done |
| T14 | [Add canonical, alternates and cvLang to BaseLayout and mark the Shell English on a Norwegian page](./t14-layout-cv-options.md) | wiring | Alexander Ponomarenko | M | T3 | done |
| T15 | [Let the Sticky action bar take a language switch and a link with a language](./t15-bar-language-switch.md) | ui | Alexander Ponomarenko | M | T8, T14 | done |
| T16 | [Build the CV head](./t16-cv-head.md) | ui | Alexander Ponomarenko | M | T4, T7, T8, T11 | done |
| T17 | [Compose CvPage, give the three pages their head and list them in the sitemap](./t17-cv-page-composition.md) | wiring | Alexander Ponomarenko | L | T2, T5, T6, T9, T10, T11, T12, T14, T15, T16 | done |
| T18 | [Write the pure modules of the CV page script](./t18-cv-script-modules.md) | app | Alexander Ponomarenko | M | T4 | done |
| T19 | [Teach the budget check that the three CV addresses are one page](./t19-budget-page-groups.md) | tests | Alexander Ponomarenko | S | — | done |
| T20 | [Wire the CV page script and check the language switch and the copy action on the page](./t20-cv-script-entry.md) | app | Alexander Ponomarenko | M | T13, T17, T18, T19 | done |
| T21 | [Hand the Legacy CV addresses over from the home page](./t21-legacy-cv-handoff.md) | app | Alexander Ponomarenko | M | T3 | done |
| T22 | [Give the CV pages, the CV PDFs and the page images their response headers](./t22-cv-response-headers.md) | wiring | Alexander Ponomarenko | S | T2 | done |
| T23 | [Extend the contact check and the placeholder check to the built CV pages](./t23-cv-built-checks.md) | tests | Alexander Ponomarenko | M | T17 | done |
| T24 | [Show the components of phase 5a on the Styleguide with marked sample data](./t24-styleguide-cv-components.md) | ui | Alexander Ponomarenko | M | T7, T8, T9, T10, T11, T12, T15 | done |
| T25 | [Check the CV pages end to end: content, downloads, preview, primary count and targets](./t25-cv-e2e.md) | tests | Alexander Ponomarenko | L | T17, T20 | done |
| T26 | [Run axe and Lighthouse on both CV pages](./t26-cv-axe-and-lighthouse.md) | tests | Alexander Ponomarenko | S | T20, T24 | done |
| T27 | [Switch on the CV parity items with their reworded behaviour](./t27-cv-parity.md) | tests | Alexander Ponomarenko | M | T20, T21, T22 | done |
| T28 | [Record the CV update rule and bring the documents in step with phase 5a](./t28-cv-docs.md) | docs | Alexander Ponomarenko | M | T23, T25, T26, T27 | done |

## Phase 5b

| # | Task | Layer | Owner | Estimate | Blocked by | Status |
|---|---|---|---|---|---|---|
| T29 | [Emit the Print block that re-applies the Dag tokens](./t29-tokens-print-block.md) | wiring | Alexander Ponomarenko | M | T28 | done |
| T30 | [Build the printed CV: print styles, the contact line and the Print button](./t30-cv-print.md) | ui | Alexander Ponomarenko | L | T29 | todo |
| T31 | [Add BackToTop to the Shell with its reserve](./t31-back-to-top.md) | ui | Alexander Ponomarenko | L | T28 | done |
| T32 | [Mark the current link in the mobile menu and check the header's marker on the rendered page](./t32-menu-current-marker.md) | ui | Alexander Ponomarenko | S | T28 | done |
| T33 | [Add the visual tests of the CV pages and re-take the baselines BackToTop changed](./t33-cv-visual-baselines.md) | tests | Alexander Ponomarenko | M | T30, T31, T32 | todo |
| T34 | [Write the pull request body with the Claims list and close the documents](./t34-cv-pr-body.md) | docs | Alexander Ponomarenko | M | T33 | todo |

**Total:** 34 tasks, ~17.5 person-days (5a: 28 tasks, ~13.75; 5b: 6 tasks, ~3.75).
