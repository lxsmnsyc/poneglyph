import readPackage from './read-package';

let EXTERNALS: string[];

export default async function readExternals(): Promise<string[]> {
  if (EXTERNALS) {
    return EXTERNALS;
  }

  const {
    dependencies,
    devDependencies,
    peerDependencies,
    optionalDependencies,
  } = await readPackage();

  const external = new Set<string>();

  Object.keys(dependencies || {}).forEach((key) => {
    external.add(key);
  });
  Object.keys(devDependencies || {}).forEach((key) => {
    external.add(key);
  });
  Object.keys(peerDependencies || {}).forEach((key) => {
    external.add(key);
  });
  Object.keys(optionalDependencies || {}).forEach((key) => {
    external.add(key);
  });

  EXTERNALS = [
    ...(await import('module')).builtinModules,
    ...Array.from(external),
  ];

  return EXTERNALS;
}
