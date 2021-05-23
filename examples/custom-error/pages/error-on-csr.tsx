import React, { useEffect } from 'react';

function CSRErrorInternal(): JSX.Element {
  useEffect(() => {
    throw new Error('hit!');
  }, []);

  return <h1>This will error</h1>;
}

export default function CSRError(): JSX.Element {
  return <CSRErrorInternal />;
}
