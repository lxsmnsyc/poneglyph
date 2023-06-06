import type { LoadResult, PageRouterConfig } from 'poneglyph-router';
import { Router, definePageRouter } from 'poneglyph-router';
import type { ReactNode } from 'react';
import ReactDOMClient from 'react-dom/client';

interface WindowWithSSRData {
  SSR_DATA: LoadResult<any>[];
}

declare const window: Window & WindowWithSSRData;

export interface ClientEntryOptions {
  routes: {
    pages: PageRouterConfig;
  };
  Root: (props: { children: ReactNode }) => JSX.Element;
}

export function createClientEntry(options: ClientEntryOptions): void {
  const pageRouter = definePageRouter(options.routes.pages);
  ReactDOMClient.hydrateRoot(
    document,
    <options.Root>
      <Router
        location={window.location}
        routes={pageRouter.tree}
        data={window.SSR_DATA}
      />
    </options.Root>,
  );
}
