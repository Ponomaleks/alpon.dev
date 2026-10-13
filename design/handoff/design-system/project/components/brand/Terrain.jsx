import React, { useMemo } from 'react';

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** Deterministic contour map for a seed (e.g. a project slug). Pure: same seed → same terrain. */
export function terrainPath(seed = 'alpon', { levels = 11, width = 400, height = 250 } = {}) {
  const r = mulberry(hash(String(seed)));
  const side = (lo, hi) => (r() < 0.5 ? lo + r() * (hi - lo) : 1 - hi + r() * (hi - lo));
  const bumps = [{ x: side(0.06, 0.3), y: side(0.12, 0.34), s: 0.34 + r() * 0.16, a: 1 }];
  const n = 3 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) bumps.push({ x: r(), y: r(), s: 0.1 + r() * 0.2, a: (r() < 0.3 ? -1 : 1) * (0.18 + r() * 0.34) });
  const k1 = 2 + r() * 4, k2 = 2 + r() * 4, p1 = r() * 6.28, p2 = r() * 6.28, asp = width / height;
  const f = (u, v) => {
    let z = 0.06 * Math.sin(u * k1 * asp + p1) * Math.cos(v * k2 + p2);
    for (const b of bumps) { const dx = (u - b.x) * asp, dy = v - b.y; z += b.a * Math.exp(-(dx * dx + dy * dy) / (2 * b.s * b.s)); }
    return z;
  };
  const NX = 88, NY = Math.round(88 / asp), g = [];
  let lo = Infinity, hi = -Infinity;
  for (let j = 0; j <= NY; j++) { const row = []; for (let i = 0; i <= NX; i++) { const z = f(i / NX, j / NY); row.push(z); if (z < lo) lo = z; if (z > hi) hi = z; } g.push(row); }
  const cw = width / NX, ch = height / NY;
  let d = '';
  const P = (x, y) => x.toFixed(1) + ' ' + y.toFixed(1);
  for (let l = 1; l <= levels; l++) {
    const t = lo + ((hi - lo) * l) / (levels + 1);
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const a = g[j][i], b = g[j][i + 1], c = g[j + 1][i + 1], e = g[j + 1][i];
      const idx = (a > t ? 8 : 0) | (b > t ? 4 : 0) | (c > t ? 2 : 0) | (e > t ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const x = i * cw, y = j * ch;
      const top = [x + cw * ((t - a) / (b - a)), y], right = [x + cw, y + ch * ((t - b) / (c - b))];
      const bot = [x + cw * ((t - e) / (c - e)), y + ch], left = [x, y + ch * ((t - a) / (e - a))];
      const seg = { 1: [left, bot], 2: [bot, right], 3: [left, right], 4: [top, right], 5: [left, top, bot, right], 6: [top, bot], 7: [left, top], 8: [left, top], 9: [top, bot], 10: [left, bot, top, right], 11: [top, right], 12: [left, right], 13: [bot, right], 14: [left, bot] }[idx];
      for (let s = 0; s < seg.length; s += 2) d += 'M' + P(...seg[s]) + 'L' + P(...seg[s + 1]);
    }
  }
  return d;
}

export function Terrain({ seed = 'alpon', tone = 'spruce', levels = 11, aspect = '16 / 10', ambient = false, label, className = '', style }) {
  const d = useMemo(() => terrainPath(seed, { levels }), [seed, levels]);
  return (
    <div className={`fj-terrain fj-terrain--${tone} ${ambient ? 'fj-terrain--drift' : ''} ${className}`} style={{ aspectRatio: aspect, ...style }} aria-hidden={label ? undefined : true}>
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
        <path d={d} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {label ? <span className="fj-terrain__label">{label}</span> : null}
    </div>
  );
}
