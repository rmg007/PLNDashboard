// ===== C:\Users\mhali\OneDrive\Documents\NewDashboard\my-dashboard\src\components\ChartTableComponent\Chart.jsx =====
// src/components/ChartTableComponent/Chart.jsx

import React, { useEffect, useMemo, useCallback } from 'react';
import Plotly from 'plotly.js-dist-min';

export default function Chart({ 
    chartRef, 
    traces, 
    layout: chartLayout = {}, 
    onHover, 
    onLeave, 
    onSelect, 
    highlightedIndex, 
    highlightedCurve, 
    selectedIndices = [], 
    splitPos, 
    xAxisTickAngle,
    chartTitle
}) {
    // Memoize layout and config to prevent unnecessary chart re-renders
    const layout = useMemo(() => ({
        hovermode: 'closest',
        barmode: 'group',
        ...chartLayout,
        // Always show chart title with fallback for undefined
        title: {
            text: chartTitle || chartLayout.title?.text || '',
            font: {
                size: 18,
                color: document.body.classList.contains('dark') ? '#FFF' : '#333',
                family: 'Arial, sans-serif',
                weight: 'bold'
            },
            xref: 'paper',
            x: 0.5, // Center the title
            xanchor: 'center',
            y: 1,
            yanchor: 'top',
            pad: { t: 15 }
        },
        xaxis: { automargin: true, type: 'category', ...chartLayout.xaxis, tickangle: xAxisTickAngle },
        yaxis: { automargin: true, fixedrange: true, rangemode: 'tozero', ...(chartLayout.yaxis?.range ? { autorange: false } : { autorange: true }), ...chartLayout.yaxis },
        margin: { t: chartTitle ? 70 : 50, r: 20, b: 80, l: 60, ...chartLayout.margin }, // Increase top margin if title exists
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: document.body.classList.contains('dark') ? '#FFF' : '#000' },
        legend: { itemclick: 'toggle', itemdoubleclick: false, ...chartLayout.legend },
        autosize: true,
    }), [chartLayout, xAxisTickAngle, chartTitle]);

    const config = useMemo(() => ({ responsive: true, displayModeBar: false }), []);

    // Main effect to update the chart when data or interactions change
    useEffect(() => {
        if (chartRef.current && traces) {
            // Create a new array of traces with updated colors
            const updatedTraces = traces.map((trace, traceIndex) => {
                const newTrace = { ...trace, marker: { ...trace.marker } };

                // Ensure there is data to process
                if (!Array.isArray(newTrace.y)) return newTrace;

                // This logic now correctly determines the color for each bar on every render
                newTrace.marker.color = newTrace.y.map((_, i) => {
                    const originalColor = Array.isArray(trace.marker?.color)
                        ? trace.marker.color[i]
                        : trace.marker?.color || '#3498db';

                    // Priority 1: Selected
                    if (selectedIndices.includes(i)) {
                        return '#e60000'; // Bright Red for selected
                    }
                    
                    // Priority 2: Highlighted
                    if (highlightedIndex === i && (highlightedCurve === null || highlightedCurve === traceIndex)) {
                        return '#ff9933'; // Bright Orange for highlight
                    }
                    
                    // Default color
                    return originalColor;
                });
                return newTrace;
            });

            Plotly.react(chartRef.current, updatedTraces, layout, config);
        }
    }, [traces, layout, config, highlightedIndex, highlightedCurve, selectedIndices]);

    // Effect to set up event listeners. Wrapped in useCallback in parent, so this runs once.
    useEffect(() => {
        const plot = chartRef.current;
        if (plot) {
            const handleHover = (eventData) => {
                if (onHover && eventData.points.length > 0) {
                    const point = eventData.points[0];
                    onHover(point.pointIndex, point.curveNumber);
                }
            };
            const handleClick = (e) => {
                if (onSelect && e.points.length > 0) {
                    onSelect(e.points[0].pointIndex);
                }
            }

            plot.on('plotly_hover', handleHover);
            plot.on('plotly_unhover', onLeave);
            plot.on('plotly_click', handleClick);
            
            return () => {
                if (plot.removeAllListeners) {
                    plot.removeAllListeners();
                }
            };
        }
    }, [chartRef, onHover, onLeave, onSelect]);

    // Effect to resize chart when splitter moves
    useEffect(() => {
        if (chartRef.current) {
            Plotly.Plots.resize(chartRef.current);
        }
    }, [splitPos]);

    return <div ref={chartRef} className="w-full h-full"></div>;
}