// The home page's one script entry (AC-32): wires every home module.
import { initCopyEmail } from './copy-email';
import { initCountUp } from './count-up';
import { initHeroHeader } from './hero-header';
import { initMotion } from './motion';
import { initParallax } from './parallax';
import { initReveal } from './reveal';

const matches = (query: string) => matchMedia(query);
const ObserverCtor = 'IntersectionObserver' in window ? IntersectionObserver : null;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

initHeroHeader();
// Reading sessionStorage can throw when the browser blocks it: keep the choice in memory then.
function pickStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  try {
    return sessionStorage;
  } catch {
    const memory = new Map<string, string>();
    return {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => void memory.set(key, value),
      removeItem: (key) => void memory.delete(key),
    };
  }
}

initMotion({ document, storage: pickStorage(), matchMedia: matches });
initParallax({ document, matchMedia: matches });

const countUpRoot = document.querySelector('[data-count-up]');
if (countUpRoot) {
  initCountUp(countUpRoot, {
    ObserverCtor,
    reducedMotion,
    frame: (cb) => requestAnimationFrame(cb),
  });
}

initCopyEmail({ document, navigator });

const fragment = decodeURIComponent(location.hash.slice(1));
initReveal(document.querySelectorAll('[data-reveal-section]'), {
  viewportHeight: window.innerHeight,
  target: fragment ? document.getElementById(fragment) : null,
  ObserverCtor,
  reducedMotion,
});
