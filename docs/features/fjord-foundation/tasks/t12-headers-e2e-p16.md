---
id: T12
title: "Verify the delivered security policy end to end and flip P-16"
layer: "tests"
deps: ["T8"]
acs: ["AC-09", "AC-12"]
files_hint: ["tests/e2e/headers.spec.ts", "tests/e2e/parity.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# T12 — Verify the delivered security policy end to end and flip P-16

## Why

AC-09, AC-12; [ADR-0002](../adr/0002-generate-the-bootstrap-hash-into-a-single-csp-rule-at-build.md) e2e bullet; stub parity P-16 ([docs/stub-parity.md](../../../stub-parity.md)).

## What

- `headers.spec.ts`: request `/`, `/does-not-exist`, `/cv/alexander-ponomarenko-cv-en.pdf`; parse the CSP; recompute the bootstrap hash from `src/scripts/theme-bootstrap.js` and compare.
- Injection: add an inline `<script>` through `page.evaluate` DOM insertion and assert it did not run (a `securitypolicyviolation` event fires), while `data-theme` is set.
- `parity.spec.ts`: P-16 `test.fixme` → `test` with a real body.

## Definition of Done

- [ ] Three responses each carry exactly one CSP header with the current hash, no `'unsafe-inline'`, `frame-ancestors 'self'`
- [ ] Injected inline script does not run; bootstrap did
- [ ] P-16 passes as a real `test`
- [ ] `npm run test` green

## Notes

- `parity.spec.ts` is shared with T13 and T14 (serialized lane).
