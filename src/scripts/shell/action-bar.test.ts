import { describe, expect, it } from 'vitest';
import { applyBarAction, decideBar } from './action-bar';

// AC-08, AC-09 (sad §6 critical flow 2, G-4, G-5). A pure decision function: previous scroll
// position, new position, focus inside the bar, reduced motion -> 'hide' | 'show' | 'none'.
// The component <script> only reads the scroll position and calls applyBarAction.

const move = (
  prev: number,
  next: number,
  opts: { focusInside?: boolean; reducedMotion?: boolean } = {},
) =>
  decideBar({
    prev,
    next,
    focusInside: opts.focusInside ?? false,
    reducedMotion: opts.reducedMotion ?? false,
  });

describe('decideBar: G-5 thresholds', () => {
  it('hides on a move down of 8 px or more', () => {
    expect(move(100, 108)).toBe('hide');
    expect(move(100, 400)).toBe('hide');
  });

  it('shows on a move up of 8 px or more', () => {
    expect(move(400, 392)).toBe('show');
    expect(move(400, 100)).toBe('show');
  });

  it('ignores a change smaller than 8 px, in both directions', () => {
    expect(move(100, 107)).toBe('none');
    expect(move(100, 93)).toBe('none');
    expect(move(100, 100)).toBe('none');
  });

  it('always shows within 40 px of the top of the page', () => {
    expect(move(200, 39)).toBe('show');
    expect(move(0, 39)).toBe('show');
    expect(move(10, 30)).toBe('show');
    expect(move(0, 0)).toBe('show');
  });

  it('does not treat 40 px itself as near the top', () => {
    expect(move(100, 40)).toBe('show'); // moving up by 60 is a normal show
    expect(move(20, 40)).toBe('hide'); // moving down by 20 from near the top, now at 40
  });
});

describe('decideBar: G-4 focus guard', () => {
  it('never hides while focus is inside the bar', () => {
    expect(move(100, 400, { focusInside: true })).toBe('none');
  });

  it('still shows while focus is inside the bar', () => {
    expect(move(400, 100, { focusInside: true })).toBe('show');
    expect(move(200, 10, { focusInside: true })).toBe('show');
  });
});

describe('decideBar: reduced motion (AC-09)', () => {
  it('changes nothing in either direction or near the top', () => {
    expect(move(100, 400, { reducedMotion: true })).toBe('none');
    expect(move(400, 100, { reducedMotion: true })).toBe('none');
    expect(move(200, 10, { reducedMotion: true })).toBe('none');
  });
});

describe('applyBarAction: the script writes only inert', () => {
  function bar() {
    const calls: string[] = [];
    let inert = false;
    return {
      calls,
      get inert() {
        return inert;
      },
      set inert(value: boolean) {
        calls.push(`inert=${value}`);
        inert = value;
      },
    };
  }

  it('hide sets inert, show removes it, none leaves it', () => {
    const b = bar();
    applyBarAction(b, 'hide');
    expect(b.inert).toBe(true);
    applyBarAction(b, 'none');
    expect(b.inert).toBe(true);
    applyBarAction(b, 'show');
    expect(b.inert).toBe(false);
  });

  it('none writes nothing', () => {
    const b = bar();
    applyBarAction(b, 'none');
    expect(b.calls).toEqual([]);
  });
});
