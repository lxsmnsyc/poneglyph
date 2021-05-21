import React, { AnchorHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react';

import Head from './Head';

type AnchorProps = DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>;

type ExcludeHrefProps = Omit<AnchorProps, 'href'>;

export interface LinkProps extends ExcludeHrefProps {
  href: string;
  children: ReactNode;
}

const Link = ({ href, children, ...props }: LinkProps): JSX.Element => (
  <>
    <Head>
      <link rel="prefetch" href={href} as="document" />
    </Head>
    <a
      href={href}
      {...props}
    >
      {children}
    </a>
  </>
);

export default Link;
