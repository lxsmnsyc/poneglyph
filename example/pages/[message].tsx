import { GetServerSideProps } from 'poneglyph';
import React from 'react';

import '../styles/index.css';

interface Params extends Record<string, string>  {
  message: string;
}

interface Props {
  message: string;
}

export const getServerSideProps: GetServerSideProps<Props, Params> = (ctx) => ({
  type: 'success',
  value: {
    message: ctx.params.message,
  },
});

export default function Example({ message }: Props) {
  return (
    <main>
      <h1>Hello {message}</h1>
    </main>
  );
}
