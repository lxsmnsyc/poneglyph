import { BUILD_OUTPUT } from '../constants';
import { BuildFullOptions, BundleType } from './types';

export async function getArtifactBaseDirectory(
  options: BuildFullOptions,
  environment: string,
  bundleType: BundleType,
): Promise<string> {
  const path = await import('path');
  return path.join(
    options.buildDir,
    environment,
    BUILD_OUTPUT[bundleType].temp,
  );
}

export default async function getArtifactDirectory(
  options: BuildFullOptions,
  environment: string,
  bundleType: BundleType,
  directory: string,
): Promise<string> {
  const path = await import('path');
  return /* @__PURE__ */ path.join(
    /* @__PURE__ */ await getArtifactBaseDirectory(
      options,
      environment,
      bundleType,
    ),
    directory,
  );
}
