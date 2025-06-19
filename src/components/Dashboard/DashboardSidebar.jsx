import React from 'react';
import KPICard from './KPICard';
import PermitTypePieChart from './PermitTypePieChart';
import DataMetricsCard from './DataMetricsCard';

/**
 * Dashboard Sidebar component containing KPI cards and summary information
 * @param {Object} props - Component props
 * @param {Object} props.kpiData - Data for KPI cards
 * @param {Object} props.chartData - Data for charts
 */
const DashboardSidebar = ({ kpiData = {}, chartData = {} }) => {
  const {
    totalPermits = { value: 0, trend: 'neutral', trendValue: '0%', sparklineData: [] },
    avgValuation = { value: 0, trend: 'neutral', trendValue: '0%', sparklineData: [] },
    deptActivity = { value: 0, trend: 'neutral', trendValue: '0%', sparklineData: [] },
    monthlyTrend = { value: 0, trend: 'neutral', trendValue: '0%', sparklineData: [] }
  } = kpiData;

  return (
    <div className="h-full flex flex-col">
      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <KPICard
          title="Total Permits (2024)"
          value={totalPermits.value.toLocaleString()}
          icon="📊"
          sparklineData={totalPermits.sparklineData}
          trend={totalPermits.trend}
          trendValue={totalPermits.trendValue}
          color="blue"
        />
        
        <KPICard
          title="Avg. Valuation"
          value={`$${avgValuation.value.toLocaleString()}`}
          icon="💰"
          sparklineData={avgValuation.sparklineData}
          trend={avgValuation.trend}
          trendValue={avgValuation.trendValue}
          color="green"
        />
        
        <KPICard
          title="Dept. Activity"
          value={deptActivity.value.toLocaleString()}
          icon="🗂️"
          sparklineData={deptActivity.sparklineData}
          trend={deptActivity.trend}
          trendValue={deptActivity.trendValue}
          color="purple"
        />
        
        <KPICard
          title="Monthly Trend"
          value={monthlyTrend.value}
          icon="📈"
          sparklineData={monthlyTrend.sparklineData}
          trend={monthlyTrend.trend}
          trendValue={monthlyTrend.trendValue}
          color="orange"
        />
      </div>
      
      {/* Permit Type Pie Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <PermitTypePieChart data={chartData?.permitDistributionData || []} />
      </div>
      
      {/* Data Metrics Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex-grow">
        <DataMetricsCard metrics={kpiData?.metrics} />
      </div>
    </div>
  );
};

export default DashboardSidebar;
