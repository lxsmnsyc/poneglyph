import { BuildResult } from 'esbuild';
import {
  BUILD_OUTPUT,
} from '../constants';
import createBrowserBundle from './create-browser-bundle';
import { getArtifactBaseDirectory } from './get-artifact-directory';
import getPages from './get-pages';
import resolveTSConfig from './resolve-tsconfig';
import traverseDirectory from './traverse-directory';
import { BuildFullOptions } from './types';

async function compressBrowserBundles(
  options: BuildFullOptions,
  environment: string,
) {
  if (options.enableCompression) {
    const path = await import('path');
    const fs = await import('fs-extra');

    const targetDirectory = path.join(
      process.cwd(),
      options.buildDir,
      environment,
      BUILD_OUTPUT.browser.output,
    );
    const files = await traverseDirectory(targetDirectory);

    const zlib = await import('zlib');

    const createCompress = async (
      file: string,
      extension: string,
      compress: (content: Buffer) => Promise<Buffer>,
    ): Promise<void> => {
      const targetFile = path.join(targetDirectory, file);
      const content = await fs.readFile(targetFile);
      const compressed = await compress(content);
      await fs.outputFile(
        path.join(path.dirname(targetFile), `${path.basename(targetFile)}.${extension}`),
        compressed,
      );
    };

    const createBrotli = async (file: string): Promise<void> => {
      await createCompress(file, 'br', (content) => new Promise((resolve, reject) => {
        zlib.brotliCompress(content, {}, (error, res) => {
          if (error) {
            reject(error);
          } else {
            resolve(res);
          }
        });
      }));
    };

    const createGzip = async (file: string): Promise<void> => {
      await createCompress(file, 'gz', (content) => new Promise((resolve, reject) => {
        zlib.gzip(content, {}, (error, res) => {
          if (error) {
            reject(error);
          } else {
            resolve(res);
          }
        });
      }));
    };

    const createDeflate = async (file: string): Promise<void> => {
      await createCompress(file, 'deflate', (content) => new Promise((resolve, reject) => {
        zlib.deflate(content, {}, (error, res) => {
          if (error) {
            reject(error);
          } else {
            resolve(res);
          }
        });
      }));
    };

    await Promise.all(files.map((file) => (
      Promise.all([
        createBrotli(file),
        createGzip(file),
        createDeflate(file),
      ])
    )));
  }
}

export default async function buildBrowserBundles(
  options: BuildFullOptions,
  environment: string,
): Promise<BuildResult | undefined> {
  const fs = await import('fs-extra');

  const pages = await getPages(options.pagesDir);

  await Promise.all(
    pages.map((page, index) => (
      createBrowserBundle(options, environment, page, index)
    )),
  );

  const esbuild = await import('esbuild');
  const path = await import('path');

  const outDir = path.join(
    options.buildDir,
    environment,
    BUILD_OUTPUT.browser.output,
  );
  const artifactDir = await getArtifactBaseDirectory(
    options,
    environment,
    'browser',
  );

  await fs.remove(outDir);

  const result = await esbuild.build({
    entryPoints: (await traverseDirectory(artifactDir)).map((file) => (
      path.join(artifactDir, file)
    )),
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
    plugins: [
      ...options.plugins,
    ],
    external: (await import('module')).builtinModules,
    tsconfig: await resolveTSConfig(options.tsconfig),
    legalComments: 'none',
    outbase: artifactDir,
  });

  await fs.remove(artifactDir);

  await compressBrowserBundles(options, environment);

  return result;
}
