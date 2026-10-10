// The scroll position the language switch of the CV head carries to the other CV page (AC-08,
// ADR-0001): one whole number in sessionStorage, written on activation and removed on arrival.
// It is the only thing this feature stores (spec §6.1).

export const POSITION_KEY = 'fjord-cv-scroll';

type PositionStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function savePosition(storage: PositionStorage, y: number): void {
  try {
    storage.setItem(POSITION_KEY, String(Math.round(y)));
  } catch {
    // Storage is blocked: the other page opens at its top.
  }
}

/** Reads the carried position and removes it. Anything but a whole number of pixels is dropped. */
export function takePosition(storage: PositionStorage): number | null {
  try {
    const value = storage.getItem(POSITION_KEY);
    storage.removeItem(POSITION_KEY);
    return value !== null && /^\d{1,7}$/.test(value) ? Number(value) : null;
  } catch {
    return null;
  }
}

/**
 * The position to open the page at, or null for its top. `firstSectionLine` is the scroll position
 * from which the first section of this page counts as in view: a carried position is restored only
 * above it, so the head's switch never lands inside a section.
 */
export function positionToRestore(y: number | null, firstSectionLine: number): number | null {
  return y !== null && y > 0 && y < firstSectionLine ? y : null;
}
