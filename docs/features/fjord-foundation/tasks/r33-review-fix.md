---
id: R33
title: "Cut the function allow list to var and calc"
layer: "wiring"
deps: ["R32"]
acs: ["AC-11"]
files_hint: ["stylelint.config.js", "scripts/lint/stylelint.test.ts", "scripts/lint/fixtures/", "docs/features/fjord-foundation/adr/0003-enforce-token-only-styles-with-stylelint-built-in-rules.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R33 — Cut the function allow list to var and calc

## Why

Review round 5, S2-15. ADR-0003 (`adr/0003-…md:57`) says a function enters the allow list "only when real code under `src/` needs it", and justifies `clamp`, `min`, `max` as "the type scale needs". The allow list (`stylelint.config.js:89`) has `var`, `calc`, `clamp`, `min`, `max`, `url`, but linted files use only `var` and `calc` (`src/pages/404.astro:64`, `:78`). `clamp` appears only in `tokens.css` and `url` only in `fonts.css`; `min` and `max` appear nowhere. The ADR front matter still says `updated_at: "2026-10-02"` after the 2026-10-03 amendment. The reviewer's probes found no literal-value hole through the four extra functions, so this tightens the rule to match the ADR; it does not fix a leak.

Owner's decision (2026-10-03): cut the list to `var`, `calc`.

Depends on R32 only because both edit `stylelint.config.js` and ADR-0003.

## Definition of Done

- [ ] First confirm that `src/styles/fonts.css` (`url`) and the generated `src/styles/tokens.css` (`clamp`) are excluded from Stylelint (`ignoreFiles`, `stylelint.config.js:100`). If either is linted, keep that function and state the reason in the ADR.
- [ ] `function-allowed-list` is `['var', 'calc']`; fixtures show `clamp()`, `min()`, `max()` and `url()` rejected by that rule (asserted by rule name).
- [ ] The ADR-0003 function table matches the config, `updated_at` is bumped, and a note says step 3 adds back what it needs (for example `min` / `clamp` and the transform functions), each with its reason.
- [ ] `npm run lint` and `npm run test:unit` green
