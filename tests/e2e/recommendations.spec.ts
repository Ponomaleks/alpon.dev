import { expect, test } from '@playwright/test';
import { contact } from '../../src/data/contact';
import { recommendations } from '../../src/data/home';

// Recommendations on the home page (home T27, T31): AC-09 each quote word for word with the person's
// name and role and an "On LinkedIn" link to the recommendations on Alexander's profile, Contact
// carries the next number;
// the source fields of a Recommendation are not on the page. Reduced motion: nothing moves.
test.use({ reducedMotion: 'reduce' });

const HEADING = 'From people I’ve worked with';

test.describe('recommendations (AC-09)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('the section sits between Experience and Contact, as 03, and Contact is 04', async ({
    page,
  }) => {
    const section = page.getByRole('main').getByRole('region', { name: HEADING });
    await expect(section).toHaveCount(1);
    await expect(section.locator('.eyebrow')).toHaveText(/03\s*\/\s*Recommendations/);
    await expect(page.locator('main #contact .eyebrow')).toHaveText(/04\s*\/\s*Contact/);
    const order = await page
      .locator('main .eyebrow')
      .evaluateAll((all) => all.map((e) => (e.textContent ?? '').replace(/\s+/g, ' ').trim()));
    expect(order).toEqual([
      '01 / About',
      '02 / Experience',
      '03 / Recommendations',
      '04 / Contact',
    ]);
  });

  test('both Recommendations show the quote word for word, the name and the role', async ({
    page,
  }) => {
    const cards = page
      .getByRole('main')
      .getByRole('region', { name: HEADING })
      .locator('figure:not([data-carousel-clone])');
    await expect(cards).toHaveCount(2);
    expect(recommendations).toHaveLength(2);
    for (const [i, r] of recommendations.entries()) {
      const card = cards.nth(i);
      const paragraphs = await card
        .locator('blockquote p')
        .evaluateAll((all) => all.map((p) => p.textContent ?? ''));
      expect(paragraphs.join('\n\n')).toBe(`\u201c${r.quote}\u201d`);
      await expect(card.locator('figcaption strong')).toHaveText(r.name);
      await expect(card.locator('figcaption')).toContainText(r.role);
    }
  });

  test('each card links "On LinkedIn" to the recommendations on Alexander’s profile, in a new tab', async ({
    page,
  }) => {
    const links = page
      .getByRole('main')
      .getByRole('region', { name: HEADING })
      .getByRole('link', { name: 'On LinkedIn' });
    await expect(links).toHaveCount(2);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute('href', contact.links.recommendations);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
      await expect(link).toHaveAccessibleName('On LinkedIn (opens in a new tab)');
    }
  });

  test('the profile address, the date and the relationship of a person are not on the page', async ({
    page,
  }) => {
    const html = await page.content();
    for (const r of recommendations) {
      expect(html).not.toContain(r.profile);
      expect(html).not.toContain(r.profile.replace(/^https:\/\/www\./, ''));
      expect(html).not.toContain(r.date);
      expect(html).not.toContain(r.relationship);
    }
  });

  for (const width of [390, 834, 1440]) {
    test(`the row shows ${width < 768 ? 'one card' : 'two cards'} at a time at ${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const cards = page
        .getByRole('main')
        .getByRole('region', { name: HEADING })
        .locator('figure:not([data-carousel-clone])');
      const first = await cards.nth(0).boundingBox();
      const second = await cards.nth(1).boundingBox();
      if (!first || !second) throw new Error('a card has no box');
      // One row in both layouts: below 768 the second card is the next one in the carousel.
      expect(Math.abs(second.y - first.y)).toBeLessThan(1);
      expect(second.x).toBeGreaterThanOrEqual(first.x + first.width);
      const row = await cards.nth(0).locator('xpath=..').boundingBox();
      if (!row) throw new Error('the row has no box');
      if (width < 768) expect(Math.abs(first.width - row.width)).toBeLessThan(1);
      else expect(first.width).toBeLessThan(row.width / 2);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
