import {
  SUPPORTED_PAGE_EXT,
  CUSTOM_APP,
  CUSTOM_500,
  CUSTOM_ERROR,
  RESERVED_PAGES,
} from '../constants';
import getArtifactDirectory from './get-artifact-directory';
import getPOSIXPath from './get-posix-path';
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

export default async function createBrowserBundle(
  options: BuildFullOptions,
  environment: string,
  targetPage: string,
  index: number,
): Promise<void> {
  const fs = await import('fs-extra');
  const path = await import('path');

  const extname = path.extname(targetPage);
  const directory = path.dirname(targetPage);
  const filename = path.basename(targetPage, extname);

  const extensionLessFile = path.join(directory, filename);

  const preferredDirectory = RESERVED_PAGES.includes(extensionLessFile)
    ? extensionLessFile
    : `${index}`;

  const artifactDir = await getArtifactDirectory(
    options,
    environment,
    'browser',
    preferredDirectory,
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
      ? `import AppComponent, * as AppExports from '${await getPOSIXPath(
        path.relative(artifactDir, app),
      )}';
const App = {
  Component: AppComponent,
  getAppData: AppExports.getAppData ?? undefined,
  reportWebVitals: AppExports.reportWebVitals ?? undefined,
};`
      : 'import { DefaultApp as App } from \'poneglyph\';'
  );

  const error = await getFallbackPage(options.pagesDir);

  const errorImport = (
    error
      ? `import ErrorPageComponent, * as ErrorPageExports from '${await getPOSIXPath(
        path.relative(artifactDir, error),
      )}';
const ErrorPage = {
  Component: ErrorPageComponent,
  onError: ErrorPageExports.onError ?? undefined,
}; `
      : 'import { DefaultErrorPage as ErrorPage } from \'poneglyph\';'
  );

  await fs.outputFile(artifact, `
  import { hydrate } from 'poneglyph';
  ${appImport}
  ${errorImport}
  import Render from '${targetFile}';

  hydrate(App, ErrorPage, Render, {
    enableEcmason: ${JSON.stringify(options.enableEcmason)}
  });
`);
}
