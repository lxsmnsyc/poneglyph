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
  GetPageData,
  GetPageDataResult,
  GlobalRenderOptions,
  Params,
  Query,
  ServerSideContext,
} from './types';
import StatusCode from './errors/StatusCode';
import { getErrorPath, renderStaticError } from '../components/Error';

export interface RenderBaseOptions {
  path: string;
  resourceID: string;
  entrypoint: string;
}

export interface SSROptions<P> extends RenderBaseOptions {
  getPageData: GetPageData<P>;
  Component: ComponentType;
}

export interface SSGOptions extends RenderBaseOptions {
  getPageData?: undefined;
  Component: ComponentType;
}

interface RenderInternalProps<P> extends RenderBaseOptions {
  pageProps: P;
  Component: ComponentType;
}

async function renderInternal<
  AppData,
  PageData,
  P extends Params = Params,
  Q extends Query = Query
>(
  ctx: ServerSideContext<P, Q>,
  global: GlobalRenderOptions<AppData>,
  options: RenderInternalProps<PageData>,
): Promise<string> {
  const result = await renderApp(ctx, global, options);

  const flag = '<!DOCTYPE html>';

  const DocumentComponent = global.document ?? DefaultDocument;

  return flag + ReactDOMServer.renderToString((
    <DocumentContext.Provider
      value={{
        ...result,
        data: global.enableEcmason ? stringify(result.data) : JSON.stringify(result.data),
        scriptURL: `/${STATIC_PATH}/${options.resourceID}/${options.entrypoint}.js?version=${global.version}`,
        styleURL: `/${STATIC_PATH}/${options.resourceID}/${options.entrypoint}.css?version=${global.version}`,
      }}
    >
      <DocumentComponent />
    </DocumentContext.Provider>
  ));
}

export function renderError<AppData, P extends Params = Params, Q extends Query = Query>(
  ctx: ServerSideContext<P, Q>,
  global: GlobalRenderOptions<AppData>,
  options: ErrorProps,
): string {
  const target = getErrorPath(options.statusCode, global);

  const result = renderStaticError(ctx, global, options);

  const flag = '<!DOCTYPE html>';

  const DocumentComponent = global.document ?? DefaultDocument;

  return flag + ReactDOMServer.renderToString((
    <DocumentContext.Provider
      value={{
        ...result,
        data: global.enableEcmason ? stringify(result.data) : JSON.stringify(result.data),
        scriptURL: `/${STATIC_PATH}/${target}/${target}.js?version=${global.version}`,
        styleURL: `/${STATIC_PATH}/${target}/${target}.css?version=${global.version}`,
      }}
    >
      <DocumentComponent />
    </DocumentContext.Provider>
  ));
}

export function renderSSG<AppData, P extends Params = Params, Q extends Query = Query>(
  ctx: ServerSideContext<P, Q>,
  global: GlobalRenderOptions<AppData>,
  options: SSGOptions,
): Promise<string> {
  return renderInternal(ctx, global, {
    ...options,
    pageProps: {},
  });
}

export async function renderSSR<
  AppData,
  PageData,
  P extends Params = Params,
  Q extends Query = Query
>(
  ctx: ServerSideContext<P, Q>,
  global: GlobalRenderOptions<AppData>,
  options: SSROptions<PageData>,
): Promise<string> {
  const data: GetPageDataResult<PageData> = await options.getPageData(ctx);

  if (data.type === 'success') {
    return renderInternal(ctx, global, {
      ...options,
      pageProps: data.value,
    });
  }
  if (data.type === 'error') {
    throw new StatusCode(data.value);
  }
  throw new StatusCode(500);
}

export async function render<
  AppData,
  PageData,
  P extends Params = Params,
  Q extends Query = Query,
>(
  ctx: ServerSideContext<P, Q>,
  global: GlobalRenderOptions<AppData>,
  options: SSGOptions | SSROptions<PageData>,
): Promise<string> {
  if (options.getPageData) {
    return renderSSR(ctx, global, options);
  }
  return renderSSG(ctx, global, options);
}
