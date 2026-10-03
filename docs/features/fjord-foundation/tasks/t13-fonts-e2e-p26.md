---
id: T13
title: "Verify font loading end to end and flip P-26"
layer: "tests"
deps: ["T7"]
acs: ["AC-05", "AC-06", "AC-15"]
files_hint: ["tests/e2e/fonts.spec.ts", "tests/e2e/parity.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T13 — Verify font loading end to end and flip P-26

## Why

AC-05, AC-06, AC-15 ([spec §5](../spec.md)); [sad §10 QG-2, §11 Arial-fallback risk](../sad.md); stub parity P-26.

## What

- Preload set: the two `link[rel=preload][as=font]` hrefs; network log shows no other woff2 before first paint.
- Lazy weights: a test-only route is not allowed in `src/pages`, so inject an element using weight 700 via `page.evaluate` and assert the 700 file is requested only then.
- Glyphs: `document.fonts.check()` for æ ø å per family/weight and that the loaded `FontFace` is the brand file.
- Fallback: block `/fonts/*` with `page.route`, assert computed family resolves to `"Schibsted Grotesk Fallback Roboto"` (skip with a reason when Roboto is not installed locally; CI installs it in T16).
- `parity.spec.ts`: P-26 `fixme` → `test`.

## Definition of Done

- [ ] Exactly two font preloads, both Schibsted (400, 600)
- [ ] Weight 700 is fetched only after it is used
- [ ] æ ø å available from the brand faces for all 7 weights
- [ ] Roboto fallback assertion passes in CI
- [ ] P-26 passes; `npm run test` green

## Notes

- Windows dev machines have Arial, not Roboto: the Roboto assertion is CI-only by design ([sad §11](../sad.md)).
