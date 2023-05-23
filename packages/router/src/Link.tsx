import { useEffect, useRef, useState } from 'react';
import { useRouter } from './Router';
import { isLocalURL, isModifiedEvent } from './utilities';

export type BaseAnchorAttributes = JSX.IntrinsicElements['a'];

export interface LinkProps extends BaseAnchorAttributes {
  href: string;
  scroll?: ScrollBehavior;
  replace?: boolean;
  prefetch?: boolean;
}

export default function Link(
  {
    href,
    scroll,
    replace,
    prefetch,
    children,
    ...props
  }: LinkProps,
): JSX.Element {
  const router = useRouter();
  const anchorRef = useRef<HTMLAnchorElement | null>();

  // Override click behavior
  useEffect(() => {
    const onClick = (ev: MouseEvent): void => {
      if (isModifiedEvent(ev) || !isLocalURL(href)) {
        return;
      }
      ev.preventDefault();

      // avoid scroll for urls with anchor refs
      let shouldScroll = scroll;
      if (shouldScroll == null && href.includes('#')) {
        shouldScroll = undefined;
      }

      router[replace ? 'replace' : 'push'](href, {
        scroll,
      });
    };

    const currentAnchor = anchorRef.current;

    if (currentAnchor) {
      currentAnchor.addEventListener('click', onClick);
      return () => {
        currentAnchor.removeEventListener('click', onClick);
      };
    }
    return undefined;
  });

  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const currentAnchor = anchorRef.current;
    if (!currentAnchor) {
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === currentAnchor && entry.isIntersecting) {
          // Host intersected, set visibility to true
          setVisible(true);

          // Stop observing
          observer.disconnect();
        }
      });
    });

    observer.observe(currentAnchor);

    return () => {
      observer.unobserve(currentAnchor);
      observer.disconnect();
    };
  }, []);

  // Lazy prefetching
  useEffect(() => {
    const shouldPrefetch = (prefetch ?? true) && visible && isLocalURL(href);
    if (shouldPrefetch) {
      router.prefetch(href).catch((err: Error) => {
        setError(err);
      });
    }
  });

  // Priotized prefetching on mouse enter
  useEffect(() => {
    const currentAnchor = anchorRef.current;
    if (!currentAnchor) {
      return undefined;
    }
    const shouldPrefetch = (prefetch ?? true) && isLocalURL(href);
    const onMouseEnter = (): void => {
      if (shouldPrefetch) {
        router.prefetch(href, true).catch((err: Error) => {
          setError(err);
        });
      }
    };

    currentAnchor.addEventListener('mouseenter', onMouseEnter);
    return () => {
      currentAnchor.removeEventListener('mouseenter', onMouseEnter);
    };
  });

  return (
    <a
      {...props}
      ref={(el): void => {
        anchorRef.current = el;
      }}
      href={href}
    >
      {children}
    </a>
  );
}
