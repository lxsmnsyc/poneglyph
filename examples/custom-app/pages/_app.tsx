import { AppProps } from 'poneglyph';
import React from 'react';

export default function App({ Component }: AppProps): JSX.Element {
  return (
    <div
      style={{
        backgroundColor: 'black',
        color: 'white',
      }}
    >
      <Component />
    </div>
  );
}
