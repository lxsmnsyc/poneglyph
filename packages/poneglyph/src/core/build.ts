import { DEFAULT_BUILD_OPTIONS } from '../constants';
import buildBrowserBundles from './build-browser-bundles';
import buildServerBundle from './build-server-bundle';
import { BuildFullOptions, BuildOptions } from './types';

export default async function createBuild(config: BuildOptions): Promise<void> {
  const fullConfig: BuildFullOptions = {
    ...DEFAULT_BUILD_OPTIONS,
    ...config,
  };

  await Promise.all([
    buildBrowserBundles(fullConfig, 'production'),
    buildBrowserBundles(fullConfig, 'development'),
    buildServerBundle(fullConfig, 'production'),
    buildServerBundle(fullConfig, 'development'),
  ]);
}
