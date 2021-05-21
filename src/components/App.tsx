import React, { ComponentType, ReactNode } from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  AppRenderResult,
  AppSSGPage,
  GlobalRenderOptions,
  Params,
  PoneglyphData,
  Query,
  ServerSideContext,
} from '../core/types';
import { getErrorPage } from './Error';
import ErrorBoundary from './ErrorBoundary';
import { HeadContext } from './Head';
import { PoneglyphDataContext } from './PoneglyphData';
import { TailContext } from './Tail';

export const DefaultApp: AppSSGPage = {
  Component: ({ Component }) => (
    <Component />
  ),
};

export interface RenderAppOptions<P> {
  pageProps: P;
  Component: ComponentType;
}

export async function renderApp<
  AppData,
  PageData,
  P extends Params = Params,
  Q extends Query = Query
>(
  ctx: ServerSideContext<P, Q>,
  global: GlobalRenderOptions<AppData>,
  options: RenderAppOptions<PageData>,
): Promise<AppRenderResult<AppData, PageData, P, Q>> {
  const CustomAppPage = global.app ?? DefaultApp;
  const CustomErrorPage = getErrorPage(500, global);

  const appData = CustomAppPage.getAppData
    ? await CustomAppPage.getAppData(ctx)
    : {};

  const head: ReactNode[] = [];
  const tail: ReactNode[] = [];

  const data: PoneglyphData<AppData, PageData, P, Q> = {
    appData: appData as AppData,
    pageData: options.pageProps,
    params: ctx.params,
    query: ctx.query,
  };

  const html = ReactDOMServer.renderToString((
    <ErrorBoundary
      fallback={<CustomErrorPage.Component statusCode={500} />}
    >
      <HeadContext.Provider value={head}>
        <TailContext.Provider value={tail}>
          <PoneglyphDataContext.Provider
            value={data}
          >
            <CustomAppPage.Component
              Component={options.Component}
            />
          </PoneglyphDataContext.Provider>
        </TailContext.Provider>
      </HeadContext.Provider>
    </ErrorBoundary>
  ));

  return {
    html,
    head,
    tail,
    data,
  };
}
