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
    createPagesMap(fullConfig),
    buildBrowserBundles(fullConfig, 'production'),
    buildBrowserBundles(fullConfig, 'development'),
    buildServerBundle(fullConfig, 'production'),
    buildServerBundle(fullConfig, 'development'),
  ]);
}
