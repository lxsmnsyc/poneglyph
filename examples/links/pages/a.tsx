import { Head, Link } from 'poneglyph';
import React from 'react';

import '../styles/index.css';

export default function Example(): JSX.Element {
  return (
    <main>
      <Head>
        <title>Welcome to A Page</title>
      </Head>
      <h1>Welcome to A Page</h1>
      <nav>
        <li>
          <Link href="/b">
            Go to B
          </Link>
        </li>
        <li>
          <Link href="/">
            Go to Home
          </Link>
        </li>
      </nav>
    </main>
  );
}
