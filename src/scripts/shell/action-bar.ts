// Sticky action bar scroll behaviour as pure functions (AC-08, AC-09; sad §6 flow 2; G-4, G-5).
// The component <script> only reads the scroll position and calls these; the slide is CSS on [inert].

export type BarAction = 'hide' | 'show' | 'none';

/** A scroll change smaller than this is ignored (G-5). */
const MIN_DELTA = 8;
/** Within this distance of the top of the page the bar is always shown (G-5). */
const TOP_ZONE = 40;

interface BarInput {
  prev: number;
  next: number;
  /** Keyboard focus is inside the bar (G-4). */
  focusInside: boolean;
  reducedMotion: boolean;
}

export function decideBar({ prev, next, focusInside, reducedMotion }: BarInput): BarAction {
  if (reducedMotion) return 'none';
  if (next < TOP_ZONE) return 'show';
  const delta = next - prev;
  if (Math.abs(delta) < MIN_DELTA) return 'none';
  if (delta > 0) return focusInside ? 'none' : 'hide';
  return 'show';
}

/** The only write the script makes: `inert` on the bar. A collapsed bar (details closed) is left alone. */
export function applyBarAction(bar: { inert: boolean; open?: boolean }, action: BarAction): void {
  if (bar.open === false) return;
  if (action === 'hide') bar.inert = true;
  else if (action === 'show') bar.inert = false;
}
