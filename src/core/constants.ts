import { BuildFullOptions } from './types';

export const RESERVED_PAGES = [
  'index',
  '404',
  '500',
  '_error',
  '_app',
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
