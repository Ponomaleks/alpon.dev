---
id: T1
title: "Install the check toolchain: Vitest and Stylelint with the ADR-0003 rule set"
layer: "wiring"
deps: []
acs: ["AC-11"]
files_hint: ["package.json", "package-lock.json", "vitest.config.ts", "stylelint.config.js", "scripts/lint/", ".github/workflows/ci.yml"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T1 — Install the check toolchain: Vitest and Stylelint with the ADR-0003 rule set

## Why

AC-11 needs a token-only check with file and line ([spec §5 AC-11](../spec.md)); [ADR-0003](../adr/0003-enforce-token-only-styles-with-stylelint-built-in-rules.md) fixes the tool and rule set. Vitest is needed by every later task with pure logic ([sad §8 Testing](../sad.md)); `CLAUDE.md` asks for a PR explanation when it is added.

## What

- Add devDependencies `vitest`, `stylelint`, `postcss-html` (explain each in the PR).
- `stylelint.config.js`: the rule table, property list, keyword allowlist and excluded files exactly as in ADR-0003 (`customSyntax: 'postcss-html'` for `**/*.astro`).
- `package.json`: `lint` gains `stylelint "src/**/*.{css,astro}" --allow-empty-input`; new script `test:unit` = `vitest run`.
- `vitest.config.ts`: include `**/*.test.ts`, exclude `tests/**` (Playwright specs), `node_modules`, `dist`.
- `scripts/lint/stylelint.test.ts` + `scripts/lint/fixtures/*.css` driving Stylelint's Node API.
- `.github/workflows/ci.yml`: a `Unit tests (Vitest)` step after Lint.

## Definition of Done

- [ ] `npm run lint` passes on the current repo with Stylelint included
- [ ] `npm run test:unit` runs and passes locally and as a CI step
- [ ] Fixture test: `#24493D`, `red`, `rgb(0 0 0)`, `16px`, `200ms`, `cubic-bezier(...)`, `font-weight: 600`, `line-height: 1.2` and `@media (min-width: 800px)` each produce a warning naming the fixture file and line
- [ ] Fixture test: a token-only file (`var(--fjord-*)`, `0`, `auto`, `currentColor`, `calc(var(--fjord-space-1) * 105)`, `@media (min-width: 768px)`) has zero warnings
- [ ] `src/styles/tokens.css` and `src/styles/fonts.css` are ignored by the config

## Notes

- Vitest's default include also matches `*.spec.ts`; the exclude of `tests/**` keeps it off the Playwright suites. Playwright's `testDir: './tests'` already keeps it off colocated `*.test.ts` files.
- Fixtures live under `scripts/`, outside the `src/**` lint glob, so their deliberate literals never fail `npm run lint`.
- Shares `package.json` / `ci.yml` with T4, T5, T10, T16 (serialized lane).
