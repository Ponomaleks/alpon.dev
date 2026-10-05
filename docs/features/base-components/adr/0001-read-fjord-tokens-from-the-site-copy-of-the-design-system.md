---
status: Accepted
owner: "Alexander Ponomarenko"
reviewers: []
updated_at: "2026-10-04"
feature_size: "S"
ticket: "roadmap step 3 (base-components)"
---

# 0001 — Read Fjord tokens from the site copy of the design system

- **Status:** Accepted
- **Date:** 2026-10-04
- **Deciders:** Alexander Ponomarenko (Owner), with Claude during the design pass (depth easy, confirmed through the assumptions ledger)

## Context

The token generator (fjord-foundation ADR-0001) reads `design/handoff/design-system/project/tokens/`. The page designs were made with the site's own, newer copy of the design system under `design/handoff/site/project/_ds/`, and the Shell uses tokens that only that copy defines: the layer order (`--fjord-z-*`), space steps such as `--fjord-space-5` and `--fjord-space-404`, the UI text sizes, `--fjord-header-height-compact`, opacity and terrain line values, and the Toast duration. Spec AC-26 requires that a token enters only through the generator, and `design/` is read-only. A comparison on 2026-10-04 found that the site copy adds declarations and changes no value in the spacing, typography and motion files; its `colors.css` keeps the same values but is restructured.

## Decision drivers

- AC-26: Fjord tokens stay the only source of visual values and are never added by hand.
- `CLAUDE.md` sources of truth: the page design wins over component demos, and the site bundles the newer copy of the design system; `BRAND.md` wins over both.
- Spec §6 Design match: 0 differences between the Not-found page and the page-design screenshots, which were rendered with the site copy's tokens.
- Quality goal 3 (composable and guarded): one source, checked by `tokens:check`.

## Considered options

1. **Read the site copy as the single handoff source** — point the generator's token and usage paths at `design/handoff/site/project/_ds/…`; the brand palette still wins on conflict.
2. **Layer the site copy over the design-system copy** — keep the current source and add only the names it lacks from the site copy, reporting any name whose value differs.

## Decision outcome

**Chosen:** Option 1. The site copy is a superset with unchanged values, so one source is simpler than two and matches the rule that the page designs and their bundled design system are the reference. A second layer would add merge rules and a conflict report for a conflict that does not exist today.

## Consequences

**Positive**
- Every token the page designs use becomes available through the generator, with no hand-written value.
- One handoff source; the next design export replaces one folder.

**Negative**
- The parser must handle the restructured `colors.css` (shared `:root, [data-theme="dag"]` block, contour and terrain line tokens referenced through `var()`, the on-spruce block under Natt).
- More tokens are emitted than this feature uses (for example the OG image and print values).

**Neutral**
- The switch is the first task of the feature and must leave every existing declaration in `src/styles/tokens.css` with the same value; the diff of the generated file is the proof. The contrast check and the Natt-block identity check run unchanged.
- fjord-foundation ADR-0001 gets a one-line pointer to this ADR for the source path; its decision (validating bootstrap, generated Natt blocks) is unchanged.
- `design/handoff/design-system/` remains the reference for component demos only.

## Links

- Spec: [[../spec.md]] (AC-26, §1 Traceability)
- SAD: [[../sad.md]] §4
- Related ADR: [[../../fjord-foundation/adr/0001-pair-a-validating-theme-bootstrap-with-generated-natt-blocks]], [[../../fjord-foundation/adr/0003-enforce-token-only-styles-with-stylelint-built-in-rules]]
