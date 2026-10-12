import { test as base, type Browser } from '@playwright/test';

export * from '@playwright/test';

/** The host of the Web Analytics script (release-1 D-01). */
export const WEB_ANALYTICS_HOST = 'static.cloudflareinsights.com';

/**
 * The `test` of every Playwright file (e2e, axe, visual; release-1 D-03, AC-04). Each request to
 * the Web Analytics host is answered here with an empty script, so no test depends on that host
 * and no test run sends a visit.
 *
 * The answer is set on every context the browser opens: the context of the `page` fixture, and
 * the ones a test opens itself with `browser.newContext()` or `browser.newPage()`.
 */
export const test = base.extend<object, { browser: Browser }>({
  browser: [
    async ({ browser }, use) => {
      const newContext = browser.newContext.bind(browser);
      browser.newContext = async (options) => {
        const context = await newContext(options);
        await context.route(`https://${WEB_ANALYTICS_HOST}/**`, (route) =>
          route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }),
        );
        return context;
      };
      await use(browser);
      browser.newContext = newContext;
    },
    { scope: 'worker' },
  ],
});
