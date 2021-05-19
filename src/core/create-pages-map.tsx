import fs from 'fs-extra';
import path from 'path';
import getPages from './get-pages';
import getPOSIXPath from './get-posix-path';
import { BuildFullOptions } from './types';

export default async function createPagesMap(
  options: BuildFullOptions,
): Promise<void> {
  const pages = await getPages(
    options.pagesDir,
  );
  const targetFile = path.join(
    options.buildDir,
    'pages-map.json',
  );
  await fs.writeJSON(
    targetFile,
    pages.map((page) => {
      const posix = getPOSIXPath(page);
      return path.join(path.dirname(posix), path.basename(posix, path.extname(posix)));
    }),
  );
}
