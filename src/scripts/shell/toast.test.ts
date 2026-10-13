import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initToast } from './toast';

// AC-30, AC-28 (sad §8 Toast). A fjord:toast event on document writes { message, meta?, lang? }
// into the one role="status" region, never moves focus, and the Toast leaves by itself after
// the Toast duration token. The document and the duration are injected; the Toast.astro
// <script> only calls initToast with the real ones.

const DURATION = 4000;

class FakeNode {
  attrs: Record<string, string> = {};
  children: FakeNode[] = [];
  textContent = '';
  constructor(public tag: string) {}
  setAttribute(name: string, value: string) {
    this.attrs[name] = value;
  }
  append(...nodes: FakeNode[]) {
    this.children.push(...nodes);
  }
  replaceChildren(...nodes: FakeNode[]) {
    this.children = [...nodes];
  }
  /** All text in the subtree, depth first. */
  text(): string[] {
    return [this.textContent, ...this.children.flatMap((c) => c.text())].filter(Boolean);
  }
  /** Every node in the subtree (self included). */
  all(): FakeNode[] {
    return [this, ...this.children.flatMap((c) => c.all())];
  }
}

function setup() {
  const region = new FakeNode('div');
  region.setAttribute('role', 'status');
  const focused = new FakeNode('button');
  const doc = {
    activeElement: focused as unknown,
    listeners: {} as Record<string, (event: unknown) => void>,
    addEventListener(type: string, fn: (event: unknown) => void) {
      this.listeners[type] = fn;
    },
    querySelector: (selector: string) => (selector === '[role="status"]' ? region : null),
    createElement: (tag: string) => new FakeNode(tag),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initToast({ document: doc, duration: DURATION } as any);
  const fire = (detail: Record<string, unknown>) => doc.listeners['fjord:toast']?.({ detail });
  return { region, doc, focused, fire };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('fjord:toast (AC-30)', () => {
  it('listens for fjord:toast on document', () => {
    const { doc } = setup();
    expect(typeof doc.listeners['fjord:toast']).toBe('function');
  });

  it('writes message and meta into the role="status" region', () => {
    const { region, fire } = setup();
    fire({ message: 'Kopiert', meta: 'ponomaleks@gmail.com' });
    expect(region.text()).toContain('Kopiert');
    expect(region.text()).toContain('ponomaleks@gmail.com');
  });

  it('works without meta', () => {
    const { region, fire } = setup();
    fire({ message: 'Saved' });
    expect(region.text()).toEqual(['Saved']);
  });

  it('applies lang to the Toast text', () => {
    const { region, fire } = setup();
    fire({ message: 'Kopiert', lang: 'no' });
    const langs = region.all().filter((n) => n.attrs.lang === 'no');
    expect(langs.length).toBeGreaterThan(0);
    expect(langs.some((n) => n.text().includes('Kopiert'))).toBe(true);
  });

  it('without lang no node carries a lang attribute', () => {
    const { region, fire } = setup();
    fire({ message: 'Copied', meta: 'a@b.no' });
    expect(region.all().some((n) => 'lang' in n.attrs)).toBe(false);
  });

  it('marks only the message, not the meta, and leaves the live region unchanged', () => {
    const { region, fire } = setup();
    fire({ message: 'Kopiert', meta: 'a@b.no', lang: 'no' });
    const marked = region.all().filter((n) => n.attrs.lang === 'no');
    expect(marked.map((n) => n.textContent)).toEqual(['Kopiert']);
    expect(region.attrs).toEqual({ role: 'status' });
  });

  it('a replacing Toast without lang clears the lang', () => {
    const { region, fire } = setup();
    fire({ message: 'Kopiert', lang: 'no' });
    fire({ message: 'Copied' });
    expect(region.text()).toEqual(['Copied']);
    expect(region.all().some((n) => 'lang' in n.attrs)).toBe(false);
  });

  it('does not move focus', () => {
    const { doc, focused, fire } = setup();
    fire({ message: 'Kopiert', meta: 'x' });
    vi.advanceTimersByTime(DURATION);
    expect(doc.activeElement).toBe(focused);
  });

  it('removes the Toast after the Toast duration', () => {
    const { region, fire } = setup();
    fire({ message: 'Kopiert' });
    vi.advanceTimersByTime(DURATION - 1);
    expect(region.text()).toContain('Kopiert');
    vi.advanceTimersByTime(1);
    expect(region.text()).toEqual([]);
  });

  it('a second event replaces the first and restarts the timer', () => {
    const { region, fire } = setup();
    fire({ message: 'First' });
    vi.advanceTimersByTime(DURATION - 1000);
    fire({ message: 'Second' });
    expect(region.text()).toEqual(['Second']);
    vi.advanceTimersByTime(DURATION - 1);
    expect(region.text()).toEqual(['Second']);
    vi.advanceTimersByTime(1);
    expect(region.text()).toEqual([]);
  });

  describe('optional check icon (AC-14, B-25)', () => {
    const toastOf = (region: FakeNode) => region.children[0];

    it('with icon "check" the Toast carries data-icon="check" and message and meta stay', () => {
      const { region, fire } = setup();
      fire({ message: 'Kopiert', meta: 'a@b.no', lang: 'no', icon: 'check' });
      expect(toastOf(region)?.attrs['data-icon']).toBe('check');
      expect(region.text()).toEqual(['Kopiert', 'a@b.no']);
    });

    it('the script adds no class beyond the Toast ones and no inline style', () => {
      const { region, fire } = setup();
      fire({ message: 'Kopiert', meta: 'a@b.no', icon: 'check' });
      for (const n of region.all()) {
        expect(n.attrs.style).toBeUndefined();
        expect(n.attrs.class ?? '').not.toMatch(/icon|check/);
      }
    });

    it('without icon there is no data-icon anywhere', () => {
      const { region, fire } = setup();
      fire({ message: 'Couldn’t copy' });
      expect(region.all().some((n) => 'data-icon' in n.attrs)).toBe(false);
    });

    it('an unknown icon value is ignored', () => {
      const { region, fire } = setup();
      fire({ message: 'Hi', icon: 'skull' });
      expect(region.all().some((n) => 'data-icon' in n.attrs)).toBe(false);
    });

    it('a replacing Toast without icon clears the icon', () => {
      const { region, fire } = setup();
      fire({ message: 'Kopiert', icon: 'check' });
      fire({ message: 'Refused' });
      expect(region.text()).toEqual(['Refused']);
      expect(region.all().some((n) => 'data-icon' in n.attrs)).toBe(false);
    });

    it('the icon Toast still leaves after the duration', () => {
      const { region, fire } = setup();
      fire({ message: 'Kopiert', icon: 'check' });
      vi.advanceTimersByTime(DURATION);
      expect(region.children).toEqual([]);
    });
  });

  it('ignores an event without a message', () => {
    const { region, fire } = setup();
    fire({});
    expect(region.text()).toEqual([]);
  });
});
