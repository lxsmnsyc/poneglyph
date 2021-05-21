import React, { useEffect } from 'react';

export default function CSRError(): JSX.Element {
  useEffect(() => {
    throw new Error('hit!');
  }, []);

  return <h1>This will error</h1>;
}
