import React, { ComponentType } from 'react';
import ReactDOM from 'react-dom';
import { parse } from 'ecmason';
import { AppComponent } from '../components/App';
import { DOCUMENT_DATA, DOCUMENT_MAIN_ROOT } from '../constants';
import { ErrorProps } from '../components/Error';
import ErrorBoundary from '../components/ErrorBoundary';

export default function hydrate<P>(
  App: AppComponent,
  ErrorPage: ComponentType<ErrorProps>,
  Component: ComponentType<P>,
): void {
  const dataSource = document.getElementById(DOCUMENT_DATA);

  if (!dataSource) {
    throw new Error('missing DOCUMENT_DATA');
  }

  const parsedData = parse<P>(dataSource.textContent || '');

  ReactDOM.hydrate((
    <ErrorBoundary fallback={<ErrorPage statusCode={500} />}>
      <App
        Component={Component}
        pageProps={parsedData}
      />
    </ErrorBoundary>
  ), document.getElementById(DOCUMENT_MAIN_ROOT));
}
