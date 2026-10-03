## Summary

Ships **fjord-foundation** (roadmap step 2, [spec](docs/features/fjord-foundation/spec.md)): the one Fjord layer every v2 page starts from. It adds generated `--fjord-*` tokens, seven self-hosted brand font files with metric-matched fallbacks, the Dag/Natt theme decided before the first frame (also with scripts off), the `BaseLayout` head contract, the Not-found page "Ikke funnet", and build guards for contrast, token-only styles, size budgets and a CSP that names exactly the theme bootstrap by hash. Stub-parity items **P-16, P-26 and P-41** are now passing tests (`test.fixme` 14 → **11**).

Base: `v2`. Production (`main`) is not touched. [Changelog](docs/features/fjord-foundation/changelog.md).

## Acceptance criteria

- AC-01 — first frame follows the device preference when nothing is stored, native controls included ✓
- AC-02 — a stored Theme choice wins over the device preference ✓
- AC-03 — an unusable stored value or blocked storage falls back to the device, with no error ✓
- AC-04 — scripts off: device theme, brand fonts, readable contrast ✓
- AC-05 — brand fonts with æ ø å, no visible text shift on swap ✓ (font-swap test runs on Linux CI only)
- AC-06 — only the two critical font files are preloaded ✓
- AC-07 — unknown address: not-found response with the Fjord Not-found page, noindex, no echoed address ✓ (interim page, see OQ-02; not served on the Workers preview URL, see Verification)
- AC-08 — "Back to home" is the only action; no route into an empty projects section ✓
- AC-09 — any other inline or cross-origin script is refused; the bootstrap still runs ✓
- AC-10 — a contrast regression fails the checks, naming pair, theme and ratio ✓ (OQ-01 printed as a known failure)
- AC-11 — a value written outside the tokens fails the checks with file and line ✓
- AC-12 — the delivered policy follows the bootstrap with no manual edit; a mismatch fails the build ✓
- AC-13 — a page with only a title and description gets the full head ✓
- AC-14 — nothing moves under reduced motion ✓
- AC-15 — every design weight ships as its own file, no synthesized bold ✓

## Design

- Spec: `docs/features/fjord-foundation/spec.md`
- Architecture: `docs/features/fjord-foundation/sad.md`
- Decisions: `docs/features/fjord-foundation/adr/` (ADR-0001 theme bootstrap + generated Natt blocks; ADR-0002 build-time CSP hash; ADR-0003 token-only styles with Stylelint)
- Screens and flows: `docs/features/fjord-foundation/screens.md`, `ux-flows.md`
- Data model + migration: none (no datastore, repo ADR-0003)
- API: none; the CSP contract is `tests/contracts/csp.contract.json`

## Tasks (SDD-Task trailers)

16 tasks (T1–T16) and 39 review follow-ups (R1–R39), all `done` in `docs/features/fjord-foundation/tasks/tracker.md`. One commit or more per task, each with `SDD-Task` / `SDD-AC` trailers: `git log --grep SDD-Task v2..HEAD`.

| Task | Commit |
|---|---|
| T1 Vitest + Stylelint (ADR-0003 rules) | 3d13d13 |
| T2 Seven brand faces + metric-matched fallbacks | ba38bf5 |
| T3 Token generator: Dag, Natt, no-JS Natt | b2ccef8 |
| T4 Reduced-motion tokens, font stacks, `tokens:check` | 80ef90c |
| T5 Contrast check | 401c027 |
| T6 Token-only `base.css` | a91135c |
| T7 Theme bootstrap + BaseLayout head contract (SCR-01) | e9e1183 |
| T8 Build-time CSP hash, one `/*` rule, fail-closed audit | 00f2192 |
| T9 Fjord Not-found page (SCR-02) | 8587717 |
| T10 Budget check | 528b153 |
| T11 Theme matrix e2e | 6e3cc52 |
| T12 Headers e2e, P-16 | 4af243f |
| T13 Fonts e2e, P-26 | 64bed03 |
| T14 Not-found + reduced-motion e2e, P-41 | 8668628 |
| T15 axe Dag/Natt, visual spec, Natt references (D1) | 42f0e8d |
| T16 Roboto-only CI runner, Lighthouse, branch protection | 18f22d3 |
| R1–R39 review follow-ups (7 review rounds) | see `tasks/tracker.md`; last: R39 16af790, R38 aa8533f |

## Review

Eight review rounds are recorded in `docs/features/fjord-foundation/_review/`. Round 7 (`review-2026-10-03-4.md`) asked for changes: five low findings, no unmet AC, fixed as R38 (docs) and R39 (`@import` condition check). Round 8 (`review-2026-10-03-5.md`) re-reviewed that surface (`72c1cdc..aa8533f`) with a clean-context reviewer: all five findings resolved, no medium or higher finding, verdict **PASS**. One low finding (a stale comment in `src/pages/404.astro`) is in `docs/backlog.md`.

## Verification (at aa8533f)

- Lint (`npm run lint`): exit 0. Tokens in sync; contrast 66 pairs pass, 1 known failure (OQ-01); `astro check` 0 errors; ESLint, Prettier, Stylelint clean.
- Unit (`npm run test:unit`): **254 passed**, 13 files (two suites run a real `astro build`).
- Build + budgets: 2 pages audited by the CSP integration; bootstrap 191 B; initial JS 0.2 KB gzip per page; 2 preloads, 50.5 KB; largest font 25.9 KB.
- e2e + axe (`npm run test`, against `wrangler dev`): **162 passed, 38 skipped** (11 parity `fixme` × 2 projects, 6 visual × 2 and 2 font-swap × 2, which run on Linux CI only).
- CI on aa8533f: `check` (includes Lighthouse CI on the Roboto-only runner) and `visual` green; Workers Builds preview green.
- Ran the feature, local `wrangler dev` (production routing), in a real browser and with `curl`:
  - AC-07: `/does-not-exist/<script>alert(1)</script>` → 404 with the Fjord page: title "Ikke funnet · alpon.dev", `h1` "Page not found", "Ikke funnet" marked `lang="no"`, `robots: noindex`, the only link "Back to home → /"; the requested path appears nowhere in the HTML.
  - AC-01: device dark, nothing stored → `data-theme="natt"`, dark background, `color-scheme: dark`.
  - AC-02: stored `dag`, device dark → `dag`, `color-scheme: light`.
  - AC-03: stored `foo`, device dark → `natt`, no error shown.
  - AC-09: an inline script added to the page did not run; the console reports the CSP violation; the bootstrap had set the theme.
  - AC-12: `/`, the 404 response and the EN CV PDF each carry one CSP header with the hash from `dist/_headers`; no `'unsafe-inline'`.
  - AC-06: the 404 HTML preloads exactly Schibsted Grotesk 400 and 600.
- Ran the feature on the Workers preview (`https://feat-fjord-foundation-alpon-dev.ponomalex-work.workers.dev`, commit aa8533f):
  - `/` and the CV PDF: 200 with the same CSP header and hash. ✓ (spec §6.1 security review: policy as delivered)
  - **Unknown address: 404 with a bare `Not found` body (9 bytes) and no CSP header, not the Fjord page.** `/404` itself serves the page with the header. The `v2` preview behaves the same, so this predates the feature and comes from the `wrangler preview` deployment, not from the page. Production (`wrangler deploy`, currently the stub) serves its custom 404. AC-07 on a deployed Worker is therefore **not verified here**; it needs a fix of the preview configuration or a check at Release 1 (step 6).
- Not run in this session: `npm run lhci` locally (CI is the authoritative run); a real iPhone check.

## Screenshots

Approved Linux baselines of the Not-found page, 390 / 834 / 1440 × Dag / Natt: `tests/visual/__screenshots__/linux/not-found.spec.ts/not-found-{dag,natt}-{390,834,1440}.png`. Page-design references for the side-by-side: `design/screenshots/{dag,natt}_not_found_{390,834,1440}.png` (the Natt and 404 references are new in this PR, roadmap D1).

## Design deviations / conflicts with the design

- **The Not-found page is an interim page** built from the design-system component demo, not from the site page design (`Misc.jsx`). All 15 known differences are listed in spec §8 **OQ-02** (map panel, two-column layout from 1024, heading "This page is off the map.", "404 / Ikke funnet", title scale, sticky action bar at 390, code line colour and typography, spacing, button size, arrow size, body measure, and others). Decision by the Owner: step 3 rebuilds the page and re-baselines the visuals.
- Intentional: the requested address is never echoed; no "See projects" until a Published project exists (AC-08); no Header, Footer or sticky action bar until step 3.
- No BRAND.md vs handoff palette conflict; the generator checks every core color.
- JetBrains Mono 700 ships although BRAND.md lists Mono 400/500 (CLAUDE.md requires it; the design system uses it).
- Theme bootstrap validates `dag`/`natt` strictly and adds a no-JS Natt block (ADR-0001), unlike the handoff's one-line snippet.
- Reduced motion: movement tokens and the count-up duration collapse to 0; `--fjord-duration-fade` keeps fades; color transitions are declared only under `prefers-reduced-motion: no-preference`.
- Font stacks list the metric-matched fallback faces in place of the handoff's system fonts.
- Handoff literals mapped to the nearest token in `base.css`: underline offset 0.2em → `--fjord-space-1`; focus radius 2px → `--fjord-radius-sm`.

## New dependencies (devDependencies only; nothing ships to the browser)

- `vitest`: unit tests for the build-time logic.
- `stylelint`, `postcss-html`: the ADR-0003 token-only rules, including `<style>` in `.astro`.
- `parse5`: a real HTML parser for the CSP audit of built pages.
- `@capsizecss/unpack`, `@capsizecss/metrics`, `fontkitten`: font metrics and cmap reading in `tools/fonts` and its test.
- Python `fonttools` + `brotli` (local tool, not an npm dependency) for `tools/fonts/subset.py`.

## Operational notes

- Migration: none.
- Feature flag / config: none. `public/_headers` holds `{{THEME_BOOTSTRAP_HASH}}`; the build writes the hash into `dist/_headers`. The CSP rule moved from `/` to `/*`.
- Branch protection: `v2` requires `check` and `visual`. `main` protection is planned for Release 1 (step 6).
- Rollback: revert the merge commit on `v2`.

## Open items for the Owner

1. OQ-01: Dag warning pair 4.40:1; fix the design source before step 7.
2. OQ-02: rebuild the Not-found page in step 3.
3. Workers preview serves a bare 404 for unknown addresses (see Verification).
4. Manual look on a real iPhone (the Arial fallback path, sad §11).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
