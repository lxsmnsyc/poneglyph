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

interface HydrationOptions {
  enableEcmason: boolean;
}

export default function hydrate<
  AppData,
  PageData,
  P extends Params = Params,
  Q extends Query = Query
>(
  CustomAppPage: AppPage<AppData>,
  CustomErrorPage: ErrorPage,
  Component: ComponentType,
  options: HydrationOptions,
): void {
  const dataSource = document.getElementById(DOCUMENT_DATA);

  if (!dataSource) {
    throw new Error('missing DOCUMENT_DATA');
  }

  const encodedData = dataSource.textContent || '{}';

  const parsedData = options.enableEcmason
    ? parse<PoneglyphData<AppData, PageData, P, Q>>(encodedData)
    : JSON.parse(encodedData) as PoneglyphData<AppData, PageData, P, Q>;

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
