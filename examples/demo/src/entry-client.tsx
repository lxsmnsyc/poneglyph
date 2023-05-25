import { createClientEntry } from 'poneglyph/client';
import Root from './root';

createClientEntry({
  Root,
  routes: {
    pages: {
      path: './routes',
      imports: import.meta.glob('./routes/**/*.tsx', { eager: true }),
    },
  },
});
