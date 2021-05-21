import { getReasonPhrase } from 'http-status-codes';
import React, { FC, ReactNode } from 'react';
import ReactDOMServer from 'react-dom/server';
import { CUSTOM_404, CUSTOM_500, CUSTOM_ERROR } from '../constants';
import {
  ErrorPage,
  ErrorData,
  GlobalRenderOptions,
  AppRenderResult,
  Params,
  Query,
  ServerSideContext,
} from '../core/types';
import ErrorBoundary from './ErrorBoundary';

import Head, { HeadContext } from './Head';
import { TailContext } from './Tail';

export const DefaultErrorComponent: FC<ErrorData> = ({ statusCode }) => {
  const phrase = getReasonPhrase(statusCode);

  return (
    <div
      style={{
        color: '#000',
        background: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Head>
        <title>{`${statusCode}: ${phrase}`}</title>
        <style dangerouslySetInnerHTML={{ __html: 'body { margin: 0 }' }} />
      </Head>
      <span
        style={{
          fontSize: '1.5rem',
          lineHeight: '2rem',
          fontWeight: 'bold',
          marginRight: '2rem',
        }}
      >
        {statusCode}
      </span>
      <span
        style={{
          fontSize: '1.25rem',
          lineHeight: '1.75rem',
        }}
      >
        {phrase}
      </span>
    </div>
  );
};

export const DefaultErrorPage: ErrorPage = {
  Component: DefaultErrorComponent,
};

export function getErrorPage<AppData>(
  statusCode: number,
  global: GlobalRenderOptions<AppData>,
): ErrorPage {
  if (statusCode === 404 && global.error404) {
    return global.error404;
  }
  if (statusCode === 500 && global.error500) {
    return global.error500;
  }
  if (global.error) {
    return global.error;
  }
  return DefaultErrorPage;
}

export function getErrorPath<AppData>(
  statusCode: number,
  global: GlobalRenderOptions<AppData>,
): string {
  if (statusCode === 404 && global.error404) {
    return CUSTOM_404;
  }
  if (statusCode === 500 && global.error500) {
    return CUSTOM_500;
  }
  return CUSTOM_ERROR;
}

export function renderStaticError<AppData, P extends Params = Params, Q extends Query = Query>(
  ctx: ServerSideContext<P, Q>,
  global: GlobalRenderOptions<AppData>,
  options: ErrorData,
): AppRenderResult<AppData, ErrorData, P, Q> {
  const CustomErrorPage = getErrorPage(options.statusCode, global);

  const head: ReactNode[] = [];
  const tail: ReactNode[] = [];

  const html = ReactDOMServer.renderToString((
    <ErrorBoundary
      fallback={<DefaultErrorComponent statusCode={500} />}
    >
      <HeadContext.Provider value={head}>
        <TailContext.Provider value={tail}>
          <CustomErrorPage.Component
            statusCode={options.statusCode}
          />
        </TailContext.Provider>
      </HeadContext.Provider>
    </ErrorBoundary>
  ));

  return {
    html,
    head,
    tail,
    data: {
      appData: {} as AppData,
      pageData: options,
      params: ctx.params,
      query: ctx.query,
    },
  };
}
