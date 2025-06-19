import React from 'react';

/**
 * Data Metrics Card component
 * @param {Object} props - Component props
 * @param {Object} props.metrics - Metrics data
 */
const DataMetricsCard = ({ metrics = {} }) => {
  const {
    avgProcessingDays = 21,
    completionRate = 87,
    approvalRate = 92,
    revisionRate = 15
  } = metrics;

  return (
    <div className="h-full">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Key Metrics</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Processing Time Metric */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Avg. Processing</p>
              <h4 className="text-xl font-bold text-blue-800 dark:text-blue-200">{avgProcessingDays} days</h4>
            </div>
            <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Completion Rate Metric */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-700 dark:text-green-300 font-medium">Completion Rate</p>
              <h4 className="text-xl font-bold text-green-800 dark:text-green-200">{completionRate}%</h4>
            </div>
            <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Approval Rate Metric */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">Approval Rate</p>
              <h4 className="text-xl font-bold text-purple-800 dark:text-purple-200">{approvalRate}%</h4>
            </div>
            <div className="bg-purple-100 dark:bg-purple-800 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Revision Rate Metric */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Revision Rate</p>
              <h4 className="text-xl font-bold text-amber-800 dark:text-amber-200">{revisionRate}%</h4>
            </div>
            <div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 dark:text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
        <div className="flex items-center">
          <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Metrics based on permits processed in the current fiscal year. Updated monthly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataMetricsCard;
