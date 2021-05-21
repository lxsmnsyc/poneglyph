import { Head, Link } from 'poneglyph';
import React from 'react';

import '../styles/index.css';

export default function Index(): JSX.Element {
  return (
    <main>
      <Head>
        <title>Hello World</title>
      </Head>
      <h1>Hello World</h1>
      <nav>
        <li>
          <Link href="/a">
            Go to A
          </Link>
        </li>
        <li>
          <Link href="/b">
            Go to B
          </Link>
        </li>
      </nav>
    </main>
  );
}
