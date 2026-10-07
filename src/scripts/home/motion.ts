// Ambient motion switch of the hero (AC-30, AC-31; ADR-0003). Sets data-motion="running|paused" on
// [data-hero] and keeps the Motion control's name and aria-pressed in step; CSS does the rest.
// Under prefers-reduced-motion: reduce no attribute is set (and the control stays hidden).
// The choice lives in session storage under 'fjord-motion' ("paused" only); storage may throw.

const KEY = 'fjord-motion';
const REDUCED = '(prefers-reduced-motion: reduce)';

interface MotionEnv {
  document: Pick<Document, 'querySelector'>;
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
  matchMedia: (query: string) => Pick<MediaQueryList, 'matches' | 'addEventListener'>;
}

export function initMotion({ document, storage, matchMedia }: MotionEnv): void {
  const hero = document.querySelector('[data-hero]');
  const control = document.querySelector('[data-motion-control]');
  if (!hero) return;

  const reduced = matchMedia(REDUCED);
  let paused = false;
  try {
    paused = storage.getItem(KEY) === 'paused';
  } catch {
    // storage blocked: the choice still applies for this page view
  }

  const apply = () => {
    if (reduced.matches) {
      hero.removeAttribute('data-motion');
      return;
    }
    hero.setAttribute('data-motion', paused ? 'paused' : 'running');
    control?.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
    control?.setAttribute('aria-pressed', String(paused));
  };

  control?.addEventListener('click', () => {
    paused = !paused;
    try {
      if (paused) storage.setItem(KEY, 'paused');
      else storage.removeItem(KEY);
    } catch {
      // ignored, see above
    }
    apply();
  });
  reduced.addEventListener('change', apply);
  apply();
}
