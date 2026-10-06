import { expect, test, type Locator, type Page } from '@playwright/test';

// The home page end to end (home T20): AC-01 first phone screen, AC-02 portrait, AC-03 Now line,
// AC-04 and AC-11 no projects entry points, AC-05 key facts, AC-07 About, AC-08 experience,
// touch targets at 390, AC-32 scripts off. Reduced motion is emulated so nothing moves.
test.use({ reducedMotion: 'reduce' });

const BAR = '[data-shell-bar]';

async function box(locator: Locator) {
  const found = await locator.boundingBox();
  if (!found) throw new Error('element has no box');
  return found;
}

async function open(page: Page, width: number, height = 844) {
  await page.setViewportSize({ width, height });
  await page.goto('/');
}

/**
 * Sum of layout-shift values since navigation, after the page has settled, counting only shifts
 * that move the portrait (AC-02). A late webfont swap moves text elsewhere (the CLS budget is T19).
 */
async function layoutShift(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        const add = (entry: PerformanceEntry) => {
          const shift = entry as PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
            sources: { node: Node | null }[];
          };
          const portrait = document.querySelector('main .portrait');
          const moves = shift.sources.some((s) => s.node && portrait?.contains(s.node));
          if (!shift.hadRecentInput && moves) total += shift.value;
        };
        const observer = new PerformanceObserver((list) => list.getEntries().forEach(add));
        observer.observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => {
          observer.takeRecords().forEach(add);
          observer.disconnect();
          resolve(total);
        }, 200);
      }),
  );
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`first phone screen, ${scheme === 'light' ? 'Dag' : 'Natt'} (AC-01)`, () => {
    test.use({ colorScheme: scheme });

    test('everything AC-01 lists lies inside the screen above the bar', async ({ page }) => {
      await open(page, 390);
      const hero = page.locator('main .hero');
      const bar = await box(page.locator(BAR));
      const parts: Record<string, Locator> = {
        badge: hero.locator('.badge'),
        eyebrow: hero.locator('.hero__eyebrow'),
        h1: page.getByRole('heading', { level: 1, name: 'Alexander Ponomarenko' }),
        roleOne: hero.getByText('Software Engineer', { exact: true }),
        roleTwo: hero.getByText('Full Stack Developer', { exact: true }),
        lead: hero.getByText('Good products are built together.', { exact: true }),
        viewCv: hero.getByRole('link', { name: 'View CV' }),
        now: hero.locator('.hero__now'),
      };
      for (const [name, locator] of Object.entries(parts)) {
        await expect(locator, name).toBeVisible();
        const b = await box(locator);
        expect(b.x, `${name} left`).toBeGreaterThanOrEqual(0);
        expect(b.x + b.width, `${name} right`).toBeLessThanOrEqual(390);
        expect(b.y, `${name} top`).toBeGreaterThanOrEqual(0);
        expect(b.y + b.height, `${name} bottom above the bar`).toBeLessThanOrEqual(bar.y);
      }
    });

    test('the eyebrow carries the Norwegian words and the coordinates', async ({ page }) => {
      await open(page, 390);
      const eyebrow = page.locator('main .hero__eyebrow');
      await expect(eyebrow.locator('[lang="no"]', { hasText: 'Hei.' })).toBeVisible();
      await expect(eyebrow.locator('[lang="no"]', { hasText: 'Oslo, Norge' })).toBeVisible();
      await expect(eyebrow).toContainText(/\d{2}\.\d{2}° N, \d{1,2}\.\d{2}° E/);
      await expect(page.locator('main .badge')).toContainText('Open to work');
      await expect(page.locator('main .badge')).toContainText('Oslo area');
    });

    test('the header and the bar offer their actions (AC-01)', async ({ page }) => {
      await open(page, 390);
      const bar = page.locator(BAR);
      await expect(bar.getByRole('link', { name: 'View CV' })).toBeVisible();
      await expect(bar.getByRole('link', { name: 'Save contact (.vcf)' })).toBeVisible();
      await expect(page.locator('header').getByRole('link', { name: 'Get in touch' })).toHaveCount(
        1,
      );
    });
  });
}

test.describe('portrait (AC-02)', () => {
  for (const width of [1024, 1440]) {
    test(`beside the text at ${width}`, async ({ page }) => {
      await open(page, width, 900);
      const text = await box(page.locator('main .hero__text'));
      const portrait = await box(page.locator('main .portrait'));
      expect(portrait.x).toBeGreaterThanOrEqual(text.x + text.width - 1);
    });
  }

  for (const width of [390, 834]) {
    test(`under the text at ${width}`, async ({ page }) => {
      await open(page, width);
      const text = await box(page.locator('main .hero__text'));
      const portrait = await box(page.locator('main .portrait'));
      expect(portrait.y).toBeGreaterThanOrEqual(text.y + text.height - 1);
    });
  }

  test('round frame, announced as an image with the name', async ({ page }) => {
    await open(page, 1440, 900);
    await expect(
      page
        .locator('main .portrait')
        .getByRole('img', { name: 'Alexander Ponomarenko', exact: true }),
    ).toBeVisible();
    const frame = await box(page.locator('main .portrait'));
    expect(Math.abs(frame.width - frame.height)).toBeLessThanOrEqual(1);
    const radius = await page
      .locator('main .portrait')
      .evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
    const half = radius.endsWith('%') ? 50 : frame.width / 2;
    expect(parseFloat(radius)).toBeGreaterThanOrEqual(half);
  });

  for (const width of [390, 834, 1440]) {
    test(`the page does not shift on load at ${width}`, async ({ page }) => {
      await open(page, width);
      expect(await layoutShift(page)).toBe(0);
    });
  }
});

test.describe('hero content (AC-03, AC-04, AC-11)', () => {
  test('the Now line shows the Norwegian label and no brackets', async ({ page }) => {
    await open(page, 390);
    const now = page.locator('main .hero__now');
    await expect(now.locator('[lang="no"]', { hasText: 'Nå:' })).toBeVisible();
    await expect(now).toContainText('MSc Computer Science at Woolf University');
    await expect(page.locator('main')).not.toContainText(/\[[^\]]*\]/);
  });

  test('no way to projects is offered', async ({ page }) => {
    await open(page, 1440, 900);
    const main = page.locator('main');
    await expect(main.getByRole('link', { name: 'See projects' })).toHaveCount(0);
    await expect(main.getByRole('link', { name: 'All projects' })).toHaveCount(0);
    await expect(main.getByText('Selected projects')).toHaveCount(0);
    await expect(main.locator('a[href^="/projects"]')).toHaveCount(0);
    await expect(main.getByRole('link', { name: 'View CV' })).toHaveCount(1);
  });

  test('the sections are numbered without a gap', async ({ page }) => {
    await open(page, 1440, 900);
    const text = await page
      .locator('main')
      .getByText(/^0\d\b/)
      .allTextContents();
    expect(text.map((t) => t.slice(0, 2))).toEqual(['01', '02', '03']);
  });
});

test.describe('key facts (AC-05)', () => {
  test('four facts with final numbers, label and context', async ({ page }) => {
    await open(page, 1440, 900);
    const panel = page.locator('main .key-facts');
    const items = panel.locator('li.stat');
    await expect(items).toHaveCount(4);
    const expected = [
      { value: '3+', label: 'Software Engineer in enterprise teams', context: 'EPAM Systems' },
      { value: '~40', label: 'Students taught React fundamentals', context: 'Alfred Nobel' },
      { value: '~2000', label: 'Participants in the IT Marathon', context: 'IT Marathons' },
      { value: '100+', label: 'Repositories on GitHub', context: 'github.com/ponomaleks' },
    ];
    for (const [i, fact] of expected.entries()) {
      const item = items.nth(i);
      await expect(item.locator('.stat__final')).toHaveText(fact.value);
      await expect(item).toContainText(fact.label);
      await expect(item).toContainText(fact.context);
      // The counting copy is hidden from assistive technology.
      await expect(item.locator('.stat__count')).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('the panel overlaps the lower edge of the hero', async ({ page }) => {
    await open(page, 1440, 900);
    const hero = await box(page.locator('main .hero'));
    const panel = await box(page.locator('main .key-facts__panel'));
    expect(panel.y).toBeLessThan(hero.y + hero.height);
    expect(panel.y + panel.height).toBeGreaterThan(hero.y + hero.height);
  });
});

test.describe('About (AC-07)', () => {
  test('heading, introduction and four quick facts', async ({ page }) => {
    await open(page, 1440, 900);
    const about = page.locator('main #about');
    await expect(
      about.getByRole('heading', { name: 'Frontend-focused, full stack.' }),
    ).toBeVisible();
    await expect(about.locator('.about__intro')).toContainText('frontend-focused full stack');
    const rows = about.locator('.quick__row');
    await expect(rows).toHaveCount(4);
    await expect(rows.locator('dt')).toHaveText(['Based in', 'Focus', 'Stack', 'Languages']);
    await expect(rows.nth(0)).toContainText('Nittedal, Oslo area');
    await expect(rows.nth(0)).toContainText('Norwegian work permit');
    await expect(rows.nth(3)).toContainText('English, upper-intermediate');
    await expect(rows.nth(3)).toContainText('Norwegian, intermediate');
    await expect(rows.nth(3)).toContainText('Ukrainian, native');
    await expect(about).not.toContainText(/\b[ABC][12]\b/);
    await expect(about.locator('img, svg[role="img"], progress, [role="progressbar"]')).toHaveCount(
      0,
    );
  });
});

test.describe('experience (AC-08)', () => {
  test('first entry open on arrival, the others closed, each shows role, organisation, period', async ({
    page,
  }) => {
    await open(page, 1440, 900);
    const entries = page.locator('main .experience details');
    await expect(entries).toHaveCount(4);
    await expect(entries.nth(0)).toHaveJSProperty('open', true);
    for (const i of [1, 2, 3]) await expect(entries.nth(i)).toHaveJSProperty('open', false);
    for (let i = 0; i < 4; i++) {
      const summary = entries.nth(i).locator('summary');
      await expect(summary.locator('.xp__role')).not.toBeEmpty();
      await expect(summary.locator('.xp__org')).not.toBeEmpty();
      await expect(summary.locator('.xp__period')).not.toBeEmpty();
    }
    await expect(
      page.locator('main .experience').getByRole('link', { name: 'Full CV' }),
    ).toHaveAttribute('href', '/cv');
  });

  test('a click opens and closes an entry and shows its body', async ({ page }) => {
    await open(page, 1440, 900);
    const entry = page.locator('main .experience details').nth(1);
    await expect(entry.locator('.xp__body')).toBeHidden();
    await entry.locator('summary').click();
    await expect(entry).toHaveJSProperty('open', true);
    await expect(entry.locator('.xp__body')).toBeVisible();
    await expect(entry.locator('.xp__body')).toContainText('Angular');
    await entry.locator('summary').click();
    await expect(entry).toHaveJSProperty('open', false);
    await expect(entry.locator('.xp__body')).toBeHidden();
  });

  test('the keyboard opens and closes an entry', async ({ page }) => {
    await open(page, 1440, 900);
    const entry = page.locator('main .experience details').nth(2);
    await entry.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(entry).toHaveJSProperty('open', true);
    await page.keyboard.press('Space');
    await expect(entry).toHaveJSProperty('open', false);
  });
});

test.describe('touch targets at 390 (every interactive element of main)', () => {
  test('at least 44 x 44', async ({ page }) => {
    await open(page, 390);
    const small = await page.evaluate(() => {
      const found: string[] = [];
      const selector = 'a[href], button, summary, input, select, textarea, [tabindex="0"]';
      for (const el of document.querySelectorAll('main ' + selector)) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (getComputedStyle(el).visibility === 'hidden') continue;
        if (rect.width < 44 || rect.height < 44) {
          const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 30);
          found.push(
            `${el.tagName.toLowerCase()} "${text}" ${Math.round(rect.width)}x${Math.round(rect.height)}`,
          );
        }
      }
      return found;
    });
    expect(small).toEqual([]);
  });
});

test.describe('scripts off (AC-32)', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });

  test('every section is visible and readable', async ({ page }) => {
    await page.goto('/');
    for (const selector of ['.hero', '.key-facts', '#about', '.experience', '#contact']) {
      const section = page.locator(`main ${selector}`);
      await expect(section, selector).toBeVisible();
      const opacity = await section.evaluate((el) => {
        let node: Element | null = el;
        let value = 1;
        while (node) {
          value *= Number(getComputedStyle(node).opacity);
          node = node.parentElement;
        }
        return value;
      });
      expect(opacity, selector).toBe(1);
    }
    await expect(page.locator('main .key-facts .stat__final').first()).toBeVisible();
  });

  test('the contact links work and Save contact downloads', async ({ page }) => {
    await page.goto('/');
    const contact = page.locator('main #contact');
    await expect(contact.locator('a[href^="mailto:"]').first()).toBeVisible();
    await expect(contact.locator('a[href^="tel:"]')).toBeVisible();
    await expect(contact.locator('a[href*="linkedin.com"]')).toBeVisible();
    await expect(contact.locator('a[href*="github.com"]')).toBeVisible();
    const save = contact.getByRole('link', { name: /Save contact/ });
    await expect(save).toBeVisible();
    await expect(save).toHaveAttribute('download', /.*/);
    const downloading = page.waitForEvent('download');
    await save.click();
    expect((await downloading).suggestedFilename()).toMatch(/\.vcf$/);
  });

  test('entries open without a script', async ({ page }) => {
    await page.goto('/');
    const entry = page.locator('main .experience details').nth(3);
    await expect(entry.locator('.xp__body')).toBeHidden();
    await entry.locator('summary').click();
    await expect(entry.locator('.xp__body')).toBeVisible();
  });

  test('no Motion control and no Copy action is displayed', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-motion-control]')).toBeHidden();
    await expect(page.getByRole('button', { name: /Copy/ })).toHaveCount(0);
    await expect(page.locator('[data-copy-email]')).toBeHidden();
    await expect(page.locator('main [data-needs-script]')).toBeHidden();
  });
});
