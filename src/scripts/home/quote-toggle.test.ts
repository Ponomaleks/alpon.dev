import { describe, expect, it } from 'vitest';
import { initQuoteToggle } from './quote-toggle';

// AC-09, D-19: a quote longer than three lines is closed behind "Show more"; "Show less" closes it
// again. A quote that fits stays open and keeps no button. The carousel's copies of a card follow
// it. Contract: initQuoteToggle(document); cards are [data-quote], each with a blockquote and a
// [data-quote-toggle]. The three-line limit itself is CSS; the browser side is in the e2e spec.

function makeCard(id: string, fullHeight: number, closedHeight = 90) {
  const attrs = new Map<string, string>([['data-quote', id]]);
  const listeners: (() => void)[] = [];
  const toggle = {
    hidden: true,
    textContent: 'Show more' as string | null,
    attrs: new Map<string, string>([['aria-expanded', 'false']]),
    setAttribute(name: string, value: string) {
      this.attrs.set(name, value);
    },
    addEventListener(_type: 'click', listener: () => void) {
      listeners.push(listener);
    },
    click: () => listeners.forEach((l) => l()),
  };
  const text = {
    scrollHeight: fullHeight,
    // The limit applies only while the card is closed.
    get clientHeight() {
      return attrs.has('data-collapsed') ? Math.min(fullHeight, closedHeight) : fullHeight;
    },
  };
  return {
    attrs,
    toggle,
    listeners,
    parentElement: null as null | {
      toggleAttribute(name: string, force: boolean): void;
      querySelector(selector: string): unknown;
    },
    getAttribute: (name: string) => attrs.get(name) ?? null,
    setAttribute: (name: string, value: string) => void attrs.set(name, value),
    removeAttribute: (name: string) => void attrs.delete(name),
    querySelector: (selector: string) => (selector === 'blockquote' ? text : toggle),
  };
}

type Card = ReturnType<typeof makeCard>;

const makeDocument = (cards: Card[], copies: Card[] = []) => ({
  querySelectorAll(selector: string) {
    if (selector === '[data-quote]') return cards;
    const id = selector.match(/^\[data-quote="(.+)"\]$/)?.[1];
    return [...cards, ...copies].filter((c) => c.attrs.get('data-quote') === id);
  },
});

describe('initQuoteToggle', () => {
  it('closes a long quote and shows "Show more"', () => {
    const card = makeCard('a', 600);
    initQuoteToggle(makeDocument([card]));
    expect(card.attrs.has('data-collapsed')).toBe(true);
    expect(card.attrs.has('data-expanded')).toBe(false);
    expect(card.toggle.hidden).toBe(false);
    expect(card.toggle.textContent).toBe('Show more');
    expect(card.toggle.attrs.get('aria-expanded')).toBe('false');
  });

  it('leaves a quote that fits in three lines open, without a button', () => {
    const card = makeCard('a', 90);
    initQuoteToggle(makeDocument([card]));
    expect(card.attrs.has('data-collapsed')).toBe(false);
    expect(card.toggle.hidden).toBe(true);
    expect(card.listeners).toHaveLength(0);
  });

  it('allows one pixel for fractional line heights', () => {
    const card = makeCard('a', 91);
    initQuoteToggle(makeDocument([card]));
    expect(card.attrs.has('data-collapsed')).toBe(false);
    expect(card.toggle.hidden).toBe(true);
  });

  it('opens the whole quote on "Show more" and closes it on "Show less"', () => {
    const card = makeCard('a', 600);
    initQuoteToggle(makeDocument([card]));

    card.toggle.click();
    expect(card.attrs.has('data-collapsed')).toBe(false);
    expect(card.attrs.has('data-expanded')).toBe(true);
    expect(card.toggle.textContent).toBe('Show less');
    expect(card.toggle.attrs.get('aria-expanded')).toBe('true');

    card.toggle.click();
    expect(card.attrs.has('data-collapsed')).toBe(true);
    expect(card.attrs.has('data-expanded')).toBe(false);
    expect(card.toggle.textContent).toBe('Show more');
    expect(card.toggle.attrs.get('aria-expanded')).toBe('false');
  });

  it('opens one card without touching another', () => {
    const first = makeCard('a', 600);
    const second = makeCard('b', 600);
    initQuoteToggle(makeDocument([first, second]));
    first.toggle.click();
    expect(first.attrs.has('data-expanded')).toBe(true);
    expect(second.attrs.has('data-collapsed')).toBe(true);
    expect(second.attrs.has('data-expanded')).toBe(false);
  });

  it('marks the row while one of its quotes is open', () => {
    const first = makeCard('a', 600);
    const second = makeCard('b', 600);
    const marks = new Map<string, boolean>();
    const row = {
      toggleAttribute: (name: string, force: boolean) => void marks.set(name, force),
      querySelector: () => [first, second].find((c) => c.attrs.has('data-expanded')) ?? null,
    };
    first.parentElement = row;
    second.parentElement = row;
    initQuoteToggle(makeDocument([first, second]));

    first.toggle.click();
    expect(marks.get('data-has-open')).toBe(true);
    second.toggle.click();
    first.toggle.click();
    expect(marks.get('data-has-open')).toBe(true);
    second.toggle.click();
    expect(marks.get('data-has-open')).toBe(false);
  });

  it('keeps the carousel copies of a card in the state of the card', () => {
    const card = makeCard('a', 600);
    // The copy is made after the start: the click handler must look the cards up then.
    const copies: Card[] = [];
    initQuoteToggle(makeDocument([card], copies));
    const copy = makeCard('a', 600);
    copy.attrs.set('data-collapsed', '');
    copies.push(copy);

    card.toggle.click();
    expect(copy.attrs.has('data-expanded')).toBe(true);
    expect(copy.attrs.has('data-collapsed')).toBe(false);
    expect(copy.toggle.textContent).toBe('Show less');
    card.toggle.click();
    expect(copy.attrs.has('data-collapsed')).toBe(true);
    expect(copy.toggle.textContent).toBe('Show more');
  });
});
