---
id: T15
title: "Compose the home page from its sections, page options, the script entry and the contact place"
layer: "wiring"
deps: ["T4", "T6", "T7", "T8", "T10", "T11", "T12", "T13", "T14"]
acs: ["AC-01", "AC-04", "AC-11", "AC-18", "AC-32", "AC-36", "AC-40"]
files_hint: ["src/pages/index.astro", "src/pages/_index.test.ts", "src/scripts/home/index.ts", "src/scripts/home/reveal.ts", "src/scripts/home/reveal.test.ts", "tests/e2e/smoke.spec.ts", "tests/a11y/smoke.spec.ts"]
owner: "Alexander Ponomarenko"
estimate: "L"
status: "done"
---

# T15 — Compose the home page from its sections, page options, the script entry and the contact place

## Why

AC-01, AC-04, AC-11, AC-18, AC-32, AC-36, AC-40 ([spec §5](../spec.md)); spec §1.3 D-04, D-05; [sad §5, §8 Section reveal, Contact place](../sad.md); [screens.md SCR-01](../screens.md).

## What

- Builds SCR-01: default, section reveal, contact arrived by link, no-script, reduced-motion.
- `src/pages/index.astro`: `BaseLayout` with title, description, `headerOverHero: true`, `ctaBandActions` = the home pair, `structuredData` = the Person object; then Hero, KeyFacts, About, ExperienceList and the contact section, numbered through `sections.ts`. No Recommendations and no Selected projects are rendered yet.
- Contact place: the section has `id="contact"`, `tabindex="-1"` and `scroll-margin-top` of the header height.
- `src/scripts/home/index.ts`: the one entry; calls `initHeroHeader`, `initMotion`, `initParallax`, `initCountUp`, `initReveal`, `initCopyEmail`.
- `src/scripts/home/reveal.ts`: marks only sections outside the viewport as `data-reveal="pending"`, never the target of the address fragment, and sets `data-reveal="in"` when each first comes into view; nothing under reduced motion.

## Definition of Done

- [ ] `src/pages/_index.test.ts`: section order and numbers, contact place attributes, page options, one page-own script, CSP integration passes
- [ ] `src/scripts/home/reveal.test.ts`: in-view and fragment target untouched; pending then in, once; nothing under reduced motion
- [ ] `npm run build` then `npm run test`: smoke and axe smoke pass on `/`
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4a.
- Sections are visible by default; the reveal style applies only to `[data-reveal="pending"]`, which only the script sets.
- From this task the home page differs from every stored baseline that shows it; baselines are written in T25.
- `#cv` and `#cv-no` do nothing here (IS-02, step 5).
