Action button; `primary` is the one solid CTA per screen, everything else is secondary or ghost.

```jsx
<Button href="#contact" arrow>Get in touch</Button>
<Button variant="secondary" icon="file-down">Download PDF</Button>
```

`arrow` adds a nudging arrow (↗ when `external`). `href` renders an <a>. Disabled uses a dashed hairline, not low opacity. On `.fjord-on-spruce` the primary flips to stone.
