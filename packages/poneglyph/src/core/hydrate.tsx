import React, { ComponentType, StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { parse } from 'ecmason';
import { DOCUMENT_DATA, DOCUMENT_MAIN_ROOT } from '../constants';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  AppPage,
  ErrorPage,
  Params,
  PoneglyphData,
  Query,
} from './types';
import { PoneglyphDataContext } from '../components/PoneglyphData';

export default function hydrate<
  AppData,
  PageData,
  P extends Params = Params,
  Q extends Query = Query
>(
  CustomAppPage: AppPage<AppData>,
  CustomErrorPage: ErrorPage,
  Component: ComponentType,
): void {
  const dataSource = document.getElementById(DOCUMENT_DATA);

  if (!dataSource) {
    throw new Error('missing DOCUMENT_DATA');
  }

  const parsedData = parse<PoneglyphData<AppData, PageData, P, Q>>(
    dataSource.textContent || '{}',
  );

  ReactDOM.hydrate((
    <StrictMode>
      <ErrorBoundary
        fallback={<CustomErrorPage.Component statusCode={500} />}
        onError={CustomErrorPage.onError}
      >
        <PoneglyphDataContext.Provider value={parsedData}>
          <CustomAppPage.Component
            Component={Component}
          />
        </PoneglyphDataContext.Provider>
      </ErrorBoundary>
    </StrictMode>
  ), document.getElementById(DOCUMENT_MAIN_ROOT));
}
