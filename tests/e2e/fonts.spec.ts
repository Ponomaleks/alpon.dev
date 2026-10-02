import { expect, test, type Browser, type Page } from '@playwright/test';
import { platformFonts } from './platform-fonts.ts';

// Brand fonts (AC-05, AC-06, AC-15; sad QG-2): two critical preloads, other weights only when
// used, every design weight from its own file with æ ø å, and a metric-matched fallback.

const FACES = [
  ...[400, 500, 600, 700].map((weight) => ({
    family: 'Schibsted Grotesk',
    weight,
    file: `schibsted-grotesk-${weight}`,
  })),
  ...[400, 500, 700].map((weight) => ({
    family: 'JetBrains Mono',
    weight,
    file: `jetbrains-mono-${weight}`,
  })),
];
const CRITICAL = ['/fonts/schibsted-grotesk-400.woff2', '/fonts/schibsted-grotesk-600.woff2'];

/** Every woff2 the page requests, in order. */
function trackFonts(page: Page): string[] {
  const requested: string[] = [];
  page.on('request', (request) => {
    const { pathname } = new URL(request.url());
    if (pathname.endsWith('.woff2')) requested.push(pathname);
  });
  return requested;
}

for (const path of ['/', '/does-not-exist']) {
  test(`${path} preloads exactly Schibsted Grotesk 400 and 600`, async ({ page }) => {
    await page.goto(path);
    const preloads = await page
      .locator('link[rel="preload"][as="font"]')
      .evaluateAll((links) => links.map((l) => new URL((l as HTMLLinkElement).href).pathname));
    expect(preloads).toEqual(CRITICAL);
  });
}

test('home requests only the two critical files', async ({ page }) => {
  const requested = trackFonts(page);
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  expect([...new Set(requested)].sort()).toEqual(CRITICAL);
});

test('a weight is fetched only once the page uses it', async ({ page }) => {
  const requested = trackFonts(page);
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  expect(requested).not.toContain('/fonts/schibsted-grotesk-700.woff2');

  await page.evaluate(() => {
    const strong = document.createElement('strong');
    strong.id = 'bold';
    strong.textContent = 'Blåbærsyltetøy';
    strong.style.fontWeight = '700';
    document.body.append(strong);
  });
  await expect.poll(() => requested).toContain('/fonts/schibsted-grotesk-700.woff2');
});

test.describe('every design weight', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'platform fonts come from Chromium CDP',
  );

  /** Renders æ ø å in one face, optionally with that face's file blocked. */
  async function probe(browser: Browser, face: (typeof FACES)[number], blockOwnFile: boolean) {
    const context = await browser.newContext();
    const page = await context.newPage();
    if (blockOwnFile) await page.route(`**/fonts/${face.file}.woff2`, (route) => route.abort());
    const requested = trackFonts(page);
    await page.goto('/');
    const statuses = await page.evaluate(
      async ({ family, weight }) => {
        const p = document.createElement('p');
        p.id = 'probe';
        p.textContent = 'æøå ÆØÅ';
        p.style.fontFamily = `"${family}"`;
        p.style.fontWeight = String(weight);
        p.style.fontSize = '64px';
        document.body.append(p);
        await document.fonts.load(`${weight} 64px "${family}"`, 'æøå').catch(() => []);
        await document.fonts.ready;
        return [...document.fonts]
          .filter((f) => f.family.replace(/"/g, '') === family && f.weight === String(weight))
          .map((f) => f.status);
      },
      { family: face.family, weight: face.weight },
    );
    const fonts = await platformFonts(page, '#probe');
    const pixels = await page.locator('#probe').screenshot();
    await context.close();
    return { requested, statuses, fonts, pixels };
  }

  for (const face of FACES) {
    test(`${face.family} ${face.weight} renders æ ø å from ${face.file}.woff2 with no synthesized bold`, async ({
      browser,
    }) => {
      const own = await probe(browser, face, false);
      expect(own.requested).toContain(`/fonts/${face.file}.woff2`);
      expect(own.statuses).toEqual(['loaded']);
      // Every glyph is drawn by the brand web font, not a local fallback.
      expect(own.fonts.map((f) => [f.familyName, f.isCustomFont])).toEqual([[face.family, true]]);
      // Without its own file the browser has to fall back (and synthesize bold from a lighter
      // face): the rendering changes, so the loaded file is what draws this weight.
      const blocked = await probe(browser, face, true);
      expect(blocked.statuses).not.toEqual(['loaded']);
      expect(own.pixels.equals(blocked.pixels)).toBe(false);
    });
  }
});

test.describe('fallback face while brand fonts are blocked', () => {
  test.skip(
    !(process.env.CI && process.platform === 'linux'),
    'runs in the CI Linux runner, which has Roboto and no Arial (sad §11); Windows dev machines have Arial',
  );

  for (const path of ['/', '/does-not-exist']) {
    test(`${path} renders the Roboto fallback face and text does not move when brand fonts swap in`, async ({
      browser,
    }) => {
      const measure = async (block: boolean) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        if (block) await page.route('**/fonts/*.woff2', (route) => route.abort());
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        // The text itself, not the block: a block's width is its container's whatever the font
        // (review F-10). A Range over the contents gives the run's width, its line count, and
        // where the glyph content area sits in the block (ascent / descent overrides).
        const runs = await page.evaluate(() =>
          ['h1', 'main p'].map((selector) => {
            const element = document.querySelector(selector);
            if (!element) return { selector, lines: 0, width: 0, height: 0, top: 0 };
            const range = document.createRange();
            range.selectNodeContents(element);
            const text = range.getBoundingClientRect();
            const lines = new Set([...range.getClientRects()].map((r) => Math.round(r.bottom)));
            return {
              selector,
              lines: lines.size,
              width: text.width,
              height: text.height,
              top: text.top - element.getBoundingClientRect().top,
            };
          }),
        );
        const fonts = block ? await platformFonts(page, 'h1') : [];
        await context.close();
        return { runs, fonts };
      };
      const fallback = await measure(true);
      const brand = await measure(false);
      expect(fallback.fonts.map((f) => f.familyName)).toEqual(['Roboto']);
      // AC-05 test plan: vertical metrics (what moves later boxes) within 1 px, the same line
      // count, and run width within 5 %: size-adjust can only match the average glyph width.
      for (const [i, run] of brand.runs.entries()) {
        const other = fallback.runs[i];
        const seen = `brand ${JSON.stringify(run)} vs fallback ${JSON.stringify(other)}`;
        expect(other?.lines, `${run.selector} line count: ${seen}`).toBe(run.lines);
        for (const dimension of ['height', 'top'] as const)
          expect(
            Math.abs(run[dimension] - (other?.[dimension] ?? 0)),
            `${run.selector} text ${dimension}: ${seen}`,
          ).toBeLessThanOrEqual(1);
        expect(
          Math.abs(run.width - (other?.width ?? 0)),
          `${run.selector} text width: ${seen}`,
        ).toBeLessThanOrEqual(run.width * 0.05);
      }
    });
  }
});
