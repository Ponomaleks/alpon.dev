The signature contour ring group from the business card, cropped by its (position:relative) container; one per composition, never centred.

```jsx
<section style={{position:"relative",overflow:"hidden"}}>
  <Contours shape="ridge" anchor="bottom-right" tone="spruce" scale={1.4} ambient parallax />
  …
</section>
```

`shape="ridge"` = closed group (card back), `"corner"` = rings entering from a corner (card front). `anchor` picks which corner the group bleeds out of. `scale` >1 crops harder. `ambient` = 32s drift, `parallax` = ≤10px pointer shift on desktop; both are off under prefers-reduced-motion. `tone="auto"` follows the theme via --fjord-color-contour-line.
