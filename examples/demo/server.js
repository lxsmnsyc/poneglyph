import { createServer } from 'poneglyph/server';
import { createNodeAdapter } from 'poneglyph-adapter-node';
import { readFile } from 'fs/promises';

// const serverManifest = JSON.parse(
//   await readFile(
//     new URL('./dist/server/manifest.json', import.meta.url)
//   )
// );
// const clientManifest = JSON.parse(
//   await readFile(
//     new URL('./dist/client/manifest.json', import.meta.url)
//   )
// );

createServer({
  env: process.env.NODE_ENV,
  // prod: {
  //   handle: createNodeAdapter({
  //     port: 3000,
  //     assets: './dist/client/assets',
  //   }),
  //   build: {
  //     server: () => import('./dist/server/' + serverManifest['src/entry-server.tsx'].file),
  //     client: clientManifest['src/entry-client.tsx'].file,
  //   }
  // },
  dev: {
    port: 3000,
    build: {
      server: './src/entry-server.tsx',
      client: '/src/entry-client.tsx',
    },
  }
});
