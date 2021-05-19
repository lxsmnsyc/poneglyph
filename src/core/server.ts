import { RequestListener } from 'http';
import {
  GlobalRenderOptions,
  render, RenderContext, renderError, SSGOptions, SSROptions,
} from './render';
import { addRoute, createRouterNode, matchRoute } from './router';
import { PUBLIC_PATH, STATIC_PATH } from '../constants';
import StatusCode from './errors/StatusCode';

export type ServerOptions<P> = (SSGOptions | SSROptions<P>)[];

export default function createServer<P>(
  global: GlobalRenderOptions,
  options: ServerOptions<P>,
): RequestListener {
  const node = createRouterNode<SSGOptions | SSROptions<P>>('');

  options.forEach((option) => {
    addRoute(node, option.path.split('/'), option);
  });

  return function (request, response) {
    function errorHandler(error: Error) {
      const statusCode = (error instanceof StatusCode) ? error.value : 500;
      console.log(error);
      response.statusCode = statusCode;
      const context: RenderContext = {
        request,
        response,
        params: {},
        query: {},
      };
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

        console.log(path.resolve(targetFile));

        try {
          const stat = await fs.stat(targetFile);
          const mimeType = mime.contentType(path.basename(file));
          if (stat.isFile() && mimeType) {
            const buffer = await fs.readFile(targetFile);
            console.log('Serving file', originalURL, mimeType);
            response.statusCode = 200;
            response.setHeader('Content-Type', mimeType);
            response.end(buffer);
          } else {
            throw new StatusCode(404);
          }
        } catch (error) {
          if (error instanceof StatusCode) {
            throw error;
          } else {
            throw new StatusCode(404);
          }
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
            const context: RenderContext = {
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
            throw new StatusCode(500);
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
