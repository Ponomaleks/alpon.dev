## Summary

Ships **base-components** (roadmap step 3, [spec](docs/features/base-components/spec.md)): the Shell every v2 page gets from `BaseLayout` (skip link, header, phone menu, Sticky action bar, closing band, footer, Toast, theme switch, page and theme cross-fade), the base components Home and CV need, the Not-found page rebuilt to its page design, `/styleguide` as the checked reference in Dag and Natt, and `src/data/contact.ts` as the one place for contact facts. Stub-parity: **P-25** passes, P-41 is reworded, P-50 and P-51 are opened for steps 4 and 5 (`test.fixme` 11 → **12**).

Base: `v2`. Production (`main`) is not touched. [Changelog](docs/features/base-components/changelog.md).

## Acceptance criteria

- AC-01 — header from 768: wordmark, "CV", "Contact", theme switch, one "Get in touch"; current link marked ✓ (the marker shows only on the Styleguide until a page sets `current`, IS-04)
- AC-02 — no "Projects" link and no search trigger ✓
- AC-03 — sticky header with a border after scroll ✓ (scripts on, D-13)
- AC-04 — phone menu panel with links, contacts, Work region, theme switch, "Get in touch"; focus moves in ✓
- AC-05 — Escape, close button or any link closes it; focus returns to the menu button ✓
- AC-06 — scripts off on a phone: CV and contact still reachable ✓
- AC-07 — Sticky action bar below 768, never covers content or focus ✓
- AC-08 — bar leaves on scroll down, returns on scroll up, not focusable while away ✓
- AC-09 — scripts off or reduced motion: the bar stays ✓
- AC-10 — theme change at once, kept across pages, both switches agree ✓
- AC-11 — blocked storage: still changes, no error; scripts off: no switch ✓
- AC-12 — the switch never shows a wrong selection ✓
- AC-13 — "Skip to content" is the first Tab stop ✓ (P-25)
- AC-14 — footer facts, Residence and "Sist oppdatert" marked as Norwegian ✓
- AC-15 — contact facts from one place; a vCard mismatch fails the checks, naming the field ✓
- AC-16 — an invalid or future last-updated date fails the checks ✓
- AC-17 — not-found response with the Fjord Not-found page per the page design, noindex, no echoed address, no closing band ✓
- AC-18 — "Back to home" is the only content action ✓
- AC-19 — the map panel is decoration and is not announced ✓
- AC-20 — closing band with "Get in touch" and "Download CV" by CV language ✓
- AC-21 — Styleguide shows every component and Shell part in every state ✓
- AC-22 — nothing leads to the Styleguide; noindex ✓
- AC-23 — at most one primary button in content, two on screen ✓
- AC-24 — the Shell follows six page options, no shared file edited ✓
- AC-25 — 44 × 44 targets, focus ring, Enter and Space ✓
- AC-26 — a non-token value fails the checks with file and line (ADR-0004) ✓
- AC-27 — the security policy is not widened ✓
- AC-28 — nothing slides, grows or loops under reduced motion ✓
- AC-29 — themes cross-fade where supported ✓
- AC-30 — Toast sits above the bar, is announced politely, goes away ✓
- AC-31 — P-50 and P-51 stand open for steps 4 and 5 ✓
- AC-32 — page content cross-fades, header stays still ✓ (verified in the built CSS, spec §1 change log)

## Design

- Spec: `docs/features/base-components/spec.md`
- Architecture: `docs/features/base-components/sad.md`
- Decisions: `docs/features/base-components/adr/` (ADR-0001 token source; ADR-0002 native `<dialog>` menu; ADR-0003 Shell state in DOM attributes; ADR-0004 targeted token-only rules, supersedes fjord-foundation ADR-0003)
- Screens and flows: `docs/features/base-components/screens.md`, `ux-flows.md`
- Data model + migration: none (no datastore)
- API: none; the CSP contract `tests/contracts/csp.contract.json` is unchanged

**New dev dependency:** `stylelint-declaration-strict-value@1.12.1`. Stylelint's built-in rules cannot require `var()` per property without listing every allowed function and unit (ADR-0004). Dev only; nothing ships to the site.

## Tasks (SDD-Task trailers)

23 tasks (T1–T23) and 8 review follow-ups (R1–R8), all `done` in `docs/features/base-components/tasks/tracker.md`: `git log --grep SDD-Task v2..HEAD`.

| Task | Commit |
|---|---|
| T1 Token generator reads the site copy | 49d8076 |
| T2 Token-only rules for the Shell styles | 7e670dc, reworked in aeb468e (ADR-0004) |
| T3 `contact.ts` + contact check | 66ee554 |
| T4 Icon, Button, Link, IconButton | a452bf4 |
| T5 Badge, Tag, Stat, SectionHeader | 0bd9b06 |
| T6 Contours, Terrain map, Wordmark | 5e6b35d, 4d2d85c |
| T7 ThemeToggle + theme script | 2a49f39 |
| T8 Toast | f49b04b |
| T9 SkipLink, CtaBand, Footer | c3aa83f |
| T10 Header | cb6d583 |
| T11 Mobile menu (SCR-03) | 4e58800, 9fc8085 |
| T12 Sticky action bar | c1d06d3 |
| T13 Shell in BaseLayout | 1fab2b4 |
| T14 Page transitions | 94dcd93 |
| T15 Not-found rebuild (SCR-02), P-41 | a196094, 5e8bd3a |
| T16, T17 Styleguide (SCR-04) | b6f1ae4, f6e6e4c |
| T18 Shell e2e, P-25, P-50, P-51 | 33c4e60 |
| T19 Menu and theme e2e | af20404 |
| T20 Bar, one-primary, Toast, reduced-motion e2e | 44828e3 |
| T21 axe + visual baselines | 1e1332f |
| T22 Budgets, contrast, policy | 7a0381f, 5c3027b |
| T23 Doc pointers, component inventory | 729b907 |
| Design-match fixes | ce22dcc, 38fa07a, 95c5f7e, b2b84e0, 40098ed, 18dbdd4 |
| R1 Menu panel on spruce | fdd1e26, 6dac511, a625173 |
| R2 Menu scroll on short viewports | 0c47bd3 |
| R3 Focus after a same-page menu link | 99481a4 |
| R4 Styleguide demo states | 9e7eb61 |
| R5 Work region vs vCard `ADR` | d67e85b |
| R6 Keyboard activation, 44 px in the open menu | 7ab3edc |
| R7 AC-32 verification method (docs) | 99cfa66 |
| R8 Theme after back/forward cache | a81e636 |
| Owner decisions at ship (press, bar shadow, header hover, Stat row name, Toast line height) | f7c3013, baselines b73b7fa |

## Review

Two rounds, in `docs/features/base-components/_review/`. Round 1 (`review-2026-10-04.md`): nine blocking findings, all fixed as R1–R8. Round 2 (`review-2026-10-05.md`, `dccdc76..f54dd08`, clean-context reviewer): all resolved, no blocking finding, verdict **PASS**. Non-blocking findings are in `docs/backlog.md`.

## Verification

Local, Windows, on `f7c3013`:

- Lint: clean (tokens check, contrast, contact, `astro check`, ESLint, Prettier, Stylelint). Contrast: 85 pairs pass, 1 known failure (fjord-foundation OQ-01), 2 decorative pairs not gated.
- Unit (Vitest): 28 files, 545 tests passed.
- Build + budgets: within limits. `404.html` 11.9 KB gzip (limit 20); Shell scripts 2.1 to 2.3 KB gzip (limit 5); two font preloads.
- e2e + axe (Playwright, `wrangler dev` on `dist/`): 439 passed, 53 skipped (among them the Linux-only visual specs and the 12 parity `fixme` items, in both projects).
- Lighthouse and visual regression: not run locally; CI `check` (includes Lighthouse CI) and `visual` are green on `b73b7fa`.

Ran the feature (`wrangler dev` on `dist/`, browser at 375 × 812, before the ship fixes below):

- AC-17, AC-27: `GET /no/such/page?x=<script>` → `404` with the CSP header (`script-src 'self'` plus the bootstrap hash only); the body has the code line "404 / Ikke funnet", the heading, the body text, one "Back to home", `noindex`, no echo of the address, no "See projects", no inline `style`, no closing band.
- AC-13: first Tab → the visible "Skip to content" link (`#main`) has focus.
- AC-04, AC-05: the menu button opens a modal dialog with focus inside; it lists CV, Contact, the email and phone links, "Oslo, Norge", Light / Dark and "Get in touch". Escape closes it and focus is back on "Open menu".
- AC-10, AC-12: "Dark" in the menu → `data-theme="natt"`, stored `natt`, both switches show Dark pressed; opening `/` next renders Natt with both switches still on Dark.
- AC-07, AC-14, AC-20, AC-23: the bar shows "View CV" / "Get in touch" and the header action is outlined while it is on screen; the footer shows "Nittedal, Norge", 60.07° N, 10.87° E and "Sist oppdatert 2026-10-04"; the band on `/` has "Download CV" → the English PDF.
- AC-22: `/styleguide` answers with `noindex` and is in neither `sitemap.xml`, `robots.txt`, `index.html` nor `404.html`.

Not exercised by hand: scripts off (AC-06, AC-09, AC-11) and reduced motion (AC-28); both are covered by the e2e suite above.

## Screenshots

The approved Linux baselines are the screenshots, at 390 / 834 / 1440 in Dag and Natt:

- Not-found page: `tests/visual/__screenshots__/linux/not-found.spec.ts/not-found-{dag,natt}-{390,834,1440}.png`; compare with `design/screenshots/{dag,natt}_not_found_{390,834,1440}.png`.
- Styleguide, one file per section: `tests/visual/__screenshots__/linux/styleguide.spec.ts/`.

## Differences from the page design

The Owner accepted the Not-found design match on 2026-10-05; fjord-foundation OQ-02 is closed.

- Accepted, recorded in spec §1.3: D-01 to D-18. D-14 is new: footer text links are 21 px high with 27 px between centres at 390 and meet WCAG 2.2 AA target size (2.5.8) by spacing, not the 44 px Shell rule (`CLAUDE.md` quality bar). The earlier list said "48 px minimum height" for the wordmark and footer links; that was stale. Measured at 390: wordmark 17 px, header "Get in touch" 36 px and theme-switch segments 28 px, each with a 44 px overlay (D-08); menu contact links 44 px.
- Removed from the list: the missing `env(safe-area-inset-bottom)` on the Sticky action bar. `viewport-fit=cover` is not set, so there is no inset to add.
- Fixed in `f7c3013`, because steps 4 and 5 must not edit Shell or component files:
  - Button and IconButton move when pressed, as in the design (`translateY(1px) scale(.985)`, `scale(.94)`, 120 ms), and stay still with reduced motion (AC-28). The old lint allow lists rejected transform functions, and the press was not restored with the nudges when ADR-0004 replaced them. The 1 px distance is written with the hairline token.
  - The Sticky action bar has the design's float shadow (closes backlog B-16).
  - The outlined header "Get in touch" changes on hover and press, when forced by the page and beside the bar below 768.
  - A Stat row takes an accessible name from the page (`rowLabel`; `label` is a single stat's own label).
  - The Toast text has the design line height (`--fjord-leading-snug`).
- Left for later, in `docs/backlog.md`: B-14 (header gaps), B-15 (icon size and three icon paths), B-17 (Not-found code-line gap), B-18 (band top margin, `main` min-height), B-19 (skip-link sample ring, underline position), B-29 (status Badge look, step 7).

Baselines changed (`b73b7fa`, written through the `visual-baselines` label, 22 files): the Styleguide Button, IconButton and Sticky action bar sections, the Toast section at 390, and the Not-found page at 390.

Conflicts with `BRAND.md`: the Shell's call to action is English, "Get in touch", as in the page design; recorded in `CLAUDE.md` Content rules (spec §1).

## Operational notes

- Migration: none.
- Feature flag / config: none. `public/_headers` and the CSP contract are unchanged.
- Merge target is `v2`. Rollback: revert the merge commit on `v2`.
- Interim surfaces IS-01 to IS-05 (spec §1.2): contact and CV links reach their final targets in steps 4 and 5.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
