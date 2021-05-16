import React, { ComponentType } from 'react';

export interface AppProps<P> {
  Component: ComponentType<P>;
  pageProps: P;
}

export type AppComponent = <P>(props: AppProps<P>) => JSX.Element;

const DefaultApp: AppComponent = ({ Component, pageProps }) => (
  <Component {...pageProps} />
);

export default DefaultApp;
