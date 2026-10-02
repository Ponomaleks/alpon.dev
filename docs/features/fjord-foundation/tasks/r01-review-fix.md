---
id: R1
title: "Parse built HTML with a real parser in the CSP audit and hash a CRLF-normalised bootstrap"
layer: "wiring"
deps: []
acs: ["AC-09", "AC-12"]
files_hint: ["src/integrations/csp.ts", "src/integrations/csp.test.ts", "src/integrations/fixtures/", "src/layouts/BaseLayout.astro", "package.json", "package-lock.json", ".gitattributes"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "done"
---

# R1 — Parse built HTML with a real parser in the CSP audit and hash a CRLF-normalised bootstrap

## Why

Review follow-up F-06, F-17 ([review-2026-10-02](../_review/review-2026-10-02.md)).

## Definition of Done

- [ ] The CSP audit walks a parsed DOM (htmlparser2 or parse5 devDependency, justified in the PR) instead of regexes; Vitest fixtures with data-src=, data-type="application/ld+json" and a '>' inside an attribute value before style=/onclick= each fail naming the page; the bootstrap text is read once, CRLF-normalised, and that same string is inlined and hashed; a Vitest case with a CRLF source still builds with a matching hash; .gitattributes sets src/scripts/*.js text eol=lf; build, lint, unit green.
- [ ] `npm run lint` and `npm run test:unit` green
