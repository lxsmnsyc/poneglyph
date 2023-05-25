import { createServer } from 'poneglyph/server';
import { createNodeAdapter } from 'poneglyph-adapter-node';

createServer({
  env: process.env.NODE_ENV,
  prod: {
    handle: createNodeAdapter({
      port: 3000,
      assets: './dist/client/assets',
    }),
    build: {
      server: () => import('./dist/server/entry-server.js'),
      client: './dist/client/entry-client.js',
    }
  },
  dev: {
    port: 3000,
    build: {
      server: './src/entry-server.tsx',
      client: '/src/entry-client.tsx',
    },
  }
});
