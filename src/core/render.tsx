import React, { ComponentType } from 'react';
import ReactDOMServer from 'react-dom/server';
import { stringify } from 'ecmason';
import {
  DefaultDocument,
  DocumentContext,
} from '../components/Document';
import { renderApp } from '../components/App';
import {
  STATIC_PATH,
} from '../constants';
import {
  ErrorProps,
  GetServerSideProps,
  GetServerSidePropsResult,
  GlobalRenderOptions,
  Params,
  Query,
  ServerSideContext,
} from './types';
import StatusCode from './errors/StatusCode';
import { getErrorPage, getErrorPath } from '../components/Error';

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
  const result = renderApp(global, options);

  const flag = '<!DOCTYPE html>';

  const DocumentComponent = global.document ?? DefaultDocument;

  return flag + ReactDOMServer.renderToString((
    <DocumentContext.Provider
      value={{
        ...result,
        data: stringify(options.pageProps),
        scriptURL: `/${STATIC_PATH}/${options.resourceID}/${options.entrypoint}.js`,
        styleURL: `/${STATIC_PATH}/${options.resourceID}/${options.entrypoint}.css`,
      }}
    >
      <DocumentComponent />
    </DocumentContext.Provider>
  ));
}

export function renderError<P extends Params = Params, Q extends Query = Query>(
  ctx: ServerSideContext<P, Q>,
  global: GlobalRenderOptions,
  options: ErrorProps,
): string {
  const target = getErrorPath(options.statusCode, global);
  return renderInternal(global, {
    path: `/${target}`,
    resourceID: target,
    entrypoint: target,
    Component: getErrorPage(options.statusCode, global).Component,
    pageProps: { statusCode: options.statusCode },
  });
}

export function renderSSG<P extends Params = Params, Q extends Query = Query>(
  ctx: ServerSideContext<P, Q>,
  global: GlobalRenderOptions,
  options: SSGOptions,
): string {
  return renderInternal(global, {
    ...options,
    pageProps: {},
  });
}

export async function renderSSR<Props, P extends Params = Params, Q extends Query = Query>(
  ctx: ServerSideContext<P, Q>,
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
    throw new StatusCode(data.value);
  }
  throw new StatusCode(500);
}

export async function render<Props, P extends Params = Params, Q extends Query = Query>(
  ctx: ServerSideContext<P, Q>,
  global: GlobalRenderOptions,
  options: SSGOptions | SSROptions<Props>,
): Promise<string> {
  if (options.getServerSideProps) {
    return renderSSR(ctx, global, options);
  }
  return renderSSG(ctx, global, options);
}
