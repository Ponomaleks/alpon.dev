Deterministic generative contour map from a seed (e.g. project slug); the placeholder whenever a project has no screenshot.

```jsx
<Terrain seed="fjordlog" tone="spruce" aspect="16 / 10" label="fjordlog" />
```

Same seed → same map, always. Main peak is forced off-centre. `terrainPath(seed)` is also exported for OG images or CSS backgrounds.
