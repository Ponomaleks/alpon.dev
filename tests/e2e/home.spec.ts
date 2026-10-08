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
    expect(text.map((t) => t.slice(0, 2))).toEqual(['01', '02', '03', '04']);
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

  for (const width of [390, 834, 1440]) {
    test(`each language is on its own line at ${width}`, async ({ page }) => {
      await open(page, width, 900);
      const lines = page.locator('main #about .quick__row').nth(3).locator('dd');
      await expect(lines).toHaveText([
        'English, upper-intermediate',
        'Norwegian, intermediate',
        'Ukrainian, native',
      ]);
      const boxes = [await box(lines.nth(0)), await box(lines.nth(1)), await box(lines.nth(2))];
      for (let i = 1; i < boxes.length; i++) {
        const [above, line] = [boxes[i - 1], boxes[i]];
        if (!above || !line) throw new Error('no box');
        expect(line.x).toBeCloseTo(above.x, 0);
        expect(line.y).toBeGreaterThanOrEqual(above.y + above.height - 1);
      }
    });
  }
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

  // Page design (.fj-xp-item): one column, the period above the heading, on a phone and at desktop,
  // where the list is the narrow column beside the section heading.
  for (const width of [390, 1024, 1440]) {
    test(`an entry is one column at ${width}: period, then heading, then body`, async ({
      page,
    }) => {
      await open(page, width, 900);
      const entry = page.locator('main .experience details').first();
      const meta = await box(entry.locator('.xp__meta'));
      const title = await box(entry.locator('.xp__title'));
      const body = await box(entry.locator('.xp__body'));
      const chevron = await box(entry.locator('.xp__chevron'));
      expect(title.x).toBeCloseTo(meta.x, 0);
      expect(title.y).toBeGreaterThanOrEqual(meta.y + meta.height - 1);
      expect(body.x).toBeCloseTo(title.x, 0);
      expect(body.y).toBeGreaterThanOrEqual(title.y + title.height - 1);
      // The chevron stands beside the heading, not beside the period.
      expect(chevron.x).toBeGreaterThanOrEqual(title.x + title.width - 1);
      expect(chevron.y).toBeGreaterThanOrEqual(meta.y + meta.height - 1);
    });
  }

  // On a tablet the list is wide: the period takes a fixed 160px column on the left, the heading
  // and the body share the right one.
  for (const width of [768, 834, 1023]) {
    test(`an entry is two columns at ${width}: period left, heading and body right`, async ({
      page,
    }) => {
      await open(page, width, 900);
      const entry = page.locator('main .experience details').first();
      const meta = await box(entry.locator('.xp__meta'));
      const title = await box(entry.locator('.xp__title'));
      const body = await box(entry.locator('.xp__body'));
      expect(meta.width).toBeCloseTo(160, 0);
      expect(title.x).toBeCloseTo(meta.x + 160 + 24, 0);
      expect(Math.abs(title.y - meta.y)).toBeLessThanOrEqual(8);
      expect(body.x).toBeCloseTo(title.x, 0);
      expect(body.y).toBeGreaterThanOrEqual(title.y + title.height - 1);
    });
  }

  test('"Full CV" carries an arrow that is not part of its name', async ({ page }) => {
    await open(page, 1440, 900);
    const link = page
      .locator('main .experience')
      .getByRole('link', { name: 'Full CV', exact: true });
    await expect(link.locator('svg')).toBeVisible();
    const arrow = await box(link.locator('svg'));
    expect(arrow.width).toBeCloseTo(16, 0);
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

test.describe('section layout (page design: every section in the page container)', () => {
  for (const width of [390, 834, 1440]) {
    test(`About, Experience and Contact share the left edge and the section spacing at ${width}`, async ({
      page,
    }) => {
      await open(page, width);
      const headings = ['#about h2', 'section.experience h2', '#contact h2'].map((selector) =>
        page.locator(selector),
      );
      const boxes = await Promise.all(headings.map((heading) => box(heading)));
      const [about, experience, contact] = boxes;
      if (!about || !experience || !contact) throw new Error('a section heading is missing');
      // One container: the three headings start on the same line, inside the page margin.
      expect(about.x).toBeGreaterThan(0);
      expect(experience.x).toBe(about.x);
      expect(contact.x).toBe(about.x);

      // One rhythm: each section keeps the same distance from the section above it.
      const gapAbove = (selector: string) =>
        page.evaluate((sel) => {
          const section = document.querySelector(sel);
          const heading = section?.querySelector('h2');
          if (!section || !heading) throw new Error(`no section for ${sel}`);
          return Math.round(
            heading.getBoundingClientRect().top - section.getBoundingClientRect().top,
          );
        }, selector);
      const aboutGap = await gapAbove('#about');
      expect(await gapAbove('section.experience')).toBe(aboutGap);
      expect(await gapAbove('#contact')).toBe(aboutGap);
    });
  }
});

// The hero against the page design (Home.jsx, site.css): the ground by theme, the badge row and
// the Now line. Expected colours are resolved from the site's own tokens in the page.
const SPACE_5 = 20;

/** Resolves a colour expression against the root tokens (the page ground, not the hero's). */
const rootColor = (page: Page, value: string) =>
  page.evaluate((v) => {
    const probe = document.createElement('span');
    document.documentElement.append(probe);
    probe.style.setProperty('color', v);
    const out = getComputedStyle(probe).color;
    probe.remove();
    return out;
  }, value);

const heroLook = (page: Page) =>
  page.evaluate(() => {
    const cs = (sel: string) => getComputedStyle(document.querySelector(sel) as Element);
    const hero = cs('main .hero');
    return {
      ground: hero.backgroundColor,
      borderWidth: hero.borderBottomWidth,
      border: hero.borderBottomColor,
      name: cs('main .hero__name').color,
      roleOne: cs('main .hero__role span:first-child').color,
      roleTwo: cs('main .hero__role span + span').color,
      dot: cs('main .hero__dot').backgroundColor,
    };
  });

for (const scripts of ['on', 'off'] as const) {
  test.describe(`hero ground by theme, scripts ${scripts} (page design: x-hero--natt / fjord-on-spruce)`, () => {
    test.use({ javaScriptEnabled: scripts === 'on' });

    test('Dag: the hero stands on spruce, with no line under it', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
      await open(page, 1440, 900);
      const look = await heroLook(page);
      expect(look.ground).toBe(await rootColor(page, 'var(--fjord-spruce)'));
      expect(look.borderWidth).toBe('0px');
      expect(look.name).toBe(await rootColor(page, 'var(--fjord-snow)'));
      expect(look.roleOne).toBe(await rootColor(page, 'var(--fjord-snow)'));
      expect(look.roleTwo).toBe(await rootColor(page, 'var(--fjord-lichen)'));
      expect(look.dot).toBe(await rootColor(page, 'var(--fjord-contour)'));
    });

    test('Natt: the hero stands on the page ground, with a border under it and the link colour on the first role and the Now dot', async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
      await open(page, 1440, 900);
      const look = await heroLook(page);
      expect(look.ground).toBe(await rootColor(page, 'var(--fjord-color-bg)'));
      expect(look.ground).not.toBe(await rootColor(page, 'var(--fjord-spruce-deep)'));
      expect(look.borderWidth).toBe('1px');
      expect(look.border).toBe(await rootColor(page, 'var(--fjord-color-border)'));
      expect(look.name).toBe(await rootColor(page, 'var(--fjord-color-text)'));
      expect(look.roleOne).toBe(await rootColor(page, 'var(--fjord-color-link)'));
      expect(look.roleTwo).toBe(await rootColor(page, 'var(--fjord-color-text-muted)'));
      expect(look.dot).toBe(await rootColor(page, 'var(--fjord-color-link)'));
    });
  });
}

test.describe('hero badge row and Now line (page design: .x-hero__text, .x-hero__now)', () => {
  for (const width of [390, 834, 1440]) {
    test(`the eyebrow follows the badge at the design gap at ${width}`, async ({ page }) => {
      await open(page, width, 900);
      const badge = await box(page.locator('main .hero .badge'));
      const eyebrow = await box(page.locator('main .hero__eyebrow'));
      expect(eyebrow.y - (badge.y + badge.height)).toBeCloseTo(SPACE_5, 0);
      // The row is as tall as the badge: the Motion control's reserved place adds nothing.
      const row = await box(page.locator('main .hero__badges'));
      expect(row.height).toBeCloseTo(badge.height, 0);
    });
  }

  /** The Now line's parts: the dot, "Nå:", the text item and the first glyph of the text. */
  const nowParts = (page: Page) =>
    page.evaluate(async () => {
      await document.fonts.ready;
      const now = document.querySelector('main .hero__now') as HTMLElement;
      const rect = (el: Element | Range) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      const item = now.querySelector('.hero__now-text') as HTMLElement;
      const first = document.createRange();
      const node = item.firstChild as Text;
      const at = node.data.search(/\S/);
      first.setStart(node, at);
      first.setEnd(node, at + 1);
      const all = document.createRange();
      all.selectNodeContents(item);
      const textLines = new Set([...all.getClientRects()].map((r) => Math.round(r.top))).size;
      return {
        line: rect(now),
        dot: rect(now.querySelector('.hero__dot') as Element),
        label: rect(now.querySelector('[lang="no"]') as Element),
        first: rect(first),
        textLines,
        gap: parseFloat(getComputedStyle(now).columnGap),
        fontSize: parseFloat(getComputedStyle(now).fontSize),
        lineHeight: parseFloat(getComputedStyle(now).lineHeight),
      };
    });
  const middle = (b: { y: number; height: number }) => b.y + b.height / 2;

  // Owner decision (design review): on a phone the line wraps as the page design does. "Nå:" keeps
  // the first line with the dot; the text starts on the next line at the left edge and takes two.
  for (const width of [360, 390]) {
    test(`"Nå:" stands on a line of its own with the dot at ${width}, and the text follows below`, async ({
      page,
    }) => {
      await open(page, width);
      const { line, dot, label, first, textLines, gap, fontSize, lineHeight } =
        await nowParts(page);
      // The design's .fjord-mono-small: the small mono size (11.5 px on a phone) at the mono leading.
      expect(fontSize).toBeCloseTo(11.5, 1);
      expect(lineHeight / fontSize).toBeCloseTo(1.5, 2);
      expect(dot.width).toBe(7);
      expect(dot.height).toBe(7);
      expect(
        Math.abs(middle(dot) - middle(label)),
        'the dot is level with "Nå:"',
      ).toBeLessThanOrEqual(1);
      expect(dot.x).toBeCloseTo(line.x, 0);
      expect(label.x - (dot.x + dot.width)).toBeCloseTo(gap, 0);
      expect(first.y, 'the text starts under "Nå:"').toBeGreaterThanOrEqual(label.y + label.height);
      expect(first.x, 'the text starts at the left edge').toBeCloseTo(line.x, 0);
      expect(textLines, 'the text takes two lines').toBe(2);
      expect(line.height, 'three lines in all').toBeGreaterThan(label.height * 3);
    });
  }

  for (const width of [834, 1440]) {
    test(`the Now line is one line at ${width}: the dot, "Nå:" and the text side by side`, async ({
      page,
    }) => {
      await open(page, width, 900);
      const { line, dot, label, first, textLines, gap, fontSize, lineHeight } =
        await nowParts(page);
      expect(fontSize, 'the small mono size, as .fjord-mono-small').toBeLessThanOrEqual(12);
      expect(lineHeight / fontSize).toBeCloseTo(1.5, 2);
      expect(textLines).toBe(1);
      expect(line.height).toBeLessThan(label.height * 1.5);
      expect(Math.abs(middle(dot) - middle(label))).toBeLessThanOrEqual(1);
      expect(Math.abs(middle(first) - middle(label))).toBeLessThanOrEqual(1);
      expect(first.x - (label.x + label.width)).toBeCloseTo(gap, 0);
    });
  }
});

// The section number is visual wayfinding: it is hidden from assistive technology, and each
// numbered section is named by its heading, so a jump to #contact announces the section by name
// instead of a bare "03" (found in the manual iPhone check of AC-18).
test.describe('numbered sections are named by their headings', () => {
  const sections = [
    { selector: '#about', number: '01', heading: 'Frontend-focused, full stack.' },
    { selector: 'section.experience', number: '02', heading: 'Where I’ve worked' },
    {
      selector: 'section[aria-labelledby="recommendations-title"]',
      number: '03',
      heading: 'From people I’ve worked with',
    },
    { selector: '#contact', number: '04', heading: 'Get in touch' },
  ];

  for (const { selector, number, heading } of sections) {
    test(`${selector} is a region named "${heading}" and its number ${number} is decorative`, async ({
      page,
    }) => {
      await open(page, 390);
      const section = page.locator(`main ${selector}`);
      await expect(section).toHaveRole('region');
      await expect(section).toHaveAccessibleName(heading);
      await expect(page.getByRole('main').getByRole('region', { name: heading })).toHaveCount(1);
      const title = section.getByRole('heading', { level: 2, name: heading });
      await expect(section).toHaveAttribute(
        'aria-labelledby',
        (await title.getAttribute('id')) ?? '',
      );
      const mark = section.locator('.sechead .eyebrow b');
      await expect(mark).toHaveText(number);
      await expect(mark).toBeVisible();
      await expect(mark).toHaveAttribute('aria-hidden', 'true');
      expect(await section.locator('.sechead').ariaSnapshot()).not.toContain(number);
    });
  }

  test('no heading id is used twice', async ({ page }) => {
    await open(page, 390);
    const ids = await page.locator('[id]').evaluateAll((els) => els.map((el) => el.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
