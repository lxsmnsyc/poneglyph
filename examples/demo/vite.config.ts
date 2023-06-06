import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import thalerPlugin from 'unplugin-thaler';
import poneglyph from 'poneglyph/vite';

export default defineConfig({
  plugins: [
    poneglyph({
      entry: {
        server: './src/entry-server.tsx',
        client: './src/entry-client.tsx',
      },
    }),
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
    thalerPlugin.vite({
      mode: 'server',
    }),
  ]
});
