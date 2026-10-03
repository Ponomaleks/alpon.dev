---
id: R35
title: "Complete the OQ-02 difference list, state that it is a checklist, and give the two-column layout its breakpoint"
layer: "docs"
deps: []
acs: ["AC-07"]
files_hint: ["docs/features/fjord-foundation/spec.md", "docs/features/fjord-foundation/screens.md", "docs/roadmap.md"]
owner: "Alexander Ponomarenko"
estimate: "S"
status: "todo"
---

# R35 — Complete the OQ-02 difference list, state that it is a checklist, and give the two-column layout its breakpoint

## Why

Review round 6, S1-13 and S1-14. Spec §8 OQ-02 (`spec.md:219-228`) lists ten differences between `src/pages/404.astro` and the page design. The reviewer's own comparison found five more, so the Design match NFR (`spec.md:194`, "0 undocumented differences") is not yet met by documentation:

| # | Difference | Page design | Built | Checked against |
|---|---|---|---|---|
| a | Code line typography | `.fj-eyebrow`: `letter-spacing: --fjord-tracking-label`, `inline-flex` with `gap: --fjord-space-3` around the "/", `--fjord-leading-none` (site `_ds` `content.css:3`) | `.code`: no letter-spacing, plain word spaces, `--fjord-leading-display` (`404.astro:107-114`) | site `_ds` CSS |
| b | Actions offset | `margin-top: --fjord-space-1` (site `_ds` `feedback.css:47`) | `--fjord-space-2` (`404.astro:134`) | site `_ds` CSS |
| c | Section min-height | none on `.fj-404` (site `_ds` `feedback.css:41`); only `.x-main{min-height:60vh}` (`site/site.css:11`) | 420 px (`404.astro:78`) | site CSS |
| d | Arrow icon | 18 px (`_ds_bundle.js:508`) | `--fjord-icon-sm`, 16 px (`404.astro:165`) | site `_ds` bundle |
| e | Body measure | `max-width: 46ch` (site `_ds` `feedback.css:45`) | `--fjord-measure-narrow`, 48ch (`404.astro:124`) | site `_ds` CSS |

OQ-02 item 2 says "the design has two columns (text left, map right)". That holds only from 1024 px (site `_ds` `feedback.css:42`); at 390 and 834 the design is one column with the map under the text. `docs/roadmap.md:24` repeats "two-column layout" without the breakpoint.

Owner's decision (2026-10-03): fix now, docs only.

## Definition of Done

- [ ] Spec §8 OQ-02 has one line per difference above (a–e), each with the page-design value and the built value.
- [ ] OQ-02 has this line: "The current 404 is an interim page and does not follow Misc.jsx. Any difference from Misc.jsx, listed here or not, is in scope for the step 3 rebuild. The list is a checklist, not an exhaustive diff."
- [ ] The Design match note (spec §6, `spec.md:194`) points to that line.
- [ ] OQ-02 item 2 and the roadmap step 3 row read: "two columns from 1024 (5fr / 7fr); below 1024, one column with the map under the text".
- [ ] The "ten ways" count in `screens.md:19` and every other count of the OQ-02 items ("Items 1–10") match the new list.
- [ ] No code or baseline changes.
- [ ] `npm run lint` and `npm run test:unit` green
