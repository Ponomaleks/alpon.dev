Sticky site header: mono wordmark, Projects / CV / Contact, ⌘K hint, Light/Dark toggle, persistent "Get in touch" CTA.

```jsx
<Header current="projects" theme={theme} onThemeChange={applyTheme} onOpenPalette={open} onOpenMenu={openMenu} />
```

Below 768px collapses to wordmark + CTA + menu button (force with `compact`). Gains a hairline once scrolled.
