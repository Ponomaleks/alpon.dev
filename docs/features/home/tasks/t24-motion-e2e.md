---
id: T24
title: "Verify Ambient motion, the Motion control, count-up, reveal, parallax and the band contours end to end"
layer: "tests"
deps: ["T15"]
acs: ["AC-06", "AC-30", "AC-31", "AC-36", "AC-41"]
files_hint: ["tests/e2e/motion.spec.ts", "tests/e2e/reduced-motion.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T24 — Verify Ambient motion, the Motion control, count-up, reveal, parallax and the band contours end to end

## Why

AC-06, AC-30, AC-31, AC-36, AC-41 ([spec §5](../spec.md)); spec §6 "Ambient motion"; [ADR-0003](../adr/0003-run-ambient-motion-only-under-a-state-attribute-the-page-script-sets.md); [sad §8 Testing, §10 QG-2](../sad.md).

## What

- `tests/e2e/motion.spec.ts` with motion allowed; the reduced-motion cases extend `tests/e2e/reduced-motion.spec.ts`. Running animations are read with `document.getAnimations()`.

## Definition of Done

- [ ] Motion control: pause within 100 ms, resume, name and state, session persistence, blocked storage (AC-30)
- [ ] Count-up once, accessible text final (AC-06); reveal once, in-view and fragment target shown at once (AC-36)
- [ ] Parallax under the policy of `public/_headers`: the layer moves, no violation is reported
- [ ] Closing band: animations advance only with scrolling, on `/` with scripts on and off (AC-41)
- [ ] Reduced motion and scripts off: 0 loops, no control, no parallax properties (AC-31)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- The band check needs a Chromium with scroll-driven animations; where the test browser lacks support the test asserts the still state instead and says so.
