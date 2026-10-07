// @ts-check
// Build config for src/pages/_index.test.ts: the site config with src/data/home.ts replaced by
// the fixture next to this file, so that the real pages are built from fixture content.
// Never used for the real build.
import { fileURLToPath } from 'node:url';
import { normalizePath } from 'vite';
import base from '../../../astro.config.mjs';

const real = normalizePath(fileURLToPath(new URL('../../data/home.ts', import.meta.url)));
const fixture = normalizePath(fileURLToPath(new URL('./home.no-consent.ts', import.meta.url)));

export default {
  ...base,
  vite: {
    ...base.vite,
    plugins: [
      ...(base.vite?.plugins ?? []),
      {
        name: 'home-data-fixture',
        enforce: /** @type {const} */ ('pre'),
        /**
         * @this {import('vite').Rollup.PluginContext}
         * @param {string} source
         * @param {string | undefined} importer
         * @param {object} options
         */
        async resolveId(source, importer, options) {
          // The fixture itself reads the real data.
          if (!importer || normalizePath(importer) === fixture) return null;
          const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
          return resolved && normalizePath(resolved.id) === real ? fixture : null;
        },
      },
    ],
  },
};
