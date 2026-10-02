// @ts-check
// Build config for src/layouts/BaseLayout.test.ts: the site config plus the AC-13 fixture page,
// written to the throwaway directory in FJORD_FIXTURE_OUT_DIR. Never used for the real build.
import base from '../../../astro.config.mjs';

const outDir = process.env.FJORD_FIXTURE_OUT_DIR;
if (!outDir) throw new Error('FJORD_FIXTURE_OUT_DIR is not set');

export default {
  ...base,
  outDir,
  integrations: [
    ...(base.integrations ?? []),
    {
      name: 'head-contract-fixture',
      hooks: {
        /** @param {{ injectRoute: (route: { pattern: string; entrypoint: string | URL }) => void }} options */
        'astro:config:setup': ({ injectRoute }) =>
          injectRoute({
            pattern: '/fixture',
            entrypoint: new URL('./MinimalPage.astro', import.meta.url),
          }),
      },
    },
  ],
};
