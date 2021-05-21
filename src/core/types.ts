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
export interface AppProps<P> {
  Component: ComponentType<P>;
  pageProps: P;
}

export type App<P> = ComponentType<AppProps<P>>;

export type AppPage = <P>() => App<P>;

export interface AppRenderResult {
  head: ReactNode[];
  tail: ReactNode[];
  html: string;
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
  (ctx: ServerSideContext<P, Q>) => (
    | GetServerSidePropsResult<Props>
    | Promise<GetServerSidePropsResult<Props>>
  )
);

/**
 * Error Page related
 */
export interface ErrorProps {
  statusCode: number;
}

export type ErrorComponent = ComponentType<ErrorProps>;

export interface ErrorPage {
  onError?: (error: Error) => void;
  Component: ErrorComponent;
}

export interface GlobalRenderOptions {
  buildDir: string;
  app?: AppPage;
  document?: ComponentType;
  error404?: ErrorPage;
  error500?: ErrorPage;
  error?: ErrorPage;
}
