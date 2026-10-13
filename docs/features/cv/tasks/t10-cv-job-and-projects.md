---
id: T10
title: "Build CvJob and CvProjects"
layer: "ui"
deps: ["T4"]
acs: ["AC-01", "AC-03"]
files_hint: ["src/components/cv/CvJob.astro", "src/components/cv/CvProjects.astro", "src/components/cv/job.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T10 — Build CvJob and CvProjects

## Why

AC-01, AC-03 ([spec §5](../spec.md)); screens SCR-05 `work experience`, `personal projects`; page design `Cv.jsx` (`CvJob`); spec §6.1 (links to other sites).

## What

- Reuses: `ui/Tag`, `ui/Link` (external).
- NEW `cv/CvJob` (ExperienceItem is a collapsible summary for the home page; the CV needs an always-open entry): the timeline rail and marker, the filled marker of the first job, the three content forms.
- `cv/CvProjects` (page section): the optional note, title with stack, paragraph, code link.

## Definition of Done

- [ ] `src/components/cv/job.test.ts`: a job with two client projects and internal projects; a job with paragraphs only; heading levels `h3` then `h4`
- [ ] Same file: the code link opens a new tab with the `rel` and the hidden hint of home D-09
- [ ] Same file: the first job has the filled marker; no `style` attribute anywhere
- [ ] Stylelint 0 findings (tokens only)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. The labels "Applied technologies" and "Internal projects" come from the CV data (Norwegian on SCR-06).
