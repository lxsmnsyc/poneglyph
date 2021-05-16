import React, { ComponentType, ReactNode } from 'react';
import ReactDOMServer from 'react-dom/server';
import { IncomingMessage, ServerResponse } from 'http';
import ecmason from 'ecmason';
import {
  DefaultDocument,
  DocumentContext,
} from './components/Document';
import { HeadContext } from './components/Head';
import { TailContext } from './components/Tail';
import ErrorPage, { ErrorProps } from './components/Error';
import DefaultApp, { AppComponent } from './components/App';

export interface RenderContext {
  request: IncomingMessage;
  response: ServerResponse;
}

export interface GetServerSidePropsSuccess<P> {
  type: 'success';
  value: P;
}

export interface GetServerSidePropsNotFound {
  type: 'error';
  value: number;
}

export interface GetServerSidePropsRedirectValue {
  destination: string;
  permanent: boolean;
}

export interface GetServerSidePropsRedirect {
  type: 'redirect';
  value: GetServerSidePropsRedirectValue;
}

export type GetServerSidePropsResult<P> =
  | GetServerSidePropsSuccess<P>
  | GetServerSidePropsNotFound
  | GetServerSidePropsRedirect;

export type GetServerSideProps<P> = (ctx: RenderContext) => (
  | GetServerSidePropsResult<P>
  | Promise<GetServerSidePropsResult<P>>
);

export interface RenderBaseOptions {
  app?: AppComponent;
  document?: () => JSX.Element;
  error404?: (props: ErrorProps) => JSX.Element;
  error500?: (props: ErrorProps) => JSX.Element;
  error?: (props: ErrorProps) => JSX.Element;
  scriptURL: string;
  styleURL: string;
}

export interface SSRProps<P> extends RenderBaseOptions {
  getServerSideProps: GetServerSideProps<P>;
  Component: ComponentType<P>;
}

export interface SSGProps extends RenderBaseOptions {
  getServerSideProps?: undefined;
  Component: ComponentType;
}

interface RenderInternalProps<P> extends RenderBaseOptions {
  pageProps: P;
  Component: ComponentType<P>;
}

function renderInternal<P>(options: RenderInternalProps<P>): string {
  const App = options.app ?? DefaultApp;

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

  const DocumentComponent = options.document ?? DefaultDocument;

  return flag + ReactDOMServer.renderToString((
    <DocumentContext.Provider
      value={{
        html: result,
        head: collectedHead,
        tail: collectedTail,
        data: ecmason.stringify(options.pageProps),
        scriptURL: options.scriptURL,
        styleURL: options.styleURL,
      }}
    >
      <DocumentComponent />
    </DocumentContext.Provider>
  ));
}

export function renderSSG(
  ctx: RenderContext,
  options: SSGProps,
): string {
  return renderInternal({
    ...options,
    pageProps: {},
  });
}

export interface RenderErrorProps extends RenderBaseOptions {
  statusCode: number;
}

export function getErrorComponent(
  statusCode: number,
  options: RenderBaseOptions,
): ComponentType<ErrorProps> {
  if (statusCode === 404 && options.error404) {
    return options.error404;
  }
  if (statusCode === 500 && options.error500) {
    return options.error500;
  }
  if (options.error) {
    return options.error;
  }
  return ErrorPage;
}

export function renderError(ctx: RenderContext, options: RenderErrorProps): string {
  ctx.response.setHeader('Content-Type', 'text/html');
  ctx.response.statusCode = options.statusCode;
  return renderInternal({
    ...options,
    Component: getErrorComponent(options.statusCode, options),
    pageProps: { statusCode: options.statusCode },
  });
}

export function renderRedirect(): string {
  // TODO
}

export async function renderSSR<P>(
  ctx: RenderContext,
  options: SSRProps<P>,
): Promise<string> {
  const data: GetServerSidePropsResult<P> = await options.getServerSideProps(ctx);

  if (data.type === 'success') {
    return renderInternal({
      ...options,
      pageProps: data.value,
    });
  }
  if (data.type === 'error') {
    return renderError(ctx, {
      ...options,
      statusCode: data.value,
    });
  }
  if (data.type === 'redirect') {
    // TODO
  }
  return renderError(ctx, {
    ...options,
    statusCode: 500,
  });
}

export async function render<P>(
  ctx: RenderContext,
  options: SSGProps | SSRProps<P>,
): Promise<string> {
  if (options.getServerSideProps) {
    return renderSSR(ctx, options);
  }
  return renderSSG(ctx, options);
}

export function hydrate() {
}