import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

export interface ErrorBoundaryState {
  error?: {
    value: Error;
    info: ErrorInfo;
  };
}

export interface ErrorBoundaryFallbackProps {
  error: Error;
  info: ErrorInfo;
  reset: () => void;
}

export interface ErrorBoundaryProps {
  Fallback?: (props: ErrorBoundaryFallbackProps) => JSX.Element;
  children?: ReactNode;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {};
  }

  componentDidCatch(value: Error, info: ErrorInfo): void {
    if (this.state.error) {
      throw value;
    } else {
      this.setState({
        error: {
          value,
          info,
        },
      });
    }
  }

  reset = (): void => {
    this.setState({
      error: undefined,
    });
  };

  render(): JSX.Element {
    const { error } = this.state;
    const { Fallback } = this.props;
    if (error) {
      if (Fallback) {
        return (
          <Fallback error={error.value} info={error.info} reset={this.reset} />
        );
      }
      throw error;
    }

    return <>{this.props.children}</>;
  }
}
