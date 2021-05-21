import { GetPageData, Head, usePageData } from 'poneglyph';
import React from 'react';

import '../styles/index.css';

interface Params extends Record<string, string>  {
  message: string;
}

interface Props {
  message: string;
}

export const getPageData: GetPageData<Props, Params> = (ctx) => ({
  type: 'success',
  value: {
    message: ctx.params.message,
  },
});

export default function Example() {
  const { message } = usePageData<Props>();
  return (
    <main>
      <Head>
        <title>{`Hello ${message}`}</title>
      </Head>
      <h1>Hello {message}</h1>
    </main>
  );
}
