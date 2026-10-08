import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

// Recommendations on the home page (home T31): "Show more" / "Show less" on a long quote (AC-09,
// D-19) and the carousel that goes round (AC-42, D-20). The page holds two Recommendations, so the
// carousel is on below 768 (one column) and off from 768 (two columns). The cases the content
// does not reach yet are tested on the same page with its HTML rewritten on the way to the browser
// (withCards): four cards in two columns from 768, and automatic turning switched on (AC-43).

const SECTION = 'main section[aria-labelledby="recommendations-title"]';
const CARD = '[data-quote]:not([data-carousel-clone])';
const COPY = '[data-carousel-clone]';

async function open(page: Page, width: number, height = 900) {
  await page.setViewportSize({ width, height });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.locator(SECTION).scrollIntoViewIfNeeded();
}

/** The card of the nth Recommendation of the content, never one of its copies. */
const realCard = (page: Page, n: number) =>
  page.locator(`${SECTION} [data-quote="recommendation-${n}"]:not(${COPY})`);

/** Lines of text the quote of a card takes on screen. */
const lines = (card: Locator) =>
  card.locator('blockquote').evaluate((el) => {
    const style = getComputedStyle(el);
    return el.getBoundingClientRect().height / parseFloat(style.lineHeight);
  });

const height = async (el: Locator) => (await el.boundingBox())?.height ?? 0;

/** The data-quote values of the cards that lie fully inside the row, copies marked. */
const inView = (page: Page) =>
  page.locator(`${SECTION} [data-carousel-track]`).evaluate((track) => {
    const row = track.getBoundingClientRect();
    return [...track.children]
      .filter((card) => {
        const box = card.getBoundingClientRect();
        return box.left >= row.left - 2 && box.right <= row.right + 2;
      })
      .map(
        (card) =>
          `${card.getAttribute('data-quote')}${card.hasAttribute('data-carousel-clone') ? ' (copy)' : ''}`,
      );
  });

/** Waits until the row has stopped on the given card, a real one. */
async function settled(page: Page, id: string) {
  await expect.poll(() => inView(page), { timeout: 5000 }).toEqual([id]);
}

for (const width of [390, 1440]) {
  test.describe(`"Show more" on a long quote at ${width} (AC-09)`, () => {
    test.beforeEach(async ({ page }) => {
      await open(page, width);
    });

    test('a quote is closed to three lines and the closed cards have the same height', async ({
      page,
    }) => {
      const cards = page.locator(`${SECTION} ${CARD}`);
      await expect(cards).toHaveCount(2);
      for (const card of await cards.all()) {
        expect(await lines(card)).toBeGreaterThan(2.9);
        expect(await lines(card)).toBeLessThan(3.1);
        const toggle = card.getByRole('button', { name: 'Show more' });
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(await height(toggle)).toBeGreaterThanOrEqual(44);
      }
      expect(Math.abs((await height(cards.nth(0))) - (await height(cards.nth(1))))).toBeLessThan(1);
    });

    test('the whole quote stays in the page while it is closed', async ({ page }) => {
      // By name, not by place: the cards may stand in another order once the row has gone round.
      const first = realCard(page, 1);
      const text = await first.locator('blockquote').evaluate((el) => el.textContent ?? '');
      expect(text).toContain('I worked with Oleksandr for over two years');
      expect(text).toContain('would be a valuable addition to any team.');
    });

    test('"Show more" opens the whole quote in place and "Show less" closes it', async ({
      page,
    }) => {
      // By name, not by place: the cards may stand in another order once the row has gone round.
      const first = realCard(page, 1);
      const toggle = first.locator('[data-quote-toggle]');
      const quote = first.locator('blockquote');
      await expect(toggle).toHaveAttribute(
        'aria-controls',
        (await quote.getAttribute('id')) ?? '-',
      );

      await toggle.click();
      await expect(toggle).toHaveText('Show less');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(await lines(first)).toBeGreaterThan(6);
      await expect(toggle).toBeFocused();

      await toggle.click();
      await expect(toggle).toHaveText('Show more');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(await lines(first)).toBeLessThan(3.1);
    });

    test('the keyboard opens and closes a quote', async ({ page }) => {
      const toggle = realCard(page, 1).locator('[data-quote-toggle]');
      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Space');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
  });
}

test.describe('a closed card next to an open one at 1440 (AC-09)', () => {
  test('keeps its height and its three lines', async ({ page }) => {
    await open(page, 1440);
    const cards = page.locator(`${SECTION} ${CARD}`);
    const before = await height(cards.nth(1));
    await cards.nth(0).locator('[data-quote-toggle]').click();
    expect(await height(cards.nth(0))).toBeGreaterThan(before * 2);
    expect(Math.abs((await height(cards.nth(1))) - before)).toBeLessThan(1);
    expect(await lines(cards.nth(1))).toBeLessThan(3.1);
  });
});

test.describe('with scripts off (AC-09, AC-42)', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });

  test('every quote is whole, there is no "Show more" and no arrow, and the row scrolls', async ({
    page,
  }) => {
    await page.goto('/');
    const section = page.locator(SECTION);
    const cards = section.locator('figure');
    await expect(cards).toHaveCount(2);
    for (const card of await cards.all()) expect(await lines(card)).toBeGreaterThan(6);
    await expect(section.getByRole('button')).toHaveCount(0);
    await expect(section.locator('[data-quote-toggle]').first()).toBeHidden();
    await expect(section.locator('[data-carousel-nav]')).toBeHidden();
    const track = section.locator('[data-carousel-track]');
    const sizes = await track.evaluate((el) => [el.scrollWidth, el.clientWidth]);
    expect(sizes[0]).toBeGreaterThan((sizes[1] ?? 0) * 1.9);
    // The second card is reached by scrolling the row.
    await cards.nth(1).scrollIntoViewIfNeeded();
    await expect(cards.nth(1)).toBeInViewport();
  });
});

test.describe('the carousel at 390, with two cards in one column (AC-42)', () => {
  test.beforeEach(async ({ page }) => {
    await open(page, 390, 844);
    await settled(page, 'recommendation-1');
  });

  test('shows two named arrows of at least 44 x 44 and names itself a carousel', async ({
    page,
  }) => {
    const section = page.locator(SECTION);
    for (const name of ['Previous recommendation', 'Next recommendation']) {
      const arrow = section.getByRole('button', { name });
      await expect(arrow).toBeVisible();
      const box = await arrow.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    const root = section.locator('[data-carousel]');
    await expect(root).toHaveAttribute('role', 'group');
    await expect(root).toHaveAttribute('aria-roledescription', 'carousel');
    await expect(root).toHaveAttribute('aria-label', 'Recommendations');
  });

  test('keeps its copies out of reach: inert, hidden from assistive technology, without ids', async ({
    page,
  }) => {
    const section = page.locator(SECTION);
    await expect(section.locator(CARD)).toHaveCount(2);
    const copies = section.locator(COPY);
    await expect(copies).toHaveCount(4);
    for (const copy of await copies.all()) {
      await expect(copy).toHaveAttribute('aria-hidden', 'true');
      expect(await copy.evaluate((el) => (el as HTMLElement).inert)).toBe(true);
      await expect(copy.locator('[id], [aria-controls]')).toHaveCount(0);
    }
    await expect(section.getByRole('figure')).toHaveCount(2);
    await expect(section.getByRole('button', { name: 'Show more' })).toHaveCount(2);
    const ids = await page.evaluate(() => [...document.querySelectorAll('[id]')].map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('the next arrow goes to the second card and then round to the first', async ({ page }) => {
    const section = page.locator(SECTION);
    const next = section.getByRole('button', { name: 'Next recommendation' });
    const status = section.locator('[data-carousel-status]');
    await next.click();
    await settled(page, 'recommendation-2');
    await expect(status).toHaveText('Recommendation 2 of 2');
    await next.click();
    await settled(page, 'recommendation-1');
    await expect(status).toHaveText('Recommendation 1 of 2');
    await expect(next).toBeFocused();
  });

  test('the previous arrow goes round from the first card to the last', async ({ page }) => {
    const section = page.locator(SECTION);
    const previous = section.getByRole('button', { name: 'Previous recommendation' });
    await previous.click();
    await settled(page, 'recommendation-2');
    await expect(section.locator('[data-carousel-status]')).toHaveText('Recommendation 2 of 2');
    await previous.click();
    await settled(page, 'recommendation-1');
  });

  test('scrolling the row past the last card, as a swipe does, lands on the first card', async ({
    page,
  }) => {
    const track = page.locator(`${SECTION} [data-carousel-track]`);
    const step = await track.evaluate((el) => {
      const [a, b] = [...el.children] as HTMLElement[];
      return (b?.offsetLeft ?? 0) - (a?.offsetLeft ?? 0);
    });
    // Two cards on: past the second card, onto the copy of the first.
    await track.evaluate((el, by) => el.scrollBy({ left: by * 2, behavior: 'instant' }), step);
    await settled(page, 'recommendation-1');
    // And back before the first card, onto the copy of the last.
    await track.evaluate((el, by) => el.scrollBy({ left: -by, behavior: 'instant' }), step);
    await settled(page, 'recommendation-2');
  });

  test('a card opened with "Show more" is open in its copies too', async ({ page }) => {
    const section = page.locator(SECTION);
    await realCard(page, 1).locator('[data-quote-toggle]').click();
    const same = section.locator('[data-quote="recommendation-1"]');
    await expect(same).toHaveCount(3);
    for (const card of await same.all()) await expect(card).toHaveAttribute('data-expanded', '');
    const other = section.locator('[data-quote="recommendation-2"]');
    for (const card of await other.all()) await expect(card).toHaveAttribute('data-collapsed', '');
  });

  test('the page does not scroll sideways', async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('the carousel with reduced motion (AC-42)', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the arrows still move the row and it still goes round', async ({ page }) => {
    await open(page, 390, 844);
    const next = page.locator(SECTION).getByRole('button', { name: 'Next recommendation' });
    await next.click();
    await settled(page, 'recommendation-2');
    await next.click();
    await settled(page, 'recommendation-1');
  });
});

test.describe('from 768, with two cards in two columns (AC-42)', () => {
  test('there is no carousel: no arrows, no copies, both cards side by side', async ({ page }) => {
    await open(page, 1440);
    const section = page.locator(SECTION);
    await expect(section.locator('[data-carousel-nav]')).toBeHidden();
    await expect(section.locator(COPY)).toHaveCount(0);
    await expect(section.locator('[data-carousel]')).not.toHaveAttribute('role', /.*/);
    expect(await inView(page)).toEqual(['recommendation-1', 'recommendation-2']);
    const track = section.locator('[data-carousel-track]');
    expect(await track.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
  });

  test('the carousel comes and goes with the width of the window', async ({ page }) => {
    await open(page, 390, 844);
    const section = page.locator(SECTION);
    await expect(section.locator(COPY)).toHaveCount(4);
    await page.setViewportSize({ width: 1024, height: 900 });
    await expect(section.locator(COPY)).toHaveCount(0);
    await expect(section.locator('[data-carousel-nav]')).toBeHidden();
    await expect.poll(() => inView(page)).toEqual(['recommendation-1', 'recommendation-2']);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(section.locator(COPY)).toHaveCount(4);
    await expect(section.getByRole('button', { name: 'Next recommendation' })).toBeVisible();
    await settled(page, 'recommendation-1');
  });
});

/**
 * Serves the home page with more Recommendations than it holds (copies of the second card under
 * new names) and, when asked, with automatic turning on. The page's own scripts and styles run
 * on it unchanged: only the HTML of the document is rewritten on its way to the browser.
 */
async function withCards(page: Page, count: number, { autoplay = false } = {}) {
  await page.route(
    (url) => url.pathname === '/',
    async (route) => {
      const response = await route.fetch();
      let html = await response.text();
      const second = html.match(
        /<figure\b[^>]*data-quote="recommendation-2"[\s\S]*?<\/figure>/,
      )?.[0];
      if (!second) throw new Error('the second Recommendation was not found in the page');
      const more = Array.from({ length: count - 2 }, (_, i) =>
        second
          .replaceAll('recommendation-2', `recommendation-${i + 3}`)
          .replace('Alina Shcherbak', `Sample Person ${i + 3}`),
      ).join('');
      html = html.replace(second, second + more);
      html = html.replace(/(data-carousel-track[^>]*?\sdata-scroll=")[^"]*"/, '$1sm md"');
      if (autoplay) html = html.replace(/(<div\b[^>]*class="recs__wrap")/, '$1 data-autoplay');
      await route.fulfill({ response, body: html });
    },
  );
}

for (const width of [834, 1440]) {
  test.describe(`the carousel at ${width}, with four cards in two columns (AC-42)`, () => {
    test.beforeEach(async ({ page }) => {
      await withCards(page, 4);
      await open(page, width);
      await expect
        .poll(() => inView(page), { timeout: 5000 })
        .toEqual(['recommendation-1', 'recommendation-2']);
    });

    test('is on: the arrows show and the row holds four cards', async ({ page }) => {
      const section = page.locator(SECTION);
      await expect(section.locator(CARD)).toHaveCount(4);
      await expect(section.getByRole('button', { name: 'Next recommendation' })).toBeVisible();
      await expect(section.locator('[data-carousel]')).toHaveAttribute(
        'aria-roledescription',
        'carousel',
      );
    });

    test('never rests on a copy: both cards in view are real ones on every stop of a lap', async ({
      page,
    }) => {
      const section = page.locator(SECTION);
      const next = section.getByRole('button', { name: 'Next recommendation' });
      const laps = [
        ['recommendation-2', 'recommendation-3'],
        ['recommendation-3', 'recommendation-4'],
        ['recommendation-4', 'recommendation-1'],
        ['recommendation-1', 'recommendation-2'],
      ];
      for (const [index, pair] of laps.entries()) {
        await next.click();
        await expect.poll(() => inView(page), { timeout: 5000 }).toEqual(pair);
        await expect(section.locator('[data-carousel-status]')).toHaveText(
          `Recommendation ${((index + 1) % 4) + 1} of 4`,
        );
      }
    });

    test('at the end of the row the card beside the last one works: it opens and its link is live', async ({
      page,
    }) => {
      const section = page.locator(SECTION);
      const previous = section.getByRole('button', { name: 'Previous recommendation' });
      await previous.click();
      await expect
        .poll(() => inView(page), { timeout: 5000 })
        .toEqual(['recommendation-4', 'recommendation-1']);
      // The second card in view is the real first card, not a copy of it.
      const first = section.locator('[data-quote="recommendation-1"]:not([data-carousel-clone])');
      expect(await first.evaluate((el) => (el as HTMLElement).inert)).toBe(false);
      const toggle = first.getByRole('button', { name: 'Show more' });
      await toggle.click();
      await expect(first).toHaveAttribute('data-expanded', '');
      await expect(first.getByRole('button', { name: 'Show less' })).toBeFocused();
      await expect(first.getByRole('link', { name: /On LinkedIn/ })).toBeVisible();
    });

    test('keeps focus on a control of a card that is tabbed into, and the card works', async ({
      page,
    }) => {
      const section = page.locator(SECTION);
      // Tab into the third card: the browser scrolls it into view and the row stops there.
      const toggle = section.locator(
        '[data-quote="recommendation-3"]:not([data-carousel-clone]) [data-quote-toggle]',
      );
      await toggle.focus();
      await expect
        .poll(async () => (await inView(page)).filter((id) => !id.includes('copy')))
        .toContain('recommendation-3');
      // Let the row settle: it does not move its cards for a card that came into view by focus.
      await page.waitForTimeout(400);
      await expect(toggle).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });

    test('a second fast press on "Next" moves two cards and announces the card that comes to rest', async ({
      page,
    }) => {
      const section = page.locator(SECTION);
      const next = section.getByRole('button', { name: 'Next recommendation' });
      await next.click();
      await next.click();
      await expect
        .poll(() => inView(page), { timeout: 5000 })
        .toEqual(['recommendation-3', 'recommendation-4']);
      await expect(section.locator('[data-carousel-status]')).toHaveText('Recommendation 3 of 4');
    });

    test('many fast presses never leave the row on a copy, and the announcement names the card at rest', async ({
      page,
    }) => {
      const section = page.locator(SECTION);
      const next = section.getByRole('button', { name: 'Next recommendation' });
      // How many cards the presses add up to depends on how fast they come (a press counts from
      // where the row is going, and the row cannot go further than its copies), so the test holds
      // what must be true wherever it stops.
      for (let press = 0; press < 6; press++) await next.click();
      await page.waitForTimeout(2500);
      const shown = await inView(page);
      expect(shown).toHaveLength(2);
      expect(shown.some((id) => id.includes('copy'))).toBe(false);
      const [first, second] = shown.map((id) => Number(id.split('-')[1]));
      expect(second).toBe(((first ?? 0) % 4) + 1);
      await expect(section.locator('[data-carousel-status]')).toHaveText(
        `Recommendation ${first} of 4`,
      );
    });

    test('scrolling the row past the last card, as a swipe does, comes round to real cards', async ({
      page,
    }) => {
      const track = page.locator(`${SECTION} [data-carousel-track]`);
      const step = await track.evaluate((el) => {
        const [a, b] = [...el.children] as HTMLElement[];
        return (b?.offsetLeft ?? 0) - (a?.offsetLeft ?? 0);
      });
      await track.evaluate((el, by) => el.scrollBy({ left: by * 4, behavior: 'instant' }), step);
      await expect
        .poll(() => inView(page), { timeout: 5000 })
        .toEqual(['recommendation-1', 'recommendation-2']);
      await track.evaluate((el, by) => el.scrollBy({ left: -by, behavior: 'instant' }), step);
      await expect
        .poll(() => inView(page), { timeout: 5000 })
        .toEqual(['recommendation-4', 'recommendation-1']);
    });

    test('has no axe violation in the carousel while it rests at the end of the row', async ({
      page,
    }) => {
      const section = page.locator(SECTION);
      await section.getByRole('button', { name: 'Previous recommendation' }).click();
      await expect
        .poll(() => inView(page), { timeout: 5000 })
        .toEqual(['recommendation-4', 'recommendation-1']);
      const result = await new AxeBuilder({ page })
        .include(SECTION)
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(result.violations).toEqual([]);
    });
  });
}

// Review round 2: the row must not move its cards round under a Visitor who is tabbing through it.
// Tab is pressed slowly, so that the row has settled (and would have rebuilt itself) between two
// presses.
async function tabThrough(page: Page, presses: number) {
  const visited: string[] = [];
  for (let press = 0; press < presses; press++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(350);
    visited.push(
      await page.evaluate((selector) => {
        const el = document.activeElement;
        if (!el || !el.closest(selector)) return 'outside';
        return el.closest('[data-quote]')?.getAttribute('data-quote') ?? 'section';
      }, SECTION),
    );
  }
  return visited;
}

test.describe('Tab goes through the row once and leaves it (AC-42)', () => {
  test('at 390 with two cards: each card in turn, then on to the rest of the page', async ({
    page,
  }) => {
    await open(page, 390, 844);
    await settled(page, 'recommendation-1');
    await realCard(page, 1).locator('[data-quote-toggle]').focus();
    // Card 1: "Show more", link. Card 2: "Show more", link. The fourth press leaves the row.
    const visited = await tabThrough(page, 7);
    expect(visited.slice(0, 3)).toEqual([
      'recommendation-1',
      'recommendation-2',
      'recommendation-2',
    ]);
    expect(visited.slice(3)).toEqual(['outside', 'outside', 'outside', 'outside']);
    // Shift+Tab comes back in from the end, to the last card.
    for (let press = 0; press < 4; press++) await page.keyboard.press('Shift+Tab');
    await expect(
      page.locator(`${SECTION} [data-quote="recommendation-2"]:not(${COPY}) a`),
    ).toBeFocused();
  });

  test('at 834 with four cards: every card is reached in order and Tab then leaves the row', async ({
    page,
  }) => {
    await withCards(page, 4);
    await open(page, 834);
    await expect
      .poll(() => inView(page), { timeout: 5000 })
      .toEqual(['recommendation-1', 'recommendation-2']);
    await realCard(page, 1).locator('[data-quote-toggle]').focus();
    const visited = await tabThrough(page, 11);
    expect(visited.slice(0, 7)).toEqual([
      'recommendation-1',
      'recommendation-2',
      'recommendation-2',
      'recommendation-3',
      'recommendation-3',
      'recommendation-4',
      'recommendation-4',
    ]);
    expect(visited.slice(7)).toEqual(['outside', 'outside', 'outside', 'outside']);
    // The focused card was always a real one, in view.
    expect((await inView(page)).some((id) => id.includes('copy'))).toBe(false);
  });

  test('after the row has gone round by an arrow, Tab still leaves it after the last card', async ({
    page,
  }) => {
    await withCards(page, 4);
    await open(page, 834);
    const section = page.locator(SECTION);
    await section.getByRole('button', { name: 'Previous recommendation' }).click();
    await expect
      .poll(() => inView(page), { timeout: 5000 })
      .toEqual(['recommendation-4', 'recommendation-1']);
    await section.getByRole('button', { name: 'Next recommendation' }).focus();
    // Eight controls in four cards, whatever card stands first; the ninth press is outside.
    const visited = await tabThrough(page, 11);
    expect(visited.slice(0, 8).every((id) => id.startsWith('recommendation-'))).toBe(true);
    expect(new Set(visited.slice(0, 8)).size).toBe(4);
    expect(visited.slice(8)).toEqual(['outside', 'outside', 'outside']);
  });
});

test.describe('focus in a card when the carousel turns off at 768 (AC-42)', () => {
  test('stays where it is, and the cards stand in the order of the content again', async ({
    page,
  }) => {
    await open(page, 390, 844);
    await settled(page, 'recommendation-1');
    const section = page.locator(SECTION);
    // Go round once backwards, so that the cards stand in another order than the content.
    await section.getByRole('button', { name: 'Previous recommendation' }).click();
    await settled(page, 'recommendation-2');
    const toggle = section.locator(
      `[data-quote="recommendation-2"]:not(${COPY}) [data-quote-toggle]`,
    );
    await toggle.focus();
    await page.setViewportSize({ width: 1024, height: 900 });
    await expect(section.locator(COPY)).toHaveCount(0);
    await expect(toggle).toBeFocused();
    expect(await inView(page)).toEqual(['recommendation-1', 'recommendation-2']);
  });
});

test.describe('automatic turning, switched on for the test (AC-43)', () => {
  const INTERVAL = 7000;
  test.describe.configure({ timeout: 60_000 });

  /**
   * The page's clock is paused: the interval and the settle timer of the carousel move only when
   * a test lets time pass. `jump` fires what is due once, as when time has simply gone by.
   */
  const jump = (page: Page, ms: number) => page.clock.fastForward(ms);

  /** The cards in view once any scrolling (real time) has ended and the row has settled. */
  async function resting(page: Page) {
    await page.waitForTimeout(700);
    await page.clock.runFor(300);
    await page.waitForTimeout(50);
    return inView(page);
  }

  /** One interval on: the row turns by itself to the given card. */
  async function untilTurn(page: Page, id: string) {
    await jump(page, INTERVAL);
    expect(await resting(page)).toEqual([id]);
  }

  const away = async (page: Page) => {
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.mouse.move(5, 5);
  };

  async function load(page: Page, autoplay: boolean) {
    await page.clock.install();
    await withCards(page, 4, { autoplay });
    await open(page, 390, 844);
    await page.clock.pauseAt(Date.now() + 1000);
    await away(page);
    expect(await resting(page)).toEqual(['recommendation-1']);
  }

  /** Opens the page with automatic turning on and lets time pass until the first turn. */
  async function start(page: Page) {
    await load(page, true);
    // Half-second steps: the first turn is then known to within 0.8 s (the step and the settle).
    for (let step = 0; step < 18; step++) {
      await jump(page, 500);
      if ((await resting(page)).join() === 'recommendation-2') return;
    }
    throw new Error('the row did not turn by itself within nine seconds');
  }

  test('moves to the next card once per interval, not sooner, and goes round', async ({ page }) => {
    await start(page);
    // The row turned at most 0.8 s ago: 5.5 s and a settle later (5.8 to 6.6 s after the turn)
    // it has not moved, and 1.5 s after that it has.
    await jump(page, INTERVAL - 1500);
    expect(await resting(page)).toEqual(['recommendation-2']);
    await jump(page, 1500);
    expect(await resting(page)).toEqual(['recommendation-3']);
    await untilTurn(page, 'recommendation-4');
    await untilTurn(page, 'recommendation-1');
    // Turning by itself is not announced.
    await expect(page.locator(`${SECTION} [data-carousel-status]`)).toHaveText('');
  });

  test('stops while the pointer is over the row and goes on when it leaves', async ({ page }) => {
    await start(page);
    await page.locator(`${SECTION} [data-quote="recommendation-2"]:not(${COPY})`).hover();
    await jump(page, INTERVAL * 2);
    expect(await resting(page)).toEqual(['recommendation-2']);
    await away(page);
    await untilTurn(page, 'recommendation-3');
  });

  test('stops while focus is inside the row and goes on when it leaves', async ({ page }) => {
    await start(page);
    await page.locator(SECTION).getByRole('button', { name: 'Next recommendation' }).focus();
    await jump(page, INTERVAL * 2);
    expect(await resting(page)).toEqual(['recommendation-2']);
    await away(page);
    await untilTurn(page, 'recommendation-3');
  });

  test('stops while a quote is open and goes on when it is closed', async ({ page }) => {
    await start(page);
    const toggle = page.locator(
      `${SECTION} [data-quote="recommendation-2"]:not(${COPY}) [data-quote-toggle]`,
    );
    await toggle.click();
    await away(page);
    await jump(page, INTERVAL * 2);
    expect(await resting(page)).toEqual(['recommendation-2']);
    await toggle.click();
    await away(page);
    await untilTurn(page, 'recommendation-3');
  });

  test('follows the hero’s Motion control: paused there, it stands still', async ({ page }) => {
    await start(page);
    const control = page.locator('[data-motion-control]');
    await control.click();
    await expect(control).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-hero]')).toHaveAttribute('data-motion', 'paused');
    await away(page);
    await jump(page, INTERVAL * 2);
    expect(await resting(page)).toEqual(['recommendation-2']);
    await control.click();
    await expect(page.locator('[data-hero]')).toHaveAttribute('data-motion', 'running');
    await away(page);
    await untilTurn(page, 'recommendation-3');
  });

  test('stops while the page is hidden', async ({ page }) => {
    await start(page);
    const setVisibility = (value: string) =>
      page.evaluate(
        (state) =>
          Object.defineProperty(document, 'visibilityState', { value: state, configurable: true }),
        value,
      );
    await setVisibility('hidden');
    await jump(page, INTERVAL * 2);
    expect(await resting(page)).toEqual(['recommendation-2']);
    await setVisibility('visible');
    await untilTurn(page, 'recommendation-3');
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('never moves by itself; the arrows still do', async ({ page }) => {
      await load(page, true);
      await jump(page, INTERVAL * 3);
      expect(await resting(page)).toEqual(['recommendation-1']);
      await page.locator(SECTION).getByRole('button', { name: 'Next recommendation' }).click();
      expect(await resting(page)).toEqual(['recommendation-2']);
    });
  });

  test('without the switch in the content the row never moves by itself', async ({ page }) => {
    await load(page, false);
    await jump(page, INTERVAL * 3);
    expect(await resting(page)).toEqual(['recommendation-1']);
  });
});
