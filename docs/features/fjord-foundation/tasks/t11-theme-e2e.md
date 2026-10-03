---
id: T11
title: "Cover the theme matrix end to end, including blocked storage and scripts off"
layer: "tests"
deps: ["T7"]
acs: ["AC-01", "AC-02", "AC-03", "AC-04"]
files_hint: ["tests/e2e/theme.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T11 — Cover the theme matrix end to end, including blocked storage and scripts off

## Why

AC-01..AC-04 ([spec §5](../spec.md)); NFR "Wrong-theme frames" ([spec §6](../spec.md)); the method is fixed in [sad §10 QG-1](../sad.md).

## What

- Playwright `colorScheme` emulation × storage seeded by `addInitScript` (Dag / Natt / none / `foo`), plus a context where `localStorage` access throws.
- An init script records every `data-theme` mutation with a `MutationObserver` and captures the computed `<html>` background and `color-scheme` in the first `requestAnimationFrame`.
- Scripts-off context (`javaScriptEnabled: false`): computed background, `color-scheme` and a screenshot after load.
- Run on `/` and an unknown path (SCR-01, SCR-02).

## Definition of Done

- [ ] All 6 combinations: first-frame theme equals settled theme, `data-theme` set exactly once
- [ ] Unknown value and blocked storage: `data-theme` follows the device preference, no page error event
- [ ] Scripts off: theme follows the device preference through the no-JS block
- [ ] Native `color-scheme` is `dark` in Natt and `light` in Dag
- [ ] `npm run test` green

## Notes

- None.
