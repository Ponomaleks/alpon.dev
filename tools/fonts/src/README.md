# Variable font sources

The masters of the two brand font files in `public/fonts/` (home sad §1, Decision override).
`design/brand/fonts/` holds the static brand TTFs and stays read-only; the variable files live here.

| File | Original name | Source | Version |
|---|---|---|---|
| `SchibstedGrotesk-wght.ttf` | `SchibstedGrotesk[wght].ttf` | Google Fonts, `ofl/schibstedgrotesk` | 1.100, as `design/brand/fonts/SchibstedGrotesk-*.ttf` |
| `JetBrainsMono-wght.ttf` | `JetBrainsMono[wght].ttf` | Google Fonts, `ofl/jetbrainsmono` | 2.211, as `design/brand/fonts/JetBrainsMono-*.ttf` |

Taken on 2026-10-06 from `https://github.com/google/fonts` (branch `main`). Both are under the SIL
Open Font License 1.1; `OFL-SchibstedGrotesk.txt` and `OFL-JetBrainsMono.txt` here are the licence
files of those folders and are the same, byte for byte, as the copies in `design/brand/fonts/`.

The files are renamed because square brackets in a path are glob characters for several tools.

`py tools/fonts/subset.py --force` writes `public/fonts/*-wght.woff2` from them (weight axis limited
to 400–700, then the Latin subset). `tools/fonts/fonts.test.ts` checks that the default instance of
each file has the metrics of the static Regular TTF, which the fallback faces and the measures of
`tokens.css` were computed from.
