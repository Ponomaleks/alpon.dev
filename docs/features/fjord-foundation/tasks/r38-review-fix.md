---
id: R38
title: "Make screens.md SCR-02 describe the built interim 404 only, cite the R36 spec rows by ID, and set T1-T14 to done"
layer: "docs"
deps: []
acs: ["AC-07"]
files_hint: ["docs/features/fjord-foundation/screens.md", "docs/features/fjord-foundation/tasks/r36-review-fix.md", "docs/features/fjord-foundation/tasks/"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R38 — Make screens.md SCR-02 describe the built interim 404 only, cite the R36 spec rows by ID, and set T1–T14 to done

## Why

Review round 7, S1-17, S1-18, S1-19 and S1-20. All four are documentation or bookkeeping; none changes code or baselines.

- **S1-17.** `screens.md` SCR-02 "Layout (built; …)" says the section is `position: relative; overflow: hidden`, and the wireframe note says the ridge is "cropped by the section (overflow: hidden)". The built `.not-found` has no overflow clipping since review F-08; only `.ridge-contours` clips itself (`src/pages/404.astro`, `.not-found` and `.ridge-contours` rules), and `tests/e2e/not-found.spec.ts` asserts that no ancestor clips the focus ring.
- **S1-18.** SCR-02 still promises that step 3 keeps the 404 baselines (the ridge constraint "same markup, so the 404 baselines stay valid", the home-link line "doesn't change the baselines", and the two NEW-component rows). Spec §8 OQ-02 says step 3 rebuilds the page per `Misc.jsx` and re-baselines the 404 visuals.
- **S1-19.** The R36 result cites `spec.md:259-263` for the AC-07 test-plan rows. R35 added lines to OQ-02 in the same commit, so those line numbers now point at the AC-04..AC-06 rows.
- **S1-20.** The front matter of the 14 task files T1–T14 still says `status: "todo"`, while `tracker.md` has every task `done`.

Owner's decisions (2026-10-03): fix now as one docs task; delete the baseline claims instead of annotating them (Git keeps the history); add an "interim" banner to SCR-02; cite by ID in the R36 result; flip only the 14 status values and leave the definition-of-done boxes as they are.

## Definition of Done

- [x] SCR-02 layout paragraph and wireframe note describe the built behaviour: only the ridge wrapper clips, since F-08; the section itself does not.
- [x] The baseline claims in SCR-02 (ridge constraint, home-link line, the two NEW-component rows) are deleted and replaced by a pointer to spec §8 OQ-02: step 3 rebuilds the page and re-baselines.
- [x] SCR-02 opens with the banner: "Interim 404. This section describes the built page only. Step 3 rewrites SCR-02 against Misc.jsx; see OQ-02."
- [x] One sweep of SCR-02: every remaining line either matches `src/pages/404.astro` or points to OQ-02. The changed lines are reported in the result.
- [x] `r36-review-fix.md`: "spec.md:259-263" is replaced by "spec.md Test plan, AC-07 rows".
- [x] The front matter of the 14 task files T1–T14 says `status: "done"`. `tasks.json` holds no status field, so it needs no change; confirm this in the result. The definition-of-done boxes stay as they are.
- [x] No code or baseline changes. `npm run lint` and `npm run test:unit` green.

## Notes

- From this round on, task and review files cite IDs or section names (AC-xx, OQ-xx, SCR-xx, a rule or selector name); a line number is only a hint. See the "Conventions" section of [review-2026-10-03-4](../_review/review-2026-10-03-4.md).
- `tracker.md` is the status source (`_epic.md`); the per-task boxes are not maintained.

## Result

Changed in `screens.md` (cited by section, not by line):

- **SCR-02 heading:** the "Interim 404" banner.
- **SCR-02 state table, home-link row:** "the design Button's tokens" is now "the component demo Button's tokens".
- **SCR-02 Layout (built):** the section does not clip, only the ridge wrapper does (F-08); the min-height and the gap are given as the built token values with the component demo's pixel values beside them; the sentence about values going "to the token/allowlist decision in tasks" is replaced by what was built.
- **SCR-02 Ridge constraints:** the size bullet describes the built wrapper (`inset: 0`, crops the ring group); the baseline claim is deleted and points to OQ-02.
- **SCR-02 Home-link constraints:** the built token names, the pointer to OQ-02 items 10 and 14, the arrow size, and the color transition under `no-preference`; the baseline claim is deleted.
- **SCR-02 wireframe (390):** "cropped by their own wrapper (review F-08)".
- **New components table:** both rows point to OQ-02; "same markup" and "without changing the baseline" are deleted.
- **Outside SCR-02, found in the sweep:** the cross-screen `reduced-motion` row said "no … transitions". The built page has color transitions under `no-preference` (`base.css` links, the home-link), so the row now says that none runs under reduced motion.

Checked in the sweep and left as they are: the SCR-02 state table rows (default, with-projects, N/A rows), the Content bullets (each names its source and points to OQ-02), and the 1440 wireframe.

Other changes:

- `r36-review-fix.md`: the line cites for the spec are replaced by "`spec.md` AC-07, `spec.md` Test plan, AC-07 rows".
- T1–T14: `status: "done"` in the 14 files. `tasks.json` has no status field (keys: `id`, `title`, `layer`, `deps`, `acs`, `dod`, `files_hint`, `source`), so it is unchanged. No task file under `tasks/` says `todo` now.
- Not changed: the comment at the top of `src/pages/404.astro` still says "same token names and markup"; round 6 left that comment for the step 3 rebuild. No code or baseline changes.
- **Gate:** `npm run lint` and `npm run test:unit` green.
