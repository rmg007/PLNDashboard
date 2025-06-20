// src/components/ChartTableComponent.jsx

import React, { useState, useMemo, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { useDraggableSplitter } from '../hooks/useDraggableSplitter';
import * as XLSX from 'xlsx';
import Plotly from 'plotly.js-dist-min';

import Toolbar from './ChartTableComponent/Toolbar';
import Chart from './ChartTableComponent/Chart';
import Table from './ChartTableComponent/Table';

export default function ChartTableComponent(props) {
    const {
        data, columns, chartTitle, xAxisTitle, yAxisTitle, xAccessor, yAccessor,
        splitterOrientation = 'vertical', initialSplitPos = 70, baseBarColor,
        traces, barMode, 
        // Support both chartType and initialChartType props
        initialChartType: propInitialChartType, chartType: propChartType, 
        xAxisType = 'category',
        showPagination, showChartTypeSwitcher = true, xAxisTickAngle, chartLayout = {},
        showTrendLine = true, showAverageLine = true, hideSplitter = false,
        showBarLabels = false, barLabelPosition = 'outside',
        barLabelInsideAnchor = 'middle', barLabelFontColor = 'black',
        containerRef: externalContainerRef, showTableToggle = true,
        initialTableWidth = null, disableHighlighting = false,
        showLineLabels = false, id, disableSelection = false,
        dataLabelFontColor = 'black', // New prop for line chart data label color
        showDataLabels = false // New prop to explicitly control data labels
    } = props;
    
    // Determine initial chart type from props, with priority: chartType > initialChartType > default 'bar'
    const initialChartTypeFromProps = propChartType || propInitialChartType || 'bar';

    // State for tracking highlighted and selected indices
    const [highlightedIndex, setHighlightedIndex] = useState(null);
    const [highlightedCurve, setHighlightedCurve] = useState(null);
    const [selectedIndices, setSelectedIndices] = useState(new Set());
    // Initialize state directly from the prop, ensuring it's defined or defaults to 'bar'
    const [chartType, setChartType] = useState(initialChartTypeFromProps || 'bar');

    // Effect to update chartType if the prop changes after initial render
    useEffect(() => {
        setChartType(initialChartTypeFromProps);
    }, [initialChartTypeFromProps]);

    const [sorting, setSorting] = useState([]);
    const [tableVisible, setTableVisible] = useState(true);
    
    // References
    const chartRef = useRef(null);
    const localContainerRef = useRef(null);
    const containerRef = externalContainerRef || localContainerRef;
    
    // Splitter functionality
    const [finalInitialSplit, setFinalInitialSplit] = useState(initialSplitPos);

    useLayoutEffect(() => {
        if (initialTableWidth && containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            if (containerWidth > 0 && splitterOrientation === 'vertical') {
                const tableWidthPercent = (initialTableWidth / containerWidth) * 100;
                setFinalInitialSplit(100 - tableWidthPercent);
            }
        }
    }, [initialTableWidth, splitterOrientation]);

    const { splitPos, isDragging, handleMouseDown } = useDraggableSplitter(containerRef, finalInitialSplit, splitterOrientation);
    
    // Table initialization
    const table = useReactTable({
        data: data || [],
        columns: columns || [],
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    // Generate chart traces based on data and settings
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
        if (!data || !Array.isArray(data) || data.length === 0) return;
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        
        const fileName = `${chartTitle || 'chart_data'}_export_${new Date().toISOString().slice(0,10)}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }, [data, chartTitle]);
    
    // Handle PNG export
    const handleExportPng = useCallback(() => {
        if (!chartRef.current) return;
        
        Plotly.downloadImage(chartRef.current, {
            format: 'png',
            filename: `${chartTitle || 'chart'}_${new Date().toISOString().slice(0,10)}`,
            height: 800,
            width: 1200
        });
    }, [chartRef, chartTitle]);

    // Calculate chart panel style based on splitter position and table visibility
    // When table is hidden, maintain the same height but use full width
    const chartPanelStyle = hideSplitter || !tableVisible 
        ? { width: '100%', height: '100%' } 
        : { width: `${splitPos}%`, flexShrink: 0 };
    
    return (
        <div className="w-full h-full flex flex-col">
            <Toolbar 
                chartType={chartType} 
                setChartType={setChartType} 
                onExportCsv={handleExportCsv} 
                onExportPng={handleExportPng} 
                showChartTypeSwitcher={showChartTypeSwitcher}
                tableVisible={tableVisible}
                onToggleTable={() => setTableVisible(prev => !prev)}
                showTableToggle={showTableToggle}
            />
            <div 
                ref={containerRef} 
                className="relative flex flex-grow overflow-hidden"
                style={{ 
                    minHeight: '450px',
                    flexDirection: splitterOrientation === 'vertical' ? 'row' : 'column'
                }}
            >
                {/* Chart Panel */}
                <div 
                    style={{ 
                        [splitterOrientation === 'vertical' ? 'width' : 'height']: !tableVisible || hideSplitter ? '100%' : `${splitPos}%`,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }} 
                    className="relative flex-shrink-0"
                >
                    <Chart
                        chartRef={chartRef}
                        traces={chartTraces}
                        layout={{
                            title: { text: chartTitle },
                            xaxis: { title: xAxisTitle, type: xAxisType, tickangle: xAxisTickAngle },
                            yaxis: { title: yAxisTitle, tickformat: ',d' },
                            ...chartLayout
                        }}
                        barMode={barMode}
                        highlightedIndex={highlightedIndex}
                        highlightedCurve={highlightedCurve}
                        selectedIndices={Array.from(selectedIndices)}
                        onHover={handleChartHover}
                        onLeave={handleLeave}
                        onSelect={handleRowSelect}
                    />
                </div>
                
                {/* Splitter - rendered between chart and table */}
                {tableVisible && !hideSplitter && (
                    <div 
                        id="splitter" 
                        onMouseDown={handleMouseDown}
                        style={{
                            cursor: splitterOrientation === 'vertical' ? 'col-resize' : 'row-resize',
                            background: '#d1d5db', // Use a neutral gray for a subtle look
                            width: splitterOrientation === 'vertical' ? '10px' : '100%',
                            height: splitterOrientation === 'vertical' ? '100%' : '10px',
                            flexShrink: 0,
                            zIndex: 20,
                        }}
                        className="hover:bg-orange-500 transition-colors"
                    />
                )}
                
                {/* Table Panel */}
                {tableVisible && !hideSplitter && (
                    <div 
                        style={{ 
                            [splitterOrientation === 'vertical' ? 'width' : 'height']: `${100 - splitPos}%`,
                            overflow: 'auto'
                        }} 
                        className="flex-shrink-0"
                    >
                        <Table 
                            table={table}
                            highlightedIndex={highlightedIndex}
                            onRowHover={handleRowHover}
                            onRowLeave={handleLeave}
                            selectedIndices={selectedIndices}
                            onRowSelect={handleRowSelect}
                            showPagination={showPagination}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
