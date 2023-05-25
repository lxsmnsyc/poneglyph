import { createServerEntry } from 'poneglyph/server';
import type { APIHandler } from 'poneglyph/router';
import Root from './root';

export default createServerEntry({
  Root,
  routes: {
    pages: {
      path: './routes',
      imports: import.meta.glob(
        './routes/**/*.tsx',
        { eager: true },
      ),
    },
    apis: {
      path: './routes',
      imports: import.meta.glob<true, string, APIHandler<any>>(
        './routes/**/*.api.ts',
        { import: 'default', eager: true },
      ),
      normalize(path) {
        return path.replace('.api', '');
      },
    },
  },
});
