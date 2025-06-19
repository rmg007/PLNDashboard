// src/components/UniquePermitAnalysis/MonthlyUniquePermitsReport.jsx

import React, { useMemo, useCallback } from 'react';
import ChartTableComponent from '../ChartTableComponent';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

// Theme B: Warm Earth Tones (directly from user's VBA ThemeBColors)
const themeBWarmEarthTones = [
    'rgb(220, 88, 42)',   // RGB(220, 88, 42)
    'rgb(255, 159, 64)',  // RGB(255, 159, 64)
    'rgb(153, 102, 51)',  // RGB(153, 102, 51)
    'rgb(245, 222, 179)', // RGB(245, 222, 179)
    'rgb(210, 105, 30)',  // RGB(210, 105, 30)
    'rgb(204, 121, 167)', // RGB(204, 121, 167)
    'rgb(240, 128, 128)', // RGB(240, 128, 128)
    'rgb(255, 205, 86)',  // RGB(255, 205, 86)
    'rgb(201, 203, 207)', // RGB(201, 203, 207)
    'rgb(75, 192, 192)',  // RGB(75, 192, 192)
    'rgb(0, 114, 178)',   // RGB(0, 114, 178)
    'rgb(86, 180, 233)'   // RGB(86, 180, 233)
];

// Month names for conversion
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthlyUniquePermitsReport({ data, isLoading }) {
  // Using Theme B: Warm Earth Tones from user's VBA code
  // Using data directly from parent component (already filtered)

  // Define base columns for monthly data when a table is needed
  const baseMonthlyColumns = useMemo(() => [
    columnHelper.accessor('FiscalYear', { header: 'Fiscal Year', cell: info => info.getValue(), enableSorting: true }),
    columnHelper.accessor('FiscalMonth', { header: 'Month', cell: info => info.getValue(), enableSorting: true }),
    columnHelper.accessor('PermitCount', { header: 'Permit Count', cell: info => info.getValue().toLocaleString(), enableSorting: true }),
  ], []);
  
  // Define columns with Quarter for when it's needed
  const baseMonthlyColumnsWithQuarter = useMemo(() => [
    columnHelper.accessor('FiscalYear', { header: 'Fiscal Year', cell: info => info.getValue(), enableSorting: true }),
    columnHelper.accessor('FiscalQuarter', { header: 'Quarter', cell: info => `Q${info.getValue()}`, enableSorting: true }),
    columnHelper.accessor('FiscalMonth', { header: 'Month', cell: info => info.getValue(), enableSorting: true }),
    columnHelper.accessor('PermitCount', { header: 'Permit Count', cell: info => info.getValue().toLocaleString(), enableSorting: true }),
  ], []);

  // Columns for charts showing a specific month's trend over years
  const singleMonthTrendColumns = useMemo(() => [
    columnHelper.accessor('FiscalYear', { header: 'Fiscal Year', cell: info => info.getValue(), enableSorting: true }),
    columnHelper.accessor('PermitCount', { header: 'Permit Count', cell: info => info.getValue().toLocaleString(), enableSorting: true }),
  ], []);

  // Helper to construct titles based on current filters
  const getBaseTitle = useCallback((suffix = '') => {
    // Since we're now using filtered data from parent, we use a simpler title
    let title = 'Monthly Permit Volume';
    
    // Optional: Extract unique years from data to show in title
    if (data && data.length > 0) {
      const uniqueYears = [...new Set(data.map(d => d.FiscalYear))].sort((a, b) => a - b);
      if (uniqueYears.length === 1) {
        title += ` for FY ${uniqueYears[0]}`;
      } else if (uniqueYears.length > 1 && uniqueYears.length <= 3) {
        title += ` for FY ${uniqueYears.join(', ')}`;
      } else if (uniqueYears.length > 3) {
        title += ` for Selected Years`;
      }
    }
    // Check if data is filtered to a single month
    if (data && data.length > 0) {
      const uniqueMonths = [...new Set(data.map(d => d.FiscalMonth))];
      if (uniqueMonths.length === 1) {
        // Convert month abbreviation to full name
        const monthAbbr = uniqueMonths[0];
        const monthIndex = monthNames.findIndex(name => name.substring(0, 3) === monthAbbr);
        if (monthIndex !== -1) {
          title += ` ${monthNames[monthIndex]}`;
        }
      }
    }
    return `${title} ${suffix}`.trim();
  }, [data]);

  // --- Data preparation for specific charts ---

  // 0. Monthly Analysis (Full Width) - Grouped by Year
  // Transform data to create grouped bar chart traces for each year with monthly data
  const groupedBarTraces = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Get unique years from the data
    const years = [...new Set(data.map(d => d.FiscalYear))].sort((a, b) => a - b);
    
    // Define month order for correct x-axis sorting
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // yearColors object removed as it's replaced by goldenrodPalette
    
    // Create a trace for each year
    const traces = [];
    
    years.forEach((year, index) => {
      // Filter data for this year
      const yearData = data.filter(d => d.FiscalYear === year);
      
      // Create an array of permit counts for each month
      const monthlyValues = monthOrder.map(month => {
        const monthData = yearData.find(d => d.FiscalMonth === month);
        return monthData ? monthData.PermitCount : 0;
      });
      
      // Month labels are already in the right format
      const monthLabels = monthOrder;
      
      // Create the trace for this year
      traces.push({
        x: monthLabels,
        y: monthlyValues,
        name: year.toString(),
        type: 'bar',
        marker: { color: themeBWarmEarthTones[index % themeBWarmEarthTones.length] }, // Ensure this uses the theme palette
        text: monthlyValues.map(val => val > 0 ? val.toString() : ''),
        textposition: 'inside',
        insidetextanchor: 'middle',
        textfont: {
          size: 11,
          color: 'white',
          family: 'sans-serif'
        },
        hovertemplate: `<b>%{x} ${year}</b><br>Permits: %{y}<extra></extra>`
      });
    });
    
    return traces;
  }, [data, themeBWarmEarthTones]); // Using Theme B warm earth tones

  // 1. Monthly Analysis (Full Width) - Grouped by Month
  // Transform data to create grouped bar chart traces for each year with monthly data
  const monthlyGroupedTraces = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Get unique years from the data
    const years = [...new Set(data.map(d => d.FiscalYear))].sort((a, b) => a - b);
    
    // Define month order for correct x-axis sorting
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Create a trace for each year
    const traces = [];
    
    years.forEach((year, index) => {
      // Filter data for this year
      const yearData = data.filter(d => d.FiscalYear === year);
      
      // Create an array of permit counts for each month
      const monthlyValues = monthOrder.map(month => {
        const monthData = yearData.find(d => d.FiscalMonth === month);
        return monthData ? monthData.PermitCount : 0;
      });
      
      // Month labels are already in the right format
      const monthLabels = monthOrder;
      
      // Create the trace for this year
      traces.push({
        x: monthLabels,
        y: monthlyValues,
        name: year.toString(),
        type: 'bar',
        marker: { color: themeBWarmEarthTones[index % themeBWarmEarthTones.length] },
        text: monthlyValues.map(val => val > 0 ? val.toLocaleString() : ''),
        textposition: 'outside',
        textfont: {
          size: 12,
          color: 'black'
        },
        hovertemplate: `<b>%{x} ${year}</b><br>Permits: %{y}<extra></extra>`
      });
    });
    
    return traces;
  }, [data, themeBWarmEarthTones]);

  // 2. Monthly Permit Count by Year (Full Width) - for trend across years
  // This aggregates permits by FiscalYear from the incoming data
  const monthlyByYearData = useMemo(() => {
    const yearMap = new Map();
    data.forEach(item => {
      const year = item.FiscalYear;
      yearMap.set(year, (yearMap.get(year) || 0) + item.PermitCount);
    });
    return Array.from(yearMap).map(([FiscalYear, PermitCount]) => ({ FiscalYear, PermitCount }));
  }, [data]);

  // Data for each individual month across years (for 2x6 grid)
  const getSingleMonthData = useCallback((monthNum) => {
    // Convert month number to abbreviation (Jan, Feb, etc.)
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthAbbr = monthOrder[monthNum - 1];
    return data.filter(d => d.FiscalMonth === monthAbbr);
  }, [data]);

  // Generate traces for a single month's data
  const generateMonthlyTraces = useCallback((monthData) => {
    if (!monthData || monthData.length === 0) return [];
    
    // Get unique years from the data
    const years = [...new Set(monthData.map(d => d.FiscalYear))].sort((a, b) => a - b);
    
    // Create a trace for each year
    return years.map((year, index) => {
      const color = themeBWarmEarthTones[index % themeBWarmEarthTones.length];
      return {
        x: [year.toString()],
        y: [monthData.find(d => d.FiscalYear === year)?.PermitCount || 0],
        name: year.toString(),
        type: 'line', // Set type to line by default
        mode: 'lines+markers+text', // Show lines, markers and text
        line: {
          color: color,
          width: 3 // Make lines thicker for better visibility
        },
        marker: { 
          color: color,
          size: 8 // Larger markers for better visibility
        },
        text: [(monthData.find(d => d.FiscalYear === year)?.PermitCount || 0).toString()],
        textposition: 'top',
        textfont: {
          size: 12,
          color: 'black'
        },
        hovertemplate: `<b>Year: ${year}</b><br>Permits: %{y}<extra></extra>`
      };
    });
  }, [themeBWarmEarthTones]);

  // Generate an array of data and traces for all 12 months
  const monthlyBreakdownChartsData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const monthData = getSingleMonthData(monthNum);
      return {
        monthNum,
        data: monthData,
        traces: generateMonthlyTraces(monthData)
      };
    });
  }, [getSingleMonthData, generateMonthlyTraces]);

  // Calculate the global maximum value for the y-axis across all monthly charts
  const globalMaxPermitCount = useMemo(() => {
    // Flatten all monthly data and find the maximum PermitCount
    const allMonthlyData = monthlyBreakdownChartsData.flatMap(({ data }) => data);
    const maxValue = Math.max(...allMonthlyData.map(item => item.PermitCount), 0);
    // Round up to the nearest 10 or 100 for a clean max value
    return Math.ceil(maxValue / 100) * 100;
  }, [monthlyBreakdownChartsData]);


  return (
    <div className="monthly-analysis-section space-y-8">
      {/* Full-width charts */}
      <div className="flex flex-col gap-8">
        {/* Chart 0: Quarterly Grouped Bar Chart */}
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow mb-8" id='quarterly-grouped-report'>
          <ChartTableComponent id='chart0_monthly_grouped'
            data={data}
            columns={baseMonthlyColumns}
            isLoading={isLoading}
            chartTitle="Permit Volume by Unique Permit Numbers — Quarterly Volumes"
            xAxisTitle="Fiscal Quarter"
            yAxisTitle="Permit Volume"
            traces={groupedBarTraces}
            barMode="group"
            showTrendLine={false}
            showAverageLine={false}
            showBarLabels={false}
            excelFileName="Quarterly-Grouped-Report.xlsx"
            chartFileName="Quarterly-Grouped-Report.png"
            excelSheetName="Quarterly Grouped Data"
            showTablePanel={true}
            initialSplitPos={80}
            showPagination={true}
            showChartTypeSwitcher={false}
          />
        </div>

        {/* Chart 1 removed as requested */}

        {/* Chart 2 removed as requested */}
      </div>

      {/* 2x6 Grid of Monthly Charts */}
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        Monthly Breakdown by Specific Month
      </h3>
      <div id='monthly-breakdown-grid' className="grid grid-cols-2 grid-rows-6 gap-4 border border-gray-200 dark:border-gray-700"> {/* Fixed 2 columns x 6 rows grid layout with outer border */}
        {monthlyBreakdownChartsData.map(({ monthNum, data: monthData, traces }) => (
          <div className="border border-gray-200 dark:border-gray-700 p-2" key={`month-chart-${monthNum}`}>
            <ChartTableComponent
            data={monthData}
            columns={singleMonthTrendColumns}
            isLoading={isLoading}
            chartTitle={`${monthNames[monthNum - 1]} Permits`}
            traces={traces} // Use the generated traces
            barMode="group" // Group the bars
            barLabelPosition="top"
            barLabelInsideAnchor="middle"
            barLabelFontColor="black"
            barLabelFontSize={10} // Slightly larger font for readability
            showBarLabels={true} // Explicitly show data labels
            showTablePanel={false} // Hide table for smaller charts
            initialSplitPos={100} // Chart only
            showChartTypeSwitcher={true} // Enable chart type switching
            hideSplitter={true} // Hide the draggable splitter
            showTableToggle={false} // Hide the table toggle button
            chartLayout={{
              showlegend: false, // Hide the legend
              yaxis: {
                range: [0, globalMaxPermitCount], // Set consistent y-axis range
                fixedrange: true // Prevent zooming on y-axis
              }
            }}
          />
          </div>
        ))}
      </div>
    </div>
  );
}
