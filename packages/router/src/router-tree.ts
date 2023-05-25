import type {
  APIHandler,
  APIRouter,
  Page,
  PageRouter,
  RouterResult,
} from './router-node';
import { createRouterTree, matchRoute } from './router-node';

function normalizeRoute(path: string, offset: number): string {
  const base = path.substring(offset).replace(/\.[^/.]+$/, '');
  if (base.endsWith('/index')) {
    return base.replace(/\/index$/, '/');
  }
  return base;
}

export interface PageRouterConfig {
  path: string;
  imports: Record<string, Page<any, any>>;
  normalize?: (path: string) => string;
}

export type PageRouterResult = (RouterResult<Page<any, any>> | undefined)[];

export interface PageRouterInstance {
  tree: PageRouter;
  match(url: URL): PageRouterResult;
}

export function definePageRouter(config: PageRouterConfig): PageRouterInstance {
  const offset = config.path.length;
  const rawPages = Object.entries(config.imports)
    .map(([key, value]) => {
      const normalKey = config.normalize
        ? config.normalize(key)
        : key;
      const trueKey = normalizeRoute(normalKey, offset);
      return {
        path: trueKey,
        value,
      };
    });

  const pages = createRouterTree(rawPages);
  return {
    tree: pages,
    match(url: URL): PageRouterResult {
      return matchRoute(pages, url.pathname);
    },
  };
}

export interface APIRouterConfig {
  path: string;
  imports: Record<string, APIHandler<any>>;
  normalize?: (path: string) => string;
}

export type APIRouterResult = (RouterResult<APIHandler<any>> | undefined)[];

export interface APIRouterInstance {
  tree: APIRouter;
  match(url: URL): APIRouterResult;
}

export function defineAPIRouter(config: APIRouterConfig): APIRouterInstance {
  const offset = config.path.length;
  const rawAPI = Object.entries(config.imports)
    .map(([key, value]) => {
      const normalKey = config.normalize
        ? config.normalize(key)
        : key;
      const trueKey = normalizeRoute(normalKey, offset);
      return {
        path: trueKey,
        value,
      };
    });

  const apis = createRouterTree(rawAPI);
  return {
    tree: apis,
    match(url: URL): APIRouterResult {
      return matchRoute(apis, url.pathname);
    },
  };
}
