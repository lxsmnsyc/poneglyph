import React, { ComponentType } from 'react';
import ReactDOM from 'react-dom';
import { parse } from 'ecmason';
import { AppComponent } from '../components/App';
import { DOCUMENT_DATA, DOCUMENT_MAIN_ROOT } from '../constants';

export default function hydrate<P>(App: AppComponent, Component: ComponentType<P>): void {
  const dataSource = document.getElementById(DOCUMENT_DATA);

  if (!dataSource) {
    throw new Error('missing DOCUMENT_DATA');
  }

  const parsedData = parse<P>(dataSource.textContent || '');

  ReactDOM.hydrate((
    <App
      Component={Component}
      pageProps={parsedData}
    />
  ), document.getElementById(DOCUMENT_MAIN_ROOT));
}
