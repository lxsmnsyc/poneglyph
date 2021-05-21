import React, { ComponentType, ReactNode } from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  AppPage,
  AppProps,
  AppRenderResult,
  GlobalRenderOptions,
} from '../core/types';
import { getErrorPage } from './Error';
import ErrorBoundary from './ErrorBoundary';
import { HeadContext } from './Head';
import { TailContext } from './Tail';

export function DefaultApp<P>() {
  return ({ Component, pageProps }: AppProps<P>): JSX.Element => (
    <Component {...pageProps} />
  );
}

export interface RenderAppOptions<P> {
  pageProps: P;
  Component: ComponentType<P>;
}

export function renderApp<PageProps>(
  global: GlobalRenderOptions,
  options: RenderAppOptions<PageProps>,
): AppRenderResult {
  const CustomAppPage: AppPage = global.app ?? DefaultApp;
  const CustomApp = CustomAppPage<PageProps>();
  const CustomErrorPage = getErrorPage(500, global);

  const head: ReactNode[] = [];
  const tail: ReactNode[] = [];

  const html = ReactDOMServer.renderToString((
    <ErrorBoundary
      fallback={<CustomErrorPage.Component statusCode={500} />}
    >
      <HeadContext.Provider value={head}>
        <TailContext.Provider value={tail}>
          <CustomApp
            Component={options.Component}
            pageProps={options.pageProps}
          />
        </TailContext.Provider>
      </HeadContext.Provider>
    </ErrorBoundary>
  ));

  return {
    html,
    head,
    tail,
  };
}
