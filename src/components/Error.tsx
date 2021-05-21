import { getReasonPhrase } from 'http-status-codes';
import React, { ComponentType, FC } from 'react';
import { CUSTOM_404, CUSTOM_500, CUSTOM_ERROR } from '../constants';
import { ErrorPage, ErrorProps, GlobalRenderOptions } from '../core/types';

import Head from './Head';

export const DefaultErrorComponent: FC<ErrorProps> = ({ statusCode }) => {
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

export function getErrorPage(
  statusCode: number,
  global: GlobalRenderOptions,
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
