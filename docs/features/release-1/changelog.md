# Changelog — release-1

## release-1 — Web Analytics from launch day, room under the LCP limit, new descriptions; then v2 goes to `main`

**What:** three changes to the site, in one pull request into `v2` ([Ponomaleks/alpon.dev#11](https://github.com/Ponomaleks/alpon.dev/pull/11), T1 to T11), after one review round ([round 1](./_review/review-2026-10-12.md)):

- Every page ends with the Cloudflare Web Analytics script, so visits are counted without cookies from the first day. The security policy names the one script file and its one endpoint and nothing else new.
- The home page has room under the 2.0 s LCP limit: about 1820 ms in Lighthouse on the Owner's machine, where it was about 2120 ms. The Shell loads one script file instead of five, and the contours of the closing band and of the mobile menu are one image the browser asks for only when the Visitor scrolls near the band or opens the menu. Both look as before.
- The description under a link to the home page, the English CV page and the Norwegian CV page says what the page holds and no longer repeats the name.

The release itself is two Owner steps after that pull request and is **not done yet**: T12 (merge `v2` into `main`, switch the deploy command, protect `main`) and T13 (the check on alpon.dev). Their results go into "Release check" below.

**Why:** `main` still serves the stub while the job search is running ([spec](./spec.md) §1). Three things had to be true on launch day: visits are measured, the LCP gate of the home page does not block merges once the checks are required on `main` (backlog B-38 and B-86), and a Recruiter reads a useful description in a search result or a link preview. Key decisions, all in the spec §1.3 (the feature is size XS and has no ADR of its own; the policy follows fjord-foundation [ADR-0002](../fjord-foundation/adr/0002-generate-the-bootstrap-hash-into-a-single-csp-rule-at-build.md)):

- D-01, D-02: the script is in the site's own code, as the dashboard issues it, and the policy names the exact file. The cost: no Subresource Integrity, because Cloudflare does not version the file.
- D-03: Playwright answers the script's host locally, so no test depends on it and no test run sends a visit.
- D-04, D-05: the script is not counted in the 50 KB budget of the site's own JS, and Lighthouse CI blocks its address. Its real cost is read from real visits after launch (backlog B-92).
- D-06, D-10: the two LCP levers that were built, and the levers that were measured and rejected (spec §1.5).
- D-07: the role wording is not unified; each page keeps its own.
- D-08, D-09: the deploy command and the protection of `main`.
- D-11: a shipped spec carries `status: Shipped`.

**How to use:**

- Web Analytics numbers: the Cloudflare dashboard, Web Analytics, the site alpon.dev. The script is in every build, so visits to preview addresses and to a local server are counted under the same token: read the numbers with the host filter `alpon.dev`.
- The script and its token: `src/layouts/BaseLayout.astro`. The policy line: `public/_headers`; a change of either has to match `tests/contracts/csp.contract.json`.
- A new Playwright file imports `test` and `expect` from `tests/fixtures.ts`, not from `@playwright/test`; ESLint refuses the direct import. A visual test calls `contourImagesShown(page)` before a capture that shows the closing band or the open mobile menu.
- The contour image `public/img/contours-ridge-spruce.svg` is generated. After a change of the ring data or of the token `--fjord-contour-line-spruce`, run `node tools/contour-image.ts`; a unit test fails while the file differs from either.
- A Shell script is added in `src/scripts/shell/start.ts`, the one file `BaseLayout` loads, not as a script block of its component.
- The descriptions: `src/pages/index.astro` and `src/data/cv/{en,no}.ts`. A new text is approved by the Owner first and recorded in the owner inputs of its feature.

**Operational notes:**

- Migration: <!-- none --> no datastore.
- Feature flag / config: <!-- none --> In the Cloudflare dashboard the site is set to "Enable with JS Snippet installation" (Owner, 2026-10-12).
- Response headers and routing: the policy line of `public/_headers` changed (`script-src` and a new `connect-src`). `public/_redirects` is unchanged.
- Static files: `public/img/contours-ridge-spruce.svg` is new.
- No new npm dependency. No paid service.
- Visual baselines: none changed.
- Deploy of the pull request: merges into `v2` only; production (`main`, the stub) is not affected by it.
- Release (T12, the Owner, in this order): merge `v2` into `main`; set the production deploy command in Workers Builds to `npm run build && npx wrangler deploy`; apply the protection of `main` with the checks `check` and `visual` (fjord-foundation [T16](../fjord-foundation/tasks/t16-ci-lighthouse-protection.md), option 2) and read it back. The protection comes after the merge, because before it would block the merge itself.
- Rollback: of the pull request, revert its merge commit on `v2`. Of the release, revert the merge of `v2` on `main` and set the deploy command back to the stub's; the Web Analytics site in the dashboard can stay.

**Release check (T13, the Owner):** not done yet. Each row gets its date and result when it is checked on alpon.dev.

| Check | AC | Result |
|---|---|---|
| The home page, both CV pages, the Short CV address, the short links and the downloads answer as the parity list says | AC-09 | — |
| `main` cannot be merged into without green `check` and `visual`, administrators included; the read-back shows both | AC-10 | — |
| An address that does not exist shows the Not-found page of the site, and its response carries the policy of AC-02 | AC-11 | — |
| A visit from Norway is listed in the Web Analytics dashboard with Norway as its country, or spec OQ-02 is answered | AC-12 | — |
| The dashboard can show the numbers of the host alpon.dev alone | AC-12 | — |

**Open items carried forward:**

- OQ-02 (spec §8): what happens if a visit from Norway is not listed. Due at the release check.
- B-92: the real-user LCP of the home page, after one to two weeks of traffic.
- B-91: a separate preview image for the CV pages.
- B-93: a suspected flake of `primary-count.spec.ts`, seen once; open until it is seen again.
- Known cost of D-10: on the first opening of the mobile menu the contours appear a moment after the panel.
- Not covered (spec §7): the content of the script itself, which Cloudflare can change at any time, and visits lost to content blockers.

**Acceptance criteria delivered:** by the pull request, AC-01 to AC-08: the script once, last in the body, on every page (AC-01); one policy with the one script file and the one endpoint (AC-02); other scripts refused as before (AC-03); tests that do not reach the script's host (AC-04); the site's own script budgets unchanged (AC-05); the LCP of the home page with a median at or below 1850 ms and the contour image asked for only when needed (AC-06); the three descriptions (AC-07) with the Owner's approval (AC-08). AC-09 has its in-repository part (no `test.fixme` in the parity tests). The rest of AC-09 and AC-10 to AC-12 are the release steps above.
