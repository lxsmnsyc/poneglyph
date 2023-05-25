import ReactDOMServer from 'react-dom/server.browser';
import { serializeAsync } from 'seroval';
import type {
  APIRouterConfig,
  LoadResult,
  PageRouterConfig,
} from 'poneglyph-router';
import {
  Router,
  defineAPIRouter,
  definePageRouter,
} from 'poneglyph-router';
import type { ReactNode } from 'react';

export interface ServerEntryOptions {
  Root: (props: { children: ReactNode }) => JSX.Element;
  routes: {
    pages: PageRouterConfig;
    apis: APIRouterConfig;
  };
}

export type ServerEntryHandle = (request: Request, client: string) => Promise<Response>;

export function createServerEntry(options: ServerEntryOptions): ServerEntryHandle {
  const apiRouter = defineAPIRouter(options.routes.apis);
  const pageRouter = definePageRouter(options.routes.pages);

  return async function handle(request: Request, client: string): Promise<Response> {
    const url = new URL(request.url);
    const apis = apiRouter.match(url);
    if (apis.length) {
      const last = apis[apis.length - 1];
      if (last && last.value) {
        return last.value(request, last.params);
      }
    }
    const pages = pageRouter.match(url);
    let data: LoadResult<any>[] = [];
    if (pages.length) {
      data = await Promise.all(
        pages.map(async (result) => {
          if (result && result.value && result.value.load) {
            return result.value.load(result.params);
          }
          return { props: undefined };
        }),
      );
    }
    for (let i = 0, len = data.length; i < len; i++) {
      const current = data[i];
      if ('redirect' in current) {
        return Response.redirect(current.redirect);
      }
    }
    return new Response(
      await ReactDOMServer.renderToReadableStream(
        <options.Root>
          <Router
            location={url}
            routes={pageRouter.tree}
            data={data}
          />
        </options.Root>,
        {
          bootstrapModules: [
            client,
          ],
          bootstrapScriptContent: `window.SSR_DATA=${await serializeAsync(data)}`,
        },
      ),
      {
        headers: {
          'Content-Type': 'text/html',
        },
        status: 200,
      },
    );
  };
}
