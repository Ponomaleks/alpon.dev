---
id: T28
title: "Define the projects collection and build the Dormant Selected projects section with ProjectCard"
layer: "ui"
deps: ["T26"]
acs: ["AC-11", "AC-12"]
files_hint: ["src/content.config.ts", "src/content/projects/", "src/data/samples.ts", "src/components/home/SelectedProjects.astro", "src/components/home/ProjectCard.astro", "src/components/home/projects.test.ts", "src/pages/index.astro", "src/pages/_index.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "done"
---

# T28 — Define the projects collection and build the Dormant Selected projects section with ProjectCard

## Why

AC-11, AC-12 ([spec §5](../spec.md)); spec §1.3 D-05; [sad §8 Dormant Selected projects, §11 empty collection](../sad.md); [screens.md SCR-04 Selected projects](../screens.md).

## What

- Reuses: `ui/SectionHeader`, `ui/Link`, `ui/Badge` (status), `ui/Tag`.
- `src/content.config.ts`: the `projects` collection (glob loader over `src/content/projects/*.md`) with the fields AC-12 names; the folder stays empty.
- `home/ProjectCard.astro` and `home/SelectedProjects.astro`: take projects as a prop; up to three featured, the first large (media 7 parts, text 5 from 1024), two compact cards in two columns from 768; "Live" and "Code" only where they exist.
- `src/data/samples.ts`: three marked sample projects, one without a live link.
- `index.astro`: renders the section only when `features.projects` is true and at least one Published project exists; it stays off.

## Definition of Done

- [ ] `src/components/home/projects.test.ts`: card fields, missing live link, three-card limit, schema
- [ ] `src/pages/_index.test.ts`: the section is absent while the switch is off; section numbers have no gap
- [ ] `npm run build` passes with an empty `src/content/projects/`
- [ ] Stylelint 0 findings
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 4b.
- Check the Astro Docs MCP for the content collection API of Astro 6 (`content.config.ts`, `glob` loader, an empty folder) before writing the config.
- Step 7 owns the switch, the Projects pages and the hero "See projects"; nothing here turns them on.
