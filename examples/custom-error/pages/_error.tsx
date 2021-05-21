import React from 'react';
import { ErrorProps } from 'poneglyph';

import '../styles/index.css';

export function onError(error: Error): void {
  console.log(error);
}

export default function Error({ statusCode }: ErrorProps): JSX.Element {
  return (
    <main>
      <h1>{statusCode}</h1>
    </main>
  );
}
