import { describe, expect, it } from 'vitest';
import {
  clampTarget,
  CLONES,
  cloneOrder,
  isActive,
  leftOf,
  logicalIndex,
  restsOnCopy,
  rotate,
  rotationPlan,
  shouldTurn,
  statusText,
  wrap,
} from './carousel';

// AC-42, AC-43 (D-20): the arithmetic of the Recommendations carousel. The row holds CLONES copies
// of the last cards before the first card and CLONES copies of the first cards after the last, so
// that it can be scrolled past either end; when scrolling stops the cards themselves are moved
// round, so that the cards in view at rest are always real ones, and the copies are made anew.
// Browser behaviour (arrows, swipe, focus, automatic turning) is in tests/e2e/carousel.spec.ts.

describe('wrap', () => {
  it('keeps an index inside the row and goes round at both ends', () => {
    expect(wrap(0, 4)).toBe(0);
    expect(wrap(3, 4)).toBe(3);
    expect(wrap(4, 4)).toBe(0);
    expect(wrap(5, 4)).toBe(1);
    expect(wrap(-1, 4)).toBe(3);
    expect(wrap(-5, 4)).toBe(3);
    expect(wrap(-1, 2)).toBe(1);
  });
});

describe('isActive', () => {
  it('turns the carousel on only with more cards than columns: one below 768, two from 768', () => {
    expect(isActive(1, false)).toBe(false);
    expect(isActive(2, false)).toBe(true);
    expect(isActive(2, true)).toBe(false);
    expect(isActive(3, true)).toBe(true);
    expect(isActive(0, false)).toBe(false);
  });
});

describe('cloneOrder', () => {
  it('copies the last cards before the row and the first cards after it', () => {
    expect(CLONES).toBe(2);
    expect(cloneOrder(4)).toEqual({ before: [2, 3], after: [0, 1] });
    expect(cloneOrder(3)).toEqual({ before: [1, 2], after: [0, 1] });
  });

  it('goes round when the row has fewer cards than copies', () => {
    expect(cloneOrder(2)).toEqual({ before: [0, 1], after: [0, 1] });
  });
});

describe('leftOf and logicalIndex', () => {
  const step = 300;

  it('places the first card after the copies', () => {
    expect(leftOf(0, step)).toBe(CLONES * step);
    expect(leftOf(3, step)).toBe((CLONES + 3) * step);
    expect(leftOf(-1, step)).toBe((CLONES - 1) * step);
  });

  it('reads the card at the left edge from the scroll position, copies included', () => {
    expect(logicalIndex(leftOf(0, step), step)).toBe(0);
    expect(logicalIndex(leftOf(2, step), step)).toBe(2);
    expect(logicalIndex(leftOf(-1, step), step)).toBe(-1);
    expect(logicalIndex(leftOf(4, step), step)).toBe(4);
  });

  it('rounds a position between two cards to the nearer one', () => {
    expect(logicalIndex(leftOf(1, step) + 140, step)).toBe(1);
    expect(logicalIndex(leftOf(1, step) + 160, step)).toBe(2);
    expect(logicalIndex(leftOf(1, step) - 0.4, step)).toBe(1);
  });

  it('stays at the first card when the row has no width yet', () => {
    expect(logicalIndex(0, 0)).toBe(0);
  });

  it('lands a stop on a copy on the card it copies', () => {
    expect(wrap(logicalIndex(leftOf(4, step), step), 4)).toBe(0);
    expect(wrap(logicalIndex(leftOf(-1, step), step), 4)).toBe(3);
  });
});

describe('rotate', () => {
  const row = ['a', 'b', 'c', 'd'];

  it('puts the card the row stopped on first and keeps the cards in their round order', () => {
    expect(rotate(row, 1)).toEqual(['b', 'c', 'd', 'a']);
    expect(rotate(row, 3)).toEqual(['d', 'a', 'b', 'c']);
    expect(rotate(row, -1)).toEqual(['d', 'a', 'b', 'c']);
    expect(rotate(row, 5)).toEqual(['b', 'c', 'd', 'a']);
  });

  it('leaves the row as it is when it stopped where it started or after a whole lap', () => {
    expect(rotate(row, 0)).toEqual(row);
    expect(rotate(row, 4)).toEqual(row);
    expect(rotate(row, -4)).toEqual(row);
  });

  it('never lets a copy be one of the cards at rest: the first cards are always real ones', () => {
    // From 768 the row shows two cards; after any stop both come from the row itself.
    for (let stop = -CLONES; stop <= row.length; stop++) {
      const [first, second] = rotate(row, stop);
      expect(row).toContain(first);
      expect(row).toContain(second);
      expect(second).toBe(row[wrap(row.indexOf(first as string) + 1, row.length)]);
    }
  });
});

describe('restsOnCopy', () => {
  it('is false wherever every card in view is a real one', () => {
    // One card in view: every place from the first card to the last.
    for (const at of [0, 1, 2, 3]) expect(restsOnCopy(at, 4, 1)).toBe(false);
    // Two in view: the last place with two real cards has the last card at the right edge.
    for (const at of [0, 1, 2]) expect(restsOnCopy(at, 4, 2)).toBe(false);
  });

  it('is true as soon as a copy is in view, at either end', () => {
    expect(restsOnCopy(-1, 4, 1)).toBe(true);
    expect(restsOnCopy(4, 4, 1)).toBe(true);
    expect(restsOnCopy(-1, 4, 2)).toBe(true);
    expect(restsOnCopy(3, 4, 2)).toBe(true);
    expect(restsOnCopy(4, 4, 2)).toBe(true);
    expect(restsOnCopy(2, 3, 2)).toBe(true);
  });
});

describe('rotationPlan', () => {
  it('moves the cards before the new first card to the end', () => {
    expect(rotationPlan(4, 1, -1)).toEqual({ take: 'front', cards: 1 });
    expect(rotationPlan(4, 3, -1)).toEqual({ take: 'front', cards: 3 });
  });

  it('moves the other cards instead when the focused card would have to move', () => {
    // Focus is in the first card and the row stopped one card on: the three others go in front.
    expect(rotationPlan(4, 1, 0)).toEqual({ take: 'back', cards: 3 });
    expect(rotationPlan(4, 3, 1)).toEqual({ take: 'back', cards: 1 });
  });

  it('keeps moving the front cards when the focused card is not among them', () => {
    expect(rotationPlan(4, 1, 1)).toEqual({ take: 'front', cards: 1 });
    expect(rotationPlan(4, 3, 3)).toEqual({ take: 'front', cards: 3 });
  });
});

describe('clampTarget', () => {
  it('keeps a target inside what the row can scroll to, copies included', () => {
    // One card in view: the copies after the row can both come to the left edge.
    expect(clampTarget(6, 4, 1)).toBe(5);
    expect(clampTarget(5, 4, 1)).toBe(5);
    // Two cards in view: the last position has the last copy at the right edge.
    expect(clampTarget(5, 4, 2)).toBe(4);
    expect(clampTarget(4, 4, 2)).toBe(4);
    expect(clampTarget(-3, 4, 2)).toBe(-CLONES);
    expect(clampTarget(1, 4, 2)).toBe(1);
  });
});

describe('statusText', () => {
  it('names the position for assistive technology', () => {
    expect(statusText(0, 4)).toBe('Recommendation 1 of 4');
    expect(statusText(3, 4)).toBe('Recommendation 4 of 4');
  });
});

describe('shouldTurn (AC-43)', () => {
  const running = {
    enabled: true,
    active: true,
    reducedMotion: false,
    motionPaused: false,
    hovered: false,
    focused: false,
    quoteOpen: false,
    pageHidden: false,
  };

  it('turns when automatic turning is on and nothing holds it', () => {
    expect(shouldTurn(running)).toBe(true);
  });

  it.each([
    ['automatic turning is off', { enabled: false }],
    ['the carousel is not on', { active: false }],
    ['the Visitor asks for reduced motion', { reducedMotion: true }],
    ['the Motion control paused motion', { motionPaused: true }],
    ['the pointer is over the row', { hovered: true }],
    ['focus is inside the row', { focused: true }],
    ['a quote is open', { quoteOpen: true }],
    ['the page is hidden', { pageHidden: true }],
  ])('does not turn when %s', (_name, change) => {
    expect(shouldTurn({ ...running, ...change })).toBe(false);
  });
});
