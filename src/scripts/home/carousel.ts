// Recommendations carousel (AC-42, AC-43; D-20). The markup is a row that scrolls sideways with
// scroll snap wherever it holds more cards than columns, so swipe and keyboard scrolling work
// without this script. The script makes the row go round and adds the arrows:
//   - copies of the last cards stand before the first card and copies of the first cards after the
//     last (inert, hidden from assistive technology); when scrolling stops on a copy the row jumps,
//     without animation, to the card it copies;
//   - the arrows scroll by one card; the position is announced as "Recommendation N of M";
//   - with data-autoplay the row turns by itself, unless something holds it (shouldTurn).
// With no more cards than columns at the current width the script leaves the row as it is.

/** Copies on each side: the most cards the row shows at once. */
export const CLONES = 2;
const WIDE = '(min-width: 768px)';
const REDUCED = '(prefers-reduced-motion: reduce)';
const SETTLE_MS = 120;
const AUTOPLAY_MS = 7000;

export const wrap = (index: number, count: number): number => ((index % count) + count) % count;

/** More cards than columns: one column below 768, two from 768. */
export const isActive = (count: number, wide: boolean): boolean => count > (wide ? 2 : 1);

/** Which cards are copied before the row and after it, in the order they stand. */
export function cloneOrder(count: number): { before: number[]; after: number[] } {
  const ks = Array.from({ length: CLONES }, (_, k) => k);
  return {
    before: ks.map((k) => wrap(k - CLONES, count)),
    after: ks.map((k) => wrap(k, count)),
  };
}

/** Scroll position that puts a card (or, outside the row, a copy) at the left edge. */
export const leftOf = (index: number, step: number): number => (index + CLONES) * step;

/** The card at the left edge; below 0 or past the last card it is a copy. */
export const logicalIndex = (scrollLeft: number, step: number): number =>
  step > 0 ? Math.round(scrollLeft / step) - CLONES : 0;

export const statusText = (index: number, count: number): string =>
  `Recommendation ${index + 1} of ${count}`;

export interface TurnState {
  enabled: boolean;
  active: boolean;
  reducedMotion: boolean;
  motionPaused: boolean;
  hovered: boolean;
  focused: boolean;
  quoteOpen: boolean;
  pageHidden: boolean;
}

/** Automatic turning moves the row only when it is on and nothing holds it (AC-43). */
export const shouldTurn = (s: TurnState): boolean =>
  s.enabled &&
  s.active &&
  !s.reducedMotion &&
  !s.motionPaused &&
  !s.hovered &&
  !s.focused &&
  !s.quoteOpen &&
  !s.pageHidden;

export function initCarousel(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>('[data-carousel-track]');
  const nav = root.querySelector<HTMLElement>('[data-carousel-nav]');
  const status = root.querySelector<HTMLElement>('[data-carousel-status]');
  if (!track || !nav) return;
  const [previous, next] = nav.querySelectorAll('button');
  const cards = [...track.children] as HTMLElement[];
  const count = cards.length;
  const wide = matchMedia(WIDE);
  const reduced = matchMedia(REDUCED);

  let active = false;
  let index = 0;
  let hovered = false;
  let settle: ReturnType<typeof setTimeout> | undefined;

  const step = () => {
    const [first, second] = track.children as unknown as HTMLElement[];
    return first && second ? second.offsetLeft - first.offsetLeft : 0;
  };
  const jump = (to: number) => {
    index = wrap(to, count);
    track.scrollTo({ left: leftOf(index, step()), behavior: 'instant' });
  };

  const copy = (card: HTMLElement) => {
    const clone = card.cloneNode(true) as HTMLElement;
    clone.inert = true;
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('data-carousel-clone', '');
    // A copy must not repeat an id; it is never the target of a control.
    for (const el of [clone, ...clone.querySelectorAll('[id], [aria-controls]')]) {
      el.removeAttribute('id');
      el.removeAttribute('aria-controls');
    }
    return clone;
  };

  const activate = () => {
    const { before, after } = cloneOrder(count);
    track.prepend(...before.map((i) => copy(cards[i] as HTMLElement)));
    track.append(...after.map((i) => copy(cards[i] as HTMLElement)));
    root.setAttribute('data-carousel-active', '');
    root.setAttribute('role', 'group');
    root.setAttribute('aria-roledescription', 'carousel');
    root.setAttribute('aria-label', 'Recommendations');
    nav.hidden = false;
    active = true;
    jump(0);
  };

  const deactivate = () => {
    for (const clone of track.querySelectorAll('[data-carousel-clone]')) clone.remove();
    for (const name of ['data-carousel-active', 'role', 'aria-roledescription', 'aria-label']) {
      root.removeAttribute(name);
    }
    nav.hidden = true;
    active = false;
    index = 0;
    track.scrollTo({ left: 0, behavior: 'instant' });
  };

  const sync = () => {
    const wanted = isActive(count, wide.matches);
    if (wanted && !active) activate();
    else if (!wanted && active) deactivate();
    else if (active) jump(index);
  };

  /** Scrolls by one card; past either end the target is a copy, and onSettle brings the row back. */
  const go = (delta: number, announce: boolean) => {
    const from = logicalIndex(track.scrollLeft, step());
    const to = from + delta;
    track.scrollTo({
      left: leftOf(to, step()),
      behavior: reduced.matches ? 'instant' : 'smooth',
    });
    if (announce && status) status.textContent = statusText(wrap(to, count), count);
  };

  const onSettle = () => {
    if (!active) return;
    const at = logicalIndex(track.scrollLeft, step());
    if (at < 0 || at >= count) jump(at);
    else index = at;
  };

  track.addEventListener(
    'scroll',
    () => {
      clearTimeout(settle);
      settle = setTimeout(onSettle, SETTLE_MS);
    },
    { passive: true },
  );
  previous?.addEventListener('click', () => go(-1, true));
  next?.addEventListener('click', () => go(1, true));
  wide.addEventListener('change', sync);
  // The width of a card changes with the row: keep the current card at the left edge.
  if ('ResizeObserver' in window) new ResizeObserver(() => active && jump(index)).observe(track);

  if (root.hasAttribute('data-autoplay')) {
    root.addEventListener('pointerenter', () => (hovered = true));
    root.addEventListener('pointerleave', () => (hovered = false));
    setInterval(() => {
      const turn = shouldTurn({
        enabled: true,
        active,
        reducedMotion: reduced.matches,
        motionPaused:
          document.querySelector('[data-hero]')?.getAttribute('data-motion') === 'paused',
        hovered,
        focused: root.contains(document.activeElement),
        quoteOpen: root.querySelector('[data-quote][data-expanded]') !== null,
        pageHidden: document.visibilityState === 'hidden',
      });
      if (turn) go(1, false);
    }, AUTOPLAY_MS);
  }

  sync();
}
