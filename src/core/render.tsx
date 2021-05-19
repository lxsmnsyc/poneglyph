import React, { ComponentType, ReactNode } from 'react';
import ReactDOMServer from 'react-dom/server';
import { IncomingMessage, ServerResponse } from 'http';
import { stringify } from 'ecmason';
import { ParsedUrlQuery } from 'querystring';
import {
  DefaultDocument,
  DocumentContext,
} from '../components/Document';
import { HeadContext } from '../components/Head';
import { TailContext } from '../components/Tail';
import ErrorPage, { ErrorProps } from '../components/Error';
import DefaultApp, { AppComponent } from '../components/App';
import { RouterParams } from './router';
import { CUSTOM_404, CUSTOM_500, CUSTOM_ERROR, STATIC_PATH } from '../constants';

export type Params = RouterParams;
export type Query = ParsedUrlQuery;

export interface RenderContext<P extends Params = Params, Q extends Query = Query> {
  request: IncomingMessage;
  response: ServerResponse;
  params: P;
  query: Q;
}

export interface GetServerSidePropsSuccess<P> {
  type: 'success';
  value: P;
}

export interface GetServerSidePropsNotFound {
  type: 'error';
  value: number;
}

export type GetServerSidePropsResult<P> =
  | GetServerSidePropsSuccess<P>
  | GetServerSidePropsNotFound;

export type GetServerSideProps<Props, P extends Params = Params, Q extends Query = Query> = (
  (ctx: RenderContext<P, Q>) => (
    | GetServerSidePropsResult<Props>
    | Promise<GetServerSidePropsResult<Props>>
  )
);

export interface GlobalRenderOptions {
  buildDir: string;
  app?: AppComponent;
  document?: () => JSX.Element;
  error404?: (props: ErrorProps) => JSX.Element;
  error500?: (props: ErrorProps) => JSX.Element;
  error?: (props: ErrorProps) => JSX.Element;
}

export interface RenderBaseOptions {
  path: string;
  resourceID: string;
  entrypoint: string;
}

export interface SSROptions<P> extends RenderBaseOptions {
  getServerSideProps: GetServerSideProps<P>;
  Component: ComponentType<P>;
}

export interface SSGOptions extends RenderBaseOptions {
  getServerSideProps?: undefined;
  Component: ComponentType;
}

interface RenderInternalProps<P> extends RenderBaseOptions {
  pageProps: P;
  Component: ComponentType<P>;
}

function renderInternal<P>(
  global: GlobalRenderOptions,
  options: RenderInternalProps<P>,
): string {
  const App = global.app ?? DefaultApp;

  const collectedHead: ReactNode[] = [];
  const collectedTail: ReactNode[] = [];

  const result = ReactDOMServer.renderToString((
    <HeadContext.Provider value={collectedHead}>
      <TailContext.Provider value={collectedTail}>
        <App
          Component={options.Component}
          pageProps={options.pageProps}
        />
      </TailContext.Provider>
    </HeadContext.Provider>
  ));

  const flag = '<!DOCTYPE html>';

  const DocumentComponent = global.document ?? DefaultDocument;

  return flag + ReactDOMServer.renderToString((
    <DocumentContext.Provider
      value={{
        html: result,
        head: collectedHead,
        tail: collectedTail,
        data: stringify(options.pageProps),
        scriptURL: `/${STATIC_PATH}/${options.resourceID}/${options.entrypoint}.js`,
        styleURL: `/${STATIC_PATH}/${options.resourceID}/${options.entrypoint}.css`,
      }}
    >
      <DocumentComponent />
    </DocumentContext.Provider>
  ));
}

export function renderSSG<P extends Params = Params, Q extends Query = Query>(
  ctx: RenderContext<P, Q>,
  global: GlobalRenderOptions,
  options: SSGOptions,
): string {
  return renderInternal(global, {
    ...options,
    pageProps: {},
  });
}

export interface RenderErrorProps {
  statusCode: number;
}

export function getErrorComponent(
  statusCode: number,
  global: GlobalRenderOptions,
): ComponentType<ErrorProps> {
  if (statusCode === 404 && global.error404) {
    return global.error404;
  }
  if (statusCode === 500 && global.error500) {
    return global.error500;
  }
  if (global.error) {
    return global.error;
  }
  return ErrorPage;
}

export function getErrorPath(
  statusCode: number,
  global: GlobalRenderOptions,
): string {
  if (statusCode === 404 && global.error404) {
    return CUSTOM_404;
  }
  if (statusCode === 500 && global.error500) {
    return CUSTOM_500;
  }
  return CUSTOM_ERROR;
}

export function renderError<P extends Params = Params, Q extends Query = Query>(
  ctx: RenderContext<P, Q>,
  global: GlobalRenderOptions,
  options: RenderErrorProps,
): string {
  const target = getErrorPath(options.statusCode, global);
  return renderInternal(global, {
    path: `/${target}`,
    resourceID: target,
    entrypoint: target,
    Component: getErrorComponent(options.statusCode, global),
    pageProps: { statusCode: options.statusCode },
  });
}

export async function renderSSR<Props, P extends Params = Params, Q extends Query = Query>(
  ctx: RenderContext<P, Q>,
  global: GlobalRenderOptions,
  options: SSROptions<Props>,
): Promise<string> {
  const data: GetServerSidePropsResult<Props> = await options.getServerSideProps(ctx);

  if (data.type === 'success') {
    return renderInternal(global, {
      ...options,
      pageProps: data.value,
    });
  }
  if (data.type === 'error') {
    return renderError(ctx, global, {
      statusCode: data.value,
    });
  }
  return renderError(ctx, global, {
    statusCode: 500,
  });
}

export async function render<Props, P extends Params = Params, Q extends Query = Query>(
  ctx: RenderContext<P, Q>,
  global: GlobalRenderOptions,
  options: SSGOptions | SSROptions<Props>,
): Promise<string> {
  if (options.getServerSideProps) {
    return renderSSR(ctx, global, options);
  }
  return renderSSG(ctx, global, options);
}
