import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildSite, type SiteBuild } from '../../scripts/test-utils/build-site.ts';

// Page transitions on the built output (AC-32, AC-28). Whether a browser carries a cross-document
// view transition on a given navigation is its own decision and a race on a fast local server, so
// nothing here waits for one. The rules that opt in, opt out and keep the header still are what the
// site ships, and they are checked as built: base.css and Header.astro after bundling.

let site: SiteBuild;
beforeAll(() => {
  site = buildSite();
  if (site.status !== 0) throw new Error(site.log);
}, 180_000);
afterAll(() => site?.cleanup());

interface Rule {
  /** The selector or at-rule prelude, without whitespace. */
  prelude: string;
  /** Declarations of a style rule, without whitespace; empty for a rule that holds other rules. */
  body: string;
  /** Preludes of the enclosing at-rules, outermost first. */
  within: string[];
}

/** Every rule of a stylesheet, flattened, each with the at-rules it sits in. */
function rules(css: string, within: string[] = []): Rule[] {
  const found: Rule[] = [];
  let at = 0;
  while (at < css.length) {
    const open = css.indexOf('{', at);
    if (open === -1) break;
    let depth = 1;
    let close = open + 1;
    for (; close < css.length && depth > 0; close += 1) {
      if (css[close] === '{') depth += 1;
      else if (css[close] === '}') depth -= 1;
    }
    const prelude = css.slice(at, open).replace(/\s+/g, '');
    const inner = css.slice(open + 1, close - 1);
    if (inner.includes('{')) {
      found.push({ prelude, body: '', within }, ...rules(inner, [...within, prelude]));
    } else {
      found.push({ prelude, body: inner.replace(/\s+/g, '').replace(/;$/, ''), within });
    }
    at = close;
  }
  return found;
}

const all = (): Rule[] => {
  // Each page has one stylesheet that holds the Shell styles; one file is the whole rule set.
  const assets = join(site.out, '_astro');
  const [file] = readdirSync(assets).filter((name) => name.endsWith('.css'));
  if (!file) throw new Error('the build has no stylesheet');
  return rules(readFileSync(join(assets, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''));
};

const declarations = (rule: Rule | undefined): Record<string, string> =>
  Object.fromEntries(
    (rule?.body ?? '')
      .split(';')
      .filter(Boolean)
      .map((d) => [d.slice(0, d.indexOf(':')), d.slice(d.indexOf(':') + 1)]),
  );

const MOTION = '@media(prefers-reduced-motion:no-preference)';
const REDUCED = '@media(prefers-reduced-motion:reduce)';

describe('built page-transition rules (AC-32, AC-28)', () => {
  const optIns = () => all().filter((r) => r.prelude === '@view-transition');

  it('opts in to page transitions only when motion is allowed', () => {
    const auto = optIns().filter((r) => declarations(r).navigation === 'auto');
    expect(auto).toHaveLength(1);
    expect(auto[0]?.within).toEqual([MOTION]);
  });

  it('turns page transitions off under reduced motion', () => {
    const none = optIns().filter((r) => declarations(r).navigation === 'none');
    expect(none).toHaveLength(1);
    expect(none[0]?.within).toEqual([REDUCED]);
  });

  it('declares nothing else about page navigation', () => {
    expect(optIns().map((r) => r.body)).toEqual(
      expect.arrayContaining(['navigation:auto', 'navigation:none']),
    );
    expect(optIns()).toHaveLength(2);
  });

  const named = () => all().filter((r) => 'view-transition-name' in declarations(r));

  it('gives the live header, and nothing else, a transition name of its own', () => {
    expect(named()).toHaveLength(1);
    const [rule] = named();
    const name = declarations(rule)['view-transition-name'];
    expect(name).toBe('site-header');
    expect(name).not.toBe('none');
    // One selector, the live header: a name must be unique on the page.
    expect(rule?.prelude).not.toContain(',');
    expect(rule?.prelude).toMatch(/^\.header(\[data-astro-cid-[\w-]+\])?\[data-header\]$/);
    expect(rule?.within).toEqual([]);
  });

  it('marks only the live header with data-header: sample headers do not get the name', () => {
    const page = readFileSync(join(site.out, 'styleguide.html'), 'utf8');
    const headers = [...page.matchAll(/<header\b[^>]*\bclass="[^"]*\bheader\b[^"]*"[^>]*>/g)].map(
      ([tag]) => tag,
    );
    const live = headers.filter((tag) => /\sdata-header(?=[\s=>])/.test(tag));
    const samples = headers.filter((tag) => /\sdata-sample(?=[\s=>])/.test(tag));
    expect(live).toHaveLength(1);
    expect(samples.length).toBeGreaterThan(0);
    expect(samples.filter((tag) => /\sdata-header(?=[\s=>])/.test(tag))).toEqual([]);
    expect(live.length + samples.length).toBe(headers.length);
  });

  it('does not animate the header group, its old or its new image', () => {
    const name = declarations(named()[0])['view-transition-name'];
    const still = all().filter((r) => r.prelude.includes(`(${name})`));
    const selectors = still.flatMap((r) => r.prelude.split(','));
    expect(selectors.sort()).toEqual(
      [
        `::view-transition-group(${name})`,
        `::view-transition-new(${name})`,
        `::view-transition-old(${name})`,
      ].sort(),
    );
    for (const rule of still) expect(declarations(rule).animation).toBe('none');
  });

  it('times the root cross-fade with motion tokens that exist', () => {
    const root = all().filter((r) => r.prelude === '::view-transition-group(root)');
    expect(root).toHaveLength(1);
    const { 'animation-duration': duration, 'animation-timing-function': easing } = declarations(
      root[0],
    );
    expect(duration).toMatch(/^var\(--fjord-duration-[\w-]+\)$/);
    expect(easing).toMatch(/^var\(--fjord-ease-[\w-]+\)$/);
    const defined = new Set(
      all().flatMap((r) => Object.keys(declarations(r)).filter((p) => p.startsWith('--fjord-'))),
    );
    for (const value of [duration, easing])
      expect(defined, value).toContain(value?.slice('var('.length, -1));
  });
});
