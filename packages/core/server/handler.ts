import type { ServerEntryHandle } from './create-server-entry';

export interface ServerHandlerOptions {
  server: () => Promise<{ default: ServerEntryHandle }>;
  client: string;
}

export type ServerHandler = (request: Request) => Promise<Response>;

export function createServerHandler(
  options: ServerHandlerOptions,
): ServerHandler {
  return async function serverHandler(request: Request): Promise<Response> {
    const { default: handle } = await options.server();
    const result = await handle(request, options.client);
    return result;
  };
}
