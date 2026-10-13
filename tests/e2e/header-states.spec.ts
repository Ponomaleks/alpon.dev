import { expect, test, type Page } from '../fixtures';

// The 18 header states of the home page (AC-33, spec section 6 "Header states", ADR-0001):
// 3 widths x 2 themes x 3 positions, asserted by computed style at fixed scroll positions, never
// by timing. Expected values are resolved from the site's own custom properties in the page, so
// the test follows the tokens and not a copy of their hex values.

type Theme = 'dag' | 'natt';
type Position = 'top' | 'over' | 'after';
type Cta =
  | { kind: 'primary'; bg: string; color: string }
  | { kind: 'secondary'; color: string; border: string };

interface Look {
  bg: string;
  border: string;
  word: string;
  dev: string;
  link: string;
  /** The track of the theme switch. */
  track: string;
  cta: Cta;
}

const WIDTHS = [390, 834, 1440] as const;
const THEMES: Theme[] = ['dag', 'natt'];
const POSITIONS: Position[] = ['top', 'over', 'after'];
const SCHEME = { dag: 'light', natt: 'dark' } as const;
const CLEAR = 'transparent';

/** The look the design asks for (AC-33), as CSS value expressions resolved in the page. */
function expectedLook(theme: Theme, position: Position, width: number): Look {
  const wide = width >= 768;
  const overHero = position !== 'after';
  const scrolled = position !== 'top';
  if (theme === 'dag' && overHero) {
    return {
      // As every header state, the ground at 94% (page design: `.fj-header{background:
      // color-mix(in srgb,var(--fjord-color-bg) 94%,transparent)}`): here the ground is spruce.
      bg: 'color-mix(in srgb, var(--fjord-spruce) 94%, transparent)',
      border: CLEAR,
      word: 'var(--fjord-snow)',
      dev: 'var(--fjord-snow)',
      link: 'var(--fjord-lichen)',
      // --fjord-color-bg-raised of the on-spruce rule, opaque as the design's .fj-seg: the label of
      // the other theme keeps its contrast while the page ground shows through the bar at the top.
      track: 'rgb(43, 84, 70)',
      cta: wide
        ? {
            kind: 'secondary',
            color: 'var(--fjord-snow)',
            border: 'rgba(191, 211, 201, 0.6)', // --fjord-color-border-strong of the on-spruce rule
          }
        : { kind: 'primary', bg: 'var(--fjord-stone)', color: 'var(--fjord-spruce)' },
    };
  }
  const primary: Cta = {
    kind: 'primary',
    bg: 'var(--fjord-color-cta-bg)',
    color: 'var(--fjord-color-cta-text)',
  };
  const secondary: Cta = {
    kind: 'secondary',
    color: 'var(--fjord-color-text)',
    border: 'var(--fjord-color-border-strong)',
  };
  return {
    bg: 'color-mix(in srgb, var(--fjord-color-bg) 94%, transparent)',
    // Dag after the hero takes its border with the default look; Natt as soon as it is scrolled.
    border: theme === 'dag' || scrolled ? 'var(--fjord-color-border)' : CLEAR,
    word: 'var(--fjord-color-text)',
    dev: 'var(--fjord-color-link)',
    link: 'var(--fjord-color-text-muted)',
    track: 'var(--fjord-color-bg-raised)',
    cta: theme === 'natt' && overHero && wide ? secondary : primary,
  };
}

/** Reads the live header as computed colour strings, or resolves a Look when one is given. */
async function header(page: Page, look?: Look) {
  return page.evaluate((spec) => {
    const probe = document.createElement('span');
    document.documentElement.append(probe);
    const resolve = (prop: 'color' | 'background-color', value: string) => {
      probe.style.cssText = '';
      probe.style.setProperty(prop, value);
      return getComputedStyle(probe).getPropertyValue(prop);
    };
    let out;
    if (spec) {
      out = {
        bg: resolve('background-color', spec.bg),
        border: resolve('color', spec.border),
        word: resolve('color', spec.word),
        dev: resolve('color', spec.dev),
        link: resolve('color', spec.link),
        track: resolve('background-color', spec.track),
        cta:
          spec.cta.kind === 'primary'
            ? {
                kind: 'primary',
                bg: resolve('background-color', spec.cta.bg),
                color: resolve('color', spec.cta.color),
              }
            : {
                kind: 'secondary',
                color: resolve('color', spec.cta.color),
                border: resolve('color', spec.cta.border),
              },
      };
    } else {
      const el = document.querySelector('header[data-header]') as HTMLElement;
      const cs = (node: Element | null) => getComputedStyle(node as Element);
      const btn = cs(el.querySelector('.header__cta .fj-btn'));
      const filled = btn.backgroundColor !== 'rgba(0, 0, 0, 0)';
      out = {
        bg: cs(el).backgroundColor,
        border: cs(el).borderBlockEndColor,
        word: cs(el.querySelector('.wordmark')).color,
        dev: cs(el.querySelector('.wordmark span')).color,
        link: cs(el.querySelector('.header__nav a')).color,
        track: cs(el.querySelector('.theme-toggle')).backgroundColor,
        cta: filled
          ? { kind: 'primary', bg: btn.backgroundColor, color: btn.color }
          : { kind: 'secondary', color: btn.color, border: btn.borderBlockEndColor },
      };
    }
    probe.remove();
    return out;
  }, look ?? null);
}

async function scrollTo(page: Page, position: Position) {
  await page.evaluate((where) => {
    const hero = document.querySelector('[data-hero]') as HTMLElement;
    const bar = document.querySelector('header[data-header]') as HTMLElement;
    const headerBottom = bar.getBoundingClientRect().bottom;
    const heroEnd = hero.getBoundingClientRect().bottom + window.scrollY;
    const y = { top: 0, over: 40, after: Math.ceil(heroEnd - headerBottom) + 16 }[where];
    window.scrollTo(0, y);
  }, position);
}

async function settled(page: Page, theme: Theme, position: Position, width: number) {
  const look = expectedLook(theme, position, width);
  // Polled: the header's own transitions (border, action) run for a few frames.
  await expect.poll(async () => header(page), { timeout: 5000 }).toEqual(await header(page, look));
}

async function openHome(page: Page, theme: Theme, width: number) {
  await page.emulateMedia({ colorScheme: SCHEME[theme] });
  await page.setViewportSize({ width, height: 844 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

test.describe('the 18 header states (AC-33)', () => {
  for (const width of WIDTHS) {
    for (const theme of THEMES) {
      for (const position of POSITIONS) {
        test(`${theme} at ${width}, ${position}`, async ({ page }) => {
          await openHome(page, theme, width);
          await scrollTo(page, position);
          await settled(page, theme, position, width);
        });
      }
    }
  }
});

test.describe('the back button at a scrolled position (AC-33)', () => {
  for (const width of [390, 1440]) {
    for (const theme of THEMES) {
      for (const position of ['over', 'after'] as const) {
        test(`${theme} at ${width}, back to ${position}`, async ({ page }) => {
          await openHome(page, theme, width);
          await scrollTo(page, position);
          await settled(page, theme, position, width);
          await page.goto('/does-not-exist');
          await page.goBack();
          await expect(page).toHaveURL(/\/$/);
          await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
          await settled(page, theme, position, width);
        });
      }
    }
  }
});

test.describe('scripts off (AC-33)', () => {
  test.use({ javaScriptEnabled: false, colorScheme: 'light' });
  for (const width of WIDTHS) {
    test(`default header, primary "Get in touch" at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      const look = expectedLook('dag', 'after', width);
      const actual = await header(page);
      const expected = await header(page, { ...look, border: CLEAR });
      expect(actual).toEqual(expected);
      expect(actual.cta.kind).toBe('primary');
    });
  }
});

// AC-20, B-05: the header's current-page marker on the rendered page, by computed style (not CSS
// text). The page design draws a 1px underline in the text colour and the text colour itself.
test.describe('current-page marker in the header (AC-20, B-05)', () => {
  test.use({ colorScheme: 'light' });
  const navLink = (page: Page, name: string) =>
    page.locator('header[data-header] .header__nav').getByRole('link', { name, exact: true });
  const look = (page: Page, name: string) =>
    navLink(page, name).evaluate((el) => {
      const cs = getComputedStyle(el);
      const probe = document.createElement('span');
      probe.style.color = 'var(--fjord-color-text)';
      document.body.append(probe);
      const text = getComputedStyle(probe).color;
      probe.remove();
      return {
        current: el.getAttribute('aria-current'),
        color: cs.color,
        text,
        shadow: cs.boxShadow,
      };
    });

  for (const path of ['/cv/en', '/cv/no']) {
    test(`"CV" is underlined and in the text colour on ${path}, "Contact" is not`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      const cv = await look(page, 'CV');
      expect(cv.current).toBe('page');
      expect(cv.color).toBe(cv.text);
      expect(cv.shadow).not.toBe('none');
      expect(cv.shadow).toContain(cv.text);
      expect(cv.shadow).toMatch(/inset/);
      const contactLink = await look(page, 'Contact');
      expect(contactLink.current).toBeNull();
      expect(contactLink.shadow).toBe('none');
    });
  }

  for (const [label, path] of [
    ['the home page', '/'],
    ['the Not-found page', '/does-not-exist'],
  ] as const) {
    test(`no link is marked on ${label}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      await expect(page.locator('header[data-header] [aria-current]')).toHaveCount(0);
      for (const name of ['CV', 'Contact']) {
        expect((await look(page, name)).shadow).toBe('none');
      }
    });
  }
});
