import React from 'react';
import { Button } from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] w-full text-center gap-3 text-xs border border-white/5 bg-white/[0.01] rounded-xl p-6">
          <span className="text-danger-red font-bold text-sm uppercase">Unable to load this section</span>
          <p className="text-text-secondary max-w-xs leading-relaxed">
            An unexpected error occurred while rendering the data controls.
          </p>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => this.setState({ hasError: false })}
          >
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
