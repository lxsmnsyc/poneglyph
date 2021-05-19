import { SUPPORTED_PAGE_EXT } from '../constants';

async function traverseDirectory(root: string, directory: string = root): Promise<string[]> {
  const fs = await import('fs-extra');
  const path = await import('path');

  const files = await fs.readdir(directory);

  const recursiveTraverse = async (file: string) => {
    const fullPath = path.join(directory, file);

    if ((await fs.lstat(fullPath)).isDirectory()) {
      return traverseDirectory(root, fullPath);
    }
    return path.relative(root, fullPath);
  };

  const results = await Promise.all(
    files.map(recursiveTraverse),
  );

  return results.flat();
}

export default async function getPages(dir: string): Promise<string[]> {
  const path = await import('path');
  return /* @__PURE__ */ (await traverseDirectory(path.join(process.cwd(), dir)))
    .filter((file) => {
      const extension = path.extname(file);
      return SUPPORTED_PAGE_EXT.includes(extension);
    });
}
