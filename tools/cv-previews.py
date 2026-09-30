"""Regenerate CV page previews (public/cv/cv-<lang>-<n>.webp) from the PDFs.

Run from the repo root after replacing a PDF:
    python tools/cv-previews.py

Needs Pillow and either PyMuPDF (pip install pymupdf pillow, works on Windows)
or poppler's pdftoppm on PATH.
"""
import io
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CV_DIR = ROOT / "public" / "cv"
APP_JS = ROOT / "public" / "app.js"
WIDTH = 1240          # px, matches width/height attrs in index.html (A4 at 150 dpi)
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


def main():
    expected = {m[0]: int(m[1]) for m in re.findall(r'(\w+): \{[^}]*cv-(?:\w+)\.pdf"[^}]*pages: (\d+)', APP_JS.read_text(encoding="utf-8"))}
    for pdf in sorted(CV_DIR.glob("alexander-ponomarenko-cv-*.pdf")):
        lang = pdf.stem.rsplit("-", 1)[-1]
        n = 0
        for n, im in enumerate(render_pages(pdf), start=1):
            im = im.convert("RGB")
            im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
            out = CV_DIR / f"cv-{lang}-{n}.webp"
            im.save(out, "WEBP", quality=QUALITY, method=6)
            print(f"{out.relative_to(ROOT)}  {out.stat().st_size // 1024} KB")
        extra = [p for p in CV_DIR.glob(f"cv-{lang}-*.webp") if int(p.stem.rsplit("-", 1)[-1]) > n]
        for p in extra:
            print(f"!! {p.relative_to(ROOT)} is left over from a longer PDF: delete it")
        if expected.get(lang) and expected[lang] != n:
            print(f"!! {pdf.name} has {n} pages, app.js says {expected[lang]}: update 'pages' in public/app.js")


if __name__ == "__main__":
    main()
