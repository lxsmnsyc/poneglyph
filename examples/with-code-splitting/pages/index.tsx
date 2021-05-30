import { Head, lazy } from 'poneglyph';
import React from 'react';

import '../styles/index.css';

const HelloWorld = lazy(() => import('../components/HelloWorld'));

export default function Index(): JSX.Element {
  return (
    <main>
      <Head>
        <title>Hello World</title>
      </Head>
      <HelloWorld />
    </main>
  );
}
