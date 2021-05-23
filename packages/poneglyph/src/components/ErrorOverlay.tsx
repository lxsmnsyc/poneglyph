import React, {
  CSSProperties,
  ErrorInfo,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { RawSourceMap, SourceMapConsumer } from 'source-map';
import { getSourceMap, sourceMapExists } from '../utils/source-map-url';
import ErrorBoundary, { ErrorBoundaryOnError } from './ErrorBoundary';

const sourceCodeContainerStyle: CSSProperties = {
  margin: '0.25rem',
  overflowX: 'scroll',
};

const sourceCodeLineStyle: CSSProperties = {
  fontSize: '0.75rem',
  lineHeight: '1rem',
  display: 'flex',
  whiteSpace: 'pre',
};

const sourceCodeIndexStyle: CSSProperties = {
  paddingLeft: '0.5rem',
  paddingRight: '0.5rem',
  borderRightWidth: '1px',
  borderRightStyle: 'solid',
  borderRightColor: 'black',
};

const sourceCodeContentSelectedStyle: CSSProperties = {
  paddingLeft: '0.5rem',
  backgroundColor: 'rgb(254, 202, 202)',
  width: '100%',
};

const sourceCodeContentStyle: CSSProperties = {
  paddingLeft: '0.5rem',
};

interface ErrorOverlayCodeViewProps {
  content: string;
  line: number;
}

function ErrorOverlayCodeView(
  {
    content,
    line,
  }: ErrorOverlayCodeViewProps,
): JSX.Element | null {
  const lines = content.split('\n').map((item, index) => ({
    index: index + 1,
    line: item,
  }));

  const actualLine = line - 1;

  const minLine = Math.max(actualLine - 3, 0);
  const maxLine = Math.min(actualLine + 4, lines.length - 1);

  return (
    <div style={sourceCodeContainerStyle}>
      {
        lines.slice(minLine, maxLine).map((item) => (
          <div key={item.index} style={sourceCodeLineStyle}>
            <div style={sourceCodeIndexStyle}>{item.index}</div>
            <div
              style={item.index === line
                ? sourceCodeContentSelectedStyle
                : sourceCodeContentStyle}
            >
              {item.line}
            </div>
          </div>
        ))
      }
    </div>
  );
}

interface ErrorOverlaySourceCodeProps {
  sourceMap: RawSourceMap;
  source: string;
  line: number;
}

function ErrorOverlaySourceCode(
  {
    sourceMap,
    line,
    source,
  }: ErrorOverlaySourceCodeProps,
): JSX.Element | null {
  const sourceIndex = sourceMap.sources.indexOf(source);

  if (sourceIndex === -1 || sourceMap.sourcesContent == null) {
    return null;
  }

  return (
    <ErrorOverlayCodeView
      content={sourceMap.sourcesContent[sourceIndex]}
      line={line}
    />
  );
}

interface ErrorOverlaySourceProps {
  value: string;
}

const sourceContainerStyle: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  marginTop: '0.5rem',
};

const sourceURLStyle: CSSProperties = {
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
};

const stackFrameButtonStyle: CSSProperties = {
  border: 'none',
  fontWeight: 500,
  padding: '0.625rem 0.375rem',
  fontSize: '0.75rem',
  lineHeight: '1rem',
  backgroundColor: 'none',
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
};

function ErrorOverlaySource({ value }: ErrorOverlaySourceProps): JSX.Element | null {
  const [show, setShow] = useState(false);
  const [compiled, setCompiled] = useState(false);

  const [originalSourceMap, setSourceMap] = useState<RawSourceMap>();
  const [originalSource, setOriginalSource] = useState<string>();
  const [originalLine, setOriginalLine] = useState<number>();
  const [originalColumn, setOriginalColumn] = useState<number>();

  const [compiledContent, setCompiledContent] = useState<string>();
  const [compiledSource, setCompiledSource] = useState<string>();
  const [compiledLine, setCompiledLine] = useState<number>();
  const [compiledColumn, setCompiledColumn] = useState<number>();

  useEffect(() => {
    const actualSource = value.substring(1, value.length - 1);
    const results = actualSource.split(':');

    const sourceURL = results.slice(0, results.length - 2).join(':');
    const line = results[results.length - 2];
    const column = results[results.length - 1];

    setCompiledSource(sourceURL);
    setCompiledLine(Number(line));
    setCompiledColumn(Number(column));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    SourceMapConsumer.initialize({
      'lib/mappings.wasm': 'https://www.unpkg.com/source-map/lib/mappings.wasm',
    });

    const processSource = async () => {
      const response = await fetch(sourceURL);
      const content = await response.text();

      setCompiledContent(content);

      if (sourceMapExists(content)) {
        const sourceMap = getSourceMap(content);

        if (sourceMap) {
          const baseURLSplit = sourceURL.split('/');
          const baseURL = baseURLSplit.slice(0, baseURLSplit.length - 1).join('/');
          const sourceMapResponse = await fetch(`${baseURL}/${sourceMap}`);
          const sourceMapContent: RawSourceMap = await sourceMapResponse.json() as RawSourceMap;

          const consumer = await new SourceMapConsumer(sourceMapContent);

          const result = consumer.originalPositionFor({
            line: Number(line),
            column: Number(column),
          });

          if (result.source) {
            setOriginalSource(result.source);
          }
          if (result.line) {
            setOriginalLine(result.line);
          }
          if (result.column) {
            setOriginalColumn(result.column);
          }

          setSourceMap(sourceMapContent);

          setShow(true);
        }
      }
    };

    processSource().catch((error) => {
      console.log(error);
    });
  }, [value]);

  if (!show) {
    return null;
  }

  if (compiled) {
    return (
      <div style={sourceContainerStyle}>
        {
          compiledSource && compiledLine && compiledContent && compiledColumn && (
            <>
              <span style={sourceURLStyle}>
                {`${compiledSource}:${compiledLine}:${compiledColumn}`}
              </span>
              <ErrorOverlayCodeView
                content={compiledContent}
                line={compiledLine}
              />
            </>
          )
        }
        <button
          type="button"
          style={stackFrameButtonStyle}
          onClick={() => {
            setCompiled(!compiled);
          }}
        >
          View original source
        </button>
      </div>
    );
  }

  return (
    <div style={sourceContainerStyle}>
      {
        originalSource && originalLine && originalSourceMap && originalColumn && (
          <>
            <span style={sourceURLStyle}>
              {`${originalSource.replace('../../../../', '')}:${originalLine}:${originalColumn}`}
            </span>
            <ErrorOverlaySourceCode
              sourceMap={originalSourceMap}
              line={originalLine}
              source={originalSource}
            />
          </>
        )
      }
      <button
        type="button"
        style={stackFrameButtonStyle}
        onClick={() => {
          setCompiled(!compiled);
        }}
      >
        View compiled source
      </button>
    </div>
  );
}

interface ErrorOverlayStackFrameProps {
  value: string;
}

const stackFrameContainerStyle: CSSProperties = {
  marginTop: '1rem',
  marginBottom: '1rem',
};

const stackFrameTitleStyle: CSSProperties = {
  fontSize: '1rem',
  lineHeight: '1.5rem',
};

const stackFrameComponentNameStyle: CSSProperties = {
  fontWeight: 500,
};

function ErrorOverlayStackFrame({ value }: ErrorOverlayStackFrameProps): JSX.Element {
  const [, component, source] = value.trim().split(' ');

  return (
    <div style={stackFrameContainerStyle}>
      <div style={stackFrameTitleStyle}>
        {'at '}
        <span style={stackFrameComponentNameStyle}>{component}</span>
      </div>
      {source && <ErrorOverlaySource value={source} />}
    </div>
  );
}

function ErrorOverlayStack({ componentStack }: ErrorInfo): JSX.Element {
  return (
    <div>
      {componentStack.split('\n').map((item) => item !== '' && (
        <ErrorOverlayStackFrame key={item} value={item} />
      ))}
    </div>
  );
}

interface ErrorOverlayFallback {
  error: Error;
  info: ErrorInfo;
}

const overlayContainerStyle: CSSProperties = {
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  margin: '2rem',
};

const overlayTitleStyle: CSSProperties = {
  fontSize: '1.25rem',
  lineHeight: '1.75rem',
  overflowWrap: 'normal',
  wordBreak: 'normal',
};

function ErrorOverlayFallback({ error, info }: ErrorOverlayFallback): JSX.Element {
  return (
    <div style={overlayContainerStyle}>
      <h1 style={overlayTitleStyle}>{`${error.name}: ${error.message}`}</h1>
      <ErrorOverlayStack componentStack={info.componentStack} />
    </div>
  );
}

export interface ErrorOverlayProps {
  children: ReactNode;
  onError?: ErrorBoundaryOnError;
}

export default function ErrorOverlay({ children, onError }: ErrorOverlayProps): JSX.Element {
  const [errorState, setErrorState] = useState<Error>();
  const [infoState, setInfoState] = useState<ErrorInfo>();

  const onErrorHandler: ErrorBoundaryOnError = (error, info) => {
    onError?.(error, info);

    setErrorState(error);
    setInfoState(info);
  };

  return (
    <ErrorBoundary
      fallback={(
        errorState && infoState && <ErrorOverlayFallback error={errorState} info={infoState} />
      )}
      onError={onErrorHandler}
    >
      {children}
    </ErrorBoundary>
  );
}
