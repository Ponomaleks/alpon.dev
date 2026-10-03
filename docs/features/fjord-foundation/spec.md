---
status: Draft
owner: "Alexander Ponomarenko"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-10-03"
feature_size: "S"
---

# Spec — fjord-foundation

> **Glossary:** [CONTEXT](../../../CONTEXT.md) (repo root; this feature has no feature-level CONTEXT)
> **Reference module / docs / channels used:** `CLAUDE.md`; `docs/roadmap.md` step 2 and D1; `docs/idea-brief.md` §2, §4, §6; `docs/stub-parity.md` P-16, P-26, P-41; `docs/architecture-map.md` (Frontend / UI foundation, risks); `docs/reference/01-foundations.md` §2–§4; `design/brand/BRAND.md`; `design/handoff/design-system/project/readme.md` (theme bootstrap); `design/handoff/design-system/project/components/feedback/NotFound.jsx`; `design/handoff/site/project/site/Misc.jsx` (not-found screen).

## 1. Context

v2 of alpon.dev has a working skeleton but no visual identity yet: pages render in browser defaults, the not-found page is unstyled text, and there is no theme. Every v2 page (Home, CV, later Projects) needs the same Fjord base before it can be built: tokens, brand fonts, the Dag/Natt theme and one shared page layout. Without it, a Recruiter opening the site on a phone sees an unfinished page, and each later step would solve color, type and theme again on its own.

Why now: Alexander is in an active job search in Norway, and the temporary stub on `main` represents him until v2 reaches stub parity (`idea-brief.md` §2, §4, §6). Fjord foundation is wave 1 of the roadmap: Base components (step 3), Home (step 4) and CV (step 5) all build on it. It also owns three parity items: P-16 (strict security policy with the theme bootstrap allowed by a hash), P-26 (critical fonts preloaded) and P-41 (the not-found page).

Committed approach: build the foundation layer once and make it guard itself. Fjord tokens are the only source of visual values; the theme is decided before the first frame (the stored Theme choice, else the device preference, and still correct when scripts are off); the brand fonts are self-hosted with size-matched fallbacks so nothing jumps; and build-time checks block contrast regressions, values written outside the tokens, and a security policy that no longer matches the theme bootstrap. The not-found page is the first real page on this layer and is its visual test surface until the styleguide arrives in step 3.

Traceability:
- Parity items P-16, P-26 and P-41 flip from `fixme` to `test` in this feature (roadmap lane rule "a parity id flips in the step that builds the behaviour").
- Roadmap D1: the missing Natt reference screenshots are captured from `design/handoff/site/alpon.dev standalone.html` together with this feature's visual tests.
- `docs/reference/01-foundations.md` §9 asked to fail the build on long and en dashes; `CLAUDE.md` now allows them, so that check is not carried over (CLAUDE.md and SDD artifacts win over early drafts).
- The design's not-found screen offers "See projects" as a second action. Per the roadmap decision "Projects never go public empty", that action appears only once a Published project exists; step 7 owns the positive case.
- The component demo's not-found code line reads "404 · <requested path>"; the page design reads "404 / Ikke funnet". This feature shows "404 · Ikke funnet" (P-41, Norwegian warm detail) and does not echo the requested address back, which keeps the page free of scripts. Interim 404, see §8 OQ-02; rebuilt in step 3 per Misc.jsx. Listed as a design difference in the PR.
- Fonts: `BRAND.md` lists JetBrains Mono 400/500; `CLAUDE.md` requires 400/500/700 because the design system uses 700. Shipping 700 adds a weight the design uses and does not break any brand rule; noted in the PR.

## 2. Goals

- Every v2 page starts from one Fjord layer: it looks right in Dag and Natt from the first frame, in brand type, at every breakpoint, with no per-page setup.
- The foundation's quality is enforced by the build, not by memory: readable contrast, token-only values and a matching security policy are checked on every change.
- v2 moves closer to Release 1: the three stub-parity items this step owns (P-16, P-26, P-41) are met.

## 3. Non-goals

- A visible theme switch (ThemeToggle), Header, Footer, SkipLink and the other base components — step 3 builds them on this layer; here the Theme choice is only read, not offered.
- The styleguide page — step 3; until then the not-found page is the only visual test surface, and the placeholder home is checked by accessibility and Lighthouse runs only.
- Animated theme and page transitions — they arrive with the theme switch in step 3; nothing in this feature moves.
- Article typography (Prose) and code highlighting — step 7, where they are first used.
- Real Home and CV content — steps 4 and 5; the home placeholder only inherits the shared layout.

## 4. User stories

### US-01: Theme from the first frame

**As a** Recruiter
**I want** the site to open in the light or dark theme my phone already uses, without a flash of the other one
**So that** the first impression is calm and finished

### US-02: Remembered Theme choice

**As a** Visitor
**I want** the theme I picked earlier to be used again when I come back
**So that** I don't have to switch it on every visit

### US-03: Brand type that holds still

**As a** Recruiter
**I want** text in the brand fonts, including æ ø å, that does not jump when the fonts arrive
**So that** I can start reading right away

### US-04: A way back from a dead link

**As a** Visitor following an outdated or mistyped link
**I want** a Fjord "Ikke funnet" page with a clear way back
**So that** I can still reach Alexander instead of leaving

### US-05: Only allowed scripts run

**As a** Tech lead
**I want** pages that run only scripts the site explicitly allows
**So that** I can see the site is built with care for security

### US-06: Guardrails for the Owner

**As the** Owner
**I want** every new page to get the Fjord base for free, and the build to stop me when a change breaks contrast, bypasses the tokens or desyncs the security policy
**So that** later steps cannot erode the foundation

### US-07: Calm for reduced motion

**As a** Visitor who prefers reduced motion
**I want** nothing on the page to move or loop
**So that** the site is comfortable to use

## 5. Acceptance criteria

### AC-01 (US-01) — happy

**Given** a Recruiter with no stored Theme choice whose device prefers dark
**When** they open any page of the site
**Then** the first rendered frame is already Natt and the page stays Natt, with native controls and scrollbars dark too; with a device that prefers light, the same holds for Dag

### AC-02 (US-02) — happy

**Given** a Visitor whose stored Theme choice is Dag while their device prefers dark
**When** they open any page of the site
**Then** the page renders in Dag from the first frame, and the mirror case (choice Natt, device light) renders in Natt

### AC-03 (US-02) — error

**Given** a Visitor whose stored Theme choice cannot be used (an unknown value, or the browser blocks site storage)
**When** they open any page of the site
**Then** the page falls back to the device preference, renders normally and shows the Visitor no error

### AC-04 (US-01) — error

**Given** a Visitor whose browser has scripts turned off
**When** they open any page of the site
**Then** the page still renders in the theme that matches the device preference, in brand fonts, with readable contrast

### AC-05 (US-03) — happy

**Given** a Recruiter on a phone opening the site for the first time, with nothing cached
**When** the brand fonts finish loading
**Then** headings and body text are set in Schibsted Grotesk and technical labels in JetBrains Mono, Norwegian letters æ ø å render in the brand fonts, and no text visibly shifts when the fonts swap in

### AC-06 (US-03) — happy

**Given** a Visitor opening any page of the site
**When** the page starts loading
**Then** only the two critical font files (Schibsted Grotesk regular and semibold) are requested ahead of rendering, and every other weight loads only when the page uses it

### AC-07 (US-04) — happy

**Given** a Visitor opens an address the site does not have
**When** the page loads
**Then** the browser receives a not-found response together with the Fjord Not-found page: the code line "Ikke funnet" in the design's not-found format, the title "Page not found", a short explanation and a primary "Back to home" action that leads to the home page; the page asks search engines not to index it and does not repeat the requested address back

### AC-08 (US-04) — cross-context

**Given** the site has no Published project yet
**When** a Visitor sees the Not-found page
**Then** it offers only "Back to home" and no action that leads to an empty projects section, because projects are never shown publicly while there are none

### AC-09 (US-05) — authorization

**Given** a page carries the theme bootstrap that the site's security policy names explicitly
**When** any other inline script, or a script from another origin, appears in that page
**Then** the browser refuses to run it while the theme bootstrap still runs; the policy never grants a blanket permission for inline scripts

### AC-10 (US-06) — domain invariant

**Given** the Owner changes a Fjord token so that a text and background pair in Dag or Natt falls below the readable contrast level
**When** the checks run on that change
**Then** they fail and name the pair, the theme and the measured ratio, because every text pair must stay readable in both themes

### AC-11 (US-06) — domain invariant

**Given** the Owner writes a color, size, space, radius, duration or easing directly in a page or component style instead of using a Fjord token
**When** the checks run on that change
**Then** they fail and point to the file and line, because Fjord tokens are the only source of visual values

### AC-12 (US-06) — cross-context

**Given** the Owner changes the theme bootstrap
**When** the site is built
**Then** the security policy delivered with the pages allows exactly the new bootstrap with no manual edit, and a build whose policy and bootstrap disagree fails before it can be deployed

### AC-13 (US-06) — happy

**Given** the Owner adds a new page on the shared layout with only a title and a description
**When** the site is built
**Then** the page has its language, title, description, theme bootstrap, critical font hints, Fjord tokens and base styles without any per-page setup

### AC-14 (US-07) — happy

**Given** a Visitor whose device asks for reduced motion
**When** any page of the site renders
**Then** no element moves, slides or loops; at most an element fades

### AC-15 (US-03) — happy

**Given** a page that uses any weight of the design system (Schibsted Grotesk regular, medium, semibold or bold; JetBrains Mono regular, medium or bold)
**When** a Visitor opens it
**Then** that weight comes from the site itself, renders from its own font file rather than a browser-synthesized bold, and includes æ ø å

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Layout shift (CLS), mobile, cold cache | ≤ 0.02 on the not-found page and the home placeholder | Lighthouse CI (mobile) on the built site |
| Largest Contentful Paint, mobile | ≤ 2.0 s | Lighthouse CI (mobile) |
| Lighthouse categories | Performance, Accessibility, Best Practices, SEO each ≥ 95; SEO is not asserted on the noindex not-found page, because Lighthouse's crawlability audit fails a noindex page by design | Lighthouse CI (mobile) |
| Total Blocking Time | ≤ 100 ms | Lighthouse CI (mobile) |
| Initial JS per page | ≤ 50 KB gzip in total; the render-blocking theme bootstrap ≤ 1 KB unminified | build output size check in CI |
| Critical font weight | exactly 2 preloaded font files, ≤ 60 KB combined; every shipped font file ≤ 30 KB | e2e head check (P-26) + file size check |
| Wrong-theme frames | 0 across the 6 combinations (stored Dag / Natt / none × device light / dark) | e2e test reading the theme before first paint |
| Contrast | body text ≥ 4.5:1; large text, UI borders and focus ring ≥ 3:1; every semantic text/background pair in Dag and Natt | contrast check script in CI |
| Accessibility | 0 axe violations on the not-found page and home placeholder, in Dag and Natt | axe in Playwright |
| Visual regression | ≤ 0.1% differing pixels per screenshot against the approved baseline, not-found page at 390 / 834 / 1440 in Dag and Natt | Playwright visual tests in CI |
| Design match | 0 undocumented differences between the not-found page and the design reference at 390 / 834 / 1440 in Dag and Natt | manual review in the PR: screenshots side by side with the listed differences |

## 6.1 Security / privacy

- **Data classification:** public — the site is a public personal page; nothing in this feature is private.
- **Personal data touched:** none. The Theme choice is a single "dag"/"natt" value kept only in the Visitor's own browser; it is never sent to the site or anyone else, and no cookie is set.
- **AuthZ/AuthN impact:** no accounts or sign-in. The security policy is tightened: scripts run only from the site itself plus the one theme bootstrap named by its fingerprint; the fingerprint is regenerated by the build.
- **Abuse cases:**
  - Injected script (through a future content source or a compromised page): the browser refuses to run any script the policy does not name (AC-09).
  - Tampered Theme choice value in the Visitor's storage: anything other than the two known themes is ignored and the device preference decides (AC-03).
  - Reflected content on the not-found page (a crafted address shown back to the Visitor): the page never repeats the requested address (AC-07).
  - Framing the site inside another site to mislead Visitors: the existing policy keeps forbidding framing by other origins; this feature must not loosen it.
- **Security review:** Required (lightweight) — the security policy is changed and is now generated by the build; review the delivered policy on the preview URL before merge.

## 7. Metrics / KPIs

- **Open stub-parity items (`test.fixme` in the parity suite)** — baseline: 14, target: 11 when this feature merges into `v2` (P-16, P-26, P-41 flipped and green).
- **Visual values written outside Fjord tokens** — baseline: 0 (no styles exist yet), target: 0 on every PR from this feature on.
- **Wrong-theme frames in the e2e theme matrix** — baseline: not measurable (no theme yet), target: 0 of 6 combinations on every PR.
- **Lighthouse mobile, not-found page** — baseline: measured on the unstyled skeleton at the start of implementation, target: Performance, Accessibility and Best Practices ≥ 95 when this feature merges. SEO is not asserted on this page: it is noindex, and Lighthouse's crawlability audit fails a noindex page by design.

## 8. Open questions

- **OQ-01 — Dag warning pair under 4.5:1** (from review 2026-10-02). `--fjord-color-warning` on `--fjord-color-warning-soft` measures 4.40:1 in Dag. It stays in the contrast manifest as a named known failure, printed on every run of the contrast check, until the design source is fixed: the Owner darkens the Dag warning color in Claude Design and re-exports, then the pair moves to the normal passing pairs. Owner: Alexander Ponomarenko. Due: before roadmap step 7 (Callout) is built.
- **OQ-02 — The Not-found page does not match the site page design** (from the Owner's design-match check, 2026-10-03). The page was built from the design-system component demo (`design/handoff/design-system/project/components/feedback/NotFound.jsx`), but the page design is the 404 screen in `design/handoff/site` (`project/site/Misc.jsx`, which renders the site's newer `NotFound`; screenshots `design/screenshots/{dag,natt}_not_found_{390,834,1440}.png`). Differences that were not documented:
  1. The map panel is missing: grid, contour terrain, dashed route, the "You are here" pin outside the map, and the coordinates "59.91° N · 10.75° E" in mono.
  2. Layout: the design has two columns (text left, map right); the page has one column with the ridge as a background.
  3. Heading: the design says "This page is off the map."; the page says "Page not found".
  4. Code line separator: the design says "404 / Ikke funnet"; the page says "404 · Ikke funnet".
  5. Body copy: the design body starts "The link may be old, or the page has moved." ("This page is off the map." is the heading); the page body (`src/pages/404.astro:38`) starts "This page is off the map. The link may be old, …".
  6. Title scale: the design uses `--fjord-text-h1`, semibold, `--fjord-tracking-heading`, `--fjord-leading-heading` and `text-wrap: balance` (site `_ds` `feedback.css:44`); the page uses `--fjord-text-display` with display tracking and leading (`404.astro:116-120`).
  7. Sticky action bar at 390: the design shows "View CV / Get in touch" on every page except the CV (`site/App.jsx:127`, `dag_not_found_390.png`); the page has none. Roadmap step 3 builds it as part of MobileBar.
  8. Code line colour: the design colours "404" with the link colour (`.fj-eyebrow b`, site `_ds` `content.css:4`) and the rest of the line muted; the page colours the whole line muted (`404.astro:107-114`).
  9. Spacing and alignment: the design has a text gap of `--fjord-space-5`, section padding `--fjord-space-404` top and `--fjord-space-section` bottom, and `align-items: center` (site `_ds` `feedback.css:41-43`); the page has a gap of `--fjord-space-4`, padding `--fjord-space-12` and the content at the bottom of the section (`404.astro:72-80`). `--fjord-space-404` and `--fjord-space-5` are not in `src/styles/tokens.css`; step 3 adds what it needs.
  10. Button size: the design "Back to home" is the default `.fj-btn` (padding `0 --fjord-space-5`, gap `--fjord-space-3`, `--fjord-text-ui`, site `_ds` `actions.css:2`), about 170 px wide at 1440 in the screenshots; the page `.home-link` (`404.astro:138-154`) has padding `0 --fjord-space-4`, gap `--fjord-space-2` and `--fjord-text-body-sm`, about 155 px. The CSS values are confirmed in the site `_ds`; the pixel widths are to confirm against the page design in the built page.

  Intentional and already documented (§1 Traceability, `screens.md`): the requested path is not echoed (the design's "Nothing lives at /path" is omitted), no "See projects" until step 7, no Header, Footer or sticky action bar (the design's "View CV / Get in touch" at 390) until step 3. Decision: do not rebuild in this feature. Items 1–10 go to the PR's design-deviation list, and roadmap step 3 rebuilds the page per the site design and re-baselines the 404 visuals. AC-07's wording ("Page not found", "404 · Ikke funnet") and P-41 are updated by the step 3 spec. Owner: Alexander Ponomarenko. Due: step 3 (Base components).

## Test plan

Size S, route quick: the plan lives here instead of a separate file. Levels follow `sad.md` `target_surfaces: [web-frontend]`. "Integration" means a check against a real, fresh production build in a throwaway output directory served with production routing; the site has no datastore (repo ADR-0003). `implement` picks the concrete runners from the repo.

### AC coverage

| AC (spec.md §5) | Test name (intent-based) | Level | Expected outcome |
|---|---|---|---|
| AC-01 | first frame follows a dark device preference when nothing is stored | e2e-through-UI | the theme marker is set once, to Natt, already at the first animation frame and unchanged at load; native controls report a dark color scheme |
| AC-01 | first frame follows a light device preference when nothing is stored | e2e-through-UI | same as above for Dag with a light color scheme |
| AC-01 | Not-found page in Natt matches its approved baseline | visual-regression | 390 / 834 / 1440 in Natt differ from the baseline by ≤ 0.1 % of pixels |
| AC-01 | both generated Natt blocks carry identical values | unit | the scripted Natt block and the no-script Natt block list the same tokens with the same values |
| AC-02 | stored Dag wins over a dark device | e2e-through-UI | Dag from the first frame through load |
| AC-02 | stored Natt wins over a light device | e2e-through-UI | Natt from the first frame through load |
| AC-02 | bootstrap honours a valid stored choice in isolation | unit | the bootstrap source file (`src/scripts/theme-bootstrap.js`, read as raw text, unchanged) run in an isolated script context with stubbed storage, media query and root element sets the marker to the stored `dag` / `natt` for both device preferences |
| AC-03 | unknown stored value falls back to the device preference | e2e-through-UI | the value is ignored, the theme follows the device, no error is shown and nothing is logged as an uncaught error |
| AC-03 | blocked site storage falls back to the device preference | e2e-through-UI | storage access throws, the page still renders in the device theme with no visible error |
| AC-03 | bootstrap rejects every unusable stored value in isolation | unit | same isolated run as the AC-02 unit row, for `DAG`, ` natt`, empty, missing, `foo` and a storage read that throws, each × device light / dark: the marker is always exactly `dag` or `natt` and equals the device preference |
| AC-04 | scripts off, device dark, renders Natt | e2e-through-UI | no theme marker, Natt colors from the no-script block, brand fonts applied |
| AC-04 | scripts off, device light, renders Dag | e2e-through-UI | Dag colors, brand fonts applied |
| AC-04 | scripts-off pages pass the accessibility scan | e2e-through-UI | zero violations, including contrast, on home and Not-found in both device preferences |
| AC-05 | fallback faces match the brand font metrics | unit | the computed size and ascent / descent / line-gap overrides of each fallback face equal the values derived from the brand font metrics |
| AC-05 | brand files contain the Norwegian letters | unit | the character map of every shipped brand file includes æ ø å |
| AC-05 | text boxes do not move when the brand fonts swap in | e2e-through-UI | with brand fonts blocked the metric-matched fallback face renders; after they load, measured on the heading and body text runs (not their block boxes): the same line count, text height and top within ≤ 1 px, run width within ≤ 5 % (`size-adjust` matches only the average glyph width; review 2026-10-02 F-10, Owner decision); runs only in the CI Linux environment with the Roboto fallback installed and no Arial |
| AC-06 | budget check rejects a wrong preload set | unit | fixtures with 1, 3, or two over-60 KB preloads fail, naming the page and the sizes |
| AC-06 | real build preloads exactly the two critical files | integration | every built page preloads Schibsted Grotesk regular and semibold only, ≤ 60 KB combined |
| AC-06 | only critical fonts are requested before render | e2e-through-UI | before first render only the two critical files are requested; any other weight is requested only on a page that uses it |
| AC-07 | unknown address returns the Fjord Not-found page | e2e-through-UI | not-found response; code line "404 · Ikke funnet" marked Norwegian, title "Page not found", the explanation, one primary "Back to home" link; page is marked noindex |
| AC-07 | "Back to home" leads to the home page | e2e-through-UI | following the link lands on `/` and the home placeholder renders |
| AC-07 | a crafted address containing markup is not echoed back | e2e-through-UI | not-found response; the requested path appears nowhere in the DOM and nothing from it executes |
| AC-07 | Not-found page matches its approved baselines | visual-regression | 390 / 834 / 1440 × Dag / Natt each differ by ≤ 0.1 % of pixels |
| AC-08 | Not-found offers no route into an empty projects section | e2e-through-UI | no "See projects" action and no link into a projects path; "Back to home" is the only action |
| AC-09 | an injected inline script is refused while the bootstrap runs | e2e-through-UI | a script element added to the page does not execute and the browser reports a policy violation; the theme marker is still set by the bootstrap |
| AC-09 | a script from another origin is refused | e2e-through-UI | the external script is blocked by the policy and never executes |
| AC-09 | the policy generator never grants blanket inline scripts | unit | for every fixture the generated policy carries the bootstrap fingerprint and never `'unsafe-inline'` or `'unsafe-eval'` |
| AC-10 | a lowered contrast pair fails the check | unit | a fixture with one pair under its threshold fails, naming the pair, the theme and the measured ratio |
| AC-10 | generator fails on a brand vs handoff palette conflict | unit | a fixture where the brand and handoff sources give one token different values fails, naming the token and both values (ADR-0001) |
| AC-10 | the real tokens pass the contrast check | integration | every manifest pair in Dag, Natt and on-spruce meets its threshold on the generated tokens |
| AC-11 | each kind of hard-coded visual value is reported | unit | fixtures with a raw color, size, space, radius, duration and easing each fail, naming the file and line; token-only styles pass |
| AC-11 | generator check mode fails when tokens.css is stale | unit | with a design source changed and `tokens.css` not regenerated, the generator's `--check` mode fails naming the file; a fresh `tokens.css` passes (ADR-0001) |
| AC-11 | the repo styles are token-only | integration | the style check over all page and component styles reports zero findings |
| AC-12 | the build refuses a policy and bootstrap that disagree | unit | each of the four ADR-0002 fail rules fails with a named reason and page: an executable inline script other than exactly one bootstrap copy (no type, `text/javascript`, `module`, a second bootstrap copy), an inline style or handler attribute, the hash placeholder left unsubstituted, more than one policy line; a structured-data block passes in any type casing |
| AC-12 | changing the bootstrap updates the delivered policy with no manual edit | integration | after editing the bootstrap and rebuilding, the generated header carries the new fingerprint; a deliberately mismatched build fails before output is finalized |
| AC-12 | the delivered header matches the agreed policy contract | contract | the built header file has one rule for all paths and exactly the directive set and values in `tests/contracts/csp.contract.json`: `frame-ancestors 'self'`, no `'unsafe-inline'` / `'unsafe-eval'`, no wildcard sources; an intentional policy change updates the contract in the same PR |
| AC-12 | every response carries the current policy | e2e | home, a not-found response and the EN CV PDF each carry exactly one policy header with the current fingerprint |
| AC-13 | a page with only a title and description inherits the full head | integration | a fixture page built on the shared layout has the language, title, description, bootstrap first, two font preloads, tokens and base styles, with no per-page setup; the fixture is excluded from the shipped output |
| AC-14 | generated tokens switch motion off under reduced motion | unit | the reduced-motion block sets every movement distance token from `motion.css` (rise, slide, parallax) and the count-up duration to zero, resets scale factors to 1, fails the build on a motion token that is not a plain number, and keeps `--fjord-duration-fade` for opacity fades; other durations are not collapsed (SAD §8 Motion) |
| AC-14 | no element moves under reduced motion | e2e-through-UI | on home and Not-found no animation is running and no transition other than opacity is declared |
| AC-15 | every design weight ships as its own small file | unit | 7 brand files exist (Schibsted 400 / 500 / 600 / 700, JetBrains Mono 400 / 500 / 700), each ≤ 30 KB, each with æ ø å |
| AC-15 | every weight renders from its own file without synthesized bold | e2e-through-UI | a page using each weight loads that weight's file from the site, renders æ ø å, and the browser reports no synthesized bold |

### Edge cases / error paths

- Stored Theme choice in a different case or with spaces (`DAG`, ` natt`) → ignored, device preference decides (AC-03 unit row).
- Storage read throws (privacy mode, blocked storage) → device preference decides, no visible error (AC-03 dedicated rows).
- Scripts turned off → the no-script Natt block decides by device preference; the page stays readable (AC-04 dedicated rows).
- Brand fonts fail to load → the metric-matched fallback face renders with no layout change (AC-05 e2e row).
- Requested address contains markup (e.g. a path with a script tag) → not-found response, the address is never shown back, nothing executes.
- Injected inline script or a script from another origin → refused by the policy; the bootstrap still runs (AC-09 dedicated rows).
- Policy widened by accident (framing by other origins, wildcard source, blanket inline) → the contract row fails and names the directive.
- Bootstrap edited without a rebuild of the policy → the build fails before output is finalized (AC-12 integration row).
- A page is added with an extra inline script → the build fails naming the page (AC-12 unit fail rule).
- Generated tokens are stale against their design sources → the token check fails naming the file.

### Test data

- Seed: fixture style files, token sets and built-page snippets checked in next to the unit tests, one per fail rule; the real generated tokens and the real build output for integration rows.
- Integration dependency: a fresh production build into a throwaway output directory per suite, served with production routing; nothing is mocked in place of the build.
- Browser state: a fresh browser context per test (empty storage, set device color scheme and motion preference) so theme cases never leak into each other.
- Cleanup: per suite, the throwaway build output and the AC-13 fixture page are removed; per test, the browser context is discarded.

### NFR validation (load)

<!-- N/A: no numeric NFR -->
No throughput or concurrency NFR: the numeric §6 targets are single-visit page budgets. They are validated without load as follows:
- CLS ≤ 0.02, LCP ≤ 2.0 s, TBT ≤ 100 ms, four categories ≥ 95 (SEO not asserted on the noindex Not-found page, see §6) → page performance audit (mobile, cold cache) on home and Not-found after the build.
- Initial JS ≤ 50 KB gzip, bootstrap ≤ 1 KB, 2 preloads ≤ 60 KB, each font ≤ 30 KB → AC-06 / AC-15 unit and integration rows plus the build-output budget check.
- 0 wrong-theme frames in 6 combinations → AC-01 / AC-02 e2e-through-UI rows.
- 0 accessibility violations in Dag and Natt → accessibility scan on home and Not-found in both themes (with the AC-04 scripts-off row).
- ≤ 0.1 % differing pixels → AC-01 / AC-07 visual-regression rows; the design match stays a manual PR review.

### CI placement

- On every PR: unit and contract (fast), plus the integration rows that run on the build already produced in CI.
- On every PR as well (small static site, a few minutes): e2e, e2e-through-UI, visual-regression, the accessibility scan and the page performance audit, because P-16, P-26 and P-41 gate the parity suite. The font-shift row and the audit run only in the CI Linux environment.
- Visual-regression baselines are produced and compared only in the CI Linux environment or the official browser-test container image, never on Windows; Windows snapshots are never committed (SAD §11).
