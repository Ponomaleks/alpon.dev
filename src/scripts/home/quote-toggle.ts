// "Show more" / "Show less" on a Recommendation (AC-09, D-19). Without this script every quote is
// whole and the button stays hidden. The script closes each quote to three lines (the CSS of
// [data-collapsed]); a quote that fits in three lines is left open and keeps no button. The whole
// quote stays in the page, so assistive technology reads it either way.
// A card is found by data-quote; the carousel's copies of a card carry the same value and follow
// the card's state.

const MORE = 'Show more';
const LESS = 'Show less';

interface Row {
  toggleAttribute(name: string, force: boolean): void;
  querySelector(selector: string): unknown;
}

interface Card {
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
  querySelector(selector: string): unknown;
  /** The row of cards. */
  parentElement?: Row | null;
}

interface Text {
  scrollHeight: number;
  clientHeight: number;
}

interface Toggle {
  hidden: boolean;
  textContent: string | null;
  setAttribute(name: string, value: string): void;
  addEventListener(type: 'click', listener: () => void): void;
}

export interface QuoteDocument {
  querySelectorAll(selector: string): Iterable<unknown>;
}

function setOpen(card: Card, open: boolean): void {
  if (open) {
    card.removeAttribute('data-collapsed');
    card.setAttribute('data-expanded', '');
  } else {
    card.removeAttribute('data-expanded');
    card.setAttribute('data-collapsed', '');
  }
  const toggle = card.querySelector('[data-quote-toggle]') as Toggle | null;
  if (toggle) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? LESS : MORE;
  }
  // While a quote is open the cards of the row keep their own heights (see Recommendations.astro).
  const row = card.parentElement;
  row?.toggleAttribute('data-has-open', row.querySelector('[data-expanded]') !== null);
}

export function initQuoteToggle(document: QuoteDocument): void {
  for (const card of document.querySelectorAll('[data-quote]') as Iterable<Card>) {
    const text = card.querySelector('blockquote') as Text | null;
    const toggle = card.querySelector('[data-quote-toggle]') as Toggle | null;
    if (!text || !toggle) continue;

    card.setAttribute('data-collapsed', '');
    // One pixel of tolerance: line heights are fractional.
    if (text.scrollHeight <= text.clientHeight + 1) {
      card.removeAttribute('data-collapsed');
      continue;
    }

    let open = false;
    const id = (card as unknown as { getAttribute(name: string): string | null }).getAttribute(
      'data-quote',
    );
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      open = !open;
      for (const same of document.querySelectorAll(`[data-quote="${id}"]`) as Iterable<Card>) {
        setOpen(same, open);
      }
    });
  }
}
