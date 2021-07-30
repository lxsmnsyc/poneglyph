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

function getAPILiteral(index: number) {
  return `API${index}`;
}

function getPageLiteral(index: number) {
  return `Page${index}`;
}

function getPageExportsLiteral(index: number) {
  return `Page${index}Exports`;
}

async function getPageExports(
  options: BuildFullOptions,
  artifactDirectory: string,
  pages: string[],
): Promise<string[]> {
  const path = await import('path');

  return pages.map((page, index) => {
    const { name, dir } = path.parse(page);

    const srcFile = path.join(options.pagesDir, dir, name);

    const targetFile = path.relative(artifactDirectory, srcFile)
      .split(path.sep)
      .join(path.posix.sep);

    const extensionless = path.join(dir, name);

    if (RESERVED_PAGES.includes(extensionless)) {
      return '';
    }

    const pageLiteral = getPageLiteral(index);
    const pageExportsLiteral = getPageExportsLiteral(index);
    return `import ${pageLiteral}, * as ${pageExportsLiteral} from '${targetFile}';`;
  });
}

async function getAPIExports(
  options: BuildFullOptions,
  artifactDirectory: string,
  endpoints: string[],
): Promise<string[]> {
  const path = await import('path');
  return endpoints.map((endpoint, index) => {
    const { name, dir } = path.parse(endpoint);

    const srcFile = path.join(options.apiDir, dir, name);

    const targetFile = path.relative(artifactDirectory, srcFile)
      .split(path.sep)
      .join(path.posix.sep);

    return `import ${getAPILiteral(index)} from '${targetFile}';`;
  });
}

async function getEndpointOption(
  page: string,
  index: number,
): Promise<string> {
  const path = await import('path');

  const { name, dir } = path.parse(page);

  const extensionless = path.join(dir, name);

  const output = `{
path: ${JSON.stringify(await getPOSIXPath(path.join('/', extensionless)))},
call: ${getAPILiteral(index)},
}`;
  if (name === DIRECTORY_ROOT) {
    return `{
path: ${JSON.stringify(await getPOSIXPath(path.join('/', dir)))},
call: API${getAPILiteral(index)},
}, ${output}`;
  }

  return output;
}

export default async function buildServerBundle(
  options: BuildFullOptions,
  environment: string,
): Promise<BuildResult> {
  const path = await import('path');
  const fs = await import('fs-extra');

  const pages = await getPages(options.pagesDir);
  const endpoints = await getPages(options.apiDir);

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
  const lines = await getPageExports(
    options,
    artifactDirectory,
    pages,
  );

  lines.push(...await getAPIExports(
    options,
    artifactDirectory,
    endpoints,
  ));

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
      const { name, dir } = path.parse(result);
      const extensionless = path.join(dir, name);
      const importPath = path.relative(artifactDirectory, extensionless)
        .split(path.sep)
        .join(path.posix.sep);

      const literal = page.toUpperCase();
      lines.push(
        `import ${literal}Component, * as ${literal}Exports from '${importPath}';`,
      );

      return literal;
    }
    return undefined;
  }

  async function injectCustomApp() {
    const result = await injectCustomPageImport(CUSTOM_APP);

    if (result) {
      lines.push(
        `const ${result} = {
          Component: ${result}Component,
          getAppData: 'getAppData' in ${result}Exports ? ${result}Exports.getAppData : null,
        }`,
      );

      return result;
    }
    return undefined;
  }

  async function injectCustomErrorPage(page: string) {
    const result = await injectCustomPageImport(page);

    if (result) {
      lines.push(
        `const ${result} = {
          Component: ${result}Component,
          onError: ${result}Exports.onError,
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

  lines.push(
    `
const globalConfig = {
  version: ${JSON.stringify(Date.now())},
  buildDir: ${JSON.stringify(path.join(options.buildDir, environment, 'browser'))},
  publicDir: ${JSON.stringify(options.publicDir)},
  apiDir: ${JSON.stringify(options.apiDir)},
  enableEcmason: ${JSON.stringify(options.enableEcmason)},
  enableCompression: ${JSON.stringify(options.enableCompression)},
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

    const exportsLiteral = getPageExportsLiteral(index);

    const output = `{
  path: ${JSON.stringify(await getPOSIXPath(path.join('/', extensionless)))},
  resourceID: '${index}',
  entrypoint: '${filename}',
  Component: ${getPageLiteral(index)},
  getPageData: 'getPageData' in ${exportsLiteral} ? ${exportsLiteral}.getPageData : null,
}`;
    if (filename === DIRECTORY_ROOT) {
      return `{
  path: ${JSON.stringify(await getPOSIXPath(path.join('/', directory)))},
  resourceID: '${index}',
  entrypoint: '${filename}',
  Component: ${getPageLiteral(index)},
  getPageData: 'getPageData' in ${exportsLiteral} ? ${exportsLiteral}.getPageData : null,
}, ${output}`;
    }

    return output;
  }

  async function getPagesOptions(): Promise<string> {
    const pagesOptions: string[] = await Promise.all(pages.map(getPageOption));

    return `const pages = [${pagesOptions.join(',\n')}];`;
  }

  async function getEndpointOptions(): Promise<string> {
    const endpointOptions: string[] = await Promise.all(
      endpoints.map(getEndpointOption),
    );

    return `const endpoints = [${endpointOptions.join(',\n')}];`;
  }

  lines.push(await getPagesOptions());
  lines.push(await getEndpointOptions());
  lines.push(`
import { createServer } from 'poneglyph';
import http from 'http';

http.createServer(createServer(globalConfig, pages, endpoints)).listen(3000);
`);

  const artifact = path.join(artifactDirectory, 'index.tsx');

  await fs.outputFile(
    artifact,
    lines.join('\n'),
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
    legalComments: 'none',
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
