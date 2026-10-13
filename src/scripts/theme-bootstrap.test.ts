import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

// ADR-0001 bootstrap, run as raw text in an isolated context with stubbed storage, media
// query and root element (AC-02, AC-03; test plan unit rows). A top-level `let`/`const` is
// not a property of the context object, so leaks are also probed with `typeof` inside the
// context and by running the snippet a second time there (a redeclaration throws).

const path = fileURLToPath(new URL('./theme-bootstrap.js', import.meta.url));
const adr = fileURLToPath(
  new URL(
    '../../docs/features/fjord-foundation/adr/0001-pair-a-validating-theme-bootstrap-with-generated-natt-blocks.md',
    import.meta.url,
  ),
);
const source = () => readFileSync(path, 'utf8');

type Stored = string | null | 'THROWS';

function run(stored: Stored, device: 'light' | 'dark', code = source()) {
  const writes: unknown[] = [];
  const dataset: Record<string, string> = {};
  const errors: unknown[] = [];
  const context: Record<string, unknown> = {};
  const localStorage = {
    getItem(key: string) {
      if (stored === 'THROWS') throw new Error('SecurityError: storage blocked');
      return key === 'fjord-theme' ? stored : null;
    },
    setItem: (...args: unknown[]) => writes.push(args),
    removeItem: (...args: unknown[]) => writes.push(args),
  };
  const ctx = createContext(
    Object.assign(context, {
      localStorage,
      matchMedia: (query: string) => ({
        matches: query === '(prefers-color-scheme: dark)' && device === 'dark',
      }),
      document: { documentElement: { dataset } },
    }),
  );
  for (let pass = 0; pass < 2; pass += 1) {
    try {
      runInContext(code, ctx);
    } catch (error) {
      errors.push(error);
    }
  }
  const globals = Object.keys(context).filter(
    (key) => !['localStorage', 'matchMedia', 'document'].includes(key),
  );
  if (runInContext('typeof t', ctx) !== 'undefined') globals.push('t');
  return { theme: dataset.theme, writes, errors, globals };
}

describe('theme-bootstrap.js', () => {
  it('is the ADR-0001 snippet verbatim and at most 1 KB', () => {
    const snippet = readFileSync(adr, 'utf8').match(
      /\*\*Bootstrap\*\*[\s\S]*?```js\s*\n\s*(.+?)\r?\n/,
    )?.[1];
    expect(snippet).toBeTruthy();
    expect(source()).toBe(snippet?.trim());
    expect(statSync(path).size).toBeLessThanOrEqual(1024);
  });

  for (const device of ['light', 'dark'] as const) {
    for (const stored of ['dag', 'natt'] as const) {
      it(`honours a stored "${stored}" on a ${device} device`, () => {
        expect(run(stored, device)).toEqual({
          theme: stored,
          writes: [],
          errors: [],
          globals: [],
        });
      });
    }

    const unusable: Stored[] = ['DAG', ' natt', '', null, 'foo', 'THROWS'];
    for (const stored of unusable) {
      it(`falls back to the ${device} device for stored ${JSON.stringify(stored)}`, () => {
        expect(run(stored, device)).toEqual({
          theme: device === 'dark' ? 'natt' : 'dag',
          writes: [],
          errors: [],
          globals: [],
        });
      });
    }
  }

  it('reports a leak when the snippet is not wrapped in a block (negative control)', () => {
    const unwrapped = source().replace(/^\{([\s\S]*)\}$/, '$1');
    expect(unwrapped.startsWith('let t;')).toBe(true);
    const leaky = run('dag', 'light', unwrapped);
    expect(leaky.globals).toEqual(['t']);
    expect(leaky.errors).toEqual([
      expect.objectContaining({ name: 'SyntaxError', message: expect.stringMatching(/'t'/) }),
    ]);
  });
});
