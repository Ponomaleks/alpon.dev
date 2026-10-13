import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { isTheme, restoreStoredTheme, switchTheme, syncPressed } from './theme';

// AC-10, AC-11, AC-12, AC-29 (sad §6 critical flow 1, G-6). Pure functions with injected
// document, storage and media query; the component <script> only wires click events.

type Button = {
  dataset: Record<string, string>;
  attrs: Record<string, string>;
  setAttribute(name: string, value: string): void;
  closest(selector: string): unknown;
};

function button(theme: string, opts: { sample?: boolean; inDialog?: boolean } = {}): Button {
  const attrs: Record<string, string> = {};
  const dataset: Record<string, string> = { themeValue: theme };
  return {
    dataset,
    attrs,
    setAttribute: (name, value) => {
      attrs[name] = value;
    },
    closest: (selector) => {
      if (selector === '[data-sample]') return opts.sample ? {} : null;
      if (selector === 'dialog[open]') return opts.inDialog ? {} : null;
      return null;
    },
  };
}

function setup(
  options: {
    transitions?: boolean;
    reduced?: boolean;
    storage?: 'ok' | 'throws';
    buttons?: Button[];
  } = {},
) {
  const { transitions = false, reduced = false, storage = 'ok' } = options;
  const dataset: Record<string, string> = {};
  const buttons = options.buttons ?? [button('dag'), button('natt'), button('dag'), button('natt')];
  const store: Record<string, string> = {};
  const calls: string[] = [];
  const startViewTransition = vi.fn((update: () => void) => {
    calls.push('transition');
    update();
    return { finished: Promise.resolve() };
  });
  const doc: Record<string, unknown> = {
    documentElement: { dataset },
    querySelectorAll: () => buttons,
  };
  if (transitions) doc.startViewTransition = startViewTransition;
  const env = {
    document: doc,
    matchMedia: (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' && reduced,
    }),
    storage: {
      setItem: (key: string, value: string) => {
        if (storage === 'throws') throw new Error('SecurityError: storage blocked');
        store[key] = value;
      },
    },
  };
  return { env, dataset, store, buttons, startViewTransition, calls };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Env = any;

describe('isTheme', () => {
  it('accepts only dag and natt', () => {
    expect(isTheme('dag')).toBe(true);
    expect(isTheme('natt')).toBe(true);
    for (const bad of ['DAG', ' natt', '', 'light', 'dark', null, undefined, 1]) {
      expect(isTheme(bad)).toBe(false);
    }
  });
});

describe('switchTheme: apply and store', () => {
  for (const theme of ['dag', 'natt'] as const) {
    it(`round-trips "${theme}" to data-theme and fjord-theme`, () => {
      const s = setup();
      switchTheme(theme, button(theme), s.env as Env);
      expect(s.dataset.theme).toBe(theme);
      expect(s.store['fjord-theme']).toBe(theme);
    });
  }

  it('ignores any other value: nothing applied, nothing stored', () => {
    const s = setup();
    for (const bad of ['DAG', 'light', '', null, undefined]) {
      switchTheme(bad, button('dag'), s.env as Env);
    }
    expect(s.dataset.theme).toBeUndefined();
    expect(s.store).toEqual({});
  });

  it('keeps the theme and throws nothing when setItem throws (AC-11)', () => {
    const s = setup({ storage: 'throws' });
    expect(() => switchTheme('natt', button('natt'), s.env as Env)).not.toThrow();
    expect(s.dataset.theme).toBe('natt');
  });
});

describe('aria-pressed (AC-12, AC-10)', () => {
  it('two live switches end with matching aria-pressed on every switch', () => {
    const s = setup();
    switchTheme('natt', s.buttons[1] as Button, s.env as Env);
    expect(s.buttons.map((b) => b.attrs['aria-pressed'])).toEqual([
      'false',
      'true',
      'false',
      'true',
    ]);
    switchTheme('dag', s.buttons[0] as Button, s.env as Env);
    expect(s.buttons.map((b) => b.attrs['aria-pressed'])).toEqual([
      'true',
      'false',
      'true',
      'false',
    ]);
  });

  it('syncPressed sets the pressed state from a theme', () => {
    const s = setup();
    syncPressed('natt', s.env.document as Env);
    expect(s.buttons.map((b) => b.attrs['aria-pressed'])).toEqual([
      'false',
      'true',
      'false',
      'true',
    ]);
  });

  it('leaves a [data-sample] switch alone', () => {
    const live = button('dag');
    const sample = button('natt', { sample: true });
    const s = setup({ buttons: [live, sample] });
    switchTheme('natt', sample, s.env as Env);
    expect(s.dataset.theme).toBeUndefined();
    expect(sample.attrs['aria-pressed']).toBeUndefined();
    expect(live.attrs['aria-pressed']).toBeUndefined();
  });

  it('never sets aria-pressed on a sample during a live switch', () => {
    const live = button('natt');
    const sample = button('dag', { sample: true });
    const s = setup({ buttons: [live, sample] });
    switchTheme('natt', live, s.env as Env);
    expect(live.attrs['aria-pressed']).toBe('true');
    expect(sample.attrs['aria-pressed']).toBeUndefined();
  });
});

describe('view transition (AC-29, G-6)', () => {
  it('runs the change inside startViewTransition when supported and motion allowed', () => {
    const s = setup({ transitions: true });
    switchTheme('natt', button('natt'), s.env as Env);
    expect(s.startViewTransition).toHaveBeenCalledTimes(1);
    expect(s.dataset.theme).toBe('natt');
  });

  it('applies directly with reduced motion', () => {
    const s = setup({ transitions: true, reduced: true });
    switchTheme('natt', button('natt'), s.env as Env);
    expect(s.startViewTransition).not.toHaveBeenCalled();
    expect(s.dataset.theme).toBe('natt');
  });

  it('applies directly without the API', () => {
    const s = setup({ transitions: false });
    switchTheme('natt', button('natt'), s.env as Env);
    expect(s.dataset.theme).toBe('natt');
  });

  it('applies directly from inside dialog[open]', () => {
    const s = setup({ transitions: true });
    switchTheme('natt', button('natt', { inDialog: true }), s.env as Env);
    expect(s.startViewTransition).not.toHaveBeenCalled();
    expect(s.dataset.theme).toBe('natt');
  });
});

describe('base.css scripts-off gate (AC-11, H-1)', () => {
  it('hides [data-needs-script] under :root:not([data-theme])', () => {
    const css = readFileSync(
      fileURLToPath(new URL('../../styles/base.css', import.meta.url)),
      'utf8',
    );
    expect(css).toMatch(
      /:root:not\(\[data-theme\]\)\s*\[data-needs-script\][^{]*\{[^}]*display:\s*none/,
    );
  });
});

// R8 / S2-04: a page restored from the back/forward cache does not re-run scripts, so the
// pageshow handler re-reads the stored theme. Contract: restoreStoredTheme(event, env) with
// env = { document, storage: { getItem } }; same validation as the head bootstrap.
describe('restoreStoredTheme (pageshow from bfcache)', () => {
  function restoreSetup(storage: { value?: string | null; throws?: boolean }, initial = 'dag') {
    const dataset: Record<string, string> = { theme: initial };
    const live = [button('dag'), button('natt'), button('dag'), button('natt')];
    const sample = [button('dag', { sample: true }), button('natt', { sample: true })];
    const env = {
      document: {
        documentElement: { dataset },
        querySelectorAll: () => [...live, ...sample],
      },
      storage: {
        getItem: (key: string) => {
          if (storage.throws) throw new Error('SecurityError: storage blocked');
          return key === 'fjord-theme' ? (storage.value ?? null) : null;
        },
      },
    };
    return { env, dataset, live, sample };
  }

  it('persisted with stored natt: sets data-theme and aria-pressed on every live switch', () => {
    const { env, dataset, live, sample } = restoreSetup({ value: 'natt' });
    restoreStoredTheme({ persisted: true }, env as Env);
    expect(dataset.theme).toBe('natt');
    expect(live.map((b) => b.attrs['aria-pressed'])).toEqual(['false', 'true', 'false', 'true']);
    for (const b of sample) expect(b.attrs['aria-pressed']).toBeUndefined();
  });

  it('persisted with stored dag over a natt page: switches back to dag', () => {
    const { env, dataset, live } = restoreSetup({ value: 'dag' }, 'natt');
    restoreStoredTheme({ persisted: true }, env as Env);
    expect(dataset.theme).toBe('dag');
    expect(live.map((b) => b.attrs['aria-pressed'])).toEqual(['true', 'false', 'true', 'false']);
  });

  it('not persisted (a normal load): does nothing', () => {
    const { env, dataset, live } = restoreSetup({ value: 'natt' });
    restoreStoredTheme({ persisted: false }, env as Env);
    expect(dataset.theme).toBe('dag');
    for (const b of live) expect(b.attrs['aria-pressed']).toBeUndefined();
  });

  it('an invalid or missing stored value does nothing', () => {
    for (const value of ['DAG', 'dark', '', ' natt', null]) {
      const { env, dataset, live } = restoreSetup({ value });
      restoreStoredTheme({ persisted: true }, env as Env);
      expect(dataset.theme, String(value)).toBe('dag');
      for (const b of live) expect(b.attrs['aria-pressed']).toBeUndefined();
    }
  });

  it('blocked storage: does nothing and throws nothing', () => {
    const { env, dataset, live } = restoreSetup({ throws: true });
    expect(() => restoreStoredTheme({ persisted: true }, env as Env)).not.toThrow();
    expect(dataset.theme).toBe('dag');
    for (const b of live) expect(b.attrs['aria-pressed']).toBeUndefined();
  });
});
