// Recommendations carousel (AC-42, AC-43; D-20). The markup is a row that scrolls sideways with
// scroll snap wherever it holds more cards than columns, so swipe and keyboard scrolling work
// without this script. The script makes the row go round and adds the arrows:
//   - copies of the last cards stand before the first card and copies of the first cards after the
//     last (inert, hidden from assistive technology), so that the row can be scrolled past either
//     end; when scrolling stops, the cards themselves are moved round in the page so that the card
//     at the left edge is the first of the row again, and the copies are made anew around them.
//     The cards in view at rest are therefore always the real ones, also from 768, where two show;
//   - the arrows scroll by one card; the position is announced as "Recommendation N of M";
//   - with data-autoplay the row turns by itself, unless something holds it (shouldTurn).
// With no more cards than columns at the current width the script leaves the row as it is.

/** Copies on each side: the most cards the row shows at once. */
export const CLONES = 2;
const WIDE = '(min-width: 768px)';
const REDUCED = '(prefers-reduced-motion: reduce)';
const SETTLE_MS = 120;
/** How long a scroll started by an arrow or a turn may take before the row is taken as stopped. */
const ARRIVE_MS = 1500;
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

/** The row after it stopped `shift` cards on (or back): that card first, the round order kept. */
export function rotate<T>(order: readonly T[], shift: number): T[] {
  const k = order.length ? wrap(shift, order.length) : 0;
  return [...order.slice(k), ...order.slice(0, k)];
}

/**
 * How to rotate the cards in the page by `shift` (1 to count - 1): move the front cards to the
 * end, or, when the focused card (its place in the row, -1 for none) is among them, move the
 * others to the front instead. A card that is moved in the page loses focus, so it never moves.
 */
export function rotationPlan(
  count: number,
  shift: number,
  focused: number,
): { take: 'front' | 'back'; cards: number } {
  return focused >= 0 && focused < shift
    ? { take: 'back', cards: count - shift }
    : { take: 'front', cards: shift };
}

/** The furthest places the row can scroll to, copies included, for the cards it shows at once. */
export const clampTarget = (to: number, count: number, perView: number): number =>
  Math.min(Math.max(to, -CLONES), count + CLONES - perView);

export function initCarousel(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>('[data-carousel-track]');
  const nav = root.querySelector<HTMLElement>('[data-carousel-nav]');
  const status = root.querySelector<HTMLElement>('[data-carousel-status]');
  if (!track || !nav) return;
  const [previous, next] = nav.querySelectorAll('button');
  /** The cards in the order of the content; `order` is the order they stand in now. */
  const cards = [...track.children] as HTMLElement[];
  const count = cards.length;
  const wide = matchMedia(WIDE);
  const reduced = matchMedia(REDUCED);

  let active = false;
  let order = [...cards];
  let hovered = false;
  let width = 0;
  /** Where the row is scrolling to after an arrow or a turn; null once it has stopped. */
  let target: number | null = null;
  let targetSince = 0;
  let settle: ReturnType<typeof setTimeout> | undefined;

  const step = () => {
    const [first, second] = track.children as unknown as HTMLElement[];
    return first && second ? second.offsetLeft - first.offsetLeft : 0;
  };
  /** Puts the first card of the row at the left edge, without animation. */
  const place = () => track.scrollTo({ left: leftOf(0, step()), behavior: 'instant' });

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
  const removeCopies = () => {
    for (const clone of track.querySelectorAll('[data-carousel-clone]')) clone.remove();
  };
  const addCopies = () => {
    const { before, after } = cloneOrder(count);
    track.prepend(...before.map((i) => copy(order[i] as HTMLElement)));
    track.append(...after.map((i) => copy(order[i] as HTMLElement)));
  };

  /**
   * The row stopped `shift` cards away from its first card. The cards themselves are moved round
   * so that the card at the left edge is the first of the row again, and the copies are made anew
   * around them: the cards in view at rest are then always the real ones, never a copy.
   */
  const comeRound = (shift: number) => {
    const k = wrap(shift, count);
    removeCopies();
    if (k > 0) {
      const focused = order.findIndex((card) => card.contains(document.activeElement));
      const plan = rotationPlan(count, k, focused);
      if (plan.take === 'front') track.append(...order.slice(0, plan.cards));
      else track.prepend(...order.slice(count - plan.cards));
      order = rotate(order, k);
    }
    addCopies();
    place();
  };

  const activate = () => {
    order = [...cards];
    addCopies();
    root.setAttribute('data-carousel-active', '');
    root.setAttribute('role', 'group');
    root.setAttribute('aria-roledescription', 'carousel');
    root.setAttribute('aria-label', 'Recommendations');
    nav.hidden = false;
    active = true;
    place();
  };

  const deactivate = () => {
    removeCopies();
    // Back to the order of the content.
    track.append(...cards);
    order = [...cards];
    for (const name of ['data-carousel-active', 'role', 'aria-roledescription', 'aria-label']) {
      root.removeAttribute(name);
    }
    nav.hidden = true;
    active = false;
    track.scrollTo({ left: 0, behavior: 'instant' });
  };

  const sync = () => {
    const wanted = isActive(count, wide.matches);
    if (wanted && !active) activate();
    else if (!wanted && active) deactivate();
    else if (active) place();
  };

  /** Scrolls by one card; past either end the target is a copy, and onSettle brings the row round. */
  const go = (delta: number, announce: boolean) => {
    // A second press while the row is still moving counts from where it is going, not from the
    // place it happens to be at.
    const from = target ?? logicalIndex(track.scrollLeft, step());
    const to = clampTarget(from + delta, count, wide.matches ? 2 : 1);
    target = to;
    targetSince = Date.now();
    track.scrollTo({
      left: leftOf(to, step()),
      behavior: reduced.matches ? 'instant' : 'smooth',
    });
    if (announce && status) {
      const card = order[wrap(to, count)] as HTMLElement;
      status.textContent = statusText(cards.indexOf(card), count);
    }
  };

  const onSettle = () => {
    // A scroll started by an arrow may pause between two frames for longer than the settle
    // delay: the row has not stopped until it is where it was sent, or has had time enough.
    if (
      target !== null &&
      Math.abs(track.scrollLeft - leftOf(target, step())) > 1 &&
      Date.now() - targetSince < ARRIVE_MS
    ) {
      settle = setTimeout(onSettle, SETTLE_MS);
      return;
    }
    target = null;
    if (!active) return;
    const at = logicalIndex(track.scrollLeft, step());
    if (at !== 0) comeRound(at);
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
  // The width of a card changes with the row: keep the first card at the left edge. A change of
  // height (a quote opened) moves nothing sideways.
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (track.clientWidth === width) return;
      width = track.clientWidth;
      if (active) place();
    }).observe(track);
  }

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
