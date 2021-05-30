import React, {
  ComponentType,
  ReactNode,
  useEffect,
  useState,
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
  return (props: P) => {
    const [state, setState] = useState<Result<LazyComponent<P>>>({
      status: 'pending',
    });

    useEffect(() => {
      let mounted = true;

      load().then(
        (value) => {
          if (mounted) {
            setState({
              status: 'success',
              value,
            });
          }
        },
        (value: any) => {
          if (mounted) {
            setState({
              status: 'failure',
              value,
            });
          }
        },
      );

      return () => {
        mounted = false;
      };
    }, []);

    if (state.status === 'pending') {
      if (typeof options?.fallback === 'function') {
        return <>{options?.fallback()}</>;
      }
      return <>{options?.fallback}</>;
    }
    if (state.status === 'failure') {
      throw state.value;
    }

    const Component = 'default' in state.value
      ? state.value.default
      : state.value;
    return <Component {...props} />;
  };
}
