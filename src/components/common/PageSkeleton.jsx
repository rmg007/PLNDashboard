import React from 'react';
import { Skeleton, SkeletonCard } from './Skeleton';

/**
 * A full-page loading skeleton that matches the layout of the main pages
 */
const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Skeleton */}
        <div className="w-full lg:w-1/4 space-y-6">
          <SkeletonCard className="p-4">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} className="p-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-16 w-full" />
                </SkeletonCard>
              ))}
            </div>
          </SkeletonCard>
          
          <SkeletonCard className="p-4">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-64 w-full" />
          </SkeletonCard>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="w-full lg:w-3/4 space-y-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} className="p-6">
              <Skeleton className="h-6 w-64 mb-6" />
              <Skeleton className="h-80 w-full mb-2" />
              {i % 2 === 0 && (
                <Skeleton className="h-4 w-3/4 mt-4" />
              )}
            </SkeletonCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;
