## Summary

Phase 4b of **home** (roadmap step 4, [spec](docs/features/home/spec.md)), tasks T27 to T31: the Recommendations section with the two quotes the Owner supplied, closed to three lines behind "Show more" and ready to become a carousel when more follow, the `projects` collection with the Dormant Selected projects section and ProjectCard, and both shown on the Styleguide with marked sample data. Phase 4a is [Ponomaleks/alpon.dev#3](https://github.com/Ponomaleks/alpon.dev/pull/3), merged into `v2`.

Base: `v2`. Production (`main`) is not touched.

**State: draft, waiting for the Owner.**

- T27, T28, T29 and T31 are `done`. T30 is `review` and waits for two things only the Owner can do:
  1. **Add the `visual-baselines` label** to this pull request. The `visual` job is expected to be red until then: the home page has a new section (`home-recommendations-*`), its contact section changed (the number is 04), and the Styleguide has two new sections (`Testimonial`, `Selected projects`). Then review the new PNGs.
  2. **Tick the two rows of the Claims list below** (AC-29).

## What changed

**Recommendations (T27, AC-09, AC-10)**

- `src/data/home.ts`: the two Recommendations of [owner-inputs.md](docs/features/home/owner-inputs.md), word for word, each with `consent: true`. The profile address, the date and the relationship are kept as source fields for the Claims list and are never rendered. A unit test reads `owner-inputs.md` and compares each quote character for character.
- `src/components/home/Recommendations.astro`: the section "From people I’ve worked with" with a Testimonial card per quote (the quote paragraph by paragraph, the name, the role, "On LinkedIn" to the recommendations on Alexander's profile, in a new tab). One column, two from 768.
- `src/pages/index.astro`: the section is rendered between Experience and Contact only when a Recommendation with consent exists. It is section 03 and Contact is 04; without one the section is left out and Contact is 03.
- `owner-inputs.md` was corrected by the Owner on 2026-10-08 before the quotes were entered: the last two paragraphs stood under Recommendation 2 and belong to Recommendation 1.

**"Show more" and the carousel (T31, AC-09, AC-42, AC-43; Owner decisions 2026-10-08)**

- A quote longer than three lines is closed to three lines with a "Show more" text button; "Show less" closes it again. Closed cards have the same height, and a closed card keeps its height next to an open one. The whole quote stays in the page; with scripts off every quote is shown whole.
- With more Recommendations than columns (one below 768, two from 768) the row is a carousel that goes round: previous and next arrows, swipe, keyboard scrolling, the position announced as "Recommendation N of M". With the two Recommendations of today that is the case below 768 only; from 768 both cards stand side by side as in the page design, with no arrows.
- No library. The row scrolls with CSS scroll snap, so swipe works without a script; `src/scripts/home/carousel.ts` makes it go round with inert copies of the cards at both ends and adds the arrows. The page's own scripts grow from 1.9 to 3.3 KB gzip (budget 10 KB).
- Automatic turning exists and is off (`recommendationsAutoplay` in `src/data/home.ts`). When on, it stops on hover, on focus, while a quote is open and while the page is hidden, follows the hero's Motion control and never runs with reduced motion.
- "On LinkedIn" leads to the recommendations on the profile (`contact.links.recommendations`) and is shown only on a Recommendation with `source: 'linkedin'`; one given directly (`source: 'direct'`) has no link.
- `spec.md`: AC-09 and AC-12 amended, AC-42 and AC-43 added, differences D-19 to D-21, D-09 changed.

**Selected projects, Dormant (T28, AC-11, AC-12)**

- `src/content.config.ts` and `src/data/projects.ts`: the `projects` collection (one markdown file per project in `src/content/projects/`, empty for now) with the entry shape of AC-12: title, summary, status, year, one result with its label, tags, optional live and code addresses, `featured`, `published`.
- `src/components/home/ProjectCard.astro` and `SelectedProjects.astro`: up to three featured projects, the first large (media 7 parts, text 5 from 1024), two compact cards in two columns from 768; "Live" and "Code" only where they exist.
- The home page renders the section only when `features.projects` is on and a Published project exists. The switch stays off; step 7 owns it.

**Styleguide (T29, AC-12, AC-28)**

- Two new sections, "Testimonial" and "Selected projects", each with a visible "Sample data" label. The sample values are bracketed and stand inside a `data-sample` block, the only place the placeholder check allows them. The sample quotes name no real person. Sample data: `src/data/samples.ts`.

**Tests and documents (T30)**

- `tests/visual/home.spec.ts` captures the Recommendations section; `tests/visual/styleguide-sections.ts` lists the two new Styleguide sections; `tests/a11y/home.spec.ts` scans the home page with both Recommendations on it.
- Fixture builds for the home page (`src/pages/_fixtures/`): one with a Recommendation without consent, one with a Published project while the switch is off. They build the real pages from fixture content; nothing in the production code reads a test setting.
- `docs/design-system.md`: Testimonial, ProjectCard, Recommendations and SelectedProjects moved to "Built in the repo". `docs/backlog.md`: B-44 seen again, B-46, B-47.
- No new npm dependency.

## Test results

**Local gate** (Windows, main checkout, 2026-10-08):

- Unit (Vitest): 947 passed in 50 files.
- Lint (tokens check, contrast, contact, `astro check`, ESLint, Prettier, Stylelint): clean.
- `npm run build`: passes with the empty `src/content/projects/` (the glob loader prints `No files found matching "*.md"`, a warning).
- `npm run check:budgets`, `npm run check:placeholders`, `npm run check:contact:built`: pass.
- Playwright e2e and axe: 1015 passed, 21 skipped (the visual folder runs in CI only). Earlier full runs of the day each had one-off failures that passed on rerun with no change; they are in the backlog with their output (B-44, B-48).
- `npm run lhci`: green. `/`: 99 / 100 / 100 / 100, LCP 2131, 2135 and 1976 ms, CLS 0, TBT 0 ms. `/404`: LCP 1673 to 1685 ms. The home page stays at the local LCP limit as before (backlog B-38).

Two things about the local gate, both in the backlog:

- In the main checkout `npm run test:unit` and `npm run lint` also read the leftover `.worktrees/` of phase 4a; the gate ran with `vitest run --exclude ".worktrees/**"` and `eslint . --ignore-pattern ".worktrees/**"` (B-47). CI is not affected.
- A container unit suite timed out several times while a second Vite or Wrangler server of the checkout was running (a preview, later `astro dev`), and passed on rerun (B-46).

**Visual baselines**: not written yet, see State.

## Acceptance criteria

- AC-09: built (T27, T31); its baseline waits for the label.
- AC-42: built (T31). Browser tests cover the carousel at 390 with the two cards of the page; from 768 with three or more cards it is covered by the unit tests of the arithmetic only.
- AC-43: built (T31), off in the content; the rule that holds it is unit-tested.
- AC-10: built (T27), proven by the fixture build without consent.
- AC-11: holds (T28): no Selected projects section and no "All projects" link on the home page, with or without a Published project.
- AC-12: built (T28, T29); its baseline waits for the label.
- AC-28: the Styleguide's marked sample data is the only exemption (T29).
- AC-29: the two rows below wait for the Owner's ticks.

## Differences from the page design

- D-19: a long quote is closed to three lines with "Show more" / "Show less"; the design draws short quotes shown whole.
- D-20: with more cards than columns the row is a carousel that goes round; the design draws a grid with every card visible. The arrows are the IconButton of the design system, in the head row.
- D-21: "On LinkedIn" leads to the recommendations on the profile and is absent on a Recommendation given directly.
- D-09 (changed, Owner decision 2026-10-08): every link to another site opens a new tab and says "(opens in a new tab)" to assistive technology: LinkedIn and GitHub in the Contact block and the footer, "On LinkedIn" on a Recommendation, "Live" and "Code" on a project card. Each shows the external-link icon, except in the footer, which keeps its tight text links. Mail, phone, the contact card and links inside the site stay in the tab. This replaces the same-tab rule of base-components D-16. A test over every anchor of every built page holds the rule.
- The quote is set in whole-pixel lines (28, 32 and 34 px, close to the design's 1.5): with fractional lines the "On LinkedIn" text and its arrow were drawn one sub-pixel apart between the closed and the open state.
- "On LinkedIn", "Show more", "Live", "Code" and "All projects" have a 44 px target (Quality bar); the design draws the bare text link.
- ProjectCard: the media is a contour panel on spruce or on the sunken ground with the project's slug. The design generates a terrain per project and fades to a screenshot on hover; screenshots and the link from the title to the case study come with the Projects pages in step 7.
- On the Styleguide the Selected projects heading is an `h3` under the section's own `h2`, and "All projects" leads to `/projects`, which does not exist until step 7.

## Known open points

- Leftover worktrees and scratch files of phase 4a in `.worktrees/` (B-47): remove them, or exclude the folder in the Vitest and ESLint configs.
- The Owner's label and ticks (State).

## Claims list (AC-29)

The rows phase 4b adds to the Claims list of [Ponomaleks/alpon.dev#3](https://github.com/Ponomaleks/alpon.dev/pull/3); the numbers continue from there. **Nothing here is ticked yet.** The Owner ticks a row after checking that the quote is the person's own words, that the name and the role are right, and that the person agreed to it being shown.

### Recommendations

- [ ] **68.** Recommendation of Hennadii Shpak, "Senior Software Engineer at EPAM Systems": five paragraphs, from "I worked with Oleksandr for over two years…" to "…a valuable addition to any team." Where: Recommendations, first card. Source: `src/data/home.ts` `recommendations[0]`, from `docs/features/home/owner-inputs.md` Recommendation 1 (LinkedIn recommendation of April 26, 2026; "Hennadii managed Alexander directly"). Agreement: confirmed by the Owner in `owner-inputs.md` (`consent: true`).
- [ ] **69.** Recommendation of Alina Shcherbak, "Frontend Developer at EPAM Systems": six paragraphs, from "I had the pleasure of working with Alexander for nearly two years as his Team Lead…" to "…both results and a positive team dynamic." Where: Recommendations, second card. Source: `src/data/home.ts` `recommendations[1]`, from `docs/features/home/owner-inputs.md` Recommendation 2 (LinkedIn recommendation of April 13, 2026; "Alina managed Alexander directly"). Agreement: confirmed by the Owner in `owner-inputs.md` (`consent: true`).

Not in this list: Selected projects (not rendered, AC-11) and the Styleguide's sample data (marked as sample, AC-12).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
