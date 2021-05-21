import React, { ComponentType } from 'react';
import ReactDOM from 'react-dom';
import { parse } from 'ecmason';
import { DOCUMENT_DATA, DOCUMENT_MAIN_ROOT } from '../constants';
import ErrorBoundary from '../components/ErrorBoundary';
import { AppPage, ErrorPage } from './types';

export default function hydrate<P>(
  CustomAppPage: AppPage,
  CustomErrorPage: ErrorPage,
  Component: ComponentType<P>,
): void {
  const dataSource = document.getElementById(DOCUMENT_DATA);

  if (!dataSource) {
    throw new Error('missing DOCUMENT_DATA');
  }

  const parsedData = parse<P>(dataSource.textContent || '');

  const CustomApp = CustomAppPage<P>();

  ReactDOM.hydrate((
    <ErrorBoundary
      fallback={<CustomErrorPage.Component statusCode={500} />}
      onError={CustomErrorPage.onError}
    >
      <CustomApp
        Component={Component}
        pageProps={parsedData}
      />
    </ErrorBoundary>
  ), document.getElementById(DOCUMENT_MAIN_ROOT));
}
