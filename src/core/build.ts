import { DEFAULT_BUILD_OPTIONS } from '../constants';
import buildBrowserBundles from './build-browser-bundles';
import buildServerBundle from './build-server-bundle';
import createPagesMap from './create-pages-map';
import { BuildFullOptions, BuildOptions } from './types';

export default async function createBuild(config: BuildOptions): Promise<void> {
  const fullConfig: BuildFullOptions = {
    ...DEFAULT_BUILD_OPTIONS,
    ...config,
  };

  await Promise.all([
    /* @__PURE__ */ createPagesMap(fullConfig),
    /* @__PURE__ */ buildBrowserBundles(fullConfig, 'production'),
    /* @__PURE__ */ buildBrowserBundles(fullConfig, 'development'),
    /* @__PURE__ */ buildServerBundle(fullConfig, 'production'),
    /* @__PURE__ */ buildServerBundle(fullConfig, 'development'),
  ]);
}
