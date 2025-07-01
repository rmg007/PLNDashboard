// src/components/ChartTableComponent.jsx

import React, { useState, useMemo, useRef, useEffect, useCallback, useLayoutEffect, forwardRef, useImperativeHandle } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';

import * as XLSX from 'xlsx';
import Plotly from 'plotly.js-dist-min';

import Chart from './ChartTableComponent/Chart';
import Table from './ChartTableComponent/Table';
import IndeterminateCheckbox from './common/IndeterminateCheckbox.jsx';

/**
 * @file ChartTableComponent.jsx
 * @description A comprehensive component that renders a chart and a data table side-by-side or vertically.
 * It synchronizes interactions like hovering and selection between the chart and the table.
 * The component is highly customizable through props, supporting various chart types,
 * data transformations, and UI configurations. It uses Plotly.js for charting and
 * TanStack Table for the data grid.
 */

/**
 * A component that displays an interactive chart and a corresponding data table.
 * It is forwarded a ref to allow parent components to call internal methods like export.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.data - The primary data source for the chart and table.
 * @param {Array<object>} [props.tableData=props.data] - Optional separate data source for the table.
 * @param {Array<object>} props.columns - Column definitions for the TanStack Table.
 * @param {string} [props.chartTitle] - The title displayed above the chart.
 * @param {string} [props.xAxisTitle] - The title for the X-axis.
 * @param {string} [props.yAxisTitle] - The title for the Y-axis.
 * @param {string} props.xAccessor - The key in the data objects for the X-axis values.
 * @param {string} props.yAccessor - The key in the data objects for the Y-axis values.
 * @param {string} [props.baseBarColor] - The base color for chart bars.
 * @param {Array<object>} [props.traces] - Pre-defined Plotly traces to be used instead of generating from data.
 * @param {string} [props.barMode] - The bar mode for bar charts (e.g., 'group', 'stack').
 * @param {string} [props.initialChartType='bar'] - The initial type of chart to display ('bar', 'line', etc.).
 * @param {string} [props.chartType] - Controlled prop to set the chart type externally.
 * @param {string} [props.xAxisType='category'] - The type of the X-axis for Plotly.
 * @param {boolean} [props.showPagination=true] - Whether to show pagination controls for the table.
 * @param {boolean} [props.showChartTypeSwitcher=true] - Whether to show UI for switching chart types.
 * @param {number} [props.xAxisTickAngle] - Angle for the X-axis tick labels.
 * @param {object} [props.chartLayout={}] - Custom Plotly layout settings to merge with the default layout.
 * @param {boolean} [props.showTrendLine=true] - Whether to calculate and display a trend line on the chart.
 * @param {boolean} [props.showAverageLine=true] - Whether to calculate and display an average line on the chart.
 * @param {boolean} [props.hideSplitter=false] - Whether to hide the splitter between the chart and table.
 * @param {boolean} [props.showBarLabels=false] - Whether to show labels on bars in a bar chart.
 * @param {string} [props.barLabelPosition='outside'] - Position of bar labels ('inside', 'outside').
 * @param {React.RefObject} [props.containerRef] - An external ref for the main container element.
 * @param {boolean} [props.showTableToggle=true] - Whether to show a button to toggle the table's visibility.
 * @param {boolean} [props.showTablePanel=true] - Prop to control the visibility of the table panel.
 * @param {number} [props.initialTableWidth=null] - The initial width of the table panel in pixels.
 * @param {boolean} [props.disableHighlighting=false] - If true, disables hover highlighting effects.
 * @param {boolean} [props.tableAutoWidth=false] - If true, allows the table to set its own width.
 * @param {boolean} [props.showLineLabels=false] - Whether to show labels on points in a line chart.
 * @param {string} [props.id] - A unique identifier for the component instance.
 * @param {string} [props.dataLabelFontColor='black'] - Font color for data labels on line charts.
 * @param {boolean} [props.showDataLabels=false] - General prop to control visibility of data labels.
 * @param {boolean} [props.enableRowSelectionCheckbox=false] - If true, adds a checkbox column for row selection.
 * @param {boolean} [props.disableSelection=false] - If true, disables row selection functionality.
 * @param {number} [props.pageSize=10] - The number of rows to display per page in the table.
 * @param {boolean} [props.verticalLayout=false] - If true, stacks the chart and table vertically.
 * @param {boolean} [props.showLegend=true] - Whether to show the chart legend.
 * @param {boolean} [props.disableHover=false] - If true, disables all hover effects.
 * @param {React.Ref} ref - The forwarded ref.
 * @returns {React.Component} The ChartTableComponent.
 */
const ChartTableComponent = forwardRef((props, ref) => {
    const {
        data, tableData, columns, chartTitle, xAxisTitle, yAxisTitle, xAccessor, yAccessor,
        baseBarColor,
        traces, barMode, 
        // Support both chartType and initialChartType props
        initialChartType: propInitialChartType, chartType: propChartType, 
        xAxisType = 'category',
        showPagination, showChartTypeSwitcher = true, xAxisTickAngle, chartLayout = {},
        showTrendLine = true, showAverageLine = true, hideSplitter = false,
        showBarLabels = false, barLabelPosition = 'outside',
        barLabelInsideAnchor = 'middle', barLabelFontColor = 'black',
        containerRef: externalContainerRef, showTableToggle = true, showTablePanel = true,
        initialTableWidth = null, disableHighlighting = false, tableAutoWidth = false,
        showLineLabels = false, id,
        dataLabelFontColor = 'black', // New prop for line chart data label color
        showDataLabels = false, // New prop to explicitly control data labels
        enableRowSelectionCheckbox = false, // New prop to enable checkbox row selection
        disableSelection = false,
        pageSize = 10,
        verticalLayout = false, // New prop to control vertical layout
        showLegend = true, // New prop to control legend visibility
        disableHover = false, // New prop to disable hover
    } = props;
    
    // Determine initial chart type from props, with priority: chartType > initialChartType > default 'bar'
    const id_slug = useMemo(() => 
        props.chartTitle 
            ? props.chartTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') 
            : 'chart-table'
    , [props.chartTitle]);

    const initialChartTypeFromProps = propChartType || propInitialChartType || 'bar';

    // SECTION: State Management
    // -------------------------
    // Manages the component's internal state for interactivity and display.

    // `highlightedIndex` and `highlightedCurve` track the data point/series currently under the mouse hover.
    const [highlightedIndex, setHighlightedIndex] = useState(null);
    const [highlightedCurve, setHighlightedCurve] = useState(null);

    // `selectedIndices` stores the indices of data points that have been clicked/selected by the user.
    const [selectedIndices, setSelectedIndices] = useState(new Set());

    // `rowSelection` is used by TanStack Table to manage the state of selected rows, especially with checkboxes.
    const [rowSelection, setRowSelection] = useState({});

    // `pagination` holds the current page index and page size for the table.
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: pageSize,
    });

    // `chartType` controls the type of chart being displayed (e.g., 'bar', 'line').
    const [chartType, setChartType] = useState(initialChartTypeFromProps || 'bar');

    // `sorting` manages the sorting state of the table columns.
    const [sorting, setSorting] = useState([]);
    
    // Effect to update chartType if the controlling prop changes.
    useEffect(() => {
        setChartType(initialChartTypeFromProps);
    }, [initialChartTypeFromProps]);

    // Effect to update pagination if the pageSize prop changes.
    useEffect(() => {
        setPagination(prev => ({ ...prev, pageSize }));
    }, [pageSize]);


    // SECTION: Refs
    // -------------------------
    // Refs are used to hold references to DOM elements and other imperative handles.

    // `chartRef` holds a reference to the Plotly chart's container div, necessary for Plotly's API.
    const chartRef = useRef(null);
    // `localContainerRef` is a ref to the component's root div, used if an external ref is not provided.
    const localContainerRef = useRef(null);
    // `containerRef` is the primary ref for the component's root div, preferring an external ref if available.
    const containerRef = externalContainerRef || localContainerRef;
    
    // SECTION: Dynamic Layout Styling
    // -------------------------------
    // These style objects are computed dynamically based on props to control the layout of the chart and table panels.

    const chartPanelStyle = {
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    };
    const tablePanelStyle = {};

    // The `verticalLayout` prop dictates whether the chart and table are stacked vertically or horizontally.
    if (verticalLayout) {
        // In vertical layout, both chart and table take full width
        chartPanelStyle.width = '100%';
        chartPanelStyle.height = '60%'; // Give chart 60% of height
        chartPanelStyle.minHeight = '400px'; // Ensure minimum height for chart
        tablePanelStyle.width = '100%';
        tablePanelStyle.height = '40%'; // Give table 40% of height
        tablePanelStyle.flex = 'none'; // Override flex behavior
        // Remove left border from table panel in vertical layout
        tablePanelStyle.borderLeft = 'none';
        // Add top border to table panel for visual separation
        tablePanelStyle.borderTop = '1px solid #e5e7eb';
    } else if (!showTablePanel) {
        chartPanelStyle.width = '100%';
    } else if (tableAutoWidth) {
        chartPanelStyle.flex = '1 1 0';
        chartPanelStyle.minWidth = '0';
        tablePanelStyle.flex = '0 0 auto';
    } else if (initialTableWidth) {
        tablePanelStyle.width = `${initialTableWidth}px`;
        tablePanelStyle.flexShrink = 0;
        chartPanelStyle.width = `calc(100% - ${initialTableWidth}px)`;
        chartPanelStyle.flexShrink = 0;
    } else {
        const chartWidth = 60; // default
        chartPanelStyle.width = `${chartWidth}%`;
        chartPanelStyle.flexShrink = 0;
        tablePanelStyle.width = `${100 - chartWidth}%`;
        tablePanelStyle.flexShrink = 0;
    }
    
    // Prepare columns with potential selection checkbox column
    const tableColumns = useMemo(() => {
        let currentColumns = columns || [];
        if (enableRowSelectionCheckbox) {
            return [
                {
                    id: 'select',
                    header: ({ table }) => (
                        <IndeterminateCheckbox
                            {...{
                                checked: table.getIsAllRowsSelected(),
                                indeterminate: table.getIsSomeRowsSelected(),
                                onChange: table.getToggleAllRowsSelectedHandler(),
                                'aria-label': 'Select all rows',
                            }}
                        />
                    ),
                    cell: ({ row }) => (
                        <div className="px-1 flex justify-center items-center h-full">
                            <IndeterminateCheckbox
                                {...{
                                    checked: row.getIsSelected(),
                                    disabled: !row.getCanSelect(),
                                    indeterminate: row.getIsSomeSelected(),
                                    onChange: row.getToggleSelectedHandler(),
                                    'aria-label': `Select row ${row.index + 1}`,
                                }}
                            />
                        </div>
                    ),
                    size: 40, // Fixed size for the checkbox column
                    minSize: 40,
                    maxSize: 40,
                    enableSorting: false,
                },
                ...currentColumns,
            ];
        }
        return currentColumns;
    }, [columns, enableRowSelectionCheckbox]);

    // Table initialization
    const tableDataToUse = useMemo(() => tableData || data, [tableData, data]);

    // SECTION: TanStack Table Instance
    // --------------------------------
    // This is where the TanStack Table instance is created and configured.
    // It brings together the data, columns, and state management for the table.
    const table = useReactTable({
        data: tableDataToUse || [],
        columns: tableColumns, // Use potentially modified columns
        state: { 
            sorting,
            rowSelection,
            pagination,
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onRowSelectionChange: enableRowSelectionCheckbox ? setRowSelection : undefined,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    // SECTION: Chart Trace Generation
    // -------------------------------
    // This `useMemo` block is responsible for generating the data traces required by Plotly.
    // It's memoized for performance, re-computing only when its dependencies change.
    // It can either use pre-defined `traces` or generate them from `data`.
    // It also handles the logic for adding optional average and trend lines.
    const chartTraces = useMemo(() => {
        if (traces) {
            let finalTraces = [];
            
            // Process traces based on chart type
            if (chartType === 'line') {
                finalTraces = traces.map(trace => {
                    // Show data labels for line charts when showDataLabels or showLineLabels is true
                    if (id === 'chartPSCActivity' || showLineLabels || showDataLabels) {
                        return { 
                            ...trace, 
                            type: 'scatter', 
                            mode: 'lines+markers+text',
                            text: trace.y.map(y => y.toLocaleString()),
                            textposition: 'top center',
                            textfont: {
                                family: 'Arial, sans-serif',
                                size: 12,
                                color: dataLabelFontColor || (document.body.classList.contains('dark') ? '#FFF' : '#333')
                            }
                        };
                    }
                    return { ...trace, type: 'scatter', mode: 'lines+markers' };
                });
            } else {
                finalTraces = [...traces];
            }
            
            // Add average line if enabled and we have trace data
            if (showAverageLine && traces.length > 0 && traces[0].y && traces[0].y.length > 0) {
                // Calculate average from the first trace (main data series)
                const yValues = traces[0].y;
                const average = yValues.reduce((a, b) => a + b, 0) / yValues.length;
                
                // Get x-axis range for the average line
                const xValues = traces[0].x;
                
                // Add average line trace
                finalTraces.push({
                    x: [xValues[0], xValues[xValues.length - 1]],
                    y: [average, average],
                    type: 'scatter',
                    mode: 'lines',
                    name: `Average: ${average.toLocaleString()}`,
                    line: { color: '#ff7f0e', dash: 'dash', width: 2 },
                    hoverinfo: 'name'
                });
            }
            
            // Add trend line if enabled and we have trace data
            if (showTrendLine && traces.length > 0 && traces[0].y && traces[0].y.length > 1) {
                const yValues = traces[0].y;
                const xValues = traces[0].x;
                const n = yValues.length;
                
                // Create x indices for calculation (0, 1, 2, ...)
                const xIndices = Array.from({length: n}, (_, i) => i);
                
                // Calculate linear regression
                const sumX = xIndices.reduce((a, b) => a + b, 0);
                const sumY = yValues.reduce((a, b) => a + b, 0);
                const sumXY = xIndices.map((xi, i) => xi * yValues[i]).reduce((a, b) => a + b, 0);
                const sumXX = xIndices.map(xi => xi * xi).reduce((a, b) => a + b, 0);
                
                const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                const intercept = (sumY - slope * sumX) / n;
                
                // Calculate trend line y values
                const trendY = xIndices.map(xi => slope * xi + intercept);
                
                // Add trend line trace
                finalTraces.push({
                    x: xValues,
                    y: trendY,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Trend',
                    line: { color: '#d62728', width: 2, shape: 'spline' },
                    hoverinfo: 'name'
                });
            }
            
            return finalTraces;
        }

        if (!data || !xAccessor || !yAccessor) return [];
        
        const sortedData = table.getRowModel().rows.map(row => row.original);
        const xValues = sortedData.map(d => d[xAccessor]);
        const yValues = sortedData.map(d => d[yAccessor]);
        
        const finalTraces = [{
            x: xValues, y: yValues, type: chartType,
            mode: chartType === 'line' ? (showDataLabels ? 'lines+markers+text' : 'lines+markers') : undefined,
            name: yAxisTitle,
            marker: { color: baseBarColor },
            text: (chartType === 'bar' && showBarLabels) || (chartType === 'line' && showDataLabels) ? yValues.map(y => y.toLocaleString()) : undefined,
            textposition: chartType === 'line' ? 'top center' : (barLabelPosition === 'inside' ? 'inside' : 'outside'),
            insidetextanchor: barLabelInsideAnchor,
            textfont: {
                color: chartType === 'line' ? dataLabelFontColor : (barLabelPosition === 'inside' ? barLabelFontColor : undefined),
                size: 12
            },
        }];

        if (showAverageLine && yValues.length > 1) {
            const average = yValues.reduce((a, b) => a + b, 0) / yValues.length;
            finalTraces.push({
                x: [xValues[0], xValues[xValues.length - 1]], y: [average, average],
                type: 'scatter', mode: 'lines', name: `Average`,
                line: { color: '#ff7f0e', dash: 'dash' }, hoverinfo: 'name',
            });
        }
        if (showTrendLine && yValues.length > 1) {
            const n = yValues.length;
            const xIndices = Array.from({length: n}, (_, i) => i);
            const sumX = xIndices.reduce((a, b) => a + b, 0);
            const sumY = yValues.reduce((a, b) => a + b, 0);
            const sumXY = xIndices.map((xi, i) => xi * yValues[i]).reduce((a, b) => a + b, 0);
            const sumXX = xIndices.map(xi => xi * xi).reduce((a, b) => a + b, 0);
            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;
            const trendY = xIndices.map(xi => slope * xi + intercept);
            finalTraces.push({
                x: xValues, y: trendY, type: 'scatter', mode: 'lines',
                name: 'Trend', line: { color: '#d62728', shape: 'spline' }
            });
        }
        
        return finalTraces;
    }, [traces, chartType, data, xAccessor, yAccessor, table, sorting, baseBarColor, yAxisTitle, showTrendLine, showAverageLine]);

    // Update the layout to include showLegend from props
    const chartLayoutWithTheme = useMemo(() => ({
        ...chartLayout,
        showlegend: showLegend !== false, // Default to true if not specified
    }), [chartLayout, showLegend]);

    // Handle row selection
    const handleRowSelect = useCallback((index) => {
        // Skip selection if disableSelection is true or for specific chart IDs
        if (disableSelection || id === 'chartPSCWeekdayActivity' || id === 'chartPSCWeekdayByDayActivity') {
            return;
        }
        
        setSelectedIndices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }, [disableSelection, id]);

    // Handle chart hover events
    const handleChartHover = useCallback((data) => {
        if (disableHighlighting) return;
        if (!data || !data.points || data.points.length === 0) {
            setHighlightedIndex(null);
            return;
        }
        const pointIndex = data.points[0].pointIndex;
        setHighlightedIndex(pointIndex);
    }, [disableHighlighting]);

    // Handle mouse leave events
    const handleLeave = useCallback(() => {
        setHighlightedIndex(null);
        setHighlightedCurve(null);
    }, []);

    // Handle row hover events
    const handleRowHover = useCallback((index) => {
        if (disableHighlighting) return;
        setHighlightedIndex(index);
        setHighlightedCurve(null);
    }, [disableHighlighting]);

    // Handle CSV export
    const handleExportCsv = useCallback(() => {
        const dataToExport = tableData || data;
        if (!dataToExport || !Array.isArray(dataToExport) || dataToExport.length === 0) return;
        
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        
        const fileName = `${chartTitle || 'chart_data'}_export_${new Date().toISOString().slice(0,10)}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }, [data, tableData, chartTitle]);
    
    /**
     * Exports the current view of the chart as a PNG image.
     * It uses Plotly's `downloadImage` utility.
     */
    const handleExportPng = useCallback(() => {
        if (!chartRef.current) return;
        
        Plotly.downloadImage(chartRef.current, {
            format: 'png',
            filename: `${chartTitle || 'chart'}_${new Date().toISOString().slice(0,10)}`,
            height: 800,
            width: 1200
        });
    }, [chartRef, chartTitle]);

    // Toggle Table Visibility
    const [tableVisible, setTableVisible] = useState(true); // Table is visible by default
    const toggleTableVisibility = () => {
        setTableVisible(!tableVisible);
    };

    // SECTION: Imperative Handle
    // --------------------------
    // `useImperativeHandle` exposes specific functions to the parent component via a ref.
    // This allows the parent to trigger actions like exporting or toggling the table visibility
    // without needing to manage the component's internal state.
    useImperativeHandle(ref, () => ({
        toggleTable: toggleTableVisibility,
        exportAsXLSX: handleExportCsv, 
        exportAsPNG: handleExportPng,
        setChartType,
        getChartType: () => chartType,
        isTableVisible: () => tableVisible
    }));

    // SECTION: Component Rendering (JSX)
    // ----------------------------------
    return (
        // The main container div. Its flex direction changes based on the `verticalLayout` prop.
        <div 
            id={`ctc-${id_slug}-container`}
            ref={containerRef} 
            className={`w-full h-full relative flex ${verticalLayout ? 'flex-col' : 'flex-row'} flex-grow overflow-hidden`}
            style={{ minHeight: '450px' }}
        >
            {/* More Menu removed from here - now rendered by parent component */}
            {/* Chart Panel: Contains the chart title and the Chart component itself. */}
            <div id={`ctc-${id_slug}-chart-panel`} style={chartPanelStyle} className="relative flex-shrink-0 flex flex-col p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                {chartTitle && (
                    <h3 id={`ctc-${id_slug}-chart-title`} className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center flex-shrink-0">
                        {chartTitle}
                    </h3>
                )}
                <div id={`ctc-${id_slug}-chart-wrapper`} className="relative flex-grow">
                    <Chart
                        chartRef={chartRef}
                        traces={chartTraces}
                        layout={{
                            ...chartLayoutWithTheme,
                            xaxis: {
                                ...chartLayoutWithTheme.xaxis,
                                tickangle: xAxisTickAngle,
                            },
                            yaxis: {
                                ...chartLayoutWithTheme.yaxis,
                                title: yAxisTitle,
                            },
                        }}
                        barMode={barMode}
                        highlightedIndex={highlightedIndex}
                        highlightedCurve={highlightedCurve}
                        selectedIndices={Array.from(selectedIndices)}
                        rowSelection={rowSelection}
                        onHover={handleChartHover}
                        onLeave={handleLeave}
                        onSelect={handleRowSelect}
                        verticalLayout={verticalLayout}
                    />
                </div>
            </div>
            
            {/* Table Panel: Contains the TanStack Table. It's conditionally rendered based on the `showTablePanel` prop. */}
            {showTablePanel && (
                <div id={`ctc-${id_slug}-table-panel`} style={tablePanelStyle} className={`flex flex-col flex-shrink-0 ${!verticalLayout ? 'border-l' : ''} border-gray-200 dark:border-gray-700`}>
                    <div id={`ctc-${id_slug}-table-wrapper`} className="flex-grow overflow-auto text-sm">
                        <Table 
                            table={table}
                            id_slug={id_slug}
                            highlightedIndex={highlightedIndex}
                            onRowHover={handleRowHover}
                            onRowLeave={handleLeave}
                            selectedIndices={selectedIndices}
                            onRowSelect={handleRowSelect}
                            showPagination={showPagination}
                            disableSelection={disableSelection}
                            disableHover={disableHover}
                            className="compact-table"
                        />
                    </div>
                </div>
            )}
        </div>
    );
});

export default ChartTableComponent;
