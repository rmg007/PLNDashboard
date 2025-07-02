import React, { useEffect, useState } from 'react';
import CombinationChart from './CombinationChart';
import DepartmentTrendsChart from './DepartmentTrendsChart';
import StackedBarChart from './StackedBarChart';
import HorizontalBarChart from './TreemapChart';
import { Skeleton, SkeletonCard } from '../common/Skeleton';

/**
 * Dashboard Main Content component containing detailed charts and tables
 * @param {Object} props - Component props
 * @param {Object} props.chartData - Data for charts
 * @param {boolean} [props.isSidebarCollapsed=false] - Whether the sidebar is collapsed
 */
const DashboardMainContent = ({ 
  chartData = {}, 
  isSidebarCollapsed = false 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Track mount state for animations
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  const {
    permitVolumeData = [],
    deptActivityData = [],
    valuationRangeData = [],
    treemapData = []
  } = chartData;

  // Skeleton loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col space-y-6">
        {[1, 2, 3, 4].map((_, i) => (
          <SkeletonCard key={`chart-skeleton-${i}`} className="p-6">
            <Skeleton className="h-6 w-64 mb-6" />
            <Skeleton className="h-80 w-full mb-2" />
            {i % 2 === 0 && (
              <Skeleton className="h-4 w-3/4 mt-4" />
            )}
          </SkeletonCard>
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`h-full flex flex-col space-y-6 transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-0' : ''
      }`}
      aria-live="polite"
      aria-busy={isLoading}
    >
      {/* Combination Chart */}
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 transition-all duration-300 ${
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{
          transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
          transitionDelay: '0.1s'
        }}
      >
        <h2 
          className="text-lg font-semibold mb-4 text-gray-900 dark:text-white"
          id="permit-volume-valuation-title"
        >
          Permit Volume & Valuation Trends
        </h2>
        <div className="h-80">
          <CombinationChart
            data={permitVolumeData}
            title=""
            xAxisTitle="Fiscal Year"
            yAxisTitle="Permit Count"
            y2AxisTitle="Average Valuation ($)"
            xField="year"
            barField="permitCount"
            lineField="avgValuation"
            barColor="rgb(54, 162, 235)"
            lineColor="rgb(255, 99, 132)"
            ariaLabelledBy="permit-volume-valuation-title"
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Combination chart showing permit volume (bars) and average valuation (line) over time.
        </p>
      </div>
      
      {/* Department Activity Trends */}
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 transition-all duration-300 ${
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{
          transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
          transitionDelay: '0.2s'
        }}
      >
        <h2 
          className="text-lg font-semibold mb-4 text-gray-900 dark:text-white"
          id="dept-activity-title"
        >
          Department Activity Trends
        </h2>
        <div className="h-80">
          <DepartmentTrendsChart 
            data={chartData.departmentActivity || []} 
            title="" 
            xAxisTitle="Fiscal Year"
            yAxisTitle="Activity Count"
            ariaLabelledBy="dept-activity-title"
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Trends showing department activity levels over time with total activity overlay.
        </p>
      </div>
      
      {/* Two-Column Layout for Stacked Bar and Treemap */}
      <div 
        className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-300 ${
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{
          transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
          transitionDelay: '0.3s'
        }}
      >
        {/* Stacked Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <h2 
            className="text-lg font-semibold mb-4 text-gray-900 dark:text-white"
            id="permit-volume-range-title"
          >
            Permit Volume by Valuation Range
          </h2>
          <div className="h-80">
            <StackedBarChart
              data={valuationRangeData}
              title=""
              xAxisTitle="Fiscal Year"
              yAxisTitle="Permit Count"
              xField="year"
              categories={['<$100K', '$100K-$1M', '$1M-$10M', '>$10M']}
              colors={['#3366CC', '#DC3912', '#FF9900', '#109618']}
              ariaLabelledBy="permit-volume-range-title"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Stacked bar chart showing permit volume distribution across different valuation ranges.
          </p>
        </div>
        
        {/* Horizontal Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <h2 
            className="text-lg font-semibold mb-4 text-gray-900 dark:text-white"
            id="permit-distribution-title"
          >
            Permit Distribution by Category
          </h2>
          <div className="h-80">
            <HorizontalBarChart 
              data={chartData.permitDistribution || []} 
              title="" 
              xAxisTitle="Number of Permits"
              yAxisTitle="Category"
              labelField="category"
              valueField="value"
              color="#3B82F6"
              ariaLabelledBy="permit-distribution-title"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Horizontal bar chart showing the distribution of permits across different categories.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardMainContent;
