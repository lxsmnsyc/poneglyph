import type { MutableRefObject } from 'react';
import {
  Suspense,
  createContext,
  useContext,
  useEffect,
  useRef,
} from 'react';
import assert from './assert';
import type {
  LayoutProps,
  LoadResult,
  Page,
  PageRouter,
  RouterResult,
} from './router-node';
import {
  matchRoute,
} from './router-node';
import type { UseLocationOptions } from './use-location';
import useLocation from './use-location';
import ErrorBoundary from './ErrorBoundary';
import { useCache } from './cache';
import { LocationContext, ParamsContext, useRouter } from './use-router';

interface RouterData {
  result: (RouterResult<Page<any, any>> | undefined)[];
  data: (LoadResult<any> | undefined)[];
}

const RouterFlagContext = createContext<MutableRefObject<boolean> | undefined>(undefined);
const RouterDataContext = createContext<RouterData | undefined>(undefined);

function useRouterData(): RouterData {
  const ctx = useContext(RouterDataContext);
  assert(ctx != null, new Error('Missing RouterDataContext'));
  return ctx;
}

interface RedirectProps {
  target: string;
}

function Redirect({ target }: RedirectProps): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    router.push(target);
  }, [router, target]);

  return <>{null}</>;
}

interface RouterPageProps {
  path: string;
  Page: Page<any, any>;
  data: LoadResult<any> | undefined;
}

function RouterPage({ path, data, Page }: RouterPageProps): JSX.Element {
  const flag = useContext(RouterFlagContext);
  assert(flag, new Error('Missing RouterFlagContext'));
  const current = useCache<LoadResult<any>>(
    path,
    flag.current ? data : undefined,
  );

  useEffect(() => {
    flag.current = false;
  }, [flag]);

  if ('redirect' in current) {
    return <Redirect target={current.redirect} />;
  }
  if ('notFound' in current) {
    return <>{Page.NotFound && <Page.NotFound />}</>;
  }
  const Render = Page.default;
  return <Render path={path} data={data} />;
}

function DEFAULT_PAGE_LAYOUT({ children }: LayoutProps): JSX.Element {
  return <>{children}</>;
}

interface RouteBuilderProps {
  NotFound?: () => JSX.Element;
  depth: number;
}

function RouteBuilder({ depth, NotFound }: RouteBuilderProps): JSX.Element {
  const ctx = useRouterData();
  const current = ctx.result[depth];
  if (current) {
    const { params, path, value } = current;
    if (value) {
      const PageLayout = value.Layout ?? DEFAULT_PAGE_LAYOUT;
      const data = ctx.data[depth];
      const isLayout = depth < ctx.result.length - 1;

      return (
        <ParamsContext.Provider value={params}>
          <PageLayout>
            <ErrorBoundary Fallback={value.Fallback}>
              <Suspense fallback={value.Loading && <value.Loading />}>
                {
                  isLayout
                    ? <RouteBuilder depth={depth + 1} NotFound={value.NotFound} />
                    : <RouterPage path={path} data={data} Page={value} />
                }
              </Suspense>
            </ErrorBoundary>
          </PageLayout>
        </ParamsContext.Provider>
      );
    }
    return (
      <ParamsContext.Provider value={params}>
        <RouteBuilder depth={depth + 1} NotFound={NotFound} />
      </ParamsContext.Provider>
    );
  }
  return <>{NotFound && <NotFound />}</>;
}

function RouteBuilderRoot(): JSX.Element {
  const ctx = useRouterData();
  return <>{(ctx.result.length > 0) && <RouteBuilder depth={0} />}</>;
}

export interface RouterProps {
  routes: PageRouter;
  data: LoadResult<any>[];
  location: UseLocationOptions;
}

export default function Router(
  { location, routes, data }: RouterProps,
): JSX.Element {
  const loc = useLocation(location);
  const matchedRoute = matchRoute(routes, loc.pathname);

  const flag = useRef(true);

  return (
    <RouterFlagContext.Provider value={flag}>
      <LocationContext.Provider value={loc}>
        <RouterDataContext.Provider value={{ result: matchedRoute, data }}>
          <RouteBuilderRoot />
        </RouterDataContext.Provider>
      </LocationContext.Provider>
    </RouterFlagContext.Provider>
  );
}
