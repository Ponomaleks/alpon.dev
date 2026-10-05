---
status: Accepted
owner: "Alexander Ponomarenko"
reviewers: []
updated_at: "2026-10-05"
feature_size: "S"
ticket: "roadmap step 4 (home)"
---

# 0002 — Pass Shell actions as typed descriptors through page options

- **Status:** Accepted
- **Date:** 2026-10-05
- **Deciders:** Alexander Ponomarenko (Owner), with Claude during the design pass (depth easy, decided by a direct question)

## Context

Until now the Sticky action bar and the closing band carried a fixed pair of actions written inside the components. The Owner decided that each page sets them (spec §1.3 D-10, D-12): the home page and the Not-found page show "View CV" and "Save contact (.vcf)" in the bar, the home page's band shows "Save contact (.vcf)" and "Download CV", and the CV page (step 5) and the project pages (step 7) bring their own pairs. AC-38 and AC-40 require a page option and forbid a page from editing the component. The shape of that option is a contract that steps 5 and 7 will use.

## Decision drivers

- AC-38, AC-40: actions are set per page through a page option; no page edits the bar or the band.
- AC-34 and the brand rule: the Sticky action bar holds no primary button on any page; the band holds none on the home page.
- Roadmap lane rule: steps 5 and 7 must not edit Shell files to get their own actions.
- Repo ADR-0002: no client script where HTML does the job; every action here is a link or a download.

## Considered options

1. **Typed action descriptors** — `BaseLayout` takes `mobileBarActions` and `ctaBandActions`, each a pair of plain objects; the components render them.
2. **Astro slots** — the page passes ready markup for the bar and the band through named slots.

Excluded by constraint: named sets (one option such as `shellActions: 'home' | 'cv' | 'project'`, with the pairs written inside the components). AC-38 and the lane rule forbid editing a shared component for each new pair, so it was not weighed as an option.

## Decision outcome

**Chosen:** Option 1. A page states its two actions as data, the component decides how they look, and the type system carries the brand rule. Option 2 lets a page put a primary button or a third action into the bar, so the rule would rest on an e2e test alone, and each page would repeat the bar's markup.

The contract, in `src/data/shell-actions.ts`:

- `ShellLink`: `{ label: string; href: string; icon?: IconName; download?: boolean | string; lang?: 'no' }`.
- `BarAction` is `ShellLink`. It has no style field, so a primary button in the bar cannot be written; the bar renders both actions in the secondary style.
- `BandAction` is `ShellLink` plus `variant?: 'primary' | 'secondary'` (default `secondary`), because on pages other than home the band's "Get in touch" stays primary.
- Both options take exactly two actions (a two-element tuple), so a missing or a third action fails `astro check`.
- Ready pairs live in the same file and read their addresses from `src/data/contact.ts`: the bar's default pair ("View CV", "Save contact (.vcf)"), the band's default pair ("Get in touch" primary, "Download CV" for the page's `cvLang`) and the band's home pair ("Save contact (.vcf)", "Download CV", both secondary).
- `BaseLayout` uses the default pairs when a page passes nothing, so the Not-found page gets the new bar without a change of its own.

## Consequences

**Positive**
- Steps 5 and 7 pass their pair and touch no Shell file.
- "No primary in the bar" is a compile-time fact; the e2e count of AC-34 stays as the second check.
- The Styleguide shows the bar and the band with any pair as a sample, using the same props.

**Negative**
- An action is always a link. A control that needs a script (a button that is not a link) would need the type to grow.
- The old `cvHref` and `contactHref` props of the bar go away, so the bar's unit tests and Styleguide sample change with this feature.

**Neutral**
- Planned extension, not a contract break: D-10 gives the CV page a bar with the language switch and "Download PDF". The language switch is two links, not one, so step 5 is expected to extend `BarAction` with a language-switch kind. It stays links only, with no script and still no style field.
- The band keeps its `cvLang` option; it only chooses which PDF the default pair downloads.

## Links

- Spec: [[../spec.md]] (US-14, US-02; AC-34, AC-38, AC-40; §1.3 D-10, D-12)
- SAD: [[../sad.md]] §4, §5 page options, §8 Shell actions
- Related ADR: [[../../base-components/adr/0003-keep-shell-state-in-dom-attributes-and-let-css-derive-the-rest]]
