"""Subset the variable brand TTFs (tools/fonts/src) to self-hosted woff2 in public/fonts.

One file per family (home sad §1, Decision override): the weight axis is limited to the brand
range 400-700 first, then the file is subset to Latin + Latin Extended-A (incl. æ ø å Æ Ø Å),
typographic punctuation (incl. – —), € ™ and arrows: the same coverage and layout features as
the static files it replaces. Existing files are only rewritten when they miss a required glyph
or with --force.

Run from the repo root: py tools/fonts/subset.py [--force]
Needs: py -m pip install --user fonttools brotli
"""

import sys
from io import BytesIO
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SRC = Path("tools/fonts/src")
OUT = Path("public/fonts")

FACES = {
    "schibsted-grotesk-wght": "SchibstedGrotesk-wght.ttf",
    "jetbrains-mono-wght": "JetBrainsMono-wght.ttf",
}

# The brand weights: Schibsted Grotesk 400/500/600/700, JetBrains Mono 400/500/700.
WEIGHT_RANGE = (400, 700)

UNICODES = (
    "U+0020-007E,U+00A0-017F,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
    "U+2010-2044,U+2074,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+FEFF"
)

FEATURES = ["calt", "case", "ccmp", "kern", "liga", "locl", "mark", "mkmk", "rlig", "rvrn", "tnum"]

REQUIRED = "æøåÆØÅ–—"
# A variable file holds every weight of its family (the static files were 30 KB for one weight).
MAX_BYTES = 50 * 1024


def missing_glyphs(path: Path) -> list[str]:
    cmap = TTFont(path).getBestCmap()
    return [c for c in REQUIRED if ord(c) not in cmap]


def build(name: str, ttf: str) -> None:
    out = OUT / f"{name}.woff2"
    options = subset.Options()
    options.flavor = "woff2"
    # The feature set of the shipped stub files; stylistic extras (frac, sups, dlig, …) are dropped.
    options.layout_features = FEATURES
    options.notdef_outline = True
    # The axis is narrowed first; the narrowed font is written to memory and read back, because
    # the subsetter needs the tables as a saved font has them.
    narrowed = BytesIO()
    instancer.instantiateVariableFont(TTFont(SRC / ttf), {"wght": WEIGHT_RANGE}).save(narrowed)
    narrowed.seek(0)
    font = subset.load_font(narrowed, options)
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=subset.parse_unicodes(UNICODES))
    subsetter.subset(font)
    subset.save_font(font, str(out), options)
    size = out.stat().st_size
    print(f"wrote {out} ({size} bytes)")
    if size > MAX_BYTES:
        sys.exit(f"{out} is {size} bytes, over the {MAX_BYTES}-byte budget")


def main() -> None:
    force = "--force" in sys.argv
    for name, ttf in FACES.items():
        out = OUT / f"{name}.woff2"
        if force or not out.exists() or missing_glyphs(out):
            build(name, ttf)
        else:
            print(f"kept {out} (has {REQUIRED})")


if __name__ == "__main__":
    main()
