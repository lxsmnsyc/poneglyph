import { Head, RouterParams, useRouteParams } from 'poneglyph';
import React from 'react';

import '../styles/index.css';

interface Params extends RouterParams {
  names: string[];
}

export default function Example(): JSX.Element {
  const { names } = useRouteParams<Params>();
  return (
    <main>
      <Head>
        <title>{`Hello ${names.join(', ')}`}</title>
      </Head>
      <h1>{`Hello ${names.join(', ')}`}</h1>
    </main>
  );
}
