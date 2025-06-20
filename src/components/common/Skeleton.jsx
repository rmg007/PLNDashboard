import React from 'react';

export const Skeleton = ({ className = '', ...props }) => (
  <div 
    className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}
    {...props}
  />
);

export const SkeletonText = ({ lines = 1, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} 
        />
      ))}
    </div>
  );
};

export const SkeletonCard = ({ className = '', children }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}>
    {children}
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="space-y-2">
    {/* Header */}
    <div className="flex space-x-2 mb-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} className="h-6 flex-1" />
      ))}
    </div>
    
    {/* Rows */}
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex space-x-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              className="h-12 flex-1" 
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonChart = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}>
    <Skeleton className="h-6 w-48 mb-4" />
    <div className="h-64 relative">
      <Skeleton className="h-full w-full" />
    </div>
  </div>
);

export const SkeletonKPICard = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}>
    <Skeleton className="h-5 w-3/4 mb-2" />
    <Skeleton className="h-8 w-1/2 mb-3" />
    <SkeletonText lines={2} />
  </div>
);
