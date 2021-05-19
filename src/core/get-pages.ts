import path from 'path';
import fs from 'fs-extra';

async function traverseDirectory(root: string, directory: string = root): Promise<string[]> {
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
  return traverseDirectory(path.join(process.cwd(), dir));
}
