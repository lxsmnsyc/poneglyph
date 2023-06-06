import type { DevServerOptions } from './create-dev-server';
import { createDevServer } from './create-dev-server';
import type { ProdServerOptions } from './create-prod-server';
import { createProdServer } from './create-prod-server';

export interface ServerOptions {
  env: 'production' | 'development';
  dev: DevServerOptions;
  prod: ProdServerOptions;
}

export default async function createServer(options: ServerOptions): Promise<void> {
  if (options.env === 'production') {
    await createProdServer(options.prod);
  } else {
    await createDevServer(options.dev);
  }
}
