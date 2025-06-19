import React from 'react';
import CombinationChart from './CombinationChart';
import DepartmentTrendsChart from './DepartmentTrendsChart';
import StackedBarChart from './StackedBarChart';
import HorizontalBarChart from './TreemapChart';

/**
 * Dashboard Main Content component containing detailed charts and tables
 * @param {Object} props - Component props
 * @param {Object} props.chartData - Data for charts
 */
const DashboardMainContent = ({ chartData = {} }) => {
  const {
    permitVolumeData = [],
    deptActivityData = [],
    valuationRangeData = [],
    treemapData = []
  } = chartData;

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Combination Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 chart-container">
        <h3 className="text-lg font-semibold mb-4">Permit Volume & Valuation Trends</h3>
        <div className="h-80">
          <CombinationChart
            data={permitVolumeData}
            title="Permit Volume vs. Average Valuation"
            xAxisTitle="Fiscal Year"
            yAxisTitle="Permit Count"
            y2AxisTitle="Average Valuation ($)"
            xField="year"
            barField="permitCount"
            lineField="avgValuation"
            barColor="rgb(54, 162, 235)"
            lineColor="rgb(255, 99, 132)"
          />
        </div>
      </div>
      
      {/* Department Activity Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 chart-container">
        <h3 className="text-lg font-semibold mb-4">Department Activity Trends</h3>
        <div className="h-80">
          <DepartmentTrendsChart 
            data={chartData.departmentActivity || []} 
            title="" 
            xAxisTitle="Fiscal Year"
            yAxisTitle="Activity Count"
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Trends showing department activity levels over time with total activity overlay.
        </p>
      </div>
      
      {/* Two-Column Layout for Stacked Bar and Treemap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stacked Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 chart-container">
          <h3 className="text-lg font-semibold mb-4">Permit Volume by Valuation Range</h3>
          <div className="h-80">
            <StackedBarChart
              data={valuationRangeData}
              title="Permit Volume by Valuation Range"
              xAxisTitle="Fiscal Year"
              yAxisTitle="Permit Count"
              xField="year"
              categories={['<$100K', '$100K-$1M', '$1M-$10M', '>$10M']}
              colors={['#3366CC', '#DC3912', '#FF9900', '#109618']}
            />
          </div>
        </div>
        
        {/* Horizontal Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 chart-container">
          <h3 className="text-lg font-semibold mb-4">Permit Distribution by Category</h3>
          <div className="h-80">
            <HorizontalBarChart 
              data={chartData.permitDistribution || []} 
              title="" 
              xAxisTitle="Number of Permits"
              yAxisTitle="Category"
              labelField="category"
              valueField="value"
              color="#3B82F6"
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
