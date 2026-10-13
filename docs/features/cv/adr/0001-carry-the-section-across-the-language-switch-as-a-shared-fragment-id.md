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

The CV is two real pages, one per CV language, and the language switch is navigation between them (spec D-02). Switching must not move the page (AC-08). Where scripts run, the switch in the Sticky action bar must open the other CV page at the section the Visitor was reading, with its heading clear of the header and keyboard focus there, and the switch in the CV head must open it at the scroll position the Visitor had; one press of Back must return. With scripts off the switch still works and opens the other page at its top (AC-07). The mechanism decides what the section ids are, and those ids become part of addresses people share.

## Decision drivers

- Quality goal 2: content and navigation work without scripts; a script only adds.
- Spec §6.1: as little as possible is stored in the Visitor's browser; a crafted section name or stored value must do no harm.
- Spec §6 "Language switch": from the bar the other page opens at the section in view, heading 0 px under the header; from the CV head it opens at the same scroll position.
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

Amended on 2026-10-09 (Owner, during implement): the fragment is carried by the switch in the Sticky action bar only. `implement` measured that the switch of the CV head is never on screen while a section is in view, so from there a section could only be a remembered one, and the page would jump. The switch of the CV head carries the scroll position instead:
- `lang-switch.ts` gives the head's link to the other language no fragment and, on activation, calls `position.ts`, which writes `scrollY` as one whole number to `sessionStorage` under one key.
- On arrival the CV page script takes the number and removes it, on every CV page load, with or without a fragment. Without a fragment it scrolls there at once, only if the position is above the first section of the new page; otherwise the page opens at its top. A value that is not a whole number of pixels is dropped.
- A fragment was not used for the position because it would put a second address shape next to the canonical one and would be shared with the link; the position belongs to one navigation of one tab, which is what session storage holds.

## Consequences

**Positive**
- Deep links to a section work with scripts off and in any browser.
- No state leaves the browser. The one stored value is one number for one navigation (spec §6.1).
- The same links serve the CV head and the Sticky action bar; only what the script does with them differs.

**Negative**
- The Norwegian page has English section ids in its address (`/cv/no#experience`).
- The ids are public: renaming one later breaks shared links.

**Neutral**
- The page script does not block rendering, so in about one arrival of ten under load (5 of 50 measured) the new page shows one frame at its top before the position is restored. Accepted by the Owner on 2026-10-09; a render-blocking script in the head with `pagereveal` was the alternative and was not taken, because it adds a script to the head and to the security contract and still leaves Firefox as it is.
- With storage blocked, or in a new tab opened from the head's switch, the other page opens at its top.
- A section only one language has gets its own id from the same list; the other page opens at its top for it.
- "On this page" uses the same ids, so the contents list and the switch cannot disagree.

## Links

- Spec: [[../spec.md]] (US-03, AC-07, AC-08, D-02)
- SAD: [[../sad.md]] §4, §5, §6
- Related ADR: home ADR-0002 (Shell actions as typed descriptors), for the switch in the Sticky action bar
