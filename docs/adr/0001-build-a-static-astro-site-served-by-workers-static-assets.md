---
status: Accepted
owner: "Alexander Ponomarenko"
reviewers: []
updated_at: "2026-10-02"
feature_size: "n/a (foundation)"
ticket: ""
---

# 0001: Build a static Astro 6 site with file-format URLs, served by Cloudflare Workers static assets

- **Status:** Accepted
- **Date:** 2026-10-02
- **Deciders:** Alexander Ponomarenko (survey, greenfield foundation)

## Context

alpon.dev v2 replaces a hand-written static stub with a full personal site: landing, CV EN/NO, case studies, a blog later (`docs/idea-brief.md`). There's no backend or auth. It must cost nothing to run, and it has to show frontend craft (performance, accessibility). The stub already runs on Cloudflare Workers static assets with short links and headers that must keep working.

## Decision drivers

- Zero running cost: only the domain is paid (`CLAUDE.md`, idea brief §5).
- Performance budget: Lighthouse ≥ 95, LCP ≤ 2.0 s, initial JS ≤ 50 KB gzip (`CLAUDE.md` Quality bar).
- Content-driven pages (markdown projects, external blog loader at build time).
- Keep the stub's URLs (`/cv/en`, `/linkedin`, …) with no trailing slash and no redirect hop.

## Considered options

1. **Astro 6 static (`output: 'static'`) on Workers static assets**: HTML at build time, zero JS by default, content collections built in.
2. **Astro with the Cloudflare adapter (SSR on Workers)**: runtime rendering, which no current feature needs. It adds server code and a CPU budget.
3. **Hand-written HTML/CSS like the stub**: no build step, but no components, content collections or type checks. It doesn't scale to case studies and a blog.

URL sub-decision: `build.format: 'file'` + `trailingSlash: 'never'` (`/cv/en` → `cv/en.html`, served at `/cv/en` by `html_handling: auto-trailing-slash`) vs `'directory'` + `'always'` (`/cv/en/`, a redirect for the slashless form).

## Decision outcome

**Chosen:** Option 1, with `build.format: 'file'` and `trailingSlash: 'never'`. Static output meets the cost and performance drivers without any runtime. Workers static assets already host the stub and give per-branch preview URLs. File-format URLs keep the stub's slashless links with no redirect.

## Consequences

**Positive**
- No server code, so there's no runtime to secure, scale or pay for. Deploys are just `dist/`.
- `_headers` / `_redirects` keep working as on the stub.

**Negative**
- Anything dynamic (a contact form, live API calls) needs a separate decision (a Worker script or a third party) and a new ADR.
- Blog updates need a rebuild (Deploy Hook), not instant publish.

**Neutral**
- Moving to the Cloudflare adapter later is additive (per-route `prerender`), not a rewrite.

## Links

- Map: [[../architecture-map.md]] §Stack
- Related ADR: [[0002-ship-zero-client-js-by-default-with-vanilla-ts-islands]], [[0003-keep-all-content-in-the-repo-with-no-datastore]]
