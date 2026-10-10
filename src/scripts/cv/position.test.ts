import { describe, expect, it } from 'vitest';
import { POSITION_KEY, positionToRestore, savePosition, takePosition } from './position';

// AC-08 (ADR-0001): the language switch of the CV head must not move the page. The scroll position
// crosses to the other CV page as one number in sessionStorage: written on activation, removed on
// arrival, restored only above the first section of the new page. Nothing else is stored
// (spec §6.1).

function storage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
  };
}

const blocked = {
  getItem: (): string | null => {
    throw new Error('blocked');
  },
  setItem: (): void => {
    throw new Error('blocked');
  },
  removeItem: (): void => {
    throw new Error('blocked');
  },
};

describe('savePosition', () => {
  it('writes the position as one whole number under one key', () => {
    const s = storage();
    savePosition(s, 61.6);
    expect([...s.map.entries()]).toEqual([[POSITION_KEY, '62']]);
  });

  it('does not throw when the browser blocks storage', () => {
    expect(() => savePosition(blocked, 40)).not.toThrow();
  });
});

describe('takePosition', () => {
  it('returns the number and removes it', () => {
    const s = storage({ [POSITION_KEY]: '62' });
    expect(takePosition(s)).toBe(62);
    expect(s.map.size).toBe(0);
  });

  it('returns null when nothing was saved', () => {
    expect(takePosition(storage())).toBeNull();
  });

  it.each(['', 'abc', '-5', '1e999', '12px', '{"y":3}', ' 7', '3.5'])(
    'ignores and removes a value that is not a whole number of pixels: %j',
    (value) => {
      const s = storage({ [POSITION_KEY]: value });
      expect(takePosition(s)).toBeNull();
      expect(s.map.size).toBe(0);
    },
  );

  it('leaves other keys alone', () => {
    const s = storage({ [POSITION_KEY]: '10', 'fjord-theme': 'natt' });
    takePosition(s);
    expect([...s.map.keys()]).toEqual(['fjord-theme']);
  });

  it('returns null when the browser blocks storage', () => {
    expect(takePosition(blocked)).toBeNull();
  });
});

describe('positionToRestore', () => {
  // firstSectionLine: the scroll position from which the first section counts as in view.
  it('restores a position above the first section of the new page', () => {
    expect(positionToRestore(120, 307)).toBe(120);
  });

  it('opens at the top when the position would put a section in view', () => {
    expect(positionToRestore(307, 307)).toBeNull();
    expect(positionToRestore(900, 307)).toBeNull();
  });

  it('opens at the top when nothing was saved or the page was at its top', () => {
    expect(positionToRestore(null, 307)).toBeNull();
    expect(positionToRestore(0, 307)).toBeNull();
  });
});
