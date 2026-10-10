// The home page's one script entry (AC-32): wires every home module.
import { initCarousel } from './carousel';
import { initCopyEmail } from '../shared/copy-email';
import { initCountUp } from './count-up';
import { initHeroHeader } from './hero-header';
import { initMotion } from './motion';
import { initParallax } from './parallax';
import { initQuoteToggle } from './quote-toggle';
import { initReveal } from './reveal';
import { legacyCvTarget } from './legacy-cv';

const matches = (query: string) => matchMedia(query);
const ObserverCtor = 'IntersectionObserver' in window ? IntersectionObserver : null;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Legacy CV addresses hand over to the CV pages; replace keeps one Back on the page before.
const legacyTarget = legacyCvTarget(location.hash);
if (legacyTarget) location.replace(legacyTarget);

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

// The built CSS may serialise 1800ms as "1.8s": read the unit, the script wants milliseconds.
const copied = getComputedStyle(document.documentElement).getPropertyValue(
  '--fjord-duration-copied',
);
const copiedMs = parseFloat(copied) * (copied.trim().endsWith('ms') ? 1 : 1000);
initCopyEmail({ document, navigator, duration: copiedMs });

// Quotes first: the carousel copies the cards in the state the toggle leaves them in.
initQuoteToggle(document);
const carousel = document.querySelector<HTMLElement>('[data-carousel]');
if (carousel) initCarousel(carousel);

const fragment = decodeURIComponent(location.hash.slice(1));
initReveal(document.querySelectorAll('[data-reveal-section]'), {
  viewportHeight: window.innerHeight,
  target: fragment ? document.getElementById(fragment) : null,
  ObserverCtor,
  reducedMotion,
});
