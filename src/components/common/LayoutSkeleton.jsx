import React from 'react';
import { Skeleton } from './Skeleton';

/**
 * @file LayoutSkeleton.jsx
 * @description A skeleton loader component that mimics the main application layout.
 * It provides a static placeholder UI to be displayed while the actual layout and its content are loading.
 * This improves the user experience by reducing perceived load times.
 */

/**
 * Renders a skeleton placeholder for the main application layout.
 * This component is typically used with React.Suspense as a fallback UI.
 * @returns {React.Component} A div element representing the skeleton layout.
 */
const LayoutSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Skeleton for the Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Skeleton className="h-8 w-8 rounded mr-3" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>
      
            {/* Skeleton for the Main Content Area */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </main>
      
            {/* Skeleton for the Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </footer>
    </div>
  );
};

export default LayoutSkeleton;
