import React from 'react';
import '../styles/index.css';

export function onError(error: Error) {
  console.log(error);
}

export default function Error({ statusCode }) {
  return (
    <main>
      <h1>{statusCode}</h1>
    </main>
  );
}