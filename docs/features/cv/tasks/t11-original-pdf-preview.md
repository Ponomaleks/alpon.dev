---
id: T11
title: "Build the Original PDF preview and the meta line"
layer: "ui"
deps: ["T4", "T7"]
acs: ["AC-05", "AC-09", "AC-10"]
files_hint: ["src/components/cv/OriginalPdfPreview.astro", "src/components/cv/CvMeta.astro", "src/components/cv/preview.test.ts"]
owner: "Alexander Ponomarenko"
estimate: "M"
status: "todo"
---

# T11 — Build the Original PDF preview and the meta line

## Why

AC-09, AC-10, AC-05 ([spec §5](../spec.md)); [sad §8 Original PDF preview](../sad.md); screens SCR-05 `preview closed`, `preview open`, `page image link`, `page image failed`, `preview closed again`, `meta line`; SCR-06 `preview`; wireframe W-3; [screens C-8](../screens.md); spec §1.3 D-03.

## What

- Reuses: the ghost Button look (T7), `ui/Icon` (`eye`, `x`).
- NEW `cv/OriginalPdfPreview` (Figure is a single image with a caption): native `<details>`, no script; each page image is `<img loading="lazy">` with `width` and `height` inside a link; the failed-image box keeps its size and shows the name (C-8).
- `cv/CvMeta`: the meta line, used here and by the CV head (T16).

## Definition of Done

- [ ] `src/components/cv/preview.test.ts`: `details` without `open`; summary text per CV language; two links with `target="_blank"`, the `rel` of the site rule and the names of AC-09 (English) and screens C-3 (Norwegian)
- [ ] Same file: each `img` has `loading="lazy"`, `width`, `height` and the name as its text alternative; no `embed`, `object` or `iframe`
- [ ] Same file: the meta line shows `cvDate` in `<time datetime>` and the format line in the CV language
- [ ] Stylelint 0 findings (tokens only)
- [ ] `npm run lint` and `npm run test:unit` green

## Notes

- Phase 5a. "No request before opening" and the failed image are checked on the page in T25.
- The opening motion uses motion tokens and falls back to a fade with reduced motion (screens `reduced-motion`).
