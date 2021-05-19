import React, {
  createContext,
  DetailedHTMLProps,
  FC,
  HtmlHTMLAttributes,
  ReactNode,
  useContext,
} from 'react';
import { DOCUMENT_DATA, DOCUMENT_MAIN_ROOT } from '../constants';

interface DocumentContextValue {
  html: string;
  head: ReactNode[];
  tail: ReactNode[];
  data: string;
  scriptURL: string;
  styleURL: string;
}

export const DocumentContext = /* @__PURE__ */ (
  createContext<DocumentContextValue | undefined>(undefined)
);

export const DocumentHead: FC = ({ children }) => {
  const context = useContext(DocumentContext);
  return (
    <head>
      {children}
      {context?.head}
      <link
        rel="stylesheet"
        href={context?.styleURL ?? ''}
      />
    </head>
  );
};

export const DocumentMain: FC = () => {
  const context = useContext(DocumentContext);

  return (
    <div
      id={DOCUMENT_MAIN_ROOT}
      dangerouslySetInnerHTML={{
        __html: context?.html ?? '',
      }}
    />
  );
};

export const DocumentTail: FC = ({ children }) => {
  const context = useContext(DocumentContext);
  return (
    <>
      {children}
      {context?.tail}
    </>
  );
};

export const DocumentScript: FC = () => {
  const context = useContext(DocumentContext);

  return (
    <>
      <script
        type="application/json"
        id={DOCUMENT_DATA}
        dangerouslySetInnerHTML={{
          __html: context?.data ?? '',
        }}
      />
      <script
        type="module"
        src={context?.scriptURL ?? ''}
      />
    </>
  );
};

export const DocumentHtml: FC = ({ lang, ...props }: DetailedHTMLProps<
  HtmlHTMLAttributes<HTMLHtmlElement>,
  HTMLHtmlElement
>) => (
  <html
    {...props}
    lang={lang ?? 'en'}
  />
);

export const DefaultDocument: FC = () => (
  <DocumentHtml>
    <DocumentHead />
    <body>
      <DocumentMain />
      <DocumentScript />
      <DocumentTail />
    </body>
  </DocumentHtml>
);
