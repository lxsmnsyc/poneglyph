import getPages from './get-pages';
import getPOSIXPath from './get-posix-path';
import { BuildFullOptions } from './types';

export default async function createPagesMap(
  options: BuildFullOptions,
): Promise<void> {
  const fs = await import('fs-extra');
  const path = await import('path');

  const pages = /* @__PURE__ */ await getPages(
    options.pagesDir,
  );
  const targetFile = path.join(
    options.buildDir,
    'pages-map.json',
  );
  const result = await Promise.all(pages.map(async (page) => {
    const posix = await getPOSIXPath(page);
    return path.join(path.dirname(posix), path.basename(posix, path.extname(posix)));
  }));
  await fs.outputJSON(
    targetFile,
    result,
  );
}
