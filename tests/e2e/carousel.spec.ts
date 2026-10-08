import { expect, test, type Locator, type Page } from '@playwright/test';

// Recommendations on the home page (home T31): "Show more" / "Show less" on a long quote (AC-09,
// D-19) and the carousel that goes round (AC-42, D-20). The page holds two Recommendations, so the
// carousel is on below 768 (one column) and off from 768 (two columns). Automatic turning is off
// in the content (AC-43); its rule is unit-tested in src/scripts/home/carousel.test.ts.

const SECTION = 'main section[aria-labelledby="recommendations-title"]';
const CARD = '[data-quote]:not([data-carousel-clone])';
const COPY = '[data-carousel-clone]';

async function open(page: Page, width: number, height = 900) {
  await page.setViewportSize({ width, height });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.locator(SECTION).scrollIntoViewIfNeeded();
}

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
      const first = page.locator(`${SECTION} ${CARD}`).first();
      const text = await first.locator('blockquote').evaluate((el) => el.textContent ?? '');
      expect(text).toContain('I worked with Oleksandr for over two years');
      expect(text).toContain('would be a valuable addition to any team.');
    });

    test('"Show more" opens the whole quote in place and "Show less" closes it', async ({
      page,
    }) => {
      const first = page.locator(`${SECTION} ${CARD}`).first();
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
      const toggle = page.locator(`${SECTION} ${CARD} [data-quote-toggle]`).first();
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
    await section.locator(`${CARD} [data-quote-toggle]`).first().click();
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
