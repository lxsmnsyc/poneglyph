import { getReasonPhrase } from 'http-status-codes';
import React, { FC } from 'react';

import Head from './Head';

export interface ErrorProps {
  statusCode: number;
}

const ErrorPage: FC<ErrorProps> = ({ statusCode }) => {
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

export default ErrorPage;
