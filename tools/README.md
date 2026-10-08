Helper sources; they are not deployed.

- `og.html` - the layout of `public/og.png` (1200x630) and `public/apple-touch-icon.png` (180x180). To render: copy `public/styles.css` to `tools/_styles.local.css`, replacing `url("/fonts/` with `url("../public/fonts/`, open the file in Chromium/Playwright and take screenshots of the elements `#og` and `#icon`.
- `contours-icon.svg` - thicker contour lines for the icon.
- `contours.py` - generator of the rings for `favicon.svg`.
- `cv-previews.py` - regenerates `public/cv/cv-<lang>-<n>.webp` from the PDF files. Run it from the repository root: `python tools/cv-previews.py`.
