import { BuildFullOptions } from "./core/types";

export const DOCUMENT_MAIN_ROOT = 'poneglyph__root';

export const DOCUMENT_DATA = 'poneglyph__data';

export const STATIC_PATH = '_poneglyph';

export const PUBLIC_PATH = 'public';

export const RESERVED_PAGES = [
  'index',
  '_404',
  '_500',
  '_error',
  '_app',
  '_document',
];

export const SUPPORTED_PAGE_EXT = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
];

export const BUILD_OUTPUT = {
  browser: {
    output: 'browser',
    temp: 'tmp.browser',
  },
  node: {
    output: 'node',
    temp: 'tmp.node',
  },
};

export const DEFAULT_BUILD_OPTIONS: BuildFullOptions = {
  buildDir: '.poneglyph',
  pagesDir: 'pages',
  target: 'es2017',
  env: {},
};
