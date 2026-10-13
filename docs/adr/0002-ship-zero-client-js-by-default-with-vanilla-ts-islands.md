---
status: Accepted
owner: "Alexander Ponomarenko"
reviewers: []
updated_at: "2026-10-02"
feature_size: "n/a (foundation)"
ticket: ""
---

# 0002: Ship zero client JS by default, with vanilla-TS islands for interactivity

- **Status:** Accepted
- **Date:** 2026-10-02
- **Deciders:** Alexander Ponomarenko (survey, greenfield foundation)

## Context

The site has a few interactive parts: theme toggle, CV language switch, copy-to-clipboard, stat count-up, live-preview facade, API "Try it". The rest is static content. The code organisation decides how much JS ships and how strict the CSP can be.

## Decision drivers

- Initial JS ≤ 50 KB gzip, TBT ≤ 100 ms (`CLAUDE.md` Quality bar).
- CSP without `'unsafe-inline'` scripts (`CLAUDE.md`, `docs/stub-parity.md` P-16).
- No UI kits, plain CSS (`CLAUDE.md` Stack).
- Every interactive part must work, or degrade, without JS and with reduced motion.

## Considered options

1. **Zero JS by default, vanilla-TS islands** in Astro `<script>` (bundled to external files). React only through a dedicated ADR when it clearly pays off.
2. **React islands as the default** (`@astrojs/react`): a familiar component model, but about 45 KB gzip of runtime on any page with an island.
3. **A client-side SPA framework**: rejected by the performance and zero-JS drivers.

## Decision outcome

**Chosen:** Option 1. Vanilla islands keep JS near zero, Astro bundles them into external files (CSP `script-src 'self'`), and the stub already shows the pattern works (`git show 89d375b:public/app.js`).

## Consequences

**Positive**
- Most pages ship no JS at all. The CSP stays strict.

**Negative**
- Richer widgets (e.g. API "Try it") cost more hand-written DOM code than React would.
- The only inline script is the no-flash theme bootstrap, and its hash must be kept in `_headers`.

**Neutral**
- Adding `@astrojs/react` for one island later is possible. It needs its own ADR and the size check.

## Links

- Map: [[../architecture-map.md]] §Stack, §Conventions
- Related ADR: [[0001-build-a-static-astro-site-served-by-workers-static-assets]]
