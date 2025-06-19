import React, { useMemo, useCallback } from 'react';
import ChartTableComponent from '../ChartTableComponent';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();

// Custom RGB Palette
const customPalette = [
    'rgb(220, 88, 42)', 'rgb(255, 159, 64)', 'rgb(153, 102, 51)', 
    'rgb(134, 100, 36)', 'rgb(210, 105, 30)', 'rgb(204, 121, 167)', 
    'rgb(240, 128, 128)', 'rgb(255, 205, 86)', 'rgb(201, 203, 207)', 
    'rgb(75, 192, 192)', 'rgb(0, 114, 178)', 'rgb(86, 180, 233)'
];

export default function QuarterlyUniquePermitsReport({ data, isLoading }) {

    // --- Column Definitions for the various tables ---
    const baseQuarterlyColumns = useMemo(() => [
        columnHelper.accessor('FiscalYear', { header: 'Fiscal Yr.', meta: { className: 'text-center' } }),
        columnHelper.accessor('FiscalQuarter', { header: 'Quarter', cell: info => `Q${info.getValue()}`, meta: { className: 'text-center' } }),
        columnHelper.accessor('PermitCount', { header: 'Permit Vol.', cell: info => info.getValue().toLocaleString(), meta: { className: 'text-center' } }),
    ], []);

    const singleYearColumns = useMemo(() => [
        columnHelper.accessor('FiscalYear', { header: 'Fiscal Year', meta: { className: 'text-center' } }),
        columnHelper.accessor('PermitCount', { header: 'Total Permits', cell: info => info.getValue().toLocaleString(), meta: { className: 'text-center' } }),
    ], []);

    const singleQuarterTrendColumns = useMemo(() => [
        columnHelper.accessor('FiscalYear', { header: 'Fiscal Year', meta: { className: 'text-center' } }),
        columnHelper.accessor('PermitCount', { header: 'Permit Count', cell: info => info.getValue().toLocaleString(), meta: { className: 'text-center' } }),
    ], []);

    // --- Data Preparation Logic ---

    // 1. Data transformation for the Grouped Bar Chart
    const groupedBarTraces = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) return [];
        const years = [...new Set(data.map(d => d.FiscalYear))].sort((a,b) => a - b);
        const traces = [];
        // Using Ocean Blue Theme Palette
        // const colors = ['#03045e', '#0077b6', '#00b4d8', '#48cae4', '#90e0ef']; // Old palette

        for (let i = 1; i <= 4; i++) {
            const quarterData = years.map(year => {
                const item = data.find(d => d.FiscalYear === year && d.FiscalQuarter === i);
                return item ? item.PermitCount : null; 
            });
            
            // Common properties for both bar and line charts
            const traceBase = {
                x: years,
                y: quarterData,
                name: `Q${i}`,
                text: quarterData.map(value => value ? `Q${i}: ${value.toLocaleString()}` : ''),
                hoverinfo: 'y+name',
                hovertemplate: `<b>%{x} - Q${i}</b><br>Volume: %{y:,} permits<extra></extra>`,
                marker: { color: customPalette[i-1 % customPalette.length] } // Use Ocean Blue Palette
            };
            
            // The trace will work for both bar and line charts
            // When in bar mode, the bar-specific properties will be used
            // When in line mode, the line-specific properties will be used
            traces.push({
                ...traceBase,
                // Bar chart specific properties
                type: 'bar', // Default type is bar, ChartTableComponent will change this when switching to line
                textposition: 'inside',
                insidetextanchor: 'middle',
                textfont: {
                    color: 'white',
                    size: 11,
                    family: 'sans-serif'
                },
                textangle: -90,
                
                // Line chart specific properties (will be used when switching to line chart)
                // These properties will be applied by the Chart component when type is changed to 'scatter'
                line: {
                    color: customPalette[i-1 % customPalette.length], // Use Ocean Blue Palette
                    width: 3
                },
                mode: 'lines+markers', // For line chart mode
            });
        }
        return traces;
    }, [data, customPalette]);
    
    // 2. Data transformation for Chart 2 (Quarterly Data by Year)
    const quarterlyByYearData = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        // Group data by fiscal year and sum permit counts
        const yearlyTotals = {};
        data.forEach(item => {
            const year = item.FiscalYear;
            if (!yearlyTotals[year]) {
                yearlyTotals[year] = { FiscalYear: year, PermitCount: 0 };
            }
            yearlyTotals[year].PermitCount += item.PermitCount;
        });
        
        // Convert to array and sort by year
        return Object.values(yearlyTotals).sort((a, b) => a.FiscalYear - b.FiscalYear);
    }, [data]);
    
    // 3. Generate traces for Chart 2 (Grouped by Quarter)
    const quarterlyGroupedTraces = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        // Get all unique years from the data
        const years = [...new Set(data.map(d => d.FiscalYear))].sort((a, b) => a - b);
        
        // Create traces for each year
        const traces = [];
        const quarters = [1, 2, 3, 4];
        
        // For each year, create a trace with data for all quarters
        // Each year will be a different bar group, colored by the customPalette
        years.forEach((year, i) => {
            // For each quarter, find the permit count for this year
            const quarterValues = quarters.map(quarter => {
                const item = data.find(d => d.FiscalYear === year && d.FiscalQuarter === quarter);
                return item ? item.PermitCount : 0;
            });
            
            // Create the trace for this year
            traces.push({
                x: quarters.map(q => `Q${q}`), // X-axis shows quarters
                y: quarterValues,
                name: `${year}`,
                type: 'bar',
                // Use the customPalette, cycling through colors for each year
                marker: { color: customPalette[i % customPalette.length] },
                text: quarterValues.map((value, idx) => value ? `${year}: ${value.toLocaleString()}` : ''),
                textposition: 'inside',
                insidetextanchor: 'middle',
                textfont: {
                    color: 'white',
                    size: 11,
                    family: 'sans-serif'
                },
                textangle: -90,
                hoverinfo: 'y+name',
                hovertemplate: `<b>${year} - %{x}</b><br>Volume: %{y:,} permits<extra></extra>`
            });
        });
        
        return traces;
    }, [data, customPalette]);

    // Data for individual quarter charts
    const q1Data = useMemo(() => data.filter(item => item.FiscalQuarter === 1), [data]);
    const q2Data = useMemo(() => data.filter(item => item.FiscalQuarter === 2), [data]);
    const q3Data = useMemo(() => data.filter(item => item.FiscalQuarter === 3), [data]);
    const q4Data = useMemo(() => data.filter(item => item.FiscalQuarter === 4), [data]);
    
    // Calculate global min and max for consistent y-axis across all quarterly charts
    const quarterlyYAxisRange = useMemo(() => {
        if (!data || data.length === 0) return { min: 0, max: 100 };
        
        // Get all permit counts from quarterly data
        const allQuarterlyValues = [
            ...q1Data.map(item => item.PermitCount),
            ...q2Data.map(item => item.PermitCount),
            ...q3Data.map(item => item.PermitCount),
            ...q4Data.map(item => item.PermitCount)
        ].filter(val => val !== undefined && val !== null);
        
        if (allQuarterlyValues.length === 0) return { min: 0, max: 100 };
        
        // Calculate min and max
        const min = Math.floor(Math.min(...allQuarterlyValues) * 0.9); // Add 10% padding below
        const max = Math.ceil(Math.max(...allQuarterlyValues) * 1.1);  // Add 10% padding above
        
        return { min: Math.max(0, min), max }; // Ensure min is never negative
    }, [data, q1Data, q2Data, q3Data, q4Data]);
    
    // Create consistent chart layout for quarterly charts
    const quarterlyChartLayout = useMemo(() => ({
        yaxis: {
            range: [quarterlyYAxisRange.min, quarterlyYAxisRange.max],
            autorange: false
        }
    }), [quarterlyYAxisRange]);

    // 4. Generate traces for the quarterly trend line chart
    const quarterlyTrendTraces = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) return [];

        // 1. Sort data chronologically
        const sortedData = [...data].sort((a, b) => {
            if (a.FiscalYear === b.FiscalYear) {
                return a.FiscalQuarter - b.FiscalQuarter;
            }
            return a.FiscalYear - b.FiscalYear;
        });

        // 2. Create X-axis labels (e.g., "2023-Q1") and Y-axis values
        const xValues = sortedData.map(item => `${item.FiscalYear}-Q${item.FiscalQuarter}`);
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
    }, [data, customPalette]);

    return (
            <>
                {/* --- Chart 0: Quarterly Trend Line Chart --- */}
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow mb-8" id='quarterly-trend-report'>
                    <ChartTableComponent id='chart0_Quarterly_Trend'
                        data={data}
                        columns={baseQuarterlyColumns}
                        isLoading={isLoading}
                        chartTitle="Permit Volume by Unique Permit Numbers — Quarterly Trend"
                        xAxisTitle="Quarter"
                        yAxisTitle="Permit Volume"
                        traces={quarterlyTrendTraces}
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
                        excelFileName="Quarterly-Trend-Report.xlsx"
                        chartFileName="Quarterly-Trend-Report.png"
                        excelSheetName="Quarterly Trend Data"
                        showPagination={true}
                        showChartTypeSwitcher={false}
                        disableHighlighting={false}
                        disableSelection={false}
                    />
                </div>
                
                {/* --- Chart 1: Grouped Bar Chart --- */}
                <div id='quarterly-grouped-report-div' className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow mb-8" id='quarterly-grouped-report'>
                    <ChartTableComponent id='chart1_Quarterly'
                        data={data}
                        columns={baseQuarterlyColumns}
                        isLoading={isLoading}
                        chartTitle="Permit Volume by Unique Permit Numbers — Quarterly Volumes"
                        xAxisTitle="Fiscal Year"
                        yAxisTitle="Permit Volume"
                        traces={groupedBarTraces}
                        barMode="group"
                        showTrendLine={false}
                        showAverageLine={false}
                        showBarLabels={true}
                        showDataLabels={true}
                        dataLabelPosition="outside"
                        barLabelFontColor="black"
                        excelFileName="Quarterly-Grouped-Report.xlsx"
                        chartFileName="Quarterly-Grouped-Report.png"
                        excelSheetName="Quarterly Grouped Data"
                        showTablePanel={true}
                        initialSplitPos={80}
                        initialTableWidth={350}
                        tableHeaderClassName="text-center"
                        disableHighlighting={true}
                        disableSelection={true}
                        showPagination={true}
                        showChartTypeSwitcher={false}
                    />
                </div>

                {/* --- Chart 2: Aggregated Line Chart --- */}
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow">
                    <ChartTableComponent id='chart2_Quarterly'
                        data={data}
                        columns={baseQuarterlyColumns}
                        isLoading={isLoading}
                        chartTitle="Permit Volume by Unique Permit Numbers — Quarterly Volumes"
                        xAxisTitle="Fiscal Year"
                        yAxisTitle="Permit Volume"
                        traces={quarterlyGroupedTraces}
                        barMode="group"
                        showTrendLine={false}
                        showAverageLine={false}
                        showBarLabels={true}
                        showDataLabels={true}
                        dataLabelPosition="outside"
                        barLabelFontColor="black"
                        showTablePanel={true}
                        initialSplitPos={80}
                        initialTableWidth={350}
                        tableHeaderClassName="text-center"
                        disableHighlighting={true}
                        disableSelection={true}
                        excelFileName="Quarterly-Grouped-Report-2.xlsx"
                        chartFileName="Quarterly-Grouped-Report-2.png"
                        excelSheetName="Quarterly Grouped Data"
                        showPagination={true}
                        showChartTypeSwitcher={false}
                    />
                </div>

                {/* --- 2x2 Grid of Charts --- */}
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                Quarterly Breakdown by Specific Quarter
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow">
                    <ChartTableComponent id='chart3_Quarterly_Q1'            
                        data={q1Data}
                        columns={singleQuarterTrendColumns}
                        isLoading={isLoading}
                        chartTitle="Q1 Permits Over Years"
                        xAxisTitle="Fiscal Year"
                        yAxisTitle="Permit Count"
                        xAccessor="FiscalYear"
                        yAccessor="PermitCount"
                        chartType="line"
                        baseBarColor={customPalette[0]} // Q1 - Ocean Blue
                        showTablePanel={false}
                        initialSplitPos={100}
                        hideSplitter={true}
                        chartLayout={{...quarterlyChartLayout, showlegend: false}}
                        chartFileName="Q1-Permits-Chart.png"
                        showTrendLine={false}
                        showAverageLine={true}
                        showTableToggle={false}
                        showDataLabels={true}
                        dataLabelPosition="outside"
                    />
                </div>
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow">
                    <ChartTableComponent id='chart4_Quarterly_Q2'
                        data={q2Data}
                        columns={singleQuarterTrendColumns}
                        isLoading={isLoading}
                        chartTitle="Q2 Permits Over Years"
                        xAxisTitle="Fiscal Year"
                        yAxisTitle="Permit Count"
                        xAccessor="FiscalYear"
                        yAccessor="PermitCount"
                        initialChartType="line" // Start with line chart
                        showChartTypeSwitcher={true} // Enable chart type switching
                        baseBarColor={customPalette[1]} // Q2 - Sky Blue
                        barLabelPosition="inside" // Position bar labels inside
                        barLabelInsideAnchor="middle" // Center the labels inside bars
                        dataLabelFontColor="black" // For line chart data labels
                        barLabelFontColor="white" // For bar chart data labels
                        showTablePanel={false}
                        initialSplitPos={100}
                        hideSplitter={true}
                        chartLayout={{...quarterlyChartLayout, showlegend: false}}
                        chartFileName="Q2-Permits-Chart.png"
                        showTrendLine={false}
                        showAverageLine={true}
                        showTableToggle={false}
                        showDataLabels={true}
                    />
                </div>
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow">
                    <ChartTableComponent id='chart5_Quarterly_Q3'
                        data={q3Data}
                        columns={singleQuarterTrendColumns}
                        isLoading={isLoading}
                        chartTitle="Q3 Permits Over Years"
                        xAxisTitle="Fiscal Year"
                        yAxisTitle="Permit Count"
                        xAccessor="FiscalYear"
                        yAccessor="PermitCount"
                        initialChartType="line" // Start with line chart
                        showChartTypeSwitcher={true} // Enable chart type switching
                        baseBarColor={customPalette[2]} // Q3 - Light Sky Blue
                        barLabelPosition="inside" // Position bar labels inside
                        barLabelInsideAnchor="middle" // Center the labels inside bars
                        dataLabelFontColor="black" // For line chart data labels
                        barLabelFontColor="white" // For bar chart data labels
                        showTablePanel={false}
                        initialSplitPos={100}
                        hideSplitter={true}
                        chartLayout={{...quarterlyChartLayout, showlegend: false}}
                        chartFileName="Q3-Permits-Chart.png"
                        showTrendLine={false}
                        showAverageLine={true}
                        showTableToggle={false}
                        showDataLabels={true}
                    />
                </div>
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow">
                    <ChartTableComponent id='chart6_Quarterly_Q4'
                        data={q4Data}
                        columns={singleQuarterTrendColumns}
                        isLoading={isLoading}
                        chartTitle="Q4 Permits Over Years"
                        xAxisTitle="Fiscal Year"
                        yAxisTitle="Permit Count"
                        xAccessor="FiscalYear"
                        yAccessor="PermitCount"
                        showTableToggle={false}
                        initialChartType="line" // Start with line chart
                        showChartTypeSwitcher={true} // Enable chart type switching
                        baseBarColor={customPalette[3]} // Q4 - Pale Sky Blue
                        barLabelPosition="inside" // Position bar labels inside
                        barLabelInsideAnchor="middle" // Center the labels inside bars
                        dataLabelFontColor="black" // For line chart data labels
                        barLabelFontColor="white" // For bar chart data labels
                        showTablePanel={false}
                        initialSplitPos={100}
                        hideSplitter={true}
                        chartLayout={{...quarterlyChartLayout, showlegend: false}}
                        chartFileName="Q4-Permits-Chart.png"
                        showTrendLine={false}
                        showAverageLine={true}
                        showDataLabels={true}
                    />
                </div>
            </div>
        </>
    );
}
