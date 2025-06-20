import React, { useId, useEffect, useState } from 'react';
import KPICard from './KPICard';
import PermitTypePieChart from './PermitTypePieChart';
import DataMetricsCard from './DataMetricsCard';
import { Skeleton, SkeletonText, SkeletonCard } from '../Common/Skeleton';

/**
 * Dashboard Sidebar component containing KPI cards and summary information
 * @param {Object} props - Component props
 * @param {Object} props.kpiData - Data for KPI cards
 * @param {Object} props.chartData - Data for charts
 * @param {boolean} [props.isCollapsed=false] - Whether the sidebar is collapsed
 * @param {Function} [props.onToggleCollapse] - Callback when collapse state changes
 * @param {string} [props.componentId=''] - Unique ID for the component
 */
const DashboardSidebar = ({ 
  kpiData = {}, 
  chartData = {}, 
  isCollapsed = false, 
  onToggleCollapse,
  componentId = '' 
}) => {
  // Generate unique IDs for sidebar sections
  const sectionIds = {
    kpiCards: `kpi-cards-${componentId}`,
    totalPermitsCard: `total-permits-card-${componentId}`,
    avgValuationCard: `avg-valuation-card-${componentId}`,
    deptActivityCard: `dept-activity-card-${componentId}`,
    monthlyTrendCard: `monthly-trend-card-${componentId}`,
    permitTypeChart: `permit-type-chart-${componentId}`,
    dataMetricsCard: `data-metrics-card-${componentId}`
  };
  const {
    totalPermits = { value: 0, trend: 'neutral', trendValue: '0%', sparklineData: [] },
    avgValuation = { value: 0, trend: 'neutral', trendValue: '0%', sparklineData: [] },
    deptActivity = { value: 0, trend: 'neutral', trendValue: '0%', sparklineData: [] },
    monthlyTrend = { value: 0, trend: 'neutral', trendValue: '0%', sparklineData: [] }
  } = kpiData;

  // State for local loading state
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state if kpiData is empty
  useEffect(() => {
    if (Object.keys(kpiData).length > 0) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [kpiData]);

  // Handle toggle collapse with keyboard
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleCollapse?.();
    }
  };

  return (
    <div 
      className={`h-full flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-full'}`}
      role="complementary"
      aria-label={isCollapsed ? 'Collapsed dashboard sidebar' : 'Dashboard sidebar with key performance indicators and metrics'}
    >
      {/* Collapse/Expand Button */}
      {onToggleCollapse && !isLoading && (
        <button
          onClick={onToggleCollapse}
          onKeyDown={handleKeyDown}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md mb-4 flex items-center justify-center"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
        >
          <svg 
            className="w-5 h-5 text-gray-500 dark:text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            )}
          </svg>
          {!isCollapsed && <span className="ml-2 text-sm">Collapse</span>}
        </button>
      )}
      {/* KPI Cards Section */}
      <section 
        id={sectionIds.kpiCards}
        className={`grid ${isCollapsed ? 'grid-cols-1' : 'grid-cols-1'} gap-4 mb-6`}
        aria-label={isCollapsed ? 'Key Performance Indicators (collapsed)' : 'Key Performance Indicators'}
      >
        {isLoading ? (
          // Skeleton loading state
          Array(4).fill(0).map((_, i) => (
            <SkeletonCard key={`kpi-skeleton-${i}`} className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-8 w-1/2 mb-2" />
              <SkeletonText lines={1} className="w-1/3" />
            </SkeletonCard>
          ))
        ) : isCollapsed ? (
          // Collapsed view - show only icons in a fragment
          <>
            <div 
              id={sectionIds.totalPermitsCard}
              className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Total Permits (2024)"
            >
              <span className="text-2xl" role="img" aria-hidden="true">📊</span>
              <span className="sr-only">Total Permits: {totalPermits.value.toLocaleString()}</span>
              <span className="text-xs mt-1 text-center truncate w-full" aria-hidden="true">
                {totalPermits.value > 999 ? `${Math.round(totalPermits.value / 1000)}k` : totalPermits.value}
              </span>
            </div>
            
            <div 
              id={sectionIds.avgValuationCard}
              className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Average Valuation"
            >
              <span className="text-2xl" role="img" aria-hidden="true">💰</span>
              <span className="sr-only">Average Valuation: ${avgValuation.value.toLocaleString()}</span>
              <span className="text-xs mt-1 text-center truncate w-full" aria-hidden="true">
                ${avgValuation.value > 999 ? `${Math.round(avgValuation.value / 1000)}k` : avgValuation.value}
              </span>
            </div>
        
            <div 
              id={sectionIds.deptActivityCard}
              className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Department Activity"
            >
              <span className="text-2xl" role="img" aria-hidden="true">🗂️</span>
              <span className="sr-only">Department Activity: {deptActivity.value.toLocaleString()}</span>
              <span className="text-xs mt-1 text-center truncate w-full" aria-hidden="true">
                {deptActivity.value > 999 ? `${Math.round(deptActivity.value / 1000)}k` : deptActivity.value}
              </span>
            </div>
            
            <div 
              id={sectionIds.monthlyTrendCard}
              className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Monthly Trend"
            >
              <span className="text-2xl" role="img" aria-hidden="true">📈</span>
              <span className="sr-only">Monthly Trend: {monthlyTrend.value}</span>
              <span className="text-xs mt-1 text-center truncate w-full" aria-hidden="true">
                {monthlyTrend.trend === 'up' ? '↑' : monthlyTrend.trend === 'down' ? '↓' : '→'} {monthlyTrend.trendValue}
              </span>
            </div>
          </>
      ) : (
        // Expanded view - show full KPI cards
        <>
          <div id={sectionIds.totalPermitsCard}>
            <KPICard
              id={`${sectionIds.totalPermitsCard}-card`}
              title="Total Permits (2024)"
              value={totalPermits.value.toLocaleString()}
              icon="📊"
              sparklineData={totalPermits.sparklineData}
              trend={totalPermits.trend}
              trendValue={totalPermits.trendValue}
              color="blue"
              aria-describedby={`${sectionIds.totalPermitsCard}-desc`}
            />
            <p id={`${sectionIds.totalPermitsCard}-desc`} className="sr-only">
              Total number of permits issued in 2024
            </p>
          </div>
          
          <div id={sectionIds.avgValuationCard}>
            <KPICard
              id={`${sectionIds.avgValuationCard}-card`}
              title="Avg. Valuation"
              value={`$${avgValuation.value.toLocaleString()}`}
              icon="💰"
              sparklineData={avgValuation.sparklineData}
              trend={avgValuation.trend}
              trendValue={avgValuation.trendValue}
              color="green"
              aria-describedby={`${sectionIds.avgValuationCard}-desc`}
            />
            <p id={`${sectionIds.avgValuationCard}-desc`} className="sr-only">
              Average valuation of all permits
            </p>
          </div>
          
          <div id={sectionIds.deptActivityCard}>
            <KPICard
              id={`${sectionIds.deptActivityCard}-card`}
              title="Dept. Activity"
              value={deptActivity.value.toLocaleString()}
              icon="🗂️"
              sparklineData={deptActivity.sparklineData}
              trend={deptActivity.trend}
              trendValue={deptActivity.trendValue}
              color="purple"
              aria-describedby={`${sectionIds.deptActivityCard}-desc`}
            />
            <p id={`${sectionIds.deptActivityCard}-desc`} className="sr-only">
              Department activity level and trends
            </p>
          </div>
          
          <div id={sectionIds.monthlyTrendCard}>
            <KPICard
              id={`${sectionIds.monthlyTrendCard}-card`}
              title="Monthly Trend"
              value={monthlyTrend.value}
              icon="📈"
              sparklineData={monthlyTrend.sparklineData}
              trend={monthlyTrend.trend}
              trendValue={monthlyTrend.trendValue}
              color="orange"
              aria-describedby={`${sectionIds.monthlyTrendCard}-desc`}
            />
            <p id={`${sectionIds.monthlyTrendCard}-desc`} className="sr-only">
              Monthly trend analysis of permit activity
            </p>
          </div>
        </>
      )}
      </section>
      
      {/* Conditional rendering for expanded view */}
      {!isCollapsed && (
        <>
          {/* Permit Type Chart */}
          <section 
            id={sectionIds.permitTypeChart}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 transition-opacity duration-300"
            aria-label="Permit Type Distribution"
          >
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <PermitTypePieChart 
                data={chartData.permitDistribution} 
                componentId={componentId}
              />
            )}
          </section>
          
          {/* Data Metrics Card */}
          <section 
            id={sectionIds.dataMetricsCard}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-1 transition-opacity duration-300"
            aria-label="Data Metrics"
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={`metric-${i}`} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-6 w-3/4" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <DataMetricsCard metrics={kpiData.metrics} componentId={componentId} />
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default DashboardSidebar;
