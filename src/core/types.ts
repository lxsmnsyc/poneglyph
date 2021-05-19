export interface Dictionary {
  [key: string]: string;
}

export interface BuildFullOptions {
  buildDir: string;
  pagesDir: string;
  target: string;
  env: Dictionary;
  tsconfig?: string;
}

export type BuildOptions = Partial<BuildFullOptions>;

export type BundleType = 'browser' | 'node';
