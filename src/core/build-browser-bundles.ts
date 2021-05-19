import { BuildResult } from 'esbuild';
import {
  SUPPORTED_PAGE_EXT, BUILD_OUTPUT, RESERVED_PAGES, CUSTOM_APP, CUSTOM_500, CUSTOM_ERROR,
} from '../constants';
import getArtifactDirectory, { getArtifactBaseDirectory } from './get-artifact-directory';
import getPages from './get-pages';
import getPOSIXPath from './get-posix-path';
import resolveTSConfig from './resolve-tsconfig';
import { BuildFullOptions } from './types';

async function getApp(pageDir: string): Promise<string | undefined> {
  const fs = await import('fs-extra');
  const path = await import('path');

  const result = await Promise.all(
    SUPPORTED_PAGE_EXT.map(async (ext) => {
      const app = path.join(
        pageDir,
        `${CUSTOM_APP}${ext}`,
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

async function get500Page(pageDir: string): Promise<string | undefined> {
  const fs = await import('fs-extra');
  const path = await import('path');

  const result = await Promise.all(
    SUPPORTED_PAGE_EXT.map(async (ext) => {
      const app = path.join(
        pageDir,
        `${CUSTOM_500}${ext}`,
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

async function getErrorPage(pageDir: string): Promise<string | undefined> {
  const fs = await import('fs-extra');
  const path = await import('path');

  const result = await Promise.all(
    SUPPORTED_PAGE_EXT.map(async (ext) => {
      const app = path.join(
        pageDir,
        `${CUSTOM_ERROR}${ext}`,
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

async function getFallbackPage(pageDir: string): Promise<string | undefined> {
  const error500 = await get500Page(pageDir);
  if (error500) {
    return error500;
  }
  const errorPage = await getErrorPage(pageDir);
  return errorPage;
}

async function buildBrowserBundle(
  options: BuildFullOptions,
  environment: string,
  targetPage: string,
  index: number,
) {
  const fs = await import('fs-extra');
  const path = await import('path');

  const extname = path.extname(targetPage);
  const directory = path.dirname(targetPage);
  const filename = path.basename(targetPage, extname);

  const extensionLessFile = path.join(directory, filename);
  const outDir = path.join(
    options.buildDir,
    environment,
    BUILD_OUTPUT.browser.output,
    RESERVED_PAGES.includes(extensionLessFile) ? extensionLessFile : `${index}`,
  );

  const artifactDir = /* @__PURE__ */ await getArtifactDirectory(
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

  const targetFile = await getPOSIXPath(
    path.relative(artifactDir, srcFile),
  );

  const app = await getApp(options.pagesDir);

  const appImport = (
    app
      ? `import App from '${await getPOSIXPath(
        path.relative(artifactDir, app),
      )}';`
      : 'import { DefaultApp as App } from \'poneglyph\';'
  );

  const error = await getErrorPage(options.pagesDir);

  const errorImport = (
    error
      ? `import ErrorPage from '${await getPOSIXPath(
        path.relative(artifactDir, error),
      )}';`
      : 'import { ErrorPage } from \'poneglyph\';'
  );

  await fs.outputFile(artifact, `
  import { hydrate } from 'poneglyph';
  ${appImport}
  ${errorImport}
  import Render from '${targetFile}';

  hydrate(App, ErrorPage, Render);
`);

  const esbuild = await import('esbuild');

  const result = await esbuild.build({
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
    external: (await import('module')).builtinModules,
    tsconfig: await resolveTSConfig(options.tsconfig),
  });

  await fs.remove(artifact);

  return result;
}

export default async function buildBrowserBundles(
  options: BuildFullOptions,
  environment: string,
): Promise<(BuildResult | undefined)[]> {
  const fs = await import('fs-extra');

  const pages = await getPages(options.pagesDir);

  const result = await Promise.all(
    pages.map((page, index) => (
      buildBrowserBundle(options, environment, page, index)
    )),
  );

  await fs.remove(/* @__PURE__ */ await getArtifactBaseDirectory(
    options,
    environment,
    'browser',
  ));

  return result;
}
