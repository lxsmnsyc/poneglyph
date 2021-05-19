import { build, BuildResult } from 'esbuild';
import fs from 'fs-extra';
import path from 'path';
import { SUPPORTED_PAGE_EXT, BUILD_OUTPUT, RESERVED_PAGES } from '../constants';
import getArtifactDirectory, { getArtifactBaseDirectory } from './get-artifact-directory';
import getPages from './get-pages';
import getPOSIXPath from './get-posix-path';
import resolveTSConfig from './resolve-tsconfig';
import { BuildFullOptions } from './types';

async function buildBrowserBundle(
  options: BuildFullOptions,
  environment: string,
  targetPage: string,
  index: number,
) {
  const extname = path.extname(targetPage);
  const directory = path.dirname(targetPage);
  const filename = path.basename(targetPage, extname);

  if (SUPPORTED_PAGE_EXT.includes(extname)) {
    const outDir = path.join(
      options.buildDir,
      environment,
      BUILD_OUTPUT.browser.output,
      RESERVED_PAGES.includes(targetPage) ? targetPage : `${index}`,
    );

    const artifactDir = getArtifactDirectory(
      options,
      environment,
      'browser',
      `${index}`,
    );

    const artifact = path.join(
      artifactDir,
      path.basename(targetPage),
    );

    const srcFile = path.join(
      options.pagesDir,
      directory,
      filename,
    );

    const targetFile = getPOSIXPath(
      path.relative(artifactDir, srcFile),
    );

    await fs.outputFile(artifact, `
    import React from 'react';
    import { hydrate } from 'react-dom';
    import Render from '${targetFile}';

    const parsedData = JSON.parse(document.getElementById('poneglyph_data').textContent);
    
    hydrate(<Render {...parsedData} />, document.getElementById('poneglyph_root'));
  `);

    const result = await build({
      entryPoints: [
        artifact,
      ],
      outdir: outDir,
      bundle: true,
      minify: environment === 'production',
      sourcemap: environment !== 'production',
      splitting: true,
      format: 'esm',
      platform: 'browser',
      target: options.target,
      define: {
        ...options.env,
        'process.env.NODE_ENV': JSON.stringify(environment),
      },
      tsconfig: resolveTSConfig(options.tsconfig),
    });

    await fs.remove(artifact);

    return result;
  }

  return undefined;
}

export default async function buildBrowserBundles(
  options: BuildFullOptions,
  environment: string,
): Promise<(BuildResult | undefined)[]> {
  const pages = await getPages(options.pagesDir);

  const result = await Promise.all(
    pages.map((page, index) => buildBrowserBundle(options, environment, page, index)),
  );

  await fs.remove(getArtifactBaseDirectory(
    options,
    environment,
    'browser',
  ));

  return result;
}
