import { BuildFullOptions } from './core/types';

export const DOCUMENT_MAIN_ROOT = 'poneglyph__root';

export const DOCUMENT_DATA = 'poneglyph__data';

export const STATIC_PATH = '_poneglyph';

export const PUBLIC_PATH = 'public';

export const CUSTOM_APP = '_app';

export const CUSTOM_DOCUMENT = '_document';

export const CUSTOM_404 = '_404';

export const CUSTOM_500 = '_500';

export const CUSTOM_ERROR = '_error';

export const DIRECTORY_ROOT = 'index';

export const RESERVED_PAGES = [
  CUSTOM_404,
  CUSTOM_500,
  CUSTOM_ERROR,
  CUSTOM_APP,
  CUSTOM_DOCUMENT,
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
  plugins: [],
};
