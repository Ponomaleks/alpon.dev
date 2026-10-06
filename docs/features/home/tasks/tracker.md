# Tracker — home

> Status of every task in the epic. `implement` updates `done` as it commits each task.
> States: `todo` · `in_progress` · `blocked` · `review` · `done`.

Estimates: S about a quarter of a day, M about half a day, L up to one day.

## Phase 4a

| # | Task | Layer | Owner | Estimate | Blocked by | Status |
|---|---|---|---|---|---|---|
| T1 | [Add the Work region coordinates to contact.ts and build the structured Person data from it](./t01-contact-geo-and-person.md) | domain | Alexander Ponomarenko | S | — | done |
| T2 | [Add the typed home content, the projects feature switch and the section numbering](./t02-home-content-data.md) | domain | Alexander Ponomarenko | M | — | done |
| T3 | [Add the icons the home page needs and the optional check icon of the Toast](./t03-icons-and-toast-check.md) | ui | Alexander Ponomarenko | S | — | done |
| T4 | [Render head meta, the structured-data block and the main minimum height in BaseLayout](./t04-layout-head-meta.md) | wiring | Alexander Ponomarenko | M | — | done |
| T5 | [Give the Sticky action bar its actions from a page option, all secondary](./t05-bar-page-actions.md) | ui | Alexander Ponomarenko | M | T3 | done |
| T6 | [Make the Sticky action bar collapsible with a native details tab and move the clearance to the tab](./t06-bar-collapse.md) | ui | Alexander Ponomarenko | M | T5 | done |
| T7 | [Add the over-hero state to the header and drop the bar-dependent secondary rule](./t07-header-over-hero.md) | ui | Alexander Ponomarenko | M | — | done |
| T8 | [Give the closing band its actions from a page option, its top margin and scroll-tied contours](./t08-band-actions-and-contours.md) | ui | Alexander Ponomarenko | M | T5 | done |
| T9 | [Build Portrait, the Motion control and the Ambient motion of the hero under data-motion](./t09-portrait-and-motion.md) | ui | Alexander Ponomarenko | M | T3 | done |
| T10 | [Build the Hero section with the Now line and the pointer parallax](./t10-hero.md) | ui | Alexander Ponomarenko | M | T1, T2, T9 | done |
| T11 | [Build the key facts panel with the Stat count-up](./t11-key-facts.md) | ui | Alexander Ponomarenko | M | T2 | done |
| T12 | [Build the About section with the QuickFacts list](./t12-about-quick-facts.md) | ui | Alexander Ponomarenko | S | T2 | done |
| T13 | [Build the experience list from native details entries](./t13-experience-list.md) | ui | Alexander Ponomarenko | M | T2, T3 | done |
| T14 | [Build the Contact block with the copy-email action, Save contact, the mail-link sentence and the QR tile](./t14-contact-block.md) | ui | Alexander Ponomarenko | M | T1, T3 | done |
| T15 | [Compose the home page from its sections, page options, the script entry and the contact place](./t15-compose-home-page.md) | wiring | Alexander Ponomarenko | L | T4, T6, T7, T8, T10, T11, T12, T13, T14 | done |
| T16 | [Add the home component sections to the Styleguide](./t16-styleguide-home-sections.md) | ui | Alexander Ponomarenko | M | T9, T11, T12, T13, T14 | done |
| T17 | [Update the changed Shell and base samples on the Styleguide](./t17-styleguide-shell-samples.md) | ui | Alexander Ponomarenko | M | T6, T7, T8, T16 | done |
| T18 | [Add the placeholder check and the built half of the contact check, and run both after the build](./t18-placeholder-and-contact-checks.md) | wiring | Alexander Ponomarenko | M | T15 | todo |
| T19 | [Split the script budgets, add the portrait and contrast checks and hold the Lighthouse budget on the home page](./t19-budgets-contrast-lighthouse.md) | tests | Alexander Ponomarenko | M | T15, T17 | todo |
| T20 | [Verify the first phone screen, the sections, touch targets and the scripts-off page end to end](./t20-home-e2e.md) | tests | Alexander Ponomarenko | M | T15 | todo |
| T21 | [Verify the Contact block and head meta end to end and turn on P-20 to P-24](./t21-contact-e2e-parity.md) | tests | Alexander Ponomarenko | M | T15 | todo |
| T22 | [Verify the 18 header states and the primary-button count on every Visitor page](./t22-header-states-primary-count-e2e.md) | tests | Alexander Ponomarenko | M | T15 | todo |
| T23 | [Verify the Shell contact links and focus at the contact place in three browsers and turn on P-50](./t23-contact-place-focus-p50.md) | tests | Alexander Ponomarenko | M | T21 | todo |
| T24 | [Verify Ambient motion, the Motion control, count-up, reveal, parallax and the band contours end to end](./t24-motion-e2e.md) | tests | Alexander Ponomarenko | M | T15 | todo |
| T25 | [Add the home axe checks and the visual baselines for the home page, the Styleguide and the Not-found page](./t25-axe-and-visual-baselines.md) | tests | Alexander Ponomarenko | M | T15, T17 | todo |
| T26 | [Close the document pointers, register the built components and draft the pull request with the Claims list](./t26-docs-and-claims-4a.md) | docs | Alexander Ponomarenko | M | T18, T19, T20, T21, T22, T23, T24, T25 | todo |

## Phase 4b

| # | Task | Layer | Owner | Estimate | Blocked by | Status |
|---|---|---|---|---|---|---|
| T27 | [Build the Recommendations section and show it only with agreed quotes](./t27-recommendations.md) | ui | Alexander Ponomarenko | M | T26 | todo |
| T28 | [Define the projects collection and build the Dormant Selected projects section with ProjectCard](./t28-selected-projects-dormant.md) | ui | Alexander Ponomarenko | M | T26 | todo |
| T29 | [Show Testimonial and the Dormant Selected projects on the Styleguide with marked sample data](./t29-styleguide-testimonial-projects.md) | ui | Alexander Ponomarenko | S | T27, T28 | todo |
| T30 | [Add the baselines and axe cases of phase 4b and complete the Claims list and the inventory](./t30-close-4b.md) | tests | Alexander Ponomarenko | S | T29 | todo |

**Total:** 30 tasks, ~14.25 person-days (phase 4a: 26 tasks, ~12.75; phase 4b: 4 tasks, ~1.5).
