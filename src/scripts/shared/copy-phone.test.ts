import { describe, expect, it } from 'vitest';
import { initCopyPhone, initPlainCopy } from './copy-email';

// save-contact-hint AC-13, AC-14 (T9). The Copy button of the phone row is `[data-copy-phone]`
// and its attribute value is the number without spaces. A selection inside `[data-copy-plain]`
// is copied without its spaces, so it can be pasted into a dialler or a contact.

const NUMBER = '+4740594584';
const DURATION = 1800;

interface ToastDetail {
  message: string;
  meta?: string;
  icon?: string;
}

function setupButton(clipboard: { writeText: (text: string) => Promise<void> } | undefined) {
  const toasts: ToastDetail[] = [];
  let click: () => unknown = () => undefined;
  const attrs = new Map<string, string>([['data-copy-phone', NUMBER]]);
  const button = {
    getAttribute: (name: string) => attrs.get(name) ?? null,
    setAttribute: (name: string, value: string) => void attrs.set(name, value),
    removeAttribute: (name: string) => void attrs.delete(name),
    addEventListener: (type: string, listener: () => unknown) => {
      if (type === 'click') click = listener;
    },
  };
  const asked: string[] = [];
  const doc = {
    querySelector: (selector: string) => {
      asked.push(selector);
      return selector === '[data-copy-phone]' ? button : null;
    },
    dispatchEvent: (event: { type: string; detail?: ToastDetail }) => {
      if (event.type === 'fjord:toast' && event.detail) toasts.push(event.detail);
      return true;
    },
  };
  initCopyPhone({ document: doc, navigator: { clipboard }, duration: DURATION } as never);
  const press = async () => {
    await click();
    await new Promise((resolve) => setTimeout(resolve, 0));
  };
  return { toasts, press, asked, done: () => attrs.get('data-done') ?? null };
}

describe('initCopyPhone (AC-13)', () => {
  it('writes the number without spaces and confirms with Copied, the number and the check icon', async () => {
    const written: string[] = [];
    const { toasts, press, done } = setupButton({
      writeText: (text) => {
        written.push(text);
        return Promise.resolve();
      },
    });
    await press();
    expect(written).toEqual([NUMBER]);
    expect(toasts).toEqual([{ message: 'Copied', meta: NUMBER, icon: 'check' }]);
    expect(done()).toBe('true');
  });

  it('tells the Visitor to select the number when copying is refused, and never says Copied', async () => {
    const { toasts, press, done } = setupButton({
      writeText: () => Promise.reject(new Error('denied')),
    });
    await press();
    expect(toasts).toEqual([{ message: "Couldn't copy. Select the number to copy it." }]);
    expect(done()).toBeNull();
  });

  it('does the same where the browser has no clipboard', async () => {
    const { toasts, press } = setupButton(undefined);
    await press();
    expect(toasts).toEqual([{ message: "Couldn't copy. Select the number to copy it." }]);
  });
});

function setupSelection() {
  let onCopy: (event: unknown) => void = () => undefined;
  const plain = { name: 'phone value' };
  const other = { name: 'other' };
  const node = (owner: object | null) => ({
    parentElement: {
      closest: (selector: string) => (selector === '[data-copy-plain]' ? owner : null),
    },
  });
  let selection: unknown = null;
  const doc = {
    addEventListener: (type: string, listener: (event: unknown) => void) => {
      if (type === 'copy') onCopy = listener;
    },
    getSelection: () => selection,
  };
  initPlainCopy({ document: doc } as never);
  const copy = (sel: unknown) => {
    selection = sel;
    const set: Record<string, string> = {};
    let prevented = false;
    onCopy({
      clipboardData: { setData: (type: string, value: string) => void (set[type] = value) },
      preventDefault: () => (prevented = true),
    });
    return { set, prevented };
  };
  return { copy, node, plain, other };
}

describe('initPlainCopy (AC-14)', () => {
  it('copies a selection inside the phone value without its spaces', () => {
    const { copy, node, plain } = setupSelection();
    const result = copy({
      isCollapsed: false,
      anchorNode: node(plain),
      focusNode: node(plain),
      toString: () => ' +47 405 94 584\n',
    });
    expect(result.set).toEqual({ 'text/plain': NUMBER });
    expect(result.prevented).toBe(true);
  });

  it('copies a part of the number as that part, without spaces', () => {
    const { copy, node, plain } = setupSelection();
    const result = copy({
      isCollapsed: false,
      anchorNode: node(plain),
      focusNode: node(plain),
      toString: () => '405 94',
    });
    expect(result.set).toEqual({ 'text/plain': '40594' });
  });

  it.each([
    ['no selection', null],
    ['a collapsed selection', { isCollapsed: true, anchorNode: null, focusNode: null }],
  ])('leaves the copy alone with %s', (_, sel) => {
    const { copy } = setupSelection();
    const result = copy(sel);
    expect(result.set).toEqual({});
    expect(result.prevented).toBe(false);
  });

  // A selection made over the whole element is anchored on the element, not on its text node.
  it('copies without spaces when the selection is anchored on the phone value itself', () => {
    const { copy, plain } = setupSelection();
    const element = {
      parentElement: { closest: () => null },
      closest: (selector: string) => (selector === '[data-copy-plain]' ? plain : null),
    };
    const result = copy({
      isCollapsed: false,
      anchorNode: element,
      focusNode: element,
      toString: () => '+47 405 94 584',
    });
    expect(result.set).toEqual({ 'text/plain': NUMBER });
    expect(result.prevented).toBe(true);
  });

  it('leaves the copy alone when the selection reaches outside the phone value', () => {
    const { copy, node, plain, other } = setupSelection();
    for (const [a, f] of [
      [plain, other],
      [other, plain],
      [null, null],
    ] as const) {
      const result = copy({
        isCollapsed: false,
        anchorNode: node(a),
        focusNode: node(f),
        toString: () => 'Phone +47 405 94 584 LinkedIn',
      });
      expect(result.set).toEqual({});
      expect(result.prevented).toBe(false);
    }
  });
});
