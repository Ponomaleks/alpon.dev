---
id: T31
title: "Close long quotes behind Show more and turn the Recommendations row into a carousel"
layer: "ui"
deps: ["T27", "T29"]
acs: ["AC-09", "AC-42", "AC-43"]
files_hint: ["src/components/home/Recommendations.astro", "src/components/home/recommendations.test.ts", "src/scripts/home/quote-toggle.ts", "src/scripts/home/quote-toggle.test.ts", "src/scripts/home/carousel.ts", "src/scripts/home/carousel.test.ts", "src/scripts/home/index.ts", "src/data/home.ts", "src/data/contact.ts", "src/data/samples.ts", "src/components/ui/Icon.astro", "src/pages/styleguide.astro", "src/pages/_styleguide.test.ts", "tests/e2e/carousel.spec.ts", "tests/e2e/recommendations.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T31 — Close long quotes behind Show more and turn the Recommendations row into a carousel

## Why

AC-09 (amended), AC-42, AC-43 ([spec §5](../spec.md)); spec §1.3 D-19, D-20, D-21. Owner decisions of 2026-10-08, after the first look at the built section: the real quotes are too long to show whole, more Recommendations may follow, and the link should land on the recommendations themselves.

## What

- Reuses: `ui/IconButton` (the two arrows), `ui/Link`, `ui/SectionHeader`; one new icon, `arrow-left`.
- `quote-toggle.ts`: a quote longer than three lines is closed to three lines with "Show more" / "Show less"; closed cards have the same height; the whole quote stays in the page.
- `carousel.ts`: no library. The row scrolls with CSS scroll snap wherever it holds more cards than columns (one below 768, two from 768), so swipe and the keyboard work without a script. The script makes the row go round: inert copies of the cards stand at both ends, and when the row stops the cards themselves are moved round in the page, so that the cards in view at rest are always real ones (review round 1). It adds the arrows and the "Recommendation N of M" announcement, and can turn the row by itself.
- `src/data/home.ts`: `source` per Recommendation (`linkedin` or `direct`) and `recommendationsAutoplay` (off). `src/data/contact.ts`: the address of the recommendations on the LinkedIn profile.
- Styleguide: a third Testimonial sample, shown closed.

## Definition of Done

- [x] `src/scripts/home/quote-toggle.test.ts`: closes a long quote, leaves a short one, opens and closes, keeps the copies in step
- [x] `src/scripts/home/carousel.test.ts`: going round, the copies, the position from the scroll offset, the rotation of the cards and which of them move, the furthest target, when automatic turning may move the row
- [x] `src/components/home/recommendations.test.ts`: the link per source, the hidden button, where the row scrolls, the arrows, the autoplay flag
- [x] `tests/e2e/carousel.spec.ts`: three lines and equal heights, "Show more" / "Show less" with pointer and keyboard, scripts off, the arrows going round both ways, a swipe past the end, copies inert, reduced motion, no carousel from 768 with two cards; with four cards at 834 and 1440: real cards at rest on every stop, the card beside the last one works, focus kept, fast presses, axe; automatic turning with a paused clock: the interval, the five holds, reduced motion
- [x] Stylelint 0 findings; `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4b, added after T30 on the Owner's request; it changes the baselines T30 waits for.
- Why no library: the row is native scrolling, so there is no drag code to ship or to keep accessible; the script is small and loads with the page's one entry. Embla Carousel (MIT, no dependencies) was the alternative; it would have added its own drag handling and still needed the same accessibility work.
- With scripts off every quote is whole and the row scrolls; nothing is hidden.
- The cases the content does not reach yet (four cards in two columns, automatic turning on) are tested on the home page itself, with its HTML rewritten on the way to the browser (`withCards` in the spec).
