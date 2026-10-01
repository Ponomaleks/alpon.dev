Project card with screenshot or seeded terrain, status, one-line summary, one key result, stack, Live/Code links.

```jsx
<ProjectCard variant="featured" slug="fjordlog" title="Fjordlog" summary="…" result={{value:"1.2 s",label:"median LCP"}} stack={["Next.js"]} liveHref="#" codeHref="#" />
```

Whole card is a link to the case study; Live/Code sit above it. Sets `view-transition-name: project-<slug>` for shared-element transitions.
