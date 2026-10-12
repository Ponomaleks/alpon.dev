import { expect, test, type Page } from '../fixtures';

// release-1 AC-04, D-03: no test depends on the Web Analytics host, and no test run sends a visit.
const SCRIPT = 'https://static.cloudflareinsights.com/beacon.min.js';

/** Asks for the script from a blank page (no policy of the site in the way) and returns the answer. */
async function askForScript(page: Page) {
  const answered = page.waitForResponse(SCRIPT);
  await page.setContent(`<script type="module" src="${SCRIPT}"></script>`);
  const response = await answered;
  return {
    status: response.status(),
    type: response.headers()['content-type'],
    body: await response.text(),
  };
}

const EMPTY_SCRIPT = { status: 200, type: 'text/javascript', body: '' };

test.describe('requests to the Web Analytics host are answered locally (AC-04)', () => {
  test('on the page of the test', async ({ page }) => {
    expect(await askForScript(page)).toEqual(EMPTY_SCRIPT);
  });

  test('in a context the test opens itself', async ({ browser }) => {
    const context = await browser.newContext();
    expect(await askForScript(await context.newPage())).toEqual(EMPTY_SCRIPT);
    await context.close();
  });

  test('on a page the test opens from the browser', async ({ browser }) => {
    const page = await browser.newPage();
    expect(await askForScript(page)).toEqual(EMPTY_SCRIPT);
    await page.close();
  });
});

test('a load of the home page makes no request that leaves the machine (AC-04)', async ({
  page,
  baseURL,
}) => {
  if (!baseURL) throw new Error('the project sets no baseURL');
  const site = new URL(baseURL).origin;
  const stubbed = new URL(SCRIPT).origin;
  const left: string[] = [];
  // Registered after the shared answer, so it sees every request first: the site's own requests
  // and the ones the shared fixture answers pass on, anything else is recorded and stopped.
  await page.route('**/*', (route) => {
    const origin = new URL(route.request().url()).origin;
    if (origin === site || origin === stubbed) return route.fallback();
    left.push(route.request().url());
    return route.abort();
  });
  const bodies: Promise<string>[] = [];
  page.on('response', (response) => {
    if (new URL(response.url()).origin === stubbed) bodies.push(response.text());
  });

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.waitForLoadState('networkidle');

  expect(left).toEqual([]);
  for (const body of await Promise.all(bodies)) expect(body).toBe('');
});
