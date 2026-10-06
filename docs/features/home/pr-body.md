Draft, opened to run CI on `feat/home` at the T25 point. Not ready for review.

This file is the body of the pull request. Task T26 completes it (what changed, screenshots, the Claims list, conflicts with the design); until then it records the state and the measured results.

## State

- Phase 4a of the home feature (`docs/features/home/`): T1 to T24 are `done`, T25 is `review` (the Linux baselines are not written or reviewed yet), T26 (documents, the Claims list, the full text of this file) is `todo`. Phase 4b (T27 to T30) has not started.
- **Claims list: not written and not ticked yet** (T26, AC-29). No number or status on the page has been confirmed by the Owner through this pull request.
- Visual check: expected red. The home page has no Linux baselines yet, and the Styleguide and Not-found baselines are stale since the Shell changes and the variable fonts. The baselines are written by the `visual-baselines` workflow after the Owner adds the label.

## Lighthouse

The budget is unchanged (CLAUDE.md, Quality bar): four categories ≥ 95, LCP ≤ 2.0 s, CLS ≤ 0.02, TBT ≤ 100 ms.

| Where | Method | Page | Performance | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Cloudflare preview of the branch, `https://feat-home-alpon-dev.ponomalex-work.workers.dev/` | 2026-10-06, the Owner: Chrome DevTools in incognito, no extensions, Lighthouse 13.4.1, mobile, simulated throttling, one run | `/` | 99 | 1.18 s | 1.59 s | 81 ms | 0 |
| Local, the Owner's Windows machine | 2026-10-06 and 2026-10-07: `npm run lhci` (Lighthouse 12.6.1 in Playwright's headless Chromium, mobile, simulated throttling, 3 runs, `wrangler dev` at `127.0.0.1:8788`) | `/` | 99 | 1.14 to 1.36 s | 1972, 1968, 1971 ms on 2026-10-07; earlier runs 2121, 2120, 1968 ms (passed) and 2014, 2020, 2168 ms (failed) | 0 to 113 ms | 0 |
| Local, same method | 2026-10-07 | `/404` | 100 | 0.91 to 0.96 s | 1662, 1669, 1669 ms | 0 ms | 0 |

- On the preview, accessibility and best practices are 100. **SEO is 69 there only because `workers.dev` preview addresses send `x-robots-tag: noindex`**; `alpon.dev` does not send it.
- `lhci` asserts on the best of the three runs (`aggregationMethod` is not set in `lighthouserc.cjs`, and the default of `@lhci/cli` is `optimistic`: the value most likely to pass).
- The budget is met on the production-like host. Locally `/` sits at the LCP limit (backlog B-38): if that blocks pushes it goes to the Owner as a decision, the limit is not changed.
- CI numbers (Linux Chromium) are added here when the run of this pull request finishes.

## What CI is asked to show

- Lighthouse CI numbers for `/` and `/404` on Linux Chromium.
- The contact place spec in Firefox and WebKit (they run only in CI).
- The visual check status.

## Decisions taken during implementation

- `main` has a literal `min-height: 60vh`: sizes are outside the token rule of base-components ADR-0004 and `tokens.css` has no size for it (T4, accepted by the Owner).
- The brand fonts are delivered as two variable files, weight axis 400 to 700; font limits are 50 KB per file and 80 KB for the two preloads (home sad §1 Decision override, §8 Fonts).
- The stylesheets of each page are joined into one file after the build (`src/integrations/one-stylesheet.ts`).
- Lighthouse CI audits `127.0.0.1` instead of `localhost`: a fix of the measurement method (home sad §10).
- The Dag header over the hero takes its colours from the on-spruce rule of `tokens.css`, which names its selector (T7).

## Known open points

- Workers Builds reported a failure for commit `0bfb705` on GitHub at first and passed later; the Owner is sending the build log of the failed attempt. The Workers and deploy configuration is unchanged.
- `upgrade-insecure-requests` left the Content-Security-Policy in a separate pull request to `v2` (Ponomaleks/alpon.dev#4, merged into this branch): WebKit applied it to the local test server and every WebKit test hung. This feature itself does not change the security policy (AC-32).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
