import React, { ComponentType, StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { parse } from 'ecmason';
import {
  getCLS,
  getFCP,
  getFID,
  getLCP,
  getTTFB,
} from 'web-vitals';
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
import ErrorOverlay from '../components/ErrorOverlay';

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

  if (CustomAppPage.reportWebVitals) {
    getCLS(CustomAppPage.reportWebVitals);
    getFCP(CustomAppPage.reportWebVitals);
    getFID(CustomAppPage.reportWebVitals);
    getLCP(CustomAppPage.reportWebVitals);
    getTTFB(CustomAppPage.reportWebVitals);
  }

  const encodedData = dataSource.textContent || '{}';

  const parsedData = options.enableEcmason
    ? parse<PoneglyphData<AppData, PageData, P, Q>>(encodedData)
    : JSON.parse(encodedData) as PoneglyphData<AppData, PageData, P, Q>;

  const Page = () => <Component {...parsedData.pageData} />;

  ReactDOM.hydrate((
    <StrictMode>
      {
        process.env.NODE_ENV === 'production'
          ? (
            <ErrorBoundary
              fallback={<CustomErrorPage.Component statusCode={500} />}
              onError={CustomErrorPage.onError}
            >
              <PoneglyphDataContext.Provider value={parsedData}>
                <CustomAppPage.Component
                  Component={Page}
                />
              </PoneglyphDataContext.Provider>
            </ErrorBoundary>
          )
          : (
            <ErrorOverlay
              onError={CustomErrorPage.onError}
            >
              <PoneglyphDataContext.Provider value={parsedData}>
                <CustomAppPage.Component
                  Component={Page}
                />
              </PoneglyphDataContext.Provider>
            </ErrorOverlay>
          )
      }
    </StrictMode>
  ), document.getElementById(DOCUMENT_MAIN_ROOT));
}
