import { expect, test, type Browser, type Page } from '@playwright/test';
import { platformFonts } from './platform-fonts.ts';

// Brand fonts (AC-05, AC-06, AC-15; sad QG-2): two preloaded variable files (home sad §1 Decision
// override, weight axis 400–700), every design weight drawn from its family's file with æ ø å and
// as a weight of its own, and a metric-matched fallback.

const FAMILIES = [
  { family: 'Schibsted Grotesk', file: 'schibsted-grotesk-wght', weights: [400, 500, 600, 700] },
  { family: 'JetBrains Mono', file: 'jetbrains-mono-wght', weights: [400, 500, 700] },
] as const;
const FACES = FAMILIES.flatMap(({ family, file, weights }) =>
  weights.map((weight) => ({ family, file, weight })),
);
const BRAND_FILES = FAMILIES.map(({ file }) => `/fonts/${file}.woff2`);

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
  test(`${path} preloads exactly the two variable brand files`, async ({ page }) => {
    await page.goto(path);
    const preloads = await page
      .locator('link[rel="preload"][as="font"]')
      .evaluateAll((links) => links.map((l) => new URL((l as HTMLLinkElement).href).pathname));
    expect(preloads).toEqual(BRAND_FILES);
  });
}

test('home requests the two brand files, each once, and no other font', async ({ page }) => {
  const requested = trackFonts(page);
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  expect([...requested].sort()).toEqual([...BRAND_FILES].sort());
});

test('a weight the page had not used yet needs no further request', async ({ page }) => {
  const requested = trackFonts(page);
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const before = requested.length;

  await page.evaluate(async () => {
    const strong = document.createElement('strong');
    strong.id = 'bold';
    strong.textContent = 'Blåbærsyltetøy';
    strong.style.fontWeight = '700';
    document.body.append(strong);
    await document.fonts.load('700 16px "Schibsted Grotesk"', 'Blåbærsyltetøy');
    await document.fonts.ready;
  });
  await expect(page.locator('#bold')).toBeAttached();
  expect(requested).toHaveLength(before);
});

test.describe('every design weight', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'platform fonts come from Chromium CDP',
  );

  /** Renders æ ø å in one face, optionally with that family's file blocked. */
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
          .filter((f) => f.family.replace(/"/g, '') === family)
          .map((f) => `${f.weight}: ${f.status}`);
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
      // One face per family, declared for the whole weight range.
      expect(own.statuses).toEqual(['400 700: loaded']);
      // Every glyph is drawn by the brand web font, not a local fallback.
      expect(own.fonts.map((f) => [f.familyName, f.isCustomFont])).toEqual([[face.family, true]]);
      // Without the family's file the browser has to fall back: the rendering changes, so the
      // loaded file is what draws this weight.
      const blocked = await probe(browser, face, true);
      expect(blocked.statuses).not.toEqual(['400 700: loaded']);
      expect(own.pixels.equals(blocked.pixels)).toBe(false);
    });
  }

  for (const { family, weights } of FAMILIES) {
    test(`${family} draws ${weights.join(', ')} as weights of their own, each heavier than the last`, async ({
      page,
    }) => {
      // A synthesized bold smears one outline: 500 would look like 400, and 600 like 700. A real
      // weight axis puts more ink on the canvas at every step.
      await page.goto('/');
      const ink = await page.evaluate(
        async ({ family, weights }) => {
          await Promise.all(
            weights.map((w) => document.fonts.load(`${w} 96px "${family}"`, 'æøå')),
          );
          return weights.map((weight) => {
            const canvas = document.createElement('canvas');
            canvas.width = 900;
            canvas.height = 160;
            const context = canvas.getContext('2d');
            if (!context) throw new Error('no 2d context');
            context.font = `${weight} 96px "${family}"`;
            context.fillText('æøå ÆØÅ Hamburg', 10, 110);
            const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
            let sum = 0;
            for (let i = 3; i < data.length; i += 4) sum += data[i] ?? 0;
            return sum;
          });
        },
        { family, weights: [...weights] },
      );
      for (let i = 1; i < ink.length; i++)
        expect(
          ink[i],
          `${weights[i]} against ${weights[i - 1]}: ${ink.join(', ')}`,
        ).toBeGreaterThan((ink[i - 1] ?? 0) * 1.02);
    });
  }
});

test.describe('Not-found faces once the brand fonts load', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'platform fonts come from Chromium CDP',
  );

  // AC-05: technical labels in JetBrains Mono, body text in Schibsted Grotesk (review S1-04).
  // Runs in both projects, so at phone (Pixel 7) and desktop width.
  for (const [selector, family] of [
    ['.code', 'JetBrains Mono'],
    ['main .body', 'Schibsted Grotesk'],
  ] as const) {
    test(`${selector} is drawn in ${family}`, async ({ page }) => {
      await page.goto('/does-not-exist');
      await page.evaluate(() => document.fonts.ready);
      const fonts = await platformFonts(page, selector);
      expect(fonts.map((f) => [f.familyName, f.isCustomFont])).toEqual([[family, true]]);
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
    }, testInfo) => {
      // AC-05 is a phone story (review S1-03): measure explicitly at 390 in the mobile project and
      // at 1440 in the desktop project. browser.newContext() does not inherit the project's Pixel 7
      // emulation, so the width is set here; layout shift depends on the width, not the device.
      const width = testInfo.project.use.isMobile ? 390 : 1440;
      const measure = async (block: boolean) => {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        const page = await context.newPage();
        if (block) await page.route('**/fonts/*.woff2', (route) => route.abort());
        await page.goto(path);
        expect(await page.evaluate(() => window.innerWidth)).toBe(width);
        await page.evaluate(() => document.fonts.ready);
        // The text itself, not the block (review F-10): a block's width is its container's or a
        // measure, and measures are in em, not ch, so neither depends on the face (review
        // 2026-10-02-3 S1-05: a 48ch box was 624 px in Roboto and 672 px in Schibsted Grotesk).
        // A Range over the contents gives the run's width, its line count, and where the glyph
        // content area sits in the block (ascent / descent overrides).
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
