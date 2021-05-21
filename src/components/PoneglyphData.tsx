import { createContext, useContext } from 'react';
import { Params, PoneglyphData, Query } from '../core/types';

export const PoneglyphDataContext = (
  createContext<PoneglyphData<any, any, any, any> | undefined>(undefined)
);

export function usePoneglyphData<
  AppData,
  PageData,
  P extends Params = Params,
  Q extends Query = Query,
>(): PoneglyphData<AppData, PageData, P, Q> {
  const data = useContext(PoneglyphDataContext);

  if (!data) {
    throw new Error('Missing poneglyph data');
  }

  return data as PoneglyphData<AppData, PageData, P, Q>;
}

export function useAppData<AppData>(): AppData {
  return usePoneglyphData<AppData, any, any, any>().appData;
}

export function usePageData<PageData>(): PageData {
  return usePoneglyphData<any, PageData, any, any>().pageData;
}

export function useRouteParams<P extends Params = Params>(): P {
  return usePoneglyphData<any, any, P, any>().params;
}

export function useRouteQuery<Q extends Query = Query>(): Q {
  return usePoneglyphData<any, any, any, Q>().query;
}
