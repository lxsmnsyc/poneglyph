import type { MutableRefObject } from 'react';
import {
  Suspense,
  createContext,
  useContext,
  useEffect,
  useRef,
} from 'react';
import useSWR from 'swr';
import assert from './assert';
import type {
  LoadResult,
  Page,
  PageRouter,
  RouterParams,
  RouterResult,
} from './router-node';
import {
  matchRoute,
} from './router-node';
import type { UseLocationOptions } from './use-location';
import useLocation from './use-location';
import ErrorBoundary from './ErrorBoundary';
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

interface RouterPageLayoutProps<T, P extends RouterParams = RouterParams> {
  path: string;
  params: P;
  Page: Page<T, P>;
  data: LoadResult<T> | undefined;
  NotFound?: () => JSX.Element;
  children: (value: T) => JSX.Element;
}

function RouterPageLayout<T, P extends RouterParams = RouterParams>({
  path,
  params,
  data,
  Page,
  children,
  NotFound,
}: RouterPageLayoutProps<T, P>): JSX.Element {
  const flag = useContext(RouterFlagContext);
  assert(flag, new Error('Missing RouterFlagContext'));
  const { data: current } = useSWR(params, async (): Promise<LoadResult<T>> => {
    if (Page.load) {
      return Page.load(params);
    }
    return { props: undefined as T };
  }, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    errorRetryCount: 1,
    suspense: true,
    fallbackData: flag.current ? data : undefined,
  });

  useEffect(() => {
    flag.current = false;
  }, [flag]);

  if ('redirect' in current) {
    return <Redirect target={current.redirect} />;
  }
  if ('notFound' in current) {
    return <>{NotFound && <NotFound />}</>;
  }
  const Render = Page.Layout;
  if (Render) {
    return (
      <Render path={path} params={params} data={current.props}>
        {children(current.props)}
      </Render>
    );
  }
  return <>{children(current.props)}</>;
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
      const data = ctx.data[depth];
      const isLayout = depth < ctx.result.length - 1;

      return (
        <ParamsContext.Provider value={params}>
          <RouterPageLayout
            path={path}
            data={data}
            params={params}
            Page={value}
            NotFound={NotFound}
          >
            {(currentData): JSX.Element => (
              <ErrorBoundary Fallback={value.Fallback}>
                <Suspense fallback={value.Loading && <value.Loading />}>
                  {
                    isLayout
                      ? <RouteBuilder depth={depth + 1} NotFound={value.NotFound} />
                      : (
                        <value.default
                          path={path}
                          data={currentData as unknown}
                          params={params}
                        />
                      )
                  }
                </Suspense>
              </ErrorBoundary>
            )}
          </RouterPageLayout>
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
