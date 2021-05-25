import React, { useEffect, useState } from 'react';

import '../styles/index.css';

interface Pending {
  status: 'pending';
  value?: undefined;
}

interface Success<T> {
  status: 'success';
  value: T;
}

interface Failure {
  status: 'failure';
  value: Error;
}

type Result<T> = Pending | Success<T> | Failure;

interface PageData {
  message: string;
}

export default function Index(): JSX.Element {
  const [state, setState] = useState<Result<PageData>>({
    status: 'pending',
  });

  useEffect(() => {
    fetch('/api/hello-world')
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('NOT OK');
      })
      .then((value: PageData) => {
        setState({
          status: 'success',
          value,
        });
      }, (error: Error) => {
        setState({
          status: 'success',
          value: error,
        });
      });
  }, []);

  if (state.status === 'pending') {
    return (
      <main>
        <h1>Loading</h1>
      </main>
    );
  }
  if (state.status === 'failure') {
    return (
      <main>
        <h1>Something went wrong.</h1>
      </main>
    );
  }
  return (
    <main>
      <h1>{state.value.message}</h1>
    </main>
  );
}
