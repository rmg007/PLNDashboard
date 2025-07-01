import React from 'react';

/**
 * Error Boundary component to catch errors in the component tree
 * and display a fallback UI instead of crashing the whole app
 */
/**
 * @class ErrorBoundary
 * @extends React.Component
 * @description A React class component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * It's a key component for building resilient applications.
 */
class ErrorBoundary extends React.Component {
    /**
   * The constructor initializes the component's state.
   * `hasError` is a flag that determines whether to show the fallback UI.
   * `error` and `errorInfo` store the error details for display or logging.
   * @param {object} props - The props passed to the component.
   */
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

    /**
   * This lifecycle method is invoked after an error has been thrown by a descendant component.
   * It receives the error that was thrown as a parameter and should return a value to update state.
   * It's used to trigger a re-render with the fallback UI.
   * @param {Error} error - The error that was thrown.
   * @returns {object} An object to update the state.
   */
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

    /**
   * This lifecycle method is also called after an error in a descendant component has been thrown.
   * It's used for side effects, like logging the error to an external service.
   * It receives both the error and an object with a `componentStack` key.
   * @param {Error} error - The error that was thrown.
   * @param {object} errorInfo - An object with a `componentStack` property.
   */
  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

    /**
   * The render method.
   * If an error has occurred (`this.state.hasError` is true), it renders a fallback UI.
   * Otherwise, it renders the child components as usual.
   * @returns {React.Component} The fallback UI or the children components.
   */
  render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

        // If an error was caught, render the fallback UI.
    if (hasError) {
      // You can render any custom fallback UI
            // A custom fallback component can be passed as a prop for more flexibility.
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

        // If there is no error, render the children components as normal.
    return children;
  }
}

export default ErrorBoundary;
