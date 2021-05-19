import { AppProps } from "poneglyph";
import React from "react";

export default function App<P>({ Component, pageProps }: AppProps<P>): JSX.Element {
  return <Component {...pageProps} />
}
