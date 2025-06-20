import React from 'react';

/**
 * Error Boundary component to catch errors in the component tree
 * and display a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      // You can render any custom fallback UI
      if (fallback) {
        return fallback;
      }
      
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
            <div className="flex items-center mb-4">
              <div className="bg-red-500 w-1 h-8 mr-3 rounded-full"></div>
              <h2 className="text-xl font-bold">Something went wrong</h2>
            </div>
            
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              There was an error loading this component. Please try refreshing the page.
            </p>
            
            <details className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-4">
              <summary className="font-medium cursor-pointer">Technical Details</summary>
              <pre className="mt-2 text-sm overflow-auto p-2 bg-gray-200 dark:bg-gray-800 rounded">
                {error && error.toString()}
              </pre>
            </details>
            
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
