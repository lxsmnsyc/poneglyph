import { BuildResult } from 'esbuild';
import {
  BUILD_OUTPUT,
  CUSTOM_404,
  CUSTOM_500,
  CUSTOM_APP,
  CUSTOM_DOCUMENT,
  CUSTOM_ERROR,
  DIRECTORY_ROOT,
  RESERVED_PAGES,
  SUPPORTED_PAGE_EXT,
} from '../constants';
import { getArtifactBaseDirectory } from './get-artifact-directory';
import getPages from './get-pages';
import getPOSIXPath from './get-posix-path';
import readExternals from './read-externals';
import resolveTSConfig from './resolve-tsconfig';
import { BuildFullOptions } from './types';

export default async function buildServerBundle(
  options: BuildFullOptions,
  environment: string,
): Promise<BuildResult> {
  const path = await import('path');
  const fs = await import('fs-extra');

  const pages = await getPages(options.pagesDir);

  const outputDirectory = path.join(
    options.buildDir,
    environment,
    BUILD_OUTPUT.node.output,
  );

  await fs.remove(outputDirectory);

  const artifactDirectory = await getArtifactBaseDirectory(
    options,
    environment,
    'node',
  );

  // Create import header
  const artifactImportHeader = await Promise.all(pages.map(async (page, index) => {
    const extname = path.extname(page);
    const directory = path.dirname(page);
    const filename = path.basename(page, extname);

    const srcFile = path.join(options.pagesDir, directory, filename);

    const targetFile = await getPOSIXPath(
      path.relative(artifactDirectory, srcFile),
    );

    const extensionless = path.join(directory, filename);

    if (RESERVED_PAGES.includes(extensionless)) {
      return '';
    }

    return `import Page${index}, * as Page${index}Exports from '${targetFile}';`;
  }));

  async function getCustomPage(page: string): Promise<string | undefined> {
    const result = await Promise.all(
      SUPPORTED_PAGE_EXT.map(async (ext) => {
        const app = path.join(
          options.pagesDir,
          `${page}${ext}`,
        );

        try {
          await fs.access(app);
          return {
            path: app,
            stat: true,
          };
        } catch (error) {
          return {
            path: app,
            stat: false,
          };
        }
      }),
    );
    for (let i = 0; i < result.length; i += 1) {
      if (result[i].stat) {
        return getPOSIXPath(result[i].path);
      }
    }

    return undefined;
  }

  async function injectCustomPageImport(page: string): Promise<string | undefined> {
    const result = await getCustomPage(page);

    if (result) {
      const extensionless = path.join(
        path.dirname(result),
        path.basename(result, path.extname(result)),
      );
      const importPath = await getPOSIXPath(
        path.relative(artifactDirectory, extensionless),
      );
      const name = page.toUpperCase();
      artifactImportHeader.push(
        `import ${name}Component, * as ${name}Exports from '${importPath}';`,
      );

      return name;
    }
    return undefined;
  }

  async function injectCustomApp() {
    const result = await injectCustomPageImport(CUSTOM_APP);

    if (result) {
      artifactImportHeader.push(
        `const ${result} = {
          Component: ${result}Component,
          getAppData: ${result}Exports.getAppData ?? undefined,
        }`,
      );

      return result;
    }
    return undefined;
  }

  async function injectCustomErrorPage(page: string) {
    const result = await injectCustomPageImport(page);

    if (result) {
      artifactImportHeader.push(
        `const ${result} = {
          Component: ${result}Component,
          onError: ${result}Exports.onError ?? undefined,
        }`,
      );

      return result;
    }
    return undefined;
  }

  const appPage = await injectCustomApp();
  const documentPage = await injectCustomPageImport(CUSTOM_DOCUMENT);
  const error404 = await injectCustomErrorPage(CUSTOM_404);
  const error500 = await injectCustomErrorPage(CUSTOM_500);
  const errorPage = await injectCustomErrorPage(CUSTOM_ERROR);

  artifactImportHeader.push(
    `
const globalConfig = {
  version: ${JSON.stringify(Date.now())},
  buildDir: ${JSON.stringify(path.join(options.buildDir, environment, 'browser'))},
  publicDir: ${JSON.stringify(path.relative(artifactDirectory, path.join(process.cwd(), options.publicDir)))},
  ${appPage ? `app: ${appPage},` : '// app: undefined'}
  ${documentPage ? `document: ${documentPage},` : '// document: undefined'}
  ${errorPage ? `error: ${errorPage},` : '// error: undefined'}
  ${error404 ? `error404: ${error404},` : '// error404: undefined'}
  ${error500 ? `error500: ${error500},` : '// error500: undefined'}
};
    `,
  );

  async function getPageOption(page: string, index: number): Promise<string> {
    const extname = path.extname(page);
    const directory = path.dirname(page);
    const filename = path.basename(page, extname);

    const extensionless = path.join(directory, filename);

    if (RESERVED_PAGES.includes(extensionless)) {
      return '';
    }

    const output = `{
  path: ${JSON.stringify(await getPOSIXPath(path.join('/', extensionless)))},
  resourceID: '${index}',
  entrypoint: '${filename}',
  Component: Page${index},
  getPageData: Page${index}Exports.getPageData ?? undefined,
}`;
    if (filename === DIRECTORY_ROOT) {
      return `{
  path: ${JSON.stringify(await getPOSIXPath(path.join('/', directory)))},
  resourceID: '${index}',
  entrypoint: '${filename}',
  Component: Page${index},
  getPageData: Page${index}Exports.getPageData ?? undefined,
}, ${output}`;
    }

    return output;
  }

  async function getPagesOptions(): Promise<string> {
    const pagesOptions: string[] = await Promise.all(pages.map(getPageOption));

    return `const pages = [${pagesOptions.join(',\n')}];`;
  }

  artifactImportHeader.push(await getPagesOptions());
  artifactImportHeader.push(`
import { createServer } from 'poneglyph';
import http from 'http';

http.createServer(createServer(globalConfig, pages)).listen(3000);
`);

  const artifact = path.join(artifactDirectory, 'index.tsx');

  await fs.outputFile(
    artifact,
    artifactImportHeader.join('\n'),
  );

  const esbuild = await import('esbuild');

  const result = await esbuild.build({
    entryPoints: [
      artifact,
    ],
    outdir: outputDirectory,
    bundle: true,
    minify: environment === 'production',
    sourcemap: environment !== 'production',
    format: 'cjs',
    platform: 'node',
    target: options.target,
    define: {
      ...options.env,
      'process.env.NODE_ENV': JSON.stringify(environment),
    },
    plugins: options.plugins,
    external: await readExternals(),
    tsconfig: await resolveTSConfig(options.tsconfig),
  });

  await fs.remove(artifact);
  await fs.remove(artifactDirectory);

  await fs.outputFile(path.join(options.buildDir, 'index.js'), `
if (process.env.NODE_ENV === 'production') {
  require('./production/node/index.js');
} else {
  require('./development/node/index.js');
}
`);

  return result;
}
