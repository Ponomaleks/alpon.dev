---
status: Accepted
owner: "Alexander Ponomarenko"
reviewers: []
updated_at: "2026-10-02"
feature_size: "S"
ticket: "roadmap step 2 — fjord-foundation (P-16)"
---

# 0002 — Generate the bootstrap hash into a single `/*` CSP rule at build

- **Status:** Accepted
- **Date:** 2026-10-02
- **Deciders:** Alexander Ponomarenko (Owner), with Claude during the design walk

## Context

The theme bootstrap (ADR-0001) must be inline to run before the first frame, yet the policy must never allow `'unsafe-inline'` scripts (P-16, AC-09). The hash has to follow the script with no manual edit, and a build whose policy and bootstrap disagree must fail before deploy (AC-12). Two findings from the skeleton: `public/_headers` carries the CSP only on the `/` rule, so the 404 response and every other page get no CSP; and Astro by default inlines stylesheets and processed scripts under 4 KB (`build.inlineStylesheets: 'auto'`, `vite.build.assetsInlineLimit`), which the existing `style-src 'self'` would block. On Workers static assets, headers from all matching `_headers` rules are combined, so two CSP rules would apply two policies at once.

## Decision drivers

- Spec AC-09, AC-12, §6.1 abuse cases (injected script, reflected content, framing by other origins must stay forbidden).
- Stub-parity P-16: the policy is a header with `script-src 'self'` plus a hash, never `'unsafe-inline'`.
- `CLAUDE.md`: security headers live in `public/_headers`; zero running cost; no Worker script (headers cannot be set at request time).
- Repo ADR-0002: islands are bundled to external files, covered by `script-src 'self'`.
- Reviewability: one policy, in one place, readable on the preview URL (spec §6.1 security review).

## Considered options

1. **Local build integration writes the header** — an Astro integration (`astro:build:done`) audits the built HTML, computes the bootstrap hash and substitutes it into the single `/*` CSP rule of `dist/_headers`.
2. **Astro `security.csp` (meta tag)** — Astro 6 emits a per-page `<meta http-equiv="Content-Security-Policy">` with hashes of the scripts and styles it renders; the bootstrap hash is added through `security.csp.scriptDirective.hashes` computed in `astro.config`; `_headers` keeps the directives a meta tag cannot carry (`frame-ancestors`) and drops `script-src`/`style-src`.

## Decision outcome

**Chosen:** Option 1. It keeps one policy in one header that also carries `frame-ancestors`, checks the real build output, and fails closed. Option 2 splits the policy between a meta tag and a header (a reviewer must read both), and since Astro hashes every inline script it renders, "fail on an unexpected inline script" (AC-09/AC-12) would still need a custom post-build check.

The shape:

- `src/scripts/theme-bootstrap.js` is the single source; `BaseLayout` inlines it with `is:inline` (`?raw` import + `set:html`).
- `astro.config.mjs`: `build.inlineStylesheets: 'never'` and `vite.build.assetsInlineLimit: 0`, so Astro never inlines CSS or JS; the local integration `src/integrations/csp.ts` is registered there.
- `public/_headers` holds the policy **template** once, under `/*` only; the `/` rule loses its CSP entirely:
  ```
  /*
    Content-Security-Policy: default-src 'self'; script-src 'self' {{THEME_BOOTSTRAP_HASH}}; style-src 'self'; img-src 'self' data:; font-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'self'; upgrade-insecure-requests
  ```
  The existing `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` and `X-Frame-Options: SAMEORIGIN` stay on `/*`.
- The integration, on `astro:build:done`, fails the build when:
  1. any built HTML page has an inline `<script>` other than exactly one whose `sha256` equals the hash of `theme-bootstrap.js` (this also catches a transformed bootstrap). **Exception — non-executable data blocks:** an inline `<script type="application/ld+json">` (type compared case-insensitively, surrounding whitespace trimmed) is permitted; the browser never executes it and `script-src` does not apply to it. Home needs one for the JSON-LD `Person` (step 4, P-24). Every other inline script — no `type`, `text/javascript`, `module`, or any other value — still fails the build unless it is the bootstrap;
  2. any built HTML page has an inline `<style>`, a `style="…"` attribute or an `on*="…"` handler attribute;
  3. the placeholder `{{THEME_BOOTSTRAP_HASH}}` is still present in `dist/_headers` after substitution;
  4. `dist/_headers` contains more than one `Content-Security-Policy` line.
  Otherwise it writes `'sha256-…'` in place of the placeholder.
- Vitest (`src/integrations/csp.test.ts`) covers rule 1 with fixtures: a page with the bootstrap plus a `<script type="application/ld+json">` block passes (also with `type="Application/LD+JSON"`); the same block with no `type` or with `type="text/javascript"` fails and names the page; a second copy of the bootstrap fails.
- e2e (`tests/e2e/headers.spec.ts`, plus P-16 flipped in `parity.spec.ts`) asserts exactly one CSP header, containing the bootstrap hash and no `'unsafe-inline'`, on `/`, on a 404 response, and on a static file (the EN CV PDF); and that an injected inline script is refused while the bootstrap runs (AC-09).
- The template is the only place to extend the policy: Release 1 adds the Cloudflare Web Analytics origins to `script-src` and `connect-src`, and step 7's live-preview facade adds the `<name>.alpon.dev` app origins to `frame-src`, in this same `/*` line, never as a second rule.

## Consequences

**Positive**
- One readable policy for every response, including the 404 page and downloads; framing by other origins stays forbidden.
- Policy and bootstrap cannot drift: the hash is computed from the built output and the build fails closed on anything unexpected, including inline code a future content source might inject.

**Negative**
- About 80–120 lines of integration code plus unit tests (Vitest) to maintain.
- With inlining off, every island and CSS chunk is a separate (small, cached) request; watch LCP in Lighthouse CI.
- The CSP now also applies to PDFs and the vCard; the same-origin inline PDF viewer (P-32, step 5) must be verified under it.

**Neutral**
- `astro dev` serves no `_headers`, so the policy is only testable on `npm run preview` (`wrangler dev`) and the preview URL, which is where the e2e suite already runs.
- Switching to Astro's `security.csp` later would mean moving `script-src`/`style-src` out of the header; the inline-code audit would remain useful either way.

## Links

- Spec: [[../spec.md]] US-05, US-06, AC-09, AC-12, §6.1
- SAD: [[../sad.md]] §4 (pillar 3), §6 flow 3, §8 Security policy
- Related ADR: [[0001-pair-a-validating-theme-bootstrap-with-generated-natt-blocks]] (defines the one allowed inline script)
