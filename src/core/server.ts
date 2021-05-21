import { RequestListener } from 'http';
import {
  render,
  renderError,
  SSGOptions,
  SSROptions,
} from './render';
import { addRoute, createRouterNode, matchRoute } from './router';
import { PUBLIC_PATH, STATIC_PATH } from '../constants';
import StatusCode from './errors/StatusCode';
import { GlobalRenderOptions, ServerSideContext } from './types';
import { getErrorPage } from '../components/Error';

export type ServerOptions<P> = (SSGOptions | SSROptions<P>)[];

async function fileExists(path: string): Promise<boolean> {
  const fs = await import('fs-extra');

  try {
    const stat = await fs.stat(path);

    return stat.isFile();
  } catch (error) {
    return false;
  }
}

export default function createServer<AppData, PageData>(
  global: GlobalRenderOptions<AppData>,
  options: ServerOptions<PageData>,
): RequestListener {
  const node = createRouterNode<SSGOptions | SSROptions<PageData>>('');

  options.forEach((option) => {
    addRoute(node, option.path.split('/'), option);
  });

  return function requestListener(request, response): void {
    function errorHandler(error: Error) {
      const statusCode = (error instanceof StatusCode) ? error.value : 500;
      const reason = (error instanceof StatusCode) ? error.reason : error;

      if (reason) {
        const { onError } = getErrorPage(statusCode, global);
        if (onError) {
          onError(reason);
        }
      }

      const context: ServerSideContext = {
        request,
        response,
        params: {},
        query: {},
      };
      response.statusCode = statusCode;
      response.setHeader('Content-Type', 'text/html');
      response.end(renderError(context, global, {
        statusCode,
      }));
    }

    const { host } = request.headers;
    const originalURL = request.url;

    if (host && originalURL) {
      const readStaticFile = async (prefix: string) => {
        const fs = await import('fs-extra');
        const path = await import('path');
        const mime = await import('mime-types');

        const file = originalURL.substring(prefix.length);
        const targetFile = path.join(global.buildDir, file);

        const exists = await fileExists(targetFile);
        const mimeType = mime.contentType(path.basename(file));
        if (exists && mimeType) {
          const buffer = await fs.readFile(targetFile);
          console.log('Serving file', originalURL, mimeType);
          response.statusCode = 200;
          response.setHeader('Content-Type', mimeType);
          response.end(buffer);
        } else {
          throw new StatusCode(404);
        }
      };
      const staticPrefix = `/${STATIC_PATH}/`;
      if (originalURL.startsWith(staticPrefix)) {
        readStaticFile(staticPrefix).catch(errorHandler);
        return;
      }
      const publicPrefix = `/${PUBLIC_PATH}/`;
      if (originalURL.startsWith(publicPrefix)) {
        readStaticFile(publicPrefix).catch(errorHandler);
        return;
      }
      const getContent = async (): Promise<string> => {
        try {
          const querystring = await import('querystring');

          const url = new URL(originalURL, `http://${host}`);

          const splitPath = url.pathname.split('/');

          const matchedNode = matchRoute(node, splitPath);

          if (matchedNode && matchedNode.value) {
            const option = matchedNode.value;
            const context: ServerSideContext = {
              request,
              response,
              params: matchedNode.params,
              query: querystring.decode(url.search),
            };

            console.log('Serving', originalURL);
            return render(context, global, option);
          }

          throw new StatusCode(404);
        } catch (error) {
          if (error instanceof StatusCode) {
            throw error;
          } else {
            throw new StatusCode(500, error);
          }
        }
      };

      getContent().then((value) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html');
        response.end(value);
      }, errorHandler);
    }
  };
}
