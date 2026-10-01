Pill radiogroup for 2–3 mutually exclusive options: EN / NO on the CV, Light / Dark theme.

```jsx
<SegmentedControl label="CV language" options={["EN","NO"]} value={lang} onChange={setLang} />
```

Also exports `ThemeToggle` and `applyTheme(theme)` (sets data-theme with a View Transition cross-fade).
