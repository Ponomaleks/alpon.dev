"""Generate Fjord topographic contour lines as SVG paths (hero, OG image, favicon)."""
import math, sys

def rings(cx, cy, n, step, sx=1.25, sy=.85, seed=1.7, base0=3.0, amp=1.0, pts=160):
    out = []
    for i in range(1, n + 1):
        base = base0 + i * step
        d = []
        for k in range(pts + 1):
            t = k / pts * math.pi * 2
            rr = base + amp * (1.6 * math.sin(3 * t + seed + i * .35)
                               + .9 * math.sin(5 * t + seed * 2 - i * .2)
                               + .5 * math.sin(2 * t + i * .6)) * (step / 4.6)
            x = cx + rr * math.cos(t) * sx
            y = cy + rr * math.sin(t) * sy
            d.append(("M" if k == 0 else "L") + f"{x:.1f} {y:.1f}")
        out.append("".join(d) + "Z")
    return out

if __name__ == "__main__":
    w, h, cx, cy, n, step = map(float, sys.argv[1:7])
    for p in rings(cx, cy, int(n), step):
        print(f'<path d="{p}"/>')
