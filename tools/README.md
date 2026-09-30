Службові джерела, у деплой не йдуть.

- `og.html` - макет `public/og.png` (1200x630) і `public/apple-touch-icon.png` (180x180). Рендер: скопіювати `public/styles.css` у `tools/_styles.local.css`, замінивши `url("/fonts/` на `url("../public/fonts/`, відкрити в Chromium/Playwright і зробити скріншоти елементів `#og` і `#icon`.
- `contours-icon.svg` - товстіші горизонталі для іконки.
- `contours.py` - генератор кілець для `favicon.svg`.
- `cv-previews.py` - перегенерує `public/cv/cv-<lang>-<n>.webp` з PDF. Запуск з кореня репозиторію: `python tools/cv-previews.py`.
