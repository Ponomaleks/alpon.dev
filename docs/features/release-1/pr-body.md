Spec: `docs/features/release-1/spec.md` (AC-01 to AC-12, T1 to T13). This pull request is T1 to T11 and goes into `v2`. T12 and T13 are the Owner's steps after it: the merge of `v2` into `main`, the deploy command, the protection of `main` and the check on alpon.dev.

## What changed

- **Web Analytics (AC-01, AC-02, AC-03).** Every page ends its body with the script the Cloudflare dashboard issues for alpon.dev (spec D-01). The one policy line in `public/_headers` names the script file in `script-src` and its endpoint in a new `connect-src` (D-02); injected inline scripts and scripts from other origins are refused as before. The script is not counted in the 50 KB budget of the site's own JS (D-04).
- **Tests do not reach the script's host (AC-04).** `tests/fixtures.ts` gives every Playwright file its `test`; each context the browser opens answers `static.cloudflareinsights.com` with an empty script (D-03). An ESLint rule keeps the files on the fixture. A new test fails if a load of the home page asks for anything off the machine.
- **Lighthouse CI blocks the script's address (AC-06, D-05).** `blockedUrlPatterns` in `lighthouserc.cjs`. In the reports the request is listed as blocked: no status, 0 bytes.
- **Two LCP levers (AC-06, D-06).** (a) The five Shell scripts are one file, `src/scripts/shell/start.ts`, loaded by `BaseLayout`: 1.7 KB gzip (was 2.2 KB in five files). (d) The contours of the closing band and of the mobile menu are one generated image, `public/img/contours-ridge-spruce.svg`, shown with `<img loading="lazy" alt="">` inside the same layer (D-10). The hero keeps its inline contours. `tools/contour-image.ts` writes the image from the ring data and the token `--fjord-contour-line-spruce`; a unit test holds the file to both.
- **Descriptions (AC-07, AC-08).** The home page and both CV pages say what the page holds and no longer repeat the name. The Owner saw the three final texts on 2026-10-12, picked the first ending of the home text and approved all three; they are recorded in the owner inputs of cv (C-25, C-27) and of home.
- **Documents.** The five shipped specs carry `status: Shipped` (D-11). Backlog: B-61 closed with no action (D-07), B-38 and B-86 closed with the numbers below, B-91 (a preview image for the CV pages) and B-92 (the real-user LCP after launch) are new. `CLAUDE.md`: the content rule on facts the Owner provided, and the D-04 exception in the quality bar. `README.md` and `docs/stub-parity.md` P-16 say what is built.

The three approved descriptions:

| Page | Text |
|---|---|
| Home | "Full stack developer in the Oslo area, open to work. React, Angular, TypeScript and Python. Key facts, background, experience and contact details." |
| English CV page | "Frontend developer with backend experience: skills, work experience and education. Read it here or download the PDF." |
| Norwegian CV page | "Frontend-utvikler med backend-erfaring: kompetanse, arbeidserfaring og utdanning. Les CV-en her eller last ned PDF-en." |

## LCP of the home page (spec §1.5)

Lighthouse mobile against `wrangler dev` on the Owner's machine, the address of the Web Analytics script blocked, LCP in ms.

| Variant | Runs | Median (lowest to highest) |
|---|---|---|
| Baseline, `v2` with the script of D-01 | 10 | 2118 (2115 to 2121) |
| (a) Shell scripts as one file | 6 | 1967 (1966 to 1968) |
| (d) the two contour layers removed, an upper bound | 6 | 1967 (1963 to 1972) |
| (a) + (d), upper bound | 6 | 1818 (1816 to 1821) |
| (a) + (d) as built, at e4bf9fb | 10 | 1820.5 (1809 to 1835) |

Every audited page, three runs each, before the levers (2a9bba0) and on the final state: `/` 2121 to 2136, now 1817 to 1821; `/404` 1690 to 1823, now 1661 to 1666; `/cv/en` 1970 to 1972, now 1662 to 1816; `/cv/no` 1968 to 1973, now 1665 to 1822. None is above 1900 ms; the level of about 1816 ms on the CV pages is the existing step of about 150 ms, not a regression.

AC-06 asks for a median at or below 1850 ms. The LCP element is the portrait in the hero in every run. No run asked for the contour image. With the script loaded the built levers were not measured again.

## Screenshots

No new baseline is committed with this pull request. The pages are meant to look as before: the only visible parts that changed their source are the contours of the closing band and of the mobile menu.

A local comparison on Windows (not the Linux baselines), before and after T7, of the closing band on `/` and `/cv/en` at 390, 834 and 1440 and of the open mobile menu at 390, in Dag and Natt: the pictures look the same. 0.7 % to 5.4 % of the pixels differ, all on the edges of the 1 px rings (the browser draws an SVG image a little differently from inline paths); the largest difference of one colour channel is 35 of 255.

The `visual` job compares with the committed Linux baselines. If it reports a difference on the closing band or the mobile menu, the new baselines go to the Owner for approval before they are committed (AC-06).

## Tests

On the final state, in one chain before the push:

- Lint (`npm run lint`): exit 0.
- Unit (`npm run test:unit`): 1370 passed, 73 files.
- Build, `check:budgets`: within limits. Initial JS of `/` 5.5 KB gzip, Shell scripts 1.7 KB gzip on every page.
- Playwright, full local run with `--workers=4`: 1991 passed, 195 skipped, 0 failed. `tests/e2e/parity.spec.ts` has no `test.fixme`.
- Lighthouse CI (`npm run lhci`, `/`, `/404`, `/cv/en`, `/cv/no`, 3 runs each): all assertions passed; `/` 1817, 1819 and 1821 ms (the "final" run of spec §1.5; the run at e4bf9fb, after the T8 measurement, gave 1812, 1816 and 1817 ms).

Notes on the work:

- The e2e test "a load of the home page makes no request that leaves the machine" passed on its first run in T2, before the script existed; from T3 it also asserts that the page asks for the script once and gets the empty answer.
- The e2e tests of the contour image were first run after the image was built; their unit counterparts failed first.
- The first run of the final gate stopped before the push: one Playwright test failed once, "[desktop] primary-count.spec.ts:88 home: bar scrolled away, the header action is primary, bar actions not focusable" (`Timeout 5000ms exceeded while waiting on the predicate`). It passed in the two full runs before and in 40 of 40 repeats after; it is recorded as a suspected flake in backlog B-93, and the whole gate was run again. The order of the Shell script and the page script (T5) was checked against what the test waits for, on the builds before and after T5: no link was found, and B-93 stays open with what was checked.
- One unit run failed in two build tests while a second unit run of mine was running beside it; alone the suite passed (1360 of 1360 at that commit). Two builds at once share Astro's caches (the family of B-46 and B-68).

## Conflicts with the design

None. The closing band and the mobile menu keep the page design; only the source of their contours changed.

## Not covered

- The content of the Web Analytics script, which Cloudflare can change at any time, and visits lost to content blockers (spec §7).
- The first opening of the mobile menu shows the contours a moment after the panel (D-10, known cost).
- A short page puts the closing band near the first screen, so there the browser may ask for the contour image during the load; AC-06 is about the home page.
- The real cost of the script for Visitors: backlog B-92, after one to two weeks of traffic.

## Operational notes

- No new dependency, no migration, no feature flag. `public/_headers` changed: the policy line.
- Merges into `v2` only. After the merge the Owner does T12 (merge `v2` into `main`, deploy command `npm run build && npx wrangler deploy`, protection of `main` with `check` and `visual`) and T13 (the check on alpon.dev, the changelog, roadmap step 6).
- Rollback: revert the merge commit.
