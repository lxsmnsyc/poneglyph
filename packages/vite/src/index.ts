import type { Plugin, UserConfig } from 'vite';

export interface PoneglyphPluginOptions {
  entry: {
    server: string;
    client: string;
  };
}

// From: https://github.com/bluwy/whyframe/blob/master/packages/jsx/src/index.js#L27-L37
function repushPlugin(plugins: Plugin[], pluginName: string, pluginNames: string[]): void {
  const namesSet = new Set(pluginNames);

  let baseIndex = -1;
  let targetIndex = -1;
  let targetPlugin: Plugin;
  for (let i = 0, len = plugins.length; i < len; i += 1) {
    const current = plugins[i];
    if (namesSet.has(current.name) && baseIndex === -1) {
      baseIndex = i;
    }
    if (current.name === pluginName) {
      targetIndex = i;
      targetPlugin = current;
    }
  }
  if (baseIndex !== -1 && targetIndex !== -1 && baseIndex < targetIndex) {
    plugins.splice(targetIndex, 1);
    plugins.splice(baseIndex, 0, targetPlugin!);
  }
}

const SCRIPT = `
import '/@vite/client';
import RefreshRuntime from '/@react-refresh';
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
`;

const VIRTUAL_MODULE = '/@poneglyph';

export default function poneglyphPlugin(
  options: PoneglyphPluginOptions,
): Plugin[] {
  return [
    {
      name: 'poneglyph',
      enforce: 'pre',
      config(_config, env): UserConfig {
        return {
          build: env.command === 'build'
            ? {
              manifest: true,
              rollupOptions: {
                input: env.ssrBuild ? options.entry.server : options.entry.client,
              },
              outDir: env.ssrBuild ? 'dist/server' : 'dist/client',
            }
            : {},
          ssr: {
            noExternal: [
              'poneglyph',
            ],
          },
        };
      },
      configResolved(config): void {
        // run our plugin before the following plugins:
        repushPlugin(config.plugins as Plugin[], 'poneglyph', [
          // https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react
          'vite:react-babel',
          'vite:react-jsx',
        ]);
      },
      resolveId(id): string | undefined {
        if (id === VIRTUAL_MODULE) {
          return id;
        }
        return undefined;
      },
      load(id): string | undefined {
        if (id === VIRTUAL_MODULE) {
          return SCRIPT;
        }
        return undefined;
      },
    },
  ];
}
