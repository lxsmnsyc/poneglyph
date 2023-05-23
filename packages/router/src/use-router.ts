import { createContext, useContext } from 'react';
import type { RouterParams } from './router-node';
import type { UseLocation } from './use-location';
import assert from './assert';

export interface RouterInstance<P extends RouterParams = RouterParams> extends UseLocation {
  params: P;
}

export const LocationContext = createContext<UseLocation | undefined>(undefined);
export const ParamsContext = createContext<RouterParams | undefined>(undefined);

export function useRouter<P extends RouterParams>(): RouterInstance<P> {
  const location = useContext(LocationContext);
  const params = useContext(ParamsContext);
  assert(location, new Error('useRouter must be used in a component within <Router>'));
  return {
    ...location,
    params: (params ?? {}) as P,
  };
}
