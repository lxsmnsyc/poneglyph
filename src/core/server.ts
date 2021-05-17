import { RequestListener } from 'http';
import querystring from 'querystring';
import path from 'path';
import mime from 'mime-types';
import fs from 'fs-extra';
import {
  GlobalRenderOptions,
  render, RenderContext, renderError, SSGOptions, SSROptions,
} from './render';
import { addRoute, createRouterNode, matchRoute } from './router';
import { PUBLIC_PATH, STATIC_PATH } from '../constants';

export type ServerOptions<P> = (SSGOptions | SSROptions<P>)[];

export default function createServer<P>(
  global: GlobalRenderOptions,
  options: ServerOptions<P>,
): RequestListener {
  const node = createRouterNode<SSGOptions | SSROptions<P>>('');

  options.forEach((option) => {
    addRoute(node, option.path.split('/'), option);
  });

  return (request, response) => {
    const { host } = request.headers;
    const originalURL = request.url;

    console.log('Serving', originalURL);

    if (host && originalURL) {
      const readStaticFile = async (prefix: string) => {
        const file = originalURL.substring(prefix.length);
        const targetFile = path.join(global.buildDir, file);
        const stat = await fs.stat(targetFile);
        const mimeType = mime.contentType(file);
        if (stat.isFile() && mimeType) {
          const buffer = await fs.readFile(targetFile);
          response.setHeader('Content-Type', mimeType);
          response.end(buffer);
        } else {
          const context: RenderContext = {
            request,
            response,
            params: {},
            query: {},
          };
          response.setHeader('Content-Type', 'text/html');
          response.end(renderError(context, global, {
            statusCode: 404,
          }));
        }
      };
      const staticPrefix = `/${STATIC_PATH}/`;
      if (originalURL.startsWith(staticPrefix)) {
        readStaticFile(staticPrefix).catch(() => {
          const context: RenderContext = {
            request,
            response,
            params: {},
            query: {},
          };
          response.setHeader('Content-Type', 'text/html');
          response.end(renderError(context, global, {
            statusCode: 500,
          }));
        });
        return;
      }
      const publicPrefix = `/${PUBLIC_PATH}/`;
      if (originalURL.startsWith(publicPrefix)) {
        readStaticFile(publicPrefix).catch(() => {
          const context: RenderContext = {
            request,
            response,
            params: {},
            query: {},
          };
          response.setHeader('Content-Type', 'text/html');
          response.end(renderError(context, global, {
            statusCode: 500,
          }));
        });
        return;
      }
      const getContent = async (): Promise<string> => {
        try {
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

            return render(context, global, option);
          }
          return renderError({
            request,
            response,
            params: {},
            query: {},
          }, global, {
            statusCode: 404,
          });
        } catch (error) {
          const context: RenderContext = {
            request,
            response,
            params: {},
            query: {},
          };
          return renderError(context, global, {
            statusCode: 500,
          });
        }
      };

      getContent().then((value) => {
        response.setHeader('Content-Type', 'text/html');
        response.end(value);
      }, (error) => {
        console.error(error);
      });
    }
  };
}
