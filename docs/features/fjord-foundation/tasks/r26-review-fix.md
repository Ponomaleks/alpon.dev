---
id: R26
title: "Switch the token-only lint from block lists to allow lists for functions and units"
layer: "wiring"
deps: []
acs: ["AC-11"]
files_hint: ["stylelint.config.js", "scripts/lint/stylelint.test.ts", "scripts/lint/fixtures/", "docs/features/fjord-foundation/adr/0003-enforce-token-only-styles-with-stylelint-built-in-rules.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R26 — Switch the token-only lint from block lists to allow lists for functions and units

## Why

Review round 4, S2-10. `function-disallowed-list` (`stylelint.config.js:94-103`) omits `lab`, `lch`, `oklab`, `color` and `color-mix`, so literal colours pass on properties outside the allowlist (e.g. `background`); the unit list (`:108`) has `rlh` but not `rch`, `rex`, `rcap`, `ric`. ADR-0003 has the same gap.

The Owner chose allow lists over longer block lists, so the next new CSS function or unit is rejected without a config change.

## Definition of Done

- [ ] stylelint.config.js uses function-allowed-list (var, calc, clamp, min, max, url, plus anything the current code genuinely needs) and unit-allowed-list (the units actually used outside tokens.css, e.g. %, the viewport units already allowed for min-height, fr, deg if needed; px only in media queries as today), so new CSS functions and units are rejected by default. The existing specific rules stay where they give a clearer error message. The ADR-0003 table lists every allowed function and unit with a reason. Fixtures under scripts/lint/fixtures/ cover lab(), oklab(), color-mix() and rch, and the existing fixtures still pass or fail as before.
- [ ] `npm run lint` and `npm run test:unit` green
