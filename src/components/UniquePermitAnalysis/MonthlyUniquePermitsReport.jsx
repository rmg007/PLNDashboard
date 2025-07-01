// src/components/UniquePermitAnalysis/MonthlyUniquePermitsReport.jsx

import React, { useMemo, useCallback } from 'react';
import MoreMenu from '../ChartTableComponent/MoreMenu';
import { createColumnHelper } from '@tanstack/react-table';
import DashboardCardComponent from '../common/DashboardCardComponent';
import LineChartTableComponent from '../charts/LineChartTableComponent';
import LineChartComponent from '../charts/LineChartComponent';
import GroupedBarChartTableComponent from '../charts/GroupedBarChartTableComponent';

const columnHelper = createColumnHelper();

// Custom RGB Palette for Monthly Reports
const customPalette = [
    'rgb(54, 84, 134)',   // RGB(54, 84, 134)
    'rgb(75, 123, 236)',  // RGB(75, 123, 236)
    'rgb(102, 51, 153)',  // RGB(102, 51, 153)
    'rgb(153, 102, 255)', // RGB(153, 102, 255)
    'rgb(201, 203, 207)', // RGB(201, 203, 207)
    'rgb(54, 162, 235)',  // RGB(54, 162, 235)
    'rgb(0, 200, 83)',    // RGB(0, 200, 83)
    'rgb(210, 105, 30)',  // RGB(210, 105, 30)
    'rgb(128, 0, 128)',   // RGB(128, 0, 128)
    'rgb(63, 81, 181)',   // RGB(63, 81, 181)
    'rgb(240, 228, 66)',  // RGB(240, 228, 66)
    'rgb(255, 99, 132)'   // RGB(255, 99, 132)
];

// Month names for conversion
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthlyUniquePermitsReport({ data, isLoading }) {
  
  // Pivot data for chart0_Monthly_Trend
  const { pivotedData, pivotedColumns } = useMemo(() => {
    if (!data || data.length === 0) {
      return { pivotedData: [], pivotedColumns: [] };
    }

    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const pivoted = data.reduce((acc, { fiscal_year, month, permit_count }) => {
      if (!acc[fiscal_year]) {
        acc[fiscal_year] = { 'fYear': fiscal_year };
        monthOrder.forEach(month => acc[fiscal_year][month] = 0); // Initialize months
      }
      acc[fiscal_year][month] = permit_count;
      return acc;
    }, {});

    const pivotedData = Object.values(pivoted).sort((a, b) => a['fYear'] - b['fYear']);

    const pivotedColumns = [
      columnHelper.accessor('fYear', { header: 'F.Year', cell: info => info.getValue() }),
      ...monthOrder.map(month => 
        columnHelper.accessor(month, { header: month, cell: info => info.getValue().toLocaleString() })
      )
    ];

    return { pivotedData, pivotedColumns };
  }, [data]);

  // Filter data for the last three years for the trend chart
  const lastThreeYearsData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const years = [...new Set(data.map(d => d.fiscal_year))].sort((a, b) => b - a); // Sort descending
    const recentYears = years.slice(0, 3);
    return data.filter(d => recentYears.includes(d.fiscal_year));
  }, [data]);

  // Extract years for grouped bar chart (chart1_monthly_grouped)
  const years = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...new Set(data.map(d => d.fiscal_year))].sort((a, b) => a - b);
  }, [data]);

  // Data for each individual month across years (for 2x6 grid)
  const getSingleMonthData = useCallback((monthNum) => {
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthAbbr = monthOrder[monthNum - 1];
    return data.filter(d => d.month === monthAbbr);
  }, [data]);

  // Calculate global max permit count for consistent y-axis scaling in grid
  const globalMaxPermitCount = useMemo(() => {
    if (!data || data.length === 0) return 100;
    const maxValue = Math.max(...data.map(item => item.permit_count || 0), 0);
    return Math.ceil(maxValue / 100) * 100;
  }, [data]);

  return (
    <div className="monthly-analysis-section space-y-8">
      <div className="flex flex-col gap-8">
        <DashboardCardComponent
          id="monthly-trend-report"
          title="Monthly Trend of Unique Permits"
          isLoading={isLoading}
          exportOptions={{
            excel: "Monthly-Trend-Report.xlsx",
            image: "Monthly-Trend-Report.png"
          }}
        >
          <LineChartTableComponent
            key={`monthly-trend-${JSON.stringify(lastThreeYearsData)}`}
            id='chart0_Monthly_Trend'
            data={lastThreeYearsData.sort((a, b) => {
              if (a.fiscal_year === b.fiscal_year) {
                const monthOrder = {'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 
                                  'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12};
                return monthOrder[a.month] - monthOrder[b.month];
              }
              return a.fiscal_year - b.fiscal_year;
            })}
            tableData={pivotedData}
            xField={item => `${item.fiscal_year}-${item.month}`}
            yField="permit_count"
            chartTitle="Monthly Trend of Unique Permits"
            columns={pivotedColumns}
            tablePosition="bottom"
            title="Monthly Trend of Unique Permits"
            showTable={true}
            defaultRowsPerPage={10}
            enableSelection={false}
            enableSorting={false}
            height={400}
            lineColor={customPalette[0]}
            markerSize={8}
            lineStyle="solid"
            chartConfig={{
              yaxis: {
                title: "Unique Permits"
              },
              xaxis: {
                title: "",
                tickangle: -45
              },
              showlegend: false,
              colorway: [customPalette[0]]
            }}
            initialState={{
              pagination: {
                pageSize: 10
              }
            }}
          />
        </DashboardCardComponent>

        <DashboardCardComponent
          id="monthly-grouped-report"
          title="Permit Volume by Unique Permit Numbers — Monthly Volumes"
          isLoading={isLoading}
          exportOptions={{
            excel: "Monthly-Grouped-Report.xlsx",
            image: "Monthly-Grouped-Report.png"
          }}
        >
          <GroupedBarChartTableComponent
            key={`monthly-grouped-${JSON.stringify(pivotedData)}`}
            id='chart1_monthly_grouped'
            data={pivotedData}
            xField="fYear"
            yFields={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
            yLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
            title="Permit Volume by Unique Permit Numbers — Monthly Volumes"
            xAxisLabel="Fiscal Year"
            yAxisLabel="Permit Volume"
            colors={customPalette}
            columns={pivotedColumns}
            tablePosition="bottom"
            showTable={true}
            defaultRowsPerPage={10}
            barMode="group"
            height={400}
            enableSelection={false}
            enableSorting={false}
          />
        </DashboardCardComponent>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        Monthly Breakdown by Specific Month
      </h3>
      <div id='monthly-breakdown-grid' className="grid grid-cols-2 grid-rows-6 gap-4 border border-gray-200 dark:border-gray-700">
        {Array.from({ length: 12 }, (_, i) => {
          const monthNum = i + 1;
          const monthData = getSingleMonthData(monthNum);
          return (
            <div className="border border-gray-200 dark:border-gray-700 shadow-lg p-2 rounded-lg relative" key={`month-chart-${monthNum}`}>
              <MoreMenu 
                chartType="line"
                showChartTypeSwitcher={false}
                tableVisible={false}
                exportOptions={{
                  excel: `Monthly-Breakdown-${monthNames[i]}.xlsx`,
                  image: `Monthly-Breakdown-${monthNames[i]}.png`
                }}
              />
              <LineChartComponent
                key={`month-chart-${monthNum}-${JSON.stringify(monthData)}`}
                id={`chart_month_${monthNum}`}
                data={monthData}
                xField="fiscal_year"
                yField="permit_count"
                title={`${monthNames[i]} Permits`}
                height={200}
                lineColor={customPalette[i % customPalette.length]}
                markerSize={6}
                lineStyle="solid"
                chartConfig={{
                  yaxis: {
                    title: "Permits",
                    range: [0, globalMaxPermitCount]
                  },
                  xaxis: {
                    title: "",
                    tickangle: -45
                  },
                  showlegend: false,
                  colorway: [customPalette[i % customPalette.length]]
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
