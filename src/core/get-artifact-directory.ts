import path from 'path';
import { BUILD_OUTPUT } from '../constants';
import { BuildFullOptions, BundleType } from './types';

export function getArtifactBaseDirectory(
  options: BuildFullOptions,
  environment: string,
  bundleType: BundleType,
): string {
  return path.join(
    options.buildDir,
    environment,
    BUILD_OUTPUT[bundleType].temp,
  );
}

export default function getArtifactDirectory(
  options: BuildFullOptions,
  environment: string,
  bundleType: BundleType,
  directory: string,
): string {
  return path.join(
    getArtifactBaseDirectory(
      options,
      environment,
      bundleType,
    ),
    directory,
  );
}
