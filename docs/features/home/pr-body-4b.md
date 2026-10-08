## Summary

Phase 4b of **home** (roadmap step 4, [spec](docs/features/home/spec.md)), tasks T27 to T31: the Recommendations section with the two quotes the Owner supplied, closed to three lines behind "Show more" and ready to become a carousel when more follow, the `projects` collection with the Dormant Selected projects section and ProjectCard, and both shown on the Styleguide with marked sample data. Phase 4a is [Ponomaleks/alpon.dev#3](https://github.com/Ponomaleks/alpon.dev/pull/3), merged into `v2`.

Base: `v2`. Production (`main`) is not touched.

**State: ready for the Owner's merge.**

- T27 to T31 are `done`. The two things only the Owner could do are done:
  1. The Linux baselines are written by the `visual-baselines` workflow on `c699460` ([run 37793213130](https://github.com/Ponomaleks/alpon.dev/actions/runs/37793213130)) and committed by the Owner's request on 2026-10-08; the label is off. 44 files: 18 new (`home-recommendations`, Styleguide `testimonial` and `selected-projects`) and 26 changed (`home-contact`: the number 04 and the arrows of the two profile links; `home-closing-band`: its contours follow scrolling and the page is longer; Styleguide `contact-list` and `icon`: the profile links and `arrow-left`; two of `mail-link-sentence` at 390, with no visible difference).
  2. Rows 68 and 69 of the Claims list below are ticked in this pull request (AC-29).

## What changed

**Recommendations (T27, AC-09, AC-10)**

- `src/data/home.ts`: the two Recommendations of [owner-inputs.md](docs/features/home/owner-inputs.md), word for word, each with `consent: true`. The profile address, the date and the relationship are kept as source fields for the Claims list and are never rendered. A unit test reads `owner-inputs.md` and compares each quote character for character.
- `src/components/home/Recommendations.astro`: the section "From people I’ve worked with" with a Testimonial card per quote (the quote paragraph by paragraph, the name, the role, "On LinkedIn" to the recommendations on Alexander's profile, in a new tab). One column, two from 768.
- `src/pages/index.astro`: the section is rendered between Experience and Contact only when a Recommendation with consent exists. It is section 03 and Contact is 04; without one the section is left out and Contact is 03.
- `owner-inputs.md` was corrected by the Owner on 2026-10-08 before the quotes were entered: the last two paragraphs stood under Recommendation 2 and belong to Recommendation 1.

**"Show more" and the carousel (T31, AC-09, AC-42, AC-43; Owner decisions 2026-10-08)**

- A quote longer than three lines is closed to three lines with a "Show more" text button; "Show less" closes it again. Closed cards have the same height, and a closed card keeps its height next to an open one. The whole quote stays in the page; with scripts off every quote is shown whole.
- With more Recommendations than columns (one below 768, two from 768) the row is a carousel that goes round: previous and next arrows, swipe, keyboard scrolling, the position announced as "Recommendation N of M". With the two Recommendations of today that is the case below 768 only; from 768 both cards stand side by side as in the page design, with no arrows.
- No library. The row scrolls with CSS scroll snap, so swipe works without a script; `src/scripts/home/carousel.ts` makes it go round (inert copies of the cards at both ends, and the cards themselves moved round when the row stops on a copy, so that a copy is never a card at rest) and adds the arrows. The page's own scripts grow from 1.9 to 3.6 KB gzip (budget 10 KB).
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

**Local gate** (Windows, main checkout, 2026-10-08, run again on `f35fd41` before shipping):

- Unit (Vitest): 960 passed in 51 files.
- Lint (tokens check, contrast, contact, `astro check`, ESLint, Prettier, Stylelint): clean.
- `npm run build`: passes with the empty `src/content/projects/` (the glob loader prints `No files found matching "*.md"`, a warning).
- `npm run check:budgets`, `npm run check:placeholders`, `npm run check:contact:built`: pass.
- Playwright e2e and axe, with one retry as in CI: 1074 passed, 1 flaky (`[desktop] menu.spec.ts:413`, passed on its retry; `SyntaxError: Unexpected end of JSON input`, backlog B-44), 129 skipped (the visual folder runs in CI only, and the parity items of later steps). Earlier full runs of the day had one-off failures of the same kind in other specs; they are in the backlog with their output (B-44, B-48).
- `npm run lhci`: green. `/`: 99 / 100 / 100 / 100, LCP 1998, 1983 and 1994 ms, CLS 0, TBT 0 to 6 ms. `/404`: LCP 1684 to 1690 ms. The home page stays at the local LCP limit as before (backlog B-38).

Two things about the local gate, both in the backlog:

- In the main checkout `npm run test:unit` and `npm run lint` also read the leftover `.worktrees/` of phase 4a; the gate ran with `vitest run --exclude ".worktrees/**"` and `eslint . --ignore-pattern ".worktrees/**"` (B-47). CI is not affected.
- A container unit suite timed out several times while a second Vite or Wrangler server of the checkout was running (a preview, later `astro dev`), and passed on rerun (B-46).

**Ran the feature** (`wrangler dev` on `dist/` of `f35fd41`, Chromium, 2026-10-08):

- AC-09 at 1440: the section is "03 / Recommendations" under "From people I’ve worked with" and Contact is 04; two cards of the same height (278 px) with five and six paragraphs in the page; "Show more" opened the first quote whole, became "Show less" with `aria-expanded="true"`, and the second card kept its height; both "On LinkedIn" links lead to the recommendations on the profile in a new tab; no arrows.
- AC-42 at 375: the two arrows are shown, 44 by 44 px; "Next" moved to the second card and announced "Recommendation 2 of 2", "Next" again came round to the first and announced "Recommendation 1 of 2"; the card in view at rest was a real one each time and the copies were inert; the page did not scroll sideways.
- AC-11: no "Selected projects" and no "All projects" on the home page.
- AC-12 on `/styleguide`: three sample cards under "Sample data" inside a `data-sample` block, "Live" and "Code" in a new tab, the third card with "Code" only; the page is `noindex`. Their layout was not looked at here (the pane had no width); the committed baselines cover it.
- Not run by hand: AC-10 and AC-43, which need a fixture build and the switched-on content; their browser tests passed in the gate above.

**Visual baselines**: committed, see State.

**Review**: three rounds, verdict PASS, in [review-2026-10-08.md](docs/features/home/_review/review-2026-10-08.md). Round 1 found that the carousel could rest on an inert copy from 768 with three or more cards and that automatic turning had no test of its outcome; both are fixed. Round 2 found two regressions of that fix (Tab never left the row; focus lost at the breakpoint), fixed before anything was pushed. Round 3's one finding does not happen in Chromium and was closed by the Owner as not an issue (B-57). The non-blocking findings are B-50 to B-56.

## Acceptance criteria

- AC-09: built (T27, T31); baseline committed.
- AC-42: built (T31). Browser tests cover the carousel at 390 with the two cards of the page, and at 834 and 1440 with four cards in two columns: the test serves the home page with its HTML rewritten on the way to the browser, so the real scripts and styles run. After the review the cards in view at rest are always real ones: when the row stops with a copy in view, the cards themselves are moved round in the page and the copies are made anew at the two ends; a stop on real cards moves nothing, so Tab goes through the row once and leaves it (tested at 390 and 834), and focus in a card survives the carousel turning off at 768.
- AC-43: built (T31), off in the content. Browser tests switch it on for the test and run a paused clock: one move per interval and not sooner, each of the five holds (pointer, focus, an open quote, the hero's Motion control pressed for real, a hidden page), reduced motion, and no move without the switch.
- AC-10: built (T27), proven by the fixture build without consent.
- AC-11: holds (T28): no Selected projects section and no "All projects" link on the home page, with or without a Published project.
- AC-12: built (T28, T29); baseline committed.
- AC-28: the Styleguide's marked sample data is the only exemption (T29).
- AC-29: rows 68 and 69 are ticked by the Owner.

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
- None that only this pull request can close; the carried items are in the [changelog](docs/features/home/changelog.md).

## Claims list (AC-29)

The rows phase 4b adds to the Claims list of [Ponomaleks/alpon.dev#3](https://github.com/Ponomaleks/alpon.dev/pull/3); the numbers continue from there. Both rows are ticked. The Owner ticks a row after checking that the quote is the person's own words, that the name and the role are right, and that the person agreed to it being shown.

### Recommendations

- [x] **68.** Recommendation of Hennadii Shpak, "Senior Software Engineer at EPAM Systems": five paragraphs, from "I worked with Oleksandr for over two years…" to "…a valuable addition to any team." Where: Recommendations, first card. Source: `src/data/home.ts` `recommendations[0]`, from `docs/features/home/owner-inputs.md` Recommendation 1 (LinkedIn recommendation of April 26, 2026; "Hennadii managed Alexander directly"). Agreement: confirmed by the Owner in `owner-inputs.md` (`consent: true`).
- [x] **69.** Recommendation of Alina Shcherbak, "Frontend Developer at EPAM Systems": six paragraphs, from "I had the pleasure of working with Alexander for nearly two years as his Team Lead…" to "…both results and a positive team dynamic." Where: Recommendations, second card. Source: `src/data/home.ts` `recommendations[1]`, from `docs/features/home/owner-inputs.md` Recommendation 2 (LinkedIn recommendation of April 13, 2026; "Alina managed Alexander directly"). Agreement: confirmed by the Owner in `owner-inputs.md` (`consent: true`).

Not in this list: Selected projects (not rendered, AC-11) and the Styleguide's sample data (marked as sample, AC-12).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
