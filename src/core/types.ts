import { FC } from 'react';

export interface Dictionary {
  [key: string]: string;
}

export interface Props {
  [key: string]: number | string | boolean | null | Props[] | Props;
}

export interface BuildFullOptions {
  buildDir: string;
  pagesDir: string;
  target: string;
  env: Dictionary;
  tsconfig?: string;
}

export type BuildOptions = Partial<BuildFullOptions>;

export type BundleType = 'browser' | 'node';

export interface GetServerSidePropsBase<P extends Props = Props> {
  type: 'props';
  props: P;
}

export interface GetServerSidePropsNotFound {
  type: 'not-found';
  notFound: boolean;
}

export interface GetServerSidePropsRedirect {
  type: 'redirect';
  redirect: string;
  permanent?: boolean;
}

export type GetServerSidePropsResult<P extends Props = Props> =
  | GetServerSidePropsBase<P>
  | GetServerSidePropsNotFound
  | GetServerSidePropsRedirect;

export type GetServerSideProps<P extends Props = Props> =
  () => GetServerSidePropsResult<P>;

export type PageRender<P extends Props = Props> = FC<P>;

export interface PoneglyphPage<P extends Props = Props> {
  getServerSideProps?: GetServerSideProps<P>;
  default: PageRender<P>;
}

export interface PoneglyphPages {
  [key: string]: PoneglyphPage;
}
