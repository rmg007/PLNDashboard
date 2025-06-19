// src/components/UniquePermitAnalysis/MonthlyUniquePermitsReport.jsx

import React, { useMemo, useCallback } from 'react';
import ChartTableComponent from '../ChartTableComponent';
import { createColumnHelper } from '@tanstack/react-table';

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
        marker: { color: customPalette[index % customPalette.length] }, // Ensure this uses the theme palette
        text: monthlyValues.map(val => val > 0 ? val.toString() : ''),
        textposition: 'inside',
        insidetextanchor: 'middle',
        textangle: -90,
        textfont: {
          size: 11,
          color: 'white',
          family: 'sans-serif'
        },
        hovertemplate: `<b>%{x} ${year}</b><br>Permits: %{y}<extra></extra>`
      });
    });
    
    return traces;
  }, [data, customPalette]); // Using Theme B warm earth tones

  // Filter data for the last three years
  const lastThreeYearsData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Get unique years from the data
    const years = [...new Set(data.map(d => d.FiscalYear))].sort((a, b) => b - a); // Sort descending
    
    // Take only the last 3 years (or fewer if less data is available)
    const recentYears = years.slice(0, 3);
    
    // Filter data to only include these years
    return data.filter(d => recentYears.includes(d.FiscalYear));
  }, [data]);

  // Generate traces for the monthly trend line chart
  const monthlyTrendTraces = useMemo(() => {
    if (!Array.isArray(lastThreeYearsData) || lastThreeYearsData.length === 0) return [];

    // 1. Sort data chronologically
    const sortedData = [...lastThreeYearsData].sort((a, b) => {
      if (a.FiscalYear === b.FiscalYear) {
        // Convert month abbreviations to numbers for comparison
        const monthOrder = {'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 
                          'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12};
        return monthOrder[a.FiscalMonth] - monthOrder[b.FiscalMonth];
      }
      return a.FiscalYear - b.FiscalYear;
    });

    // 2. Create X-axis labels (e.g., "2023-Jan") and Y-axis values
    const xValues = sortedData.map(item => `${item.FiscalYear}-${item.FiscalMonth}`);
    const yValues = sortedData.map(item => item.PermitCount);

    // 3. Create single trace object
    const singleTrace = {
      x: xValues,
      y: yValues,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Permit Volume Trend',
      line: { color: customPalette[0], width: 3 }, // Use first color from the theme
      marker: { size: 8, color: customPalette[0] },
      hovertemplate: '<b>%{x}</b><br>Volume: %{y:,} permits<extra></extra>'
    };

    return [singleTrace]; // Return as an array containing the single trace
  }, [lastThreeYearsData, customPalette]);

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
        marker: { color: customPalette[index % customPalette.length] },
        text: monthlyValues.map(val => val > 0 ? val.toLocaleString() : ''),
        textposition: 'outside',
        textangle: -90, // Rotate data labels by -90 degrees
        textfont: {
          size: 12,
          color: 'black'
        },
        hovertemplate: `<b>%{x} ${year}</b><br>Permits: %{y}<extra></extra>`
      });
    });
    
    return traces;
  }, [data, customPalette]);

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

  // Calculate global max permit count for consistent y-axis scaling
  const globalMaxPermitCount = useMemo(() => {
    if (!data || data.length === 0) return 100; // Default max if no data
    // Find the maximum PermitCount from the main data prop
    const maxValue = Math.max(...data.map(item => item.PermitCount || 0), 0);
    // Round up to the nearest 100 for a clean max value
    return Math.ceil(maxValue / 100) * 100;
  }, [data]);

  return (
    <div className="monthly-analysis-section space-y-8">
      {/* Full-width charts */}
      <div className="flex flex-col gap-8">
        {/* Chart 0: Monthly Trend Line Chart */}
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow mb-8" id='monthly-trend-report'>
          <ChartTableComponent id='chart0_Monthly_Trend'
            data={lastThreeYearsData}
            columns={baseMonthlyColumns}
            isLoading={isLoading}
            chartTitle="Permit Volume by Unique Permit Numbers — Monthly Trend (Last 3 Years)"
            xAxisTitle="Month"
            yAxisTitle="Permit Volume"
            traces={monthlyTrendTraces}
            chartType="line"
            showTrendLine={true}
            showAverageLine={true}
            xAxisTickAngle={-45}
            showTablePanel={true}
            initialSplitPos={80}
            initialTableWidth={350}
            tableHeaderClassName="text-center"
            chartLayout={{
              showlegend: false  // Hide the legend completely
            }}
            excelFileName="Monthly-Trend-Report.xlsx"
            chartFileName="Monthly-Trend-Report.png"
            excelSheetName="Monthly Trend Data"
            showPagination={true}
            showChartTypeSwitcher={false}
            disableHighlighting={false}
            disableSelection={false}
            showDataLabels={true}
          />
        </div>

        {/* Chart 1: Monthly Grouped Bar Chart */}
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow mb-8" id='monthly-grouped-report'>
          <ChartTableComponent id='chart1_monthly_grouped'
            data={data}
            columns={baseMonthlyColumns}
            isLoading={isLoading}
            chartTitle="Permit Volume by Unique Permit Numbers — Monthly Volumes"
            xAxisTitle="Fiscal Month"
            yAxisTitle="Permit Volume"
            traces={groupedBarTraces}
            barMode="group"
            showTrendLine={false}
            showAverageLine={false}
            showBarLabels={true}
            showDataLabels={true}
            dataLabelPosition="outside"
            barLabelFontColor="black"
            excelFileName="Monthly-Grouped-Report.xlsx"
            chartFileName="Monthly-Grouped-Report.png"
            excelSheetName="Monthly Grouped Data"
            showTablePanel={true}
            initialSplitPos={80}
            initialTableWidth={350}
            tableHeaderClassName="text-center"
            showPagination={true}
            showChartTypeSwitcher={false}
            disableHighlighting={true}
            disableSelection={true}
            chartLayout={{
              xaxis: {
                tickangle: -90 // Rotate data labels -90 degrees
              },
              legend: {
                orientation: 'h', // Horizontal legend
                yanchor: 'bottom',
                y: -0.3, // Position below the chart
                xanchor: 'center',
                x: 0.5 // Center horizontally
              }
            }}
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
        {Array.from({ length: 12 }, (_, i) => {
          const monthNum = i + 1;
          const monthData = getSingleMonthData(monthNum);
          return (
            <div className="border border-gray-200 dark:border-gray-700 p-2" key={`month-chart-${monthNum}`}>
              <ChartTableComponent id={`chart_monthly_${monthNum}`}
                data={monthData}
                columns={singleMonthTrendColumns}
                isLoading={isLoading}
                chartTitle={`${monthNames[monthNum - 1]} Permits`}
                xAxisTitle="Fiscal Year"
                yAxisTitle="Permit Count"
                xAccessor="FiscalYear"
                yAccessor="PermitCount"
                barMode="group" // Group the bars
                barLabelPosition="inside" // Position bar labels inside
                barLabelInsideAnchor="middle" // Center the labels inside bars
                showBarLabels={true} // Explicitly show data labels (applies to bar charts)
                initialChartType="line" // Start with line chart - as requested
                showDataLabels={true} // Show data labels for all chart types
                showTablePanel={false} // Hide table for smaller charts
                initialSplitPos={100} // Chart only
                showChartTypeSwitcher={true} // Enable chart type switching
                hideSplitter={true} // Hide the draggable splitter
                showTableToggle={false} // Hide the table toggle button
                baseBarColor={customPalette[0]} // Use the first color from the palette
                dataLabelFontColor="black" // For line chart data labels
                barLabelFontColor="white" // For bar chart data labels
                chartLayout={{
                  showlegend: false, // Hide the legend
                  yaxis: {
                    range: [0, globalMaxPermitCount], // Set consistent y-axis range
                    fixedrange: true, // Prevent zooming on y-axis
                    showgrid: true, // Show horizontal grid lines
                    gridcolor: 'rgba(200, 200, 200, 0.3)' // Light gray grid lines
                  },
                  xaxis: {
                    showgrid: true, // Show vertical grid lines
                    gridcolor: 'rgba(200, 200, 200, 0.3)' // Light gray grid lines
                  }
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
