---
status: Draft
owner: "Alexander Ponomarenko"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-10-02"
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
- The design's not-found code line reads "404 · <requested path>". This feature shows "404 · Ikke funnet" instead (P-41, Norwegian warm detail) and does not echo the requested address back, which keeps the page free of scripts. Listed as a design difference in the PR.
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
| Lighthouse categories | Performance, Accessibility, Best Practices, SEO each ≥ 95 | Lighthouse CI (mobile) |
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
- **Lighthouse mobile, not-found page** — baseline: measured on the unstyled skeleton at the start of implementation, target: all four categories ≥ 95 when this feature merges.

## 8. Open questions

<!-- N/A: no open questions — every decision was taken from CLAUDE.md, the roadmap and the design, and listed in the assumptions ledger for veto. -->
