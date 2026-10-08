---
status: Accepted
owner: "Alexander Ponomarenko"
reviewers: ["Tech Lead"]
updated_at: "2026-10-09"
feature_size: "S"
ticket: "roadmap step 5"
---

# 0001 — Carry the section across the language switch as a shared fragment id

- **Status:** Accepted
- **Date:** 2026-10-09
- **Deciders:** Alexander Ponomarenko (Owner), with Claude during the design walk

## Context

The CV is two real pages, one per CV language, and the language switch is navigation between them (spec D-02). Where scripts run, the other CV page must open at the section the Visitor was reading, with its heading clear of the header and keyboard focus there; one press of Back must return (AC-08). With scripts off the switch still works and opens the other page at its top (AC-07). The mechanism decides what the section ids are, and those ids become part of addresses people share.

## Decision drivers

- Quality goal 2: content and navigation work without scripts; a script only adds.
- Spec §6.1: nothing is stored in the Visitor's browser; a crafted section name must do no harm.
- Spec §6 "Language switch": the other page opens at the section in view, heading 0 px under the header.
- AC-17: each CV page has one canonical address and the two name each other as language versions.

## Considered options

1. **Shared, language-neutral ids in the fragment** — both pages use the same ids (`profile`, `skills`, `languages`, `experience`, `projects`, `education`, `courses`, `community`); the script writes the id of the section in view into the fragment of the other language's links.
2. **Localised ids with a mapping table** — the Norwegian page has Norwegian ids; the CV data holds a table from one language's id to the other's, and the script builds the link from it.
3. **A query parameter read by a script on arrival** — the link carries `?section=…`; a script on the target page scrolls and focuses.

## Decision outcome

**Chosen:** Option 1. The browser performs the arrival, so a link with a section works with scripts off, Back needs no handling, and an id the page does not have simply opens the page at its top, which is the whole defence against a crafted address. Option 2 gives nicer Norwegian addresses but adds a table that must be kept in step with every section and fails silently when it is not. Option 3 does nothing without scripts and puts a second address shape next to the canonical one.

How it is built:
- `src/data/cv/sections.ts` holds the ids in order; both CV pages render their sections from it, each section with `id`, `tabindex="-1"` and `scroll-margin-top: var(--fjord-scroll-offset)`.
- `src/scripts/cv/section-in-view.ts` reports the section in view, or none above the first one. `lang-switch.ts` sets `href` of every link to the other language (CV head and Sticky action bar) to that page's address plus the fragment, or without a fragment when none is in view.
- `arrive.ts` moves focus to the element the fragment names only if it is one of the page's CV sections.
- The link of the current language keeps its own address with scripts off; with scripts on its navigation is stopped.

## Consequences

**Positive**
- Deep links to a section work with scripts off and in any browser.
- No state leaves the page; no storage is used.
- The same links serve the CV head and the Sticky action bar.

**Negative**
- The Norwegian page has English section ids in its address (`/cv/no#experience`).
- The ids are public: renaming one later breaks shared links.

**Neutral**
- A section only one language has gets its own id from the same list; the other page opens at its top for it.
- "On this page" uses the same ids, so the contents list and the switch cannot disagree.

## Links

- Spec: [[../spec.md]] (US-03, AC-07, AC-08, D-02)
- SAD: [[../sad.md]] §4, §5, §6
- Related ADR: home ADR-0002 (Shell actions as typed descriptors), for the switch in the Sticky action bar
