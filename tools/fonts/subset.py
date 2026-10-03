"""Subset the brand TTFs (design/brand/fonts) to self-hosted woff2 in public/fonts.

Latin + Latin Extended-A (incl. æ ø å Æ Ø Å), typographic punctuation (incl. – —), € ™ and
arrows: the same coverage as the five files shipped with the stub. Existing files are only
rewritten when they miss a required glyph or with --force.

Run from the repo root: py tools/fonts/subset.py [--force]
Needs: py -m pip install --user fonttools brotli
"""

import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

SRC = Path("design/brand/fonts")
OUT = Path("public/fonts")

FACES = {
    "schibsted-grotesk-400": "SchibstedGrotesk-Regular.ttf",
    "schibsted-grotesk-500": "SchibstedGrotesk-Medium.ttf",
    "schibsted-grotesk-600": "SchibstedGrotesk-SemiBold.ttf",
    "schibsted-grotesk-700": "SchibstedGrotesk-Bold.ttf",
    "jetbrains-mono-400": "JetBrainsMono-Regular.ttf",
    "jetbrains-mono-500": "JetBrainsMono-Medium.ttf",
    "jetbrains-mono-700": "JetBrainsMono-Bold.ttf",
}

UNICODES = (
    "U+0020-007E,U+00A0-017F,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
    "U+2010-2044,U+2074,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+FEFF"
)

FEATURES = ["calt", "case", "ccmp", "kern", "liga", "locl", "mark", "mkmk", "rlig", "rvrn", "tnum"]

REQUIRED = "æøåÆØÅ–—"
MAX_BYTES = 30 * 1024


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
    font = subset.load_font(str(SRC / ttf), options)
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
