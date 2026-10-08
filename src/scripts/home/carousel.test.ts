import { describe, expect, it } from 'vitest';
import {
  CLONES,
  cloneOrder,
  isActive,
  leftOf,
  logicalIndex,
  shouldTurn,
  statusText,
  wrap,
} from './carousel';

// AC-42, AC-43 (D-20): the arithmetic of the Recommendations carousel. The row holds CLONES copies
// of the last cards before the first card and CLONES copies of the first cards after the last, so
// that it can be scrolled past either end; when scrolling stops on a copy the row jumps to the
// card it copies. Browser behaviour (arrows, swipe, focus) is checked by tests/e2e/carousel.spec.ts.

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
