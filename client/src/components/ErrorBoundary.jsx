import { Component } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FBF8F1] p-4">
          <div className="card max-w-lg w-full !p-8 text-center space-y-4 shadow-xl border border-red-500/20 bg-white">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-500">
              <FaExclamationTriangle size={32} />
            </div>
            <h1 className="text-2xl font-black text-[#0E4429]" style={{ fontFamily: 'var(--font-heading)' }}>
              Oops! Something went wrong.
            </h1>
            <p className="text-sm font-medium text-[#3a4a40] leading-relaxed">
              We encountered an unexpected error while loading this page. Our technical team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 btn-primary !px-8 shadow-md"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-6 text-left bg-gray-100 p-4 rounded text-xs text-red-600 overflow-auto">
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
