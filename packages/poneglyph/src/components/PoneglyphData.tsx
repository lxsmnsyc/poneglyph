import { createContext, useContext, useDebugValue } from 'react';
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

  useDebugValue(data);

  return data as PoneglyphData<AppData, PageData, P, Q>;
}

export function useAppData<AppData>(): AppData {
  const data = usePoneglyphData<AppData, any, any, any>().appData;
  useDebugValue(data);
  return data;
}

export function usePageData<PageData>(): PageData {
  const data = usePoneglyphData<any, PageData, any, any>().pageData;
  useDebugValue(data);
  return data;
}

export function useRouteParams<P extends Params = Params>(): P {
  const data = usePoneglyphData<any, any, P, any>().params;
  useDebugValue(data);
  return data;
}

export function useRouteQuery<Q extends Query = Query>(): Q {
  const data = usePoneglyphData<any, any, any, Q>().query;
  useDebugValue(data);
  return data;
}
