---
id: T9
title: "Build CvSection, SkillGroup, LanguageList and DatedRows"
layer: "ui"
deps: ["T4"]
acs: ["AC-01", "AC-03"]
files_hint: ["src/components/cv/CvSection.astro", "src/components/cv/SkillGroup.astro", "src/components/cv/LanguageList.astro", "src/components/cv/DatedRows.astro", "src/components/cv/sections.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T9 — Build CvSection, SkillGroup, LanguageList and DatedRows

## Why

AC-01, AC-03 ([spec §5](../spec.md)); screens SCR-05 `sections`, `profile`, `skills`, `languages`, `education, courses`, `community`; SCR-06 `sections`, `languages`; [screens C-9](../screens.md).

## What

- Reuses: `ui/SectionHeader` (small); the `.fj-skills` and `.fj-langs` looks from the site copy of the design system.
- `cv/CvSection` (page section): the numbered heading, the shared id, the slot; the profile paragraph and the community list are plain elements inside it (C-9).
- `cv/SkillGroup` and `cv/LanguageList` (design-only inventory rows, built here).
- NEW `cv/DatedRows` (no inventory list has a period column with title, organisation and note).

## Definition of Done

- [ ] `src/components/cv/sections.test.ts`: CvSection: `id` from `sections.ts`, number, `h2`
- [ ] Same file: SkillGroup: `h3`, text only, no image, bar or percentage; LanguageList: no level code
- [ ] Same file: DatedRows: two-line period, note, `lang="no"` on a Norwegian name
- [ ] Stylelint 0 findings (tokens only)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. Layout: one column of skills below 768, two from 768; the period column from 768 (screens `skills`, `education, courses`).
