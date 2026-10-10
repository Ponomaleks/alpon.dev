// Moves keyboard focus to the CV section a fragment names (AC-08, spec §6.1, ADR-0001). The browser
// does the scrolling; anything that is not exactly a section id of this page is ignored.

export interface ArriveOptions {
  /** `location.hash` as the browser gives it, still percent-encoded. */
  hash: string;
  ids: readonly string[];
  document: {
    getElementById(id: string): { focus(options?: { preventScroll?: boolean }): void } | null;
  };
}

export function arrive({ hash, ids, document }: ArriveOptions): void {
  if (!hash.startsWith('#')) return;
  let id: string;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    // A fragment that cannot be decoded (`#%`) names no section.
    return;
  }
  if (!ids.includes(id)) return;
  document.getElementById(id)?.focus({ preventScroll: true });
}
