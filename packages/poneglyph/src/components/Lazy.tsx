import { useForceUpdate } from '@lyonph/react-hooks';
import React, {
  ComponentType,
  ReactNode,
  useEffect,
} from 'react';

export interface LazyOptions {
  fallback: ReactNode | (() => ReactNode);
}

interface LazyComponentExport<P> {
  default: ComponentType<P>;
}

type LazyComponent<P> = ComponentType<P> | LazyComponentExport<P>;

interface Pending {
  status: 'pending';
  value?: undefined;
}

interface Success<T> {
  status: 'success';
  value: T;
}

interface Failure {
  status: 'failure';
  value: any;
}

type Result<T> = Pending | Success<T> | Failure;

export default function lazy<P>(
  load: () => Promise<LazyComponent<P>>,
  options?: LazyOptions,
): ComponentType<P> {
  let localState: Result<LazyComponent<P>> = {
    status: 'pending',
  };

  function loadComponent(): Promise<void> {
    return load().then((value) => {
      localState = {
        status: 'success',
        value,
      };
    }, (value: any) => {
      localState = {
        status: 'failure',
        value,
      };
    });
  }

  return (props: P) => {
    const forceUpdate = useForceUpdate();

    useEffect(() => {
      let mounted = true;

      loadComponent().finally(() => {
        if (mounted) {
          forceUpdate();
        }
      });

      return () => {
        mounted = false;
      };
    }, [forceUpdate]);

    if (localState.status === 'pending') {
      if (typeof options?.fallback === 'function') {
        return <>{options?.fallback()}</>;
      }
      return <>{options?.fallback}</>;
    }
    if (localState.status === 'failure') {
      throw localState.value;
    }

    const Component = 'default' in localState.value
      ? localState.value.default
      : localState.value;
    return <Component {...props} />;
  };
}
