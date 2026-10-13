---
id: T27
title: "Build the Recommendations section and show it only with agreed quotes"
layer: "ui"
deps: ["T26"]
acs: ["AC-09", "AC-10"]
files_hint: ["src/components/home/Recommendations.astro", "src/components/home/recommendations.test.ts", "src/data/home.ts", "src/data/home.test.ts", "src/pages/index.astro", "src/pages/_index.test.ts", "tests/e2e/recommendations.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T27 — Build the Recommendations section and show it only with agreed quotes

## Why

AC-09, AC-10 ([spec §5](../spec.md)); spec §6.1 (third-party personal data); [sad §8 Home content](../sad.md); [screens.md SCR-01 recommendations, present and absent](../screens.md).

## What

- Builds SCR-01 states: recommendations present, recommendations absent.
- Reuses: `ui/SectionHeader`, `ui/Link` ("On LinkedIn", same tab); the Testimonial card is part of this component; data through `visibleRecommendations()` and `sections.ts`.
- Enter the two Recommendations of [owner-inputs.md](../owner-inputs.md) into `home.ts`, from that file and word for word: quote (with its paragraph breaks), name, role, `consent: true`, and the profile address, date and relationship as source fields for the Claims list. The Owner has confirmed both agreements; do not ask again.
- The card renders the quote, the name and the role only (AC-09); the profile address, date and relationship are never rendered. "On LinkedIn" leads to Alexander's profile from `contact.ts`.
- `index.astro` renders the section between Experience and Contact only when at least one Recommendation with consent exists.

## Definition of Done

- [ ] `src/components/home/recommendations.test.ts`: card content, consent filter, same-tab link; the profile address, date and relationship of a Recommendation appear nowhere in the HTML
- [ ] `src/data/home.test.ts`: each quote in `home.ts` is identical, character for character, to its quote in `docs/features/home/owner-inputs.md` (read by the test), and both entries have `consent: true`
- [ ] `src/pages/_index.test.ts`: both numbering states, built from fixtures of the data
- [ ] `tests/e2e/recommendations.spec.ts`: the section with both Recommendations, name and role only, and "Contact 04"
- [ ] Two columns from 768; Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4b.
- Source of the content: [owner-inputs.md](../owner-inputs.md). Both people agreed, so the section is rendered as 03 and Contact becomes 04.
- Never edit, shorten or correct a quote: "Oleksandr" and "Alexander" stay as written and the dashes stay. No typographic clean-up, no trimming for layout.
- A quote without agreement is omitted, never edited (AC-10); this path stays covered by fixtures.
- Lane: `index.astro` and `_index.test.ts` with T28.
