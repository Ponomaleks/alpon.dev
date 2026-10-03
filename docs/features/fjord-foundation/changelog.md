# Changelog — fjord-foundation

## fjord-foundation — the Fjord base layer every v2 page starts from

**What:** v2 pages now render in the Fjord identity with no per-page setup. A page on `BaseLayout` gets the generated `--fjord-*` tokens, the seven self-hosted brand font files (Schibsted Grotesk 400/500/600/700, JetBrains Mono 400/500/700, with æ ø å) and metric-matched fallback faces, and the Dag/Natt theme decided before the first frame: the stored Theme choice, else the device preference, and still correct with scripts off. The Not-found page ("404 · Ikke funnet", "Page not found", "Back to home") is the first real page on this layer. The build now guards the layer: a contrast check, token-only style checks, size budgets, and a Content-Security-Policy that names exactly the theme bootstrap by its hash.

**Why:** v2 had a skeleton but no visual identity, and Home, CV and Base components all need the same base ([spec](./spec.md) §1, §2). It also closes three stub-parity items: P-16, P-26 and P-41 (`test.fixme` 14 → 11). Key decisions:

- [ADR-0001](./adr/0001-pair-a-validating-theme-bootstrap-with-generated-natt-blocks.md): a validating theme bootstrap paired with generated Natt blocks (scripted and no-script).
- [ADR-0002](./adr/0002-generate-the-bootstrap-hash-into-a-single-csp-rule-at-build.md): the bootstrap hash is generated into a single `/*` CSP rule at build; the build fails closed.
- [ADR-0003](./adr/0003-enforce-token-only-styles-with-stylelint-built-in-rules.md): token-only styles enforced with Stylelint built-in rules, plus a check that no `@import` carries a condition.

**How to use:**

- New page: wrap it in `src/layouts/BaseLayout.astro` with a `title` and a `description`. Nothing else is needed.
- Styles: use `--fjord-*` tokens only; `npm run lint` fails on a raw color, size, space, radius, duration or easing, and names the file and line.
- Tokens: `src/styles/tokens.css` is generated. Change the design sources, then run `npm run tokens:build`; `npm run tokens:check` fails when the file is stale.
- Theme bootstrap: edit `src/scripts/theme-bootstrap.js` and rebuild; the hash in `dist/_headers` follows. Never edit the hash by hand.
- Checks: `npm run lint`, `npm run test:unit`, `npm run build`, `npm run check:budgets`, `npm run test`, `npm run lhci`.

**Operational notes:**

- Migration: <!-- none --> no datastore.
- Feature flag / config: none. `public/_headers` now holds the placeholder `{{THEME_BOOTSTRAP_HASH}}`; the build replaces it in `dist/_headers`. The CSP rule moved from `/` to `/*`, so the 404 response, PDFs and the vCard carry it too.
- Deploy: merges into `v2` only. Production (`main`, the stub) is not affected.
- Known gap on Workers previews: on the `wrangler preview` URL an unknown address returns a bare `Not found` (9 bytes, no CSP header) instead of the Fjord Not-found page. The same happens on the `v2` preview, so it predates this feature. `wrangler dev` (production routing) and the production Worker (`wrangler deploy`) serve the custom 404 page. Check it again in Release 1 (roadmap step 6) or fix the preview configuration before then.
- Visual baselines are Linux-only (`tests/visual/__screenshots__/linux/`); never commit Windows snapshots.
- Rollback: revert the merge commit on `v2`. Nothing outside the repo changes.

**Open items carried forward:**

- OQ-01: the Dag warning pair measures 4.40:1 (needs 4.5:1). It is printed as a named known failure on every contrast run; fix the design source before step 7 (Callout).
- OQ-02: the Not-found page is an interim page built from the component demo, not the site page design (`Misc.jsx`). Step 3 rebuilds it and re-baselines the visuals.

**Acceptance criteria delivered:** AC-01 to AC-15: theme from the first frame with or without a stored choice, with unusable storage and with scripts off (AC-01 to AC-04); brand fonts without text shift, two preloads only, every weight from its own file (AC-05, AC-06, AC-15); the Fjord Not-found page with one way back and no echoed address (AC-07, AC-08); only the named bootstrap runs inline (AC-09); build guards for contrast, token-only values and policy/bootstrap agreement (AC-10 to AC-12); the full head from a title and description (AC-13); nothing moves under reduced motion (AC-14).
