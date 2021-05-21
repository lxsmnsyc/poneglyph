import { Plugin } from 'esbuild';
import { IncomingMessage, ServerResponse } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { ComponentType, ReactNode } from 'react';
import { RouterParams } from './router';

export interface Dictionary {
  [key: string]: string;
}

export interface BuildFullOptions {
  buildDir: string;
  pagesDir: string;
  target: string;
  env: Dictionary;
  plugins: Plugin[];
  tsconfig?: string;
}

export type BuildOptions = Partial<BuildFullOptions>;

export type BundleType = 'browser' | 'node';

export type Params = RouterParams;
export type Query = ParsedUrlQuery;

export interface ServerSideContext<P extends Params = Params, Q extends Query = Query> {
  request: IncomingMessage;
  response: ServerResponse;
  params: P;
  query: Q;
}

/**
 * App Types
 */
export interface AppProps {
  Component: ComponentType;
}

export type App = ComponentType<AppProps>;

export interface AppSSGPage {
  Component: App;
  getAppData?: undefined;
}

export interface AppSSRPage<P> {
  Component: App;
  getAppData: (ctx: ServerSideContext) => P | Promise<P>;
}

export type AppPage<P> = AppSSGPage | AppSSRPage<P>;

export interface AppRenderResult<
  AppData,
  PageData,
  P extends Params = Params,
  Q extends Query = Query
> {
  head: ReactNode[];
  tail: ReactNode[];
  html: string;
  data: PoneglyphData<AppData, PageData, P, Q>;
}

export interface GetPageDataSuccess<P> {
  type: 'success';
  value: P;
}

export interface GetPageDataNotFound {
  type: 'error';
  value: number;
}

export type GetPageDataResult<P> =
  | GetPageDataSuccess<P>
  | GetPageDataNotFound;

export type GetPageData<PageData, P extends Params = Params, Q extends Query = Query> = (
  (ctx: ServerSideContext<P, Q>) => (
    | GetPageDataResult<PageData>
    | Promise<GetPageDataResult<PageData>>
  )
);

/**
 * Error Page related
 */
export interface ErrorProps {
  statusCode: number;
}

export interface ErrorPage {
  onError?: (error: Error) => void;
  Component: ComponentType<ErrorProps>;
}

export interface GlobalRenderOptions<AppData> {
  buildDir: string;
  app?: AppPage<AppData>;
  document?: ComponentType;
  error404?: ErrorPage;
  error500?: ErrorPage;
  error?: ErrorPage;
}

export interface PoneglyphData<
  AppData,
  PageData,
  P extends Params = Params,
  Q extends Query = Query
> {
  appData: AppData;
  pageData: PageData;
  params: P;
  query: Q;
}
