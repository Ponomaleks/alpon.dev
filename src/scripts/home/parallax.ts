// Hero pointer parallax (AC-31; sad §1 Decision override, §8 Hero parallax). The one named
// exception to "scripts never write styles": two custom properties on one element, written with
// style.setProperty only. Active only for a fine pointer with hover and without reduced motion;
// CSS turns --fj-px / --fj-py into a translate, capped at --fjord-parallax-max (10px).

const MAX = 10;
const REDUCED = '(prefers-reduced-motion: reduce)';
const FINE = '(hover: hover) and (pointer: fine)';

interface ParallaxEnv {
  document: Pick<Document, 'querySelector'>;
  matchMedia: (query: string) => Pick<MediaQueryList, 'matches' | 'addEventListener'>;
}

const clamp = (n: number) => Math.max(-MAX, Math.min(MAX, n));

export function initParallax({ document, matchMedia }: ParallaxEnv): void {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const layer = document.querySelector<HTMLElement>('[data-contours-parallax]');
  if (!hero || !layer) return;

  const fine = matchMedia(FINE);
  const reduced = matchMedia(REDUCED);

  hero.addEventListener('pointermove', (e: PointerEvent) => {
    if (!fine.matches || reduced.matches) return;
    const r = hero.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2 * MAX;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2 * MAX;
    layer.style.setProperty('--fj-px', `${clamp(x).toFixed(2)}px`);
    layer.style.setProperty('--fj-py', `${clamp(y).toFixed(2)}px`);
  });
}
