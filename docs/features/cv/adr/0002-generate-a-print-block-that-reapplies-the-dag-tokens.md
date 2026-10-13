---
status: Accepted
owner: "Alexander Ponomarenko"
reviewers: ["Tech Lead"]
updated_at: "2026-10-09"
feature_size: "S"
ticket: "roadmap step 5"
---

# 0002 — Generate a print block that re-applies the Dag tokens

- **Status:** Accepted
- **Date:** 2026-10-09
- **Deciders:** Alexander Ponomarenko (Owner), with Claude during the design walk

## Context

A CV printed from Natt must use the light colours, exactly as from Dag, and the theme on screen must not change (AC-12). Colours on the site come from Fjord tokens that `scripts/tokens/` generates into `src/styles/tokens.css`: one set under `[data-theme="dag"]`, one under `[data-theme="natt"]`, and the No-JS Natt block for a dark device with scripts off. Print media keeps the active theme, so without a rule a print from Natt carries dark fills. The primitives `--fjord-print-bg` and `--fjord-print-text` already exist.

## Decision drivers

- Quality goal 3 and spec §6 "Print": background of the sheet white, started from Dag and from Natt.
- AC-12: "exactly as from Dag".
- Token-only styles: no colour value is written outside the token layer (`CLAUDE.md`, Stylelint).
- The failure-mode pass of the spec ranked a CV printed from Natt among the two worst silent failures.

## Considered options

1. **A print block in the token generator** — `scripts/tokens/` emits `@media print` rules that hold for any theme: they re-apply the Dag set for `[data-theme="natt"]` and for the No-JS Natt block, and set the sheet background and text from the print primitives under Dag as well, where the screen background is stone and not white.
2. **Overrides in the CV page's print styles** — the CV page re-declares, by hand, the semantic colour tokens its components use, with Dag primitives, on the CV root in print media.

## Decision outcome

**Chosen:** Option 1. The Dag set in print comes from the same source as the Dag set on screen, so "exactly as from Dag" holds by construction and cannot drift when a token is added or changed. Option 2 keeps the change inside the feature but duplicates the generator's knowledge in a hand-kept list; a component token missing from the list would print dark, and only a print test from Natt would notice.

How it is built:
- The block decides colours only and applies whatever the theme is, Dag included. The generator writes it after the theme sets; `tokens.css` stays generated and is not edited by hand. The generator's tests and the tokens check (`npm run tokens:check`) cover the block.
- The CV page's own `@media print` styles hold no colour decisions: they remove the Shell and the controls, show the contact line and control sheet breaks.
- `data-theme` on `<html>` is not touched for printing; no script takes part.

## Consequences

**Positive**
- A print from Natt and a print from Dag are the same document.
- Printing needs no script and no theme switch.
- Later pages (case studies, thoughts) print in the light colours without new work.

**Negative**
- The generated file and the generator's tests change in a feature that is about the CV.
- Every page now prints in the light colours, the home page and the Not-found page included; that is wider than the spec asks.

**Neutral**
- Only colours are decided here; which parts a page prints stays that page's own print styles. Other pages get none in this feature.
- Rules scoped to a component state (the header over the hero, `.fjord-on-spruce`) are outside the CV print because the Shell is not printed; they are not changed.

## Links

- Spec: [[../spec.md]] (US-05, AC-11, AC-12, D-04)
- SAD: [[../sad.md]] §4, §8
- Related ADR: fjord-foundation ADR-0001 (tokens are generated from the design sources)
