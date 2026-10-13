// Header over the hero (AC-33, ADR-0001). The server renders `data-over-hero` on the header; this
// script removes it once the hero no longer reaches below the header and puts it back when it
// does. The state is read from the two rects, so the observer only says "look again". The check
// also runs at start and on `pageshow`, because a restored scroll position raises no observer
// callback. The only write is the one attribute.

const ATTR = 'data-over-hero';

interface Observer {
  observe(target: Element): void;
}

type ObserverConstructor = new (
  callback: () => void,
  options?: { rootMargin?: string },
) => Observer;

export interface HeroHeaderOptions {
  header?: Element | null;
  hero?: Element | null;
  ObserverCtor?: ObserverConstructor;
  target?: EventTarget;
}

export function initHeroHeader(options: HeroHeaderOptions = {}): void {
  const {
    header = document.querySelector('[data-header]'),
    hero = document.querySelector('[data-hero]'),
    ObserverCtor = typeof IntersectionObserver === 'undefined' ? undefined : IntersectionObserver,
    target = window,
  } = options;
  if (!header || !hero) return;

  const check = () => {
    const over = hero.getBoundingClientRect().bottom > header.getBoundingClientRect().bottom;
    if (over === header.hasAttribute(ATTR)) return;
    if (over) header.setAttribute(ATTR, '');
    else header.removeAttribute(ATTR);
  };

  check();
  target.addEventListener('pageshow', check);
  if (ObserverCtor) {
    const height = header.getBoundingClientRect().height;
    new ObserverCtor(check, { rootMargin: `-${height}px 0px 0px 0px` }).observe(hero);
  }
}
