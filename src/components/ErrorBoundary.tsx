import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * [GLOBAL] Error Boundary
 * Contains a rendering error to the area it wraps so a single broken page or content block
 * does not blank the whole site. The fallback reuses the site's existing label and body styles.
 */
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Page failed to render:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div role="alert" className="px-6 lg:px-20 pt-32 pb-16 max-w-4xl mx-auto">
        <span className="eyebrow text-muted">Something went wrong</span>
        <p className="mt-6 text-lg lg:text-xl font-light text-ink/80">
          This page could not be displayed.{' '}
          <a href="/" className="underline underline-offset-4">Return to the home page</a>
        </p>
      </div>
    );
  }
}
