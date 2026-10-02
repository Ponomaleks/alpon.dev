// @ts-check
// Build config for src/integrations/csp.build.test.ts: the site config plus a page with an
// unexpected inline script, written to FJORD_FIXTURE_OUT_DIR. Never used for the real build.
import base from '../../../astro.config.mjs';

const outDir = process.env.FJORD_FIXTURE_OUT_DIR;
if (!outDir) throw new Error('FJORD_FIXTURE_OUT_DIR is not set');

export default {
  ...base,
  outDir,
  integrations: [
    ...(base.integrations ?? []),
    {
      name: 'bad-page-fixture',
      hooks: {
        /** @param {{ injectRoute: (route: { pattern: string; entrypoint: string | URL }) => void }} options */
        'astro:config:setup': ({ injectRoute }) =>
          injectRoute({
            pattern: '/bad-fixture',
            entrypoint: new URL('./InlineScriptPage.astro', import.meta.url),
          }),
      },
    },
  ],
};
