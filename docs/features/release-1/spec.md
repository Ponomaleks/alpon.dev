---
status: Shipped
owner: "Alexander Ponomarenko"
reviewers: ["Tech Lead"]
updated_at: "2026-10-13"
feature_size: "XS"
---

# Spec — release-1

> **Glossary:** [CONTEXT](../../../CONTEXT.md) (repo root; this feature has no feature-level CONTEXT)
> **Docs used:** [roadmap](../../roadmap.md) step 6 and D2, [backlog](../../backlog.md) B-38, B-61 and B-86, [stub-parity](../../stub-parity.md), fjord-foundation [ADR-0002](../fjord-foundation/adr/0002-generate-the-bootstrap-hash-into-a-single-csp-rule-at-build.md) and [T16](../fjord-foundation/tasks/t16-ci-lighthouse-protection.md), cv [owner-inputs](../cv/owner-inputs.md) table 3, the Cloudflare Web Analytics documentation (FAQ, Get started, Limits, RUM beacon; read on 2026-10-12).

## 1. Context

`main` still serves the stub. The new site (v2) is built on the `v2` branch: the home page, the CV pages and the Not-found page are shipped, and no `test.fixme` is left in `tests/e2e/parity.spec.ts`. Release 1 puts v2 on alpon.dev for Recruiters and Tech leads.

Why now: the job search is running, and the stub does not show the work. Three things have to be true on launch day and are not yet:

- Visits are measured from the first day, without cookies (roadmap, "Decisions so far").
- The home page has no room under the 2.0 s LCP limit (B-38 locally, B-86 once in CI). Once the checks are required on `main`, one such failure blocks a merge.
- The description a Recruiter sees in a search result or a link preview repeats the name that the title and the preview image already show, and says little about the page.

Approach: one pull request into `v2` adds the Web Analytics script with the matching security policy, gives the home page room under the LCP limit and rewrites the three descriptions. Then `v2` is merged into `main`, the Owner switches the production deploy command and protects `main`, and the release is checked on alpon.dev.

This feature is small (XS): the test plan is in this file, and there is no `sad.md`.

### 1.1 New or extended

| Part | Kind | Notes |
|---|---|---|
| `BaseLayout` | extended | the Web Analytics script as the last element of the body, on every page |
| `public/_headers` | extended | the one policy line names the script and its endpoint (D-02) |
| Policy and parity tests | extended | the three exact `script-src` assertions, a new `connect-src` check |
| Playwright setup | extended | requests to the script's host are answered locally, for every test |
| `lighthouserc.cjs` | extended | blocks the address of the Web Analytics script (D-05) |
| Shell scripts | changed | one script file for the Shell instead of five (D-06) |
| Closing band, mobile menu | changed | their contours come from an image file, asked for only when needed (D-10); the hero contours stay in the page |
| Contour image | new | one generated file with the ridge contours in the spruce tone (D-10) |
| Descriptions | changed | home, English CV page, Norwegian CV page (§1.4) |
| Production deploy command, protection of `main` | changed by the Owner | outside the repository (D-08, D-09) |

### 1.2 Changes to earlier documents

- The front-matter `status` of the five shipped specs (fjord-foundation, base-components, home, cv, save-contact-hint) is `Draft`. One docs commit sets `Shipped` in all five (D-11).
- Backlog B-61 is closed with no action, both halves: the two wordings of the role are intended (D-07), and "2 groups" in the key fact on the students is true and stays (Owner, 2026-10-12).
- `CLAUDE.md`, "Content rules", a new rule: facts the Owner provided for the site are confirmed by default. A fact that appears on the site but not in the CV PDF is not a discrepancy and needs no backlog item; only a direct contradiction between two sources does.
- Backlog B-38 and B-86 are closed by AC-06, with the numbers of §1.5 and of the measurement of the built levers.
- A new backlog item, after launch: read the real-user LCP of the home page in Web Analytics (Core Web Vitals) after one to two weeks of traffic, and compare it with the Lighthouse values of §1.5 (D-05).
- A new backlog item: a separate preview image for the CV pages with a "CV" label. Not built here.
- cv `owner-inputs.md`, table 3: rows C-25 and C-27 get the new descriptions, with the Owner's approval (AC-08).
- fjord-foundation ADR-0002 and its sad already name this change of the policy; they are not edited.
- `docs/roadmap.md`: step 6 links this folder; D2 is answered by D-01.
- `CLAUDE.md`, "Quality bar": the exception of D-04 is added to the initial JS budget line.
- `README.md`: the production deploy command (D-08) and Web Analytics, which it calls optional and describes as future (D-01).
- `docs/stub-parity.md` P-16: its wording names the script source of D-02 beside the site itself and the hash.
- home `owner-inputs.md`: the approved home description is recorded there as a claim, because it states the status "open to work" (AC-08).
- B-86 asks for the LCP work in a separate pull request into `v2`. It is done in the pull request of this feature instead, because it has to be measured with the Web Analytics script in place (Owner, order of 2026-10-12).

### 1.3 Decisions

| # | Decision | Reason |
|---|---|---|
| D-01 | Web Analytics is switched on by the script in the site's own code, exactly as the Cloudflare dashboard issues it for alpon.dev: `<script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "145a994b908a49539c57bf82ca84fb4f"}'></script>`, without the comments around it, as the last element of the body. It is rendered in every build. The token is public and lives in the repository. In the dashboard the site is set to "Enable with JS Snippet installation" (Owner, 2026-10-12) | The script is versioned and the policy tests and Lighthouse see it. The documentation does not confirm the dashboard's own injection for a Worker on a custom domain; on the Free plan it would also reach every subdomain of the zone, and by default it leaves out visitors from the EU and Norway. The cost: no Subresource Integrity, because Cloudflare does not version the file (Owner decision 2026-10-12, answers roadmap D2) |
| D-02 | The policy line in `public/_headers`: `script-src` adds `https://static.cloudflareinsights.com/beacon.min.js` (the exact file, not the host); a new `connect-src 'self' https://cloudflareinsights.com`. It stays one line under `/*` | Cloudflare FAQ, "What do I need to add to my Content Security Policy"; ADR-0002 (one rule) |
| D-03 | In Playwright (e2e, axe, visual) every request to `static.cloudflareinsights.com` is answered locally with an empty script | The tests do not depend on a third-party host, and no test run sends a visit |
| D-04 | The script is not counted in the 50 KB initial JS budget. The budget is for the site's own code. The script is third-party, a module script (deferred, not render-blocking), unversioned, about 10.2 KB gzip on 2026-10-12 | Owner decision 2026-10-12. The budget check reads the site's own files only; its script budgets are not changed |
| D-05 | Lighthouse CI blocks the address of the Web Analytics script (`blockedUrlPatterns`), locally and in CI. The script stays in every build and in every other test as D-01 and D-03 say | Measured on 2026-10-12 (§1.5): with the script loaded Lighthouse reports an LCP 300 to 390 ms higher, far outside the spread of the runs (under 20 ms). That is the estimate of the simulated slow network for two third-party connections, which on a local run finish before the first paint and so enter the model; the observed LCP is the same with and without the script (345 and 383 ms in Lighthouse, 84 to 112 ms in a warm browser). The intent was an LCP gate that does not depend on a third-party download, not a gate on a property of the model. The real cost is checked on real visits after launch (§1.2). Owner decision 2026-10-12 |
| D-06 | Two LCP levers are built: (a) the Shell scripts as one file; (d) the contours below the first screen leave the HTML (D-10). Rejected: a preload for Schibsted Grotesk only, and `fetchpriority="low"` on the Web Analytics script or on the JetBrains Mono preload. The two font preloads, their budget check and the `CLAUDE.md` line stay as they are. The limit of 2.0 s is not changed | §1.5: (a) and (d) each take about 150 ms off and add up (1818 ms with the script blocked); the rejected levers change nothing on top of them. Owner decision 2026-10-12 |
| D-07 | The role wording is not unified. The home page says "Software Engineer" and "Full Stack Developer", the CV says frontend developer with backend experience. Each page keeps its own | "Software Engineer" is the broader frame on the home page, the CV narrows it and is tailored per vacancy (Owner decision 2026-10-12; closes B-61) |
| D-08 | The production deploy command becomes `npm run build && npx wrangler deploy`, set by the Owner in the Workers Builds settings together with the merge | Roadmap step 6: v2 has a build step, the stub had none |
| D-10 | The contours of the closing band and of the mobile menu are one image file, shown with `<img loading="lazy" alt="">` inside the same layer element as today. Both places use the spruce tone, whose colour is one value in Dag and in Natt (`--fjord-contour-line-spruce`; the band and the menu are spruce in both themes), so the file carries that colour and a theme switch changes nothing. The file is generated from the contour data and the token by a script under `tools/`, and a unit test fails if its colour differs from the token. The band's contours are mirrored with a transform, so one file serves both places. The hero contours stay inline: they follow the theme (`--fjord-color-contour-line`) and drift | The request must not happen before the first paint, or the model counts it and the gain shrinks. A lazy image far below the first screen is asked for only when the Visitor scrolls near it; the mobile menu is a closed dialog, which is not rendered, so its image is asked for when the menu opens. Known cost: on the first opening of the menu the contours appear a moment after the panel. The built levers are measured again before the task is done (AC-06). Owner decision 2026-10-12 |
| D-11 | A shipped spec carries `status: Shipped` in its front matter | It is the word the roadmap uses for shipped steps, and a public repository should not show live features as drafts. Checked on 2026-10-12: nothing reads the status of a spec and expects `Draft`, neither the skills, agents and templates of the SDD plugin (2.2.1; its templates only write the first value) nor the scripts, tools, tests and workflows of this repository. Owner decision 2026-10-12 |
| D-09 | `main` is protected right after the merge with the required checks `check` and `visual`, by the command of T16 option 2 | T16 (fjord-foundation); a protection set before the merge would block the merge itself |

### 1.4 Description drafts

Final texts are shown to the Owner before the commit (AC-08). The home draft lists the sections the home page renders today: key facts, About, experience, contact. Titles and the preview image do not change. The layout has no length limit for a description; the drafts stay under 160 characters.

| Page | Now | Draft |
|---|---|---|
| Home | "Alexander Ponomarenko, Software Engineer and Full Stack Developer based in Oslo, Norway." | "Full stack developer in the Oslo area, open to work. React, Angular, TypeScript and Python. Key facts, background, experience and contact details." |
| English CV page (C-25) | "CV of Alexander Ponomarenko, frontend developer with backend experience: skills, work experience and education. Read it here or download the PDF." | "Frontend developer with backend experience: skills, work experience and education. Read it here or download the PDF." |
| Norwegian CV page (C-27) | "CV for Alexander Ponomarenko, frontend-utvikler med backend-erfaring: kompetanse, arbeidserfaring og utdanning. Les den her eller last ned PDF-en." | "Frontend-utvikler med backend-erfaring: kompetanse, arbeidserfaring og utdanning. Les CV-en her eller last ned PDF-en." |

The Owner picks between two endings of the home text when the final texts are shown: "Key facts, background, experience and contact details." (the draft above) or "Background, experience and how to reach me.".

In the Norwegian draft "Les den her" became "Les CV-en her": without the opening "CV for …" the pronoun has nothing to point to.

### 1.5 LCP measurements of 2026-10-12

Home page, Lighthouse mobile (`@lhci/cli` 0.15.1, Lighthouse 12.6.1) against `wrangler dev` on the Owner's machine, one session. LCP in ms: median (lowest to highest). The LCP element is the portrait in the hero in every run. "Blocked" means the address of the Web Analytics script is blocked in Lighthouse.

| Variant | Runs | Script loaded | Script blocked |
|---|---|---|---|
| Baseline (v2 with the script of D-01) | 10 | 2420 (2416 to 2425) | 2118 (2115 to 2121) |
| Baseline again, at the end of the session | 6 | 2419 (2417 to 2432) | 2121 (2113 to 2130) |
| (a) Shell scripts as one file | 6 | 2345 (2311 to 2409) | 1967 (1966 to 1968) |
| (b) preload for Schibsted Grotesk only | 6 | 2352 (2325 to 2375) | 2053 (1974 to 2128) |
| (c) `fetchpriority="low"` on the Web Analytics script | 6 | 2418 (2416 to 2422) | 2119 (2118 to 2122) |
| (c) `fetchpriority="low"` on the JetBrains Mono preload | 6 | 2373 (1968 to 2422) | 2117 (2116 to 2123) |
| (d) the two contour layers below the first screen removed from the HTML | 6 | 2268 (2267 to 2271) | 1967 (1963 to 1972) |
| (a) + (b) | 6 | 2362 (1821 to 2390) | 1975 (1969 to 1982) |
| (a) + (d) | 6 | 2210 (2148 to 2221) | 1818 (1816 to 1821) |
| (a) + (b) + (d) | 6 | 2183 (2155 to 2228) | 1821 (1817 to 1823) |
| The script added by the site's own code after the load event | 6 | 3014 (2930 to 3107) | 2321 (2316 to 2344) |
| (a) + (d) as built (T5 and T7, at e4bf9fb, the same day) | 10 | not measured | 1820.5 (1809 to 1835) |

What the numbers show:

- The values move in steps of about 150 ms (1820, 1970, 2120, 2420). These are the two clusters of B-38 and the steps around them.
- On a local run every request of the page ends within about 130 ms and Lighthouse's first paint comes at about 320 ms, so the simulated slow network counts all of them. The LCP in Lighthouse therefore follows the number of requests and of third-party origins before the first paint, not their order or priority.
- (d) was measured as an upper bound: the two layers were removed, not replaced. D-10 is measured as built.
- As built (AC-06): ten runs of the home page through `lhci collect` with the configuration of `lighthouserc.cjs` gave 1809, 1816, 1817, 1820, 1820, 1821, 1824, 1834, 1834 and 1835 ms, a median of 1820.5 ms, under the 1850 ms of AC-06 and the same step as the upper bound of (a) + (d). No run asked for the contour image, and the request for the Web Analytics script is listed as blocked (no status, 0 bytes). The `npm run lhci` run that followed passed: `/` 1812, 1816 and 1817 ms; `/404` 1667 to 1668 ms; `/cv/en` 1665 to 1818 ms; `/cv/no` 1664 to 1671 ms. With the script loaded the built levers were not measured again; D-05 keeps the script out of every audit.
- Not measured: CI. The one CI failure of B-86 (2000 ms) is on the same step as the local baseline with the script blocked.

Every audited page, `npm run lhci` (three runs per page, the script's address blocked), LCP in ms. "Before the levers" is the run at 2a9bba0 (T4: the script in the page and blocked, the levers not built); "final" is the run before the push of 15d13b9.

| Page | Before the levers | Final |
|---|---|---|
| `/` | 2121, 2122, 2136 | 1817, 1819, 1821 |
| `/404` | 1690, 1821, 1823 | 1661, 1665, 1666 |
| `/cv/en` | 1970, 1971, 1972 | 1662, 1668, 1816 |
| `/cv/no` | 1968, 1970, 1973 | 1665, 1816, 1822 |

Every page is faster than before the levers and none is above 1900 ms. The level of about 1816 ms on the CV pages is the existing step of about 150 ms (the first bullet above), not a regression: the same pages also give about 1665 ms in the same run.

## 2. Goals

- The Owner can see, from launch day, how many Visitors open the site and its pages, without cookies.
- The LCP gate of the home page passes with room to spare, so it does not block merges into `main`.
- A Recruiter who meets a page in a search result or a link preview reads what the page holds.
- alpon.dev serves v2, and nothing reaches `main` without the checks.

## 3. Non-goals

- Step 7 (Projects) and everything after it: not started, not built in parallel.
- Custom events (PDF downloads, contact clicks): Web Analytics counts page views; events need their own decision.
- A consent banner: the script uses no cookies and no browser storage (Cloudflare, RUM beacon).
- A separate preview image for the CV pages: backlog (§1.2).
- A change of the LCP limit or of the Lighthouse aggregation (B-38, Owner decision 2026-10-07).
- Unifying the role wording (D-07).

## 4. User stories

### US-01: See the visits

**As an** Owner
**I want** visits to the site counted from launch day without cookies
**So that** I can tell whether Recruiters open the site and the CV

### US-02: Read what the page holds

**As a** Recruiter
**I want** the description under a link to say what I find on the page
**So that** I open the right page without reading the name twice

### US-03: A fast first screen

**As a** Visitor on a phone
**I want** the home page to show its first screen quickly
**So that** I do not leave before I see who Alexander is

### US-04: Release without regressions

**As an** Owner
**I want** v2 on alpon.dev with the checks required on `main`
**So that** a broken change cannot reach the live site

## 5. Acceptance criteria

### AC-01 (US-01) — happy

**Given** any built page of the site, the Not-found page and the Styleguide included
**When** it is read
**Then** it holds the Web Analytics script of D-01 once, as the last element of the body, and no other third-party script

### AC-02 (US-01) — domain invariant

**Given** any response of the site
**When** its security policy is read
**Then** there is exactly one policy; it names the site itself, the hash of the Theme bootstrap and the one script file of D-02 as script sources, and the site itself and the one endpoint of D-02 as connection targets; it grants no inline or evaluated script

### AC-03 (US-01) — error

**Given** a page of the site open in a browser
**When** a script from an origin the policy does not name is added to it, or an inline script
**Then** the browser refuses it, as before this feature

### AC-04 (US-01) — error

**Given** the test suites of the site (e2e, accessibility, visual)
**When** they run with the script's host unreachable
**Then** they give the same results, and no test run sends a visit to Web Analytics (D-03)

### AC-05 (US-01) — domain invariant

**Given** the built pages
**When** the budgets are checked
**Then** the site's own scripts stay within their budgets as before, and the Web Analytics script is not counted (D-04)

### AC-06 (US-03) — domain invariant

**Given** the home page with the Web Analytics script in place and the levers of D-06 built as D-10 says
**When** its LCP is measured locally with Lighthouse, the script's address blocked (D-05), in at least six runs
**Then** the median is at or below 1850 ms and the numbers are recorded in this spec; the LCP gate of Lighthouse CI stays at 2000 ms and passes locally and in CI. On a load of the home page the contour image is not asked for before the Visitor scrolls towards the closing band or opens the mobile menu. The closing band and the mobile menu look as before in Dag and Natt, the other budgets of the quality bar hold on every page, and the visual tests show no difference the Owner has not approved

### AC-07 (US-02) — happy

**Given** the home page, the English CV page and the Norwegian CV page
**When** a Recruiter reads the description in a search result or a link preview
**Then** it does not repeat the name; it says what the page holds, from the sections the page really renders, in the page's own role wording (D-07) and the page's own language; the title and the preview image are as before; and the description of the link preview equals the page description

### AC-08 (US-02) — authorization

**Given** the three final description texts
**When** they are ready to be committed
**Then** the Owner has seen all three and approved them first; rows C-25 and C-27 of the Claims list carry the approved CV texts with the Owner's tick, and the home text is recorded with the Owner's tick in the home owner inputs

### AC-09 (US-04) — happy

**Given** the pull request of this feature merged into `v2`, with no item of the parity list left switched off
**When** `v2` is merged into `main` and the Owner has set the deploy command of D-08
**Then** alpon.dev serves v2: the home page, the CV pages in both CV languages, the Short CV address, the short links and the downloads answer as the parity list says

### AC-10 (US-04) — authorization

**Given** `main` after the merge
**When** the Owner applies the protection of D-09
**Then** a change cannot be merged into `main` unless `check` and `visual` are green, for administrators too, and reading the protection back shows both checks

### AC-11 (US-04) — cross-context

**Given** v2 live on alpon.dev
**When** the Owner opens an address that does not exist
**Then** the Not-found page of the site is shown, not a bare text, and its response carries the policy of AC-02

### AC-12 (US-01) — cross-context

**Given** v2 live on alpon.dev and the site set as D-01 says
**When** the Owner opens the site from Norway and then the Web Analytics dashboard
**Then** the visit is listed with Norway as its country, and the result is recorded in the changelog (OQ-02 says what happens if it is not). The script is in every build, so visits to preview addresses and to a local server are counted under the same token: the Owner checks that the dashboard can show the numbers of the host alpon.dev only, and the changelog says that the numbers are read with that filter

## 6. Non-functional requirements

The quality bar of `CLAUDE.md` applies unchanged, with the one exception of D-04.

| Aspect | Target | Measurement |
|---|---|---|
| LCP of the home page (Lighthouse mobile, the Web Analytics script blocked) | median ≤ 1850 ms over at least 6 local runs; every Lighthouse CI run ≤ 2000 ms | local Lighthouse runs recorded in this spec; `npm run lhci`, locally and in the `quality` job |
| Every audited page (Lighthouse mobile) | LCP ≤ 2000 ms, CLS ≤ 0.02, TBT ≤ 100 ms, each category score ≥ 95, as before | `npm run lhci` |
| The site's own initial JS per page | ≤ 50 KB gzip; Shell scripts ≤ 5 KB, page scripts ≤ 10 KB | the budget check of the `quality` job |
| Running cost | 0 paid services added | the Cloudflare account's billing page after launch (Owner) |

## 7. Test plan

| AC | Level | Test |
|---|---|---|
| AC-01 | unit | `BaseLayout` test: the script is the last element of the body, once, on a normal and a noindex page; a test on the built pages: every page holds it once and no other script from another origin |
| AC-02 | unit, e2e | `csp.build.test.ts` (the contract line); `headers.spec.ts` (home, a not-found response, a CV PDF): exact `script-src`, exact `connect-src`, one header; `parity.spec.ts` P-16 with the new pattern |
| AC-03 | e2e | `headers.spec.ts`, the existing two refusals, unchanged |
| AC-04 | e2e | the local answer of D-03 in the shared Playwright setup; one test that a page load makes no request that leaves the machine |
| AC-05 | unit | the existing budget check, unchanged, green |
| AC-06 | unit, e2e, measurement, visual | unit: the Shell loads one script file; the contour image carries the colour of the token; the band and the menu hold the lazy image and no inline contours. e2e: a load of the home page asks for no contour image, scrolling to the closing band does, opening the mobile menu does. Measurement: at least six local Lighthouse runs of the built levers, recorded in §1.5; then `npm run lhci` and the `quality` job. Visual: the `visual` job, where a full-page screenshot waits for the lazy image; new baselines only for differences the Owner approved |
| AC-07 | unit | home, `en.test.ts`, `no.test.ts`: the exact approved texts, none contains the name; the existing check that the preview description equals the page description |
| AC-08 | Owner | approval in the pull request; `owner-inputs.md` rows C-25 and C-27 |
| AC-09 | e2e, Owner | `parity.spec.ts` green with no `test.fixme`; the Owner's smoke check on alpon.dev |
| AC-10 | Owner | the read-back command of T16 |
| AC-11, AC-12 | Owner | smoke check on alpon.dev, recorded in the changelog |

Not covered: the content of the script itself, which Cloudflare can change at any time (D-01); visits lost to content blockers, which block the script by its address.

## 8. Open questions

| # | Question | Owner | Due |
|---|---|---|---|
| OQ-02 | If a visit from Norway is not listed (AC-12), the exclusion of EU visitors applies to the script in the page too. What then: accept it, or ask Cloudflare, or choose another free cookieless counter in a later spec. Closed: the smoke check of 2026-10-13 lists visits from Norway in Web Analytics, so the EU exclusion does not apply to the snippet in the page | Owner | at the smoke check, on launch day |
