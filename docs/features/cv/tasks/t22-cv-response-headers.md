---
id: T22
title: "Give the CV pages, the CV PDFs and the page images their response headers"
layer: "wiring"
deps: ["T2"]
acs: ["AC-18"]
files_hint: ["public/_headers", "tests/e2e/headers.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T22 — Give the CV pages, the CV PDFs and the page images their response headers

## Why

AC-18 ([spec §5](../spec.md)); [sad §8 Response headers](../sad.md); [sad §11, the row on explicit rules](../sad.md).

## What

- `public/_headers`: remove `/cv/*`; add the rule of `/` for the three page addresses and the one-hour rule for each of the six files by full path; the PDFs keep `Content-Disposition: inline` with their file names.
- `tests/e2e/headers.spec.ts`: the cases above; the test reads the list of files from `public/cv/`.

## Definition of Done

- [ ] `tests/e2e/headers.spec.ts`: the three page addresses equal the home page's cache rule
- [ ] Same file: six files with the one-hour rule; `Content-Disposition` on the two PDFs only
- [ ] Same file: the security headers of the home page are on every answer; the policy line equals `tests/contracts/csp.contract.json`
- [ ] Same file: adding a file to the list without a rule fails
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. Check the Cloudflare Docs MCP on how matching `_headers` rules add up before editing.
- The security policy itself does not change; only cache and disposition rules do.
