import assert from './assert';

export interface RouterParams {
  [key: string]: string | string[];
}

export interface RouterNode<T> {
  key: string;
  value?: T;
  normal: Record<string, RouterNode<T>>;
  glob?: RouterNode<T>;
  named?: RouterNode<T>;
}

function createRouterNode<T>(key: string, value?: T): RouterNode<T> {
  return {
    key,
    value,
    normal: {},
  };
}

const GLOB_PATH_TEST = /^\[\.\.\.[a-z0-9]+\]$/i;
const NAMED_PATH_TEST = /^\[[a-z0-9]+\]$/i;

function addRoute<T>(
  parent: RouterNode<T>,
  path: string[],
  value: T,
): void {
  let node = parent;
  let paths = '';
  for (let i = 0, len = path.length; i < len; i++) {
    const current = path[i];
    if (i !== 0) {
      paths += `/${current}`;
    }
    if (GLOB_PATH_TEST.test(current)) {
      const key = current.substring(4, current.length - 1);
      let matched = node.glob;
      assert(!(matched && matched.key !== key && matched.value), new Error(`Conflicting glob path at ${paths}`));
      if (!matched) {
        matched = createRouterNode(key, i === len - 1 ? value : undefined);
        node.glob = matched;
      } else if (i === len - 1) {
        matched.value = value;
      }
      node = matched;
    } else if (NAMED_PATH_TEST.test(current)) {
      const key = current.substring(1, current.length - 1);
      let matched = node.named;
      assert(!(matched && matched.key !== key && matched.value), new Error(`Conflicting named path at ${paths}`));
      if (!matched) {
        matched = createRouterNode(key, i === len - 1 ? value : undefined);
        node.named = matched;
      } else if (i === len - 1) {
        matched.value = value;
      }
      node = matched;
    } else {
      let matched = node.normal[current];
      assert(!(matched && i === len - 1 && matched.value), new Error(`Conflicting path at ${paths}`));
      if (!matched) {
        matched = createRouterNode(current, i === len - 1 ? value : undefined);
        node.normal[current] = matched;
      } else if (i === len - 1) {
        matched.value = value;
      }
      node = matched;
    }
  }
}

export function normalizePath(route: string): string {
  return route.endsWith('/')
    ? route.substring(0, route.length - 1)
    : route;
}

export interface Route<T> {
  path: string;
  value: T;
}

export function createRouterTree<T>(routes: Route<T>[]): RouterNode<T> {
  const root = createRouterNode<T>('');

  for (let i = 0, len = routes.length; i < len; i++) {
    const route = routes[i];
    addRoute(root, normalizePath(route.path).split('/'), route.value);
  }

  return root;
}

export interface RouterResult<T> {
  value?: T;
  path: string;
  params: RouterParams;
}

export function matchRoute<T>(root: RouterNode<T>, path: string): (RouterResult<T> | undefined)[] {
  const params: RouterParams = {};
  const results: (RouterResult<T> | undefined)[] = [];
  const paths = normalizePath(path).split('/');
  let node = root;

  for (let i = 0, len = paths.length; i < len; i++) {
    const current = paths[i];
    if (current in node.normal) {
      node = node.normal[current];
      const result = i === 0 ? '/' : paths.slice(0, i + 1).join('/');
      results[i] = {
        value: node.value,
        path: result,
        params: { ...params },
      };
    } else if (node.named) {
      node = node.named;
      params[node.key] = current;
      const result = i === 0 ? '/' : paths.slice(0, i + 1).join('/');
      results[i] = {
        value: node.value,
        path: result,
        params: { ...params },
      };
    } else if (node.glob) {
      node = node.glob;
      params[node.key] = paths.slice(i);
      results[i] = {
        value: node.value,
        path: paths.join('/'),
        params: { ...params },
      };
      break;
    } else {
      results[i] = undefined;
    }
  }

  return results;
}

export interface PageProps<T, P extends RouterParams = RouterParams> {
  path: string;
  params: P;
  data: T;
}

export interface SuccessResult<T> {
  props: T;
}

export interface NotFoundResult {
  notFound: true;
}

export interface RedirectResult {
  redirect: string;
}

export type LoadResult<T> =
  | SuccessResult<T>
  | NotFoundResult
  | RedirectResult;

export type Load<T, P extends RouterParams = RouterParams> = (
  params: P,
) => (Promise<LoadResult<T>> | LoadResult<T>);

export type APIHandler<P extends RouterParams> = (
  request: Request,
  params: P,
) => (Response | Promise<Response>);

export type APIRoute = Route<APIHandler<any>>;
export type APIRouter = RouterNode<APIHandler<any>>;

export interface LayoutProps<T, P extends RouterParams = RouterParams> {
  path: string;
  params: P;
  data: T;
  children: React.ReactNode;
}

export interface FallbackProps {
  error: Error;
  reset: () => void;
}

export interface Page<T, P extends RouterParams = RouterParams> {
  load?: Load<T, P>;
  Layout?: (props: LayoutProps<T, P>) => JSX.Element;
  NotFound?: () => JSX.Element;
  Loading?: () => JSX.Element;
  Fallback?: (props: FallbackProps) => JSX.Element;
  default: (props: PageProps<T, P>) => JSX.Element;
}

export type PageRoute = Route<Page<any, any>>;
export type PageRouter = RouterNode<Page<any, any>>;
