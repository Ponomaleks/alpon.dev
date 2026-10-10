## Summary

Feature **cv** (roadmap step 5, [spec](docs/features/cv/spec.md)), tasks T1 to T34: one CV page per CV language at `/cv`, `/cv/en` and `/cv/no`, built from typed CV data with the CV PDF as the source of truth, plus the Shell changes the step carried (BackToTop, the marker of the current link in the mobile menu, canonical and language alternates). It closes the nine stub-parity items of the step; no `test.fixme` is left in `tests/e2e/parity.spec.ts`.

Base: `v2`. Production (`main`) is not touched.

**State: ready for review.** The Claims list is ticked by the Owner (40 rows, 2026-10-10) and the Linux baselines are committed from the `visual-baselines` workflow.

## What changed

**CV pages (AC-01 to AC-06, AC-09, AC-10, AC-15 to AC-18)**

- `src/data/cv/`: content and page labels per CV language, the CV date, the checksum of each CV PDF. `npm run check:cv`, part of `npm run lint`, fails when a CV PDF changes without its checksum (AC-25).
- `src/components/cv/`: the head (breadcrumbs, name, role and location lines, language switch, "Download PDF" as the one primary button, meta line), the Original PDF preview (a native `<details>`; page images one under the other, D-11), the eight sections, the side column with "On this page", the contact list from `src/data/contact.ts` and the second download.
- `/cv` serves the English page with `/cv/en` as its canonical address; the three CV rules left `public/_redirects`; response headers for the pages, the CV PDFs and the page images; both pages are in the sitemap with their language alternates.
- Every internal CV link reads its address from `src/data/contact.ts`.

**Language switch (AC-07, AC-08, AC-19)**

- Two links that work with scripts off. With scripts on, the switch of the CV head opens the other page at the scroll position the Visitor had, and the switch of the Sticky action bar opens it at the section in view. AC-08, D-02, spec §6.1 and ADR-0001 were reworded on 2026-10-09 after implement measured that the head's switch is never on screen while a section is in view.

**Print (AC-11, AC-12)**

- A print block in the generated tokens re-applies the Dag colours from either theme (ADR-0002). The printed CV is the content alone, with one contact line that is not on screen; "Print" is shown only where scripts run. Each CV prints on three A4 sheets.

**Shell (AC-13, AC-14, AC-20 to AC-22)**

- The Legacy CV addresses `#cv` and `#cv-no` hand over from the home page.
- BackToTop: a link with no script, from 768, tied to scrolling where the browser can; it hides again over the end of the page, so the page keeps no reserve under the footer.
- The current link of the mobile menu has an accent rule at the start of its row; the header's marker is checked on the rendered page (B-05).
- Moves inside a page scroll smoothly where motion is allowed, as in the page design.

**Design match pass (2026-10-10)**

- The built CV page was measured against the standalone design at 1440 / 834 / 390, and about thirty values that had been carried over wrongly were set back to the design's (the 56 × 36 switch segments, the gaps of the head, the width of the sections, the dated rows, the side column, breadcrumbs, the icon sizes of Button and Link). Content height, design against built: 4588 / 4533 at 1440, 4535 / 4486 at 834, 6181 / 6140 at 390.

**Outside the feature, done on the way**

- CI: the Playwright suite runs as two shards beside a `quality` job; `check` gathers them and stays the required check with `visual`. The single job ran into its 30-minute limit.
- Unit tests: the container suites start their Vite server with no watcher and a dependency cache of their own (B-68, B-46).
- `tools/cv-previews.py` runs on `v2` (B-63). The home page no longer marks the EPAM job as current (pull request 7, B-60).
- Pre-publication check of the repository (B-59): the README points to alpon.dev only, `.claude/sdd.local.md` is no longer tracked.

## Screenshots

The approved Linux baselines are the screenshots: [`tests/visual/__screenshots__/linux/cv.spec.ts/`](tests/visual/__screenshots__/linux/cv.spec.ts/) holds both CV pages at 390 / 834 / 1440 in Dag and Natt with the preview closed and open (`cv-{en,no}-{closed,open}-{dag,natt}-{390,834,1440}.png`, 24 files); the new and changed Styleguide sections are in [`styleguide.spec.ts/`](tests/visual/__screenshots__/linux/styleguide.spec.ts/).

## Test results

Local gate on `f600f00` (Windows, one `&&` chain before the push):

- `npm run test:unit`: 69 files, 1295 tests passed (141 s)
- `npm run lint`: 0 errors
- `npm run build`, `check:budgets`, `check:contact:built`, `check:placeholders`: green
- `npm run lhci`: passed on `/`, `/404`, `/cv/en`, `/cv/no`; LCP 1974, 1678, 1972 and 1969 ms
- Playwright `tests/e2e` and `tests/a11y` with `--workers=4`: 1835 passed, 13 skipped, 0 failed

CI on `c6069d1`: `quality`, both `e2e` shards, `check` and `visual` green. The first run with shards (`b2a4377`): `quality` 5 min 26 s, `e2e (1)` 11 min 40 s (932 passed, 80 skipped), `e2e (2)` 14 min 58 s (927 passed, 85 skipped), 15 min 6 s in all, no test failed or passed on a retry.

Manual checks:

| Check | Browser | Result |
| ----- | ------- | ------ |
| Print of `/cv/en` and `/cv/no` | Chromium (Playwright 1.63, PDF) | three A4 sheets each, no Shell part, no control, no skip link, white sheet from Dag and from Natt |
| Print of `/cv/en` and `/cv/no` | Firefox (Owner, 2026-10-10) | looks right in both languages after the content became plain blocks in print (0f9e1dd); before that the first sheet held the head alone |
| Print | Safari | not checked: the Owner has no Safari |
| Page images of the preview requested only after opening | Chromium (e2e `cv-preview.spec.ts`) | 0 requests before opening |
| The same | Firefox, Safari | not checked by hand; Firefox and WebKit run only `contact-place.spec.ts` in CI |

## Differences from the page design

Decided by the Owner; the reasons are in [spec §1.3](docs/features/cv/spec.md), D-01 to D-11. Outside that list:

| Difference | Decision |
| ---------- | -------- |
| No job is marked as current (the design marks the EPAM job) | Owner, 2026-10-09: the period has an end ([owner-inputs](docs/features/cv/owner-inputs.md) EN-12, NO-12) |
| BackToTop hides over the end of the page | Owner, 2026-10-10: no reserve under the footer, as the design has none (AC-22) |
| Under reduced motion BackToTop appears by opacity only | Owner, 2026-10-09 (AC-21) |
| The printed CV: a job may run over a sheet, its parts stay whole; three sheets | Owner, 2026-10-10 (AC-11) |
| 41 to 55 px of content height left against the design | Named causes, left on purpose: browser-default margins inside the design's Prose, the recorded differences, 44 px targets on the contact links, different line breaks |

The `visual` baselines were compared with `design/screenshots/{dag,natt}_cv.png` through the measured pass above, not pixel by pixel; Natt and the widths 1024 and 360 were not measured.

## Difference lists and Claims

All three are in [owner-inputs.md](docs/features/cv/owner-inputs.md), with the Owner's decision in every row:

1. The design's CV text against each CV PDF: 13 rows for English, 13 for Norwegian, all "accept".
2. Facts the home page and a CV page state differently: 9 rows, all "keep both, no change"; B-60 (done) and B-61 came out of it.
3. The Claims list: 40 rows, every number and date on the CV pages with the CV PDF page as its source, the page count, the CV date, both titles and descriptions and the Norwegian wordings. All ticked by the Owner on 2026-10-10.

## Left open

- Backlog: B-61 (the home wording against the CV), B-64 (workers of the local Playwright run), B-65 (one suspected flake), B-66 (the CV labels exist twice), B-38 (the home page's local LCP sits at the limit).
- AC-08: a single first frame at the top before the carried position is restored, about one arrival in ten under load, accepted by the Owner.
- Safari was not checked for print or for the preview.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
