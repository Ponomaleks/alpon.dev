import { expect, test, type Page } from '@playwright/test';

// The sheet of "Add to contacts" end to end (save-contact-hint T5): AC-03 opening with the
// download, AC-04 closing and focus, AC-05 where it must not open. The mobile project is the
// touch device; the desktop project is not.
test.use({ reducedMotion: 'reduce' });

const NAME = 'Add to contacts (vCard file)';
const SHEET = '#save-contact-sheet';
const COPY = [
  'Add the contact card',
  'It goes to your Downloads.',
  'If your browser asks, tap Download.',
  'Open Downloads in your Files app.',
  'Tap the file and save it as a contact.',
  'Or scan the QR code on a computer.',
];

const actions = [
  { name: 'the Contact block', scope: '#contact' },
  { name: 'the closing band', scope: '.fj-band' },
  { name: 'the Sticky action bar', scope: '[data-shell-bar]' },
] as const;

const isTouch = (page: Page) =>
  page.evaluate(() => matchMedia('(hover: none) and (pointer: coarse)').matches);

/** Activates the action and waits for the download the click starts. */
async function activate(page: Page, scope: string) {
  const link = page.locator(scope).getByRole('link', { name: NAME });
  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  expect(download.suggestedFilename()).toMatch(/\.vcf$/);
  return link;
}

test.describe('on a touch device', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'the mobile project is the touch device');
    await page.goto('/');
    expect(await isTouch(page)).toBe(true);
  });

  for (const { name, scope } of actions) {
    test(`${name}: the file downloads and the sheet opens with its copy (AC-03)`, async ({
      page,
    }) => {
      const sheet = page.locator(SHEET);
      await expect(sheet).toBeHidden();
      await activate(page, scope);
      await expect(sheet).toBeVisible();
      await expect(page.getByRole('dialog', { name: 'Add the contact card' })).toBeVisible();
      await expect(sheet.getByRole('heading', { level: 2 })).toHaveText('Add the contact card');
      for (const line of COPY) await expect(sheet.getByText(line, { exact: true })).toBeVisible();
      await expect(sheet.getByRole('listitem')).toHaveCount(3);
      await expect(sheet).not.toContainText('.vcf');
      await expect(sheet.getByRole('button')).toHaveText('Got it');
      // Modal: in the top layer, the page under it cannot be reached.
      expect(await sheet.evaluate((el) => el.matches(':modal'))).toBe(true);
    });

    test(`${name}: "Got it" closes the sheet and focus returns to the action (AC-04)`, async ({
      page,
    }) => {
      const link = await activate(page, scope);
      await page.locator(SHEET).getByRole('button', { name: 'Got it' }).click();
      await expect(page.locator(SHEET)).toBeHidden();
      await expect(link).toBeFocused();
    });
  }

  test('Escape closes the sheet and focus returns to the action (AC-04)', async ({ page }) => {
    const link = await activate(page, '#contact');
    await page.keyboard.press('Escape');
    await expect(page.locator(SHEET)).toBeHidden();
    await expect(link).toBeFocused();
  });

  test('a tap outside closes the sheet and focus returns; a tap inside does not (AC-04)', async ({
    page,
  }) => {
    const link = await activate(page, '#contact');
    const sheet = page.locator(SHEET);
    await sheet.getByText('It goes to your Downloads.').click();
    await expect(sheet).toBeVisible();
    await page.mouse.click(20, 20);
    await expect(sheet).toBeHidden();
    await expect(link).toBeFocused();
  });

  test('the sheet opens on every activation and stores nothing (AC-03)', async ({ page }) => {
    for (let i = 0; i < 2; i += 1) {
      await activate(page, '#contact');
      await expect(page.locator(SHEET)).toBeVisible();
      await page.locator(SHEET).getByRole('button', { name: 'Got it' }).click();
      await expect(page.locator(SHEET)).toBeHidden();
    }
    const stored = await page.evaluate(() =>
      [...Object.keys(localStorage), ...Object.keys(sessionStorage)].filter((k) =>
        /contact|sheet|vcf/i.test(k),
      ),
    );
    expect(stored).toEqual([]);
  });

  test('below 768 the sheet spans the bottom of the screen; "Got it" is 44 px or more (AC-06, AC-08)', async ({
    page,
  }) => {
    await activate(page, '#contact');
    const sheet = await page.locator(SHEET).boundingBox();
    const viewport = page.viewportSize();
    if (!sheet || !viewport) throw new Error('no box');
    expect(sheet.x).toBe(0);
    expect(Math.round(sheet.width)).toBe(viewport.width);
    expect(Math.round(sheet.y + sheet.height)).toBe(viewport.height);
    const button = await page.locator(SHEET).getByRole('button').boundingBox();
    expect(button?.height).toBeGreaterThanOrEqual(44);
    expect(await page.locator(`${SHEET} .fj-btn--primary`).count()).toBe(1);
  });

  test('from 768 the sheet is at most 480 wide, centred, 16 above the bottom (AC-06)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await activate(page, '#contact');
    const sheet = await page.locator(SHEET).boundingBox();
    if (!sheet) throw new Error('no box');
    expect(Math.round(sheet.width)).toBe(480);
    expect(Math.round(sheet.x)).toBe((834 - 480) / 2);
    expect(Math.round(1112 - (sheet.y + sheet.height))).toBe(16);
  });

  test('the Not-found page: the bar action downloads and no sheet exists (AC-05, D-03)', async ({
    page,
  }) => {
    await page.goto('/does-not-exist');
    await activate(page, '[data-shell-bar]');
    await expect(page.locator(SHEET)).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test.describe('with scripts off', () => {
    test.use({ javaScriptEnabled: false });

    test('the action downloads and no sheet opens (AC-05)', async ({ page }) => {
      await activate(page, '#contact');
      await expect(page.locator(SHEET)).toBeHidden();
    });
  });
});

// One set of copy for every device (D-02): the same sheet under an iPhone and an Android user agent.
for (const [device, userAgent] of [
  [
    'iPhone',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  ],
  [
    'Android',
    'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
  ],
] as const) {
  test.describe(`${device} user agent`, () => {
    test.use({ userAgent });

    test('the sheet has the same copy (D-02)', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'mobile', 'the mobile project is the touch device');
      await page.goto('/');
      await activate(page, '#contact');
      const sheet = page.locator(SHEET);
      await expect(sheet).toBeVisible();
      for (const line of COPY) await expect(sheet.getByText(line, { exact: true })).toBeVisible();
    });
  });
}

test.describe('on a device that is not a touch device', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'the desktop project is not a touch device');
    await page.goto('/');
    expect(await isTouch(page)).toBe(false);
  });

  for (const { name, scope } of actions.slice(0, 2)) {
    test(`${name}: the file downloads and no sheet opens (AC-05)`, async ({ page }) => {
      await activate(page, scope);
      await expect(page.locator(SHEET)).toBeHidden();
      await expect(page.getByRole('dialog')).toHaveCount(0);
    });
  }
});
