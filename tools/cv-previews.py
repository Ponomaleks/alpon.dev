"""Regenerate CV page previews (public/cv/cv-<lang>-<n>.webp) from the PDFs.

Run from the repo root after replacing a PDF:
    python tools/cv-previews.py

To compare with the committed images without touching them, write somewhere else:
    python tools/cv-previews.py --out <directory>

Needs Pillow and either PyMuPDF (pip install pymupdf pillow, works on Windows)
or poppler's pdftoppm on PATH.
"""
import argparse
import io
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CV_DIR = ROOT / "public" / "cv"
# The CV data names the page images of each CV PDF (src/data/cv/index.ts, `images`).
CV_DATA = ROOT / "src" / "data" / "cv" / "index.ts"
WIDTH = 1240          # px, matches the width/height in the CV data (A4 at 150 dpi)
DPI = 150
QUALITY = 82


def render_pages(pdf: Path):
    try:
        import fitz  # PyMuPDF
        with fitz.open(pdf) as doc:
            for page in doc:
                pix = page.get_pixmap(dpi=DPI)
                yield Image.open(io.BytesIO(pix.tobytes("png")))
        return
    except ImportError:
        pass
    if not shutil.which("pdftoppm"):
        raise SystemExit("Install PyMuPDF (pip install pymupdf pillow) or poppler (pdftoppm).")
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdftoppm", "-r", str(DPI), "-png", str(pdf), f"{tmp}/p"], check=True)
        for png in sorted(Path(tmp).glob("p-*.png"), key=lambda p: int(p.stem.split("-")[-1])):
            with Image.open(png) as im:
                yield im.copy()


def expected_pages():
    """How many page images the CV data lists per CV PDF, or None if it cannot be read."""
    if not CV_DATA.is_file():
        return None
    listed = re.search(r"\[([\d,\s]+)\]\.map\(\(n\) =>", CV_DATA.read_text(encoding="utf-8"))
    return len(listed.group(1).split(",")) if listed else None


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--out", type=Path, default=CV_DIR,
                        help="directory to write the images to (default: public/cv)")
    out_dir = parser.parse_args().out.resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    expected = expected_pages()
    if expected is None:
        print(f"!! could not read the page count from {CV_DATA.relative_to(ROOT)}: not checked")
    for pdf in sorted(CV_DIR.glob("alexander-ponomarenko-cv-*.pdf")):
        lang = pdf.stem.rsplit("-", 1)[-1]
        n = 0
        for n, im in enumerate(render_pages(pdf), start=1):
            im = im.convert("RGB")
            im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
            out = out_dir / f"cv-{lang}-{n}.webp"
            im.save(out, "WEBP", quality=QUALITY, method=6)
            shown = out.relative_to(ROOT) if out.is_relative_to(ROOT) else out
            print(f"{shown}  {out.stat().st_size // 1024} KB")
        extra = [p for p in CV_DIR.glob(f"cv-{lang}-*.webp") if int(p.stem.rsplit("-", 1)[-1]) > n]
        for p in extra:
            print(f"!! {p.relative_to(ROOT)} is left over from a longer PDF: delete it")
        if expected is not None and expected != n:
            print(f"!! {pdf.name} has {n} pages, the CV data lists {expected} page images: "
                  f"update `images` in {CV_DATA.relative_to(ROOT)}, the meta line and the page")


if __name__ == "__main__":
    main()
