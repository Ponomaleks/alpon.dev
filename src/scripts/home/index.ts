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
initMotion({ document, storage: sessionStorage, matchMedia: matches });
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
