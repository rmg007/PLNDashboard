// ===== C:\Users\mhali\OneDrive\Documents\NewDashboard\my-dashboard\src\components\ChartTableComponent\Chart.jsx =====
// src/components/ChartTableComponent/Chart.jsx

import React, { useEffect, useMemo, useCallback } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useIsDark } from '../../contexts/ThemeContext';
import { getPalette, getPlotlyLayout } from '../../utils/chartTheme';

/**
 * @file Chart.jsx
 * @description A reusable chart component that uses Plotly.js to render interactive charts.
 * It supports theming (dark/light mode), highlighting, selection, and custom layouts.
 * This component is designed to be a pure presentation component, driven by props from its parent.
 */

/**
 * Renders an interactive Plotly chart.
 *
 * @param {object} props - The component props.
 * @param {React.RefObject} props.chartRef - A ref to the div element where the chart will be rendered.
 * @param {Array<object>} props.traces - An array of Plotly trace objects that define the data to be plotted.
 * @param {object} [props.layout={}] - A Plotly layout object to customize the chart's appearance.
 * @param {Function} [props.onHover] - Callback function triggered when a data point is hovered.
 * @param {Function} [props.onLeave] - Callback function triggered when the mouse leaves the plot area.
 * @param {Function} [props.onSelect] - Callback function triggered when a data point is clicked.
 * @param {number|null} props.highlightedIndex - The index of the data point to highlight.
 * @param {number|null} props.highlightedCurve - The index of the trace to highlight.
 * @param {Array<number>} [props.selectedIndices=[]] - An array of indices of currently selected data points.
 * @param {number} [props.splitPos] - The position of a splitter, used to trigger chart resizing.
 * @param {number} [props.xAxisTickAngle] - The angle of the x-axis tick labels.
 * @param {string} [props.chartTitle] - The title of the chart.
 * @param {boolean} [props.verticalLayout=false] - If true, adjusts the layout for vertical stacking.
 * @returns {React.Component} A div element containing the Plotly chart.
 */
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
    chartTitle,
    verticalLayout // Add verticalLayout prop
}) {
        // useIsDark hook from ThemeContext determines the current theme (light or dark).
    const isDark = useIsDark();
    
        // `useMemo` is used here to memoize the Plotly layout configuration.
    // This prevents the expensive layout object from being recalculated on every render,
    // optimizing performance. The layout is recalculated only when its dependencies change.
    const layout = useMemo(() => {
                // Fetches the base layout configuration from a predefined theme (either dark or light).
        // This ensures visual consistency across the application.
        const themeLayout = getPlotlyLayout(isDark);
        
        return {
            hovermode: 'closest',
            barmode: 'group',
            ...chartLayout,
            // Apply theme colors and styles
            ...themeLayout,
            // Always show chart title with fallback for undefined
            title: {
                text: chartTitle || chartLayout.title?.text || '',
                font: {
                    size: 18,
                    color: themeLayout.font.color,
                    family: 'Inter, system-ui, -apple-system, sans-serif',
                    weight: 'bold'
                },
                xref: 'paper',
                x: 0.5, // Center the title
                xanchor: 'center',
                y: 1,
                yanchor: 'top',
                pad: { t: 15 }
            },
            xaxis: { 
                ...themeLayout.xaxis,
                automargin: true, 
                type: 'category', 
                ...chartLayout.xaxis, 
                tickangle: xAxisTickAngle 
            },
            yaxis: { 
                ...themeLayout.yaxis,
                automargin: true, 
                fixedrange: true, 
                rangemode: 'tozero', 
                ...(chartLayout.yaxis?.range ? { autorange: false } : { autorange: true }), 
                ...chartLayout.yaxis 
            },
            margin: { 
                t: chartTitle ? 70 : 50, 
                r: 20, 
                b: 80, 
                l: 60, 
                ...chartLayout.margin 
            },
            // Only show legend if showlegend is not explicitly set to false
            showlegend: chartLayout.showlegend !== false,
            legend: chartLayout.showlegend === false ? { 
                visible: false 
            } : { 
                ...themeLayout.legend,
                itemclick: 'toggle', 
                itemdoubleclick: false, 
                ...chartLayout.legend 
            },
            autosize: true,
        };
    }, [chartLayout, xAxisTickAngle, chartTitle, isDark]);

        // `useMemo` memoizes the Plotly configuration object.
    // This configuration controls the chart's behavior, such as responsiveness and the mode bar.
    // Memoization prevents this object from being recreated on each render.
    const config = useMemo(() => ({
        responsive: true, 
        displayModeBar: false,
        scrollZoom: false,
        displaylogo: false,
        modeBarButtonsToRemove: [
            'select2d', 'lasso2d', 'zoomIn', 'zoomOut', 'autoScale', 'resetScale',
            'hoverClosestCartesian', 'hoverCompareCartesian', 'toggleSpikelines'
        ]
    }), []);

        // This `useEffect` hook is the core of the component's interactivity.
    // It triggers a chart re-render whenever the traces, layout, or user interactions (highlighting, selection) change.
    // It uses `Plotly.react` which efficiently updates the chart instead of redrawing it from scratch.
    useEffect(() => {
        if (chartRef.current && traces) {
                        // Dynamically updates trace colors based on the current theme and user interaction state (selected/highlighted).
            // This logic is crucial for providing visual feedback to the user.
            const updatedTraces = traces.map((trace, traceIndex) => {
                const newTrace = { ...trace, marker: { ...trace.marker } };

                // Ensure there is data to process
                if (!Array.isArray(newTrace.y)) return newTrace;

                // Get colors from theme palette
                const palette = getPalette(isDark);
                
                // This logic now correctly determines the color for each bar on every render
                newTrace.marker.color = newTrace.y.map((_, i) => {
                    const originalColor = Array.isArray(trace.marker?.color)
                        ? trace.marker.color[i]
                        : trace.marker?.color || palette[traceIndex % palette.length];

                    // Priority 1: Selected
                    if (selectedIndices.includes(i)) {
                        return isDark ? '#ef4444' : '#dc2626'; // Red-500/Red-600
                    }
                    
                    // Priority 2: Highlighted
                    if (highlightedIndex === i && (highlightedCurve === null || highlightedCurve === traceIndex)) {
                        return isDark ? '#f97316' : '#ea580c'; // Orange-500/Orange-600
                    }
                    
                    // Default color with opacity for unselected items
                    return originalColor;
                });
                return newTrace;
            });

            Plotly.react(chartRef.current, updatedTraces, layout, config);
        }
    }, [traces, layout, config, highlightedIndex, highlightedCurve, selectedIndices]);

        // This `useEffect` hook is responsible for setting up and tearing down Plotly event listeners.
    // It handles hover, unhover, and click events, connecting them to the callback props (`onHover`, `onLeave`, `onSelect`).
    // The empty dependency array `[]` ensures this effect runs only once when the component mounts, preventing memory leaks.
    useEffect(() => {
                const plot = chartRef.current;
                if (plot) {
                        // Internal handler for Plotly's hover event.
            const handleHover = (eventData) => {
                if (onHover && eventData.points.length > 0) {
                    const point = eventData.points[0];
                    onHover(point.pointIndex, point.curveNumber);
                }
            };
                        // Internal handler for Plotly's click event.
            const handleClick = (e) => {
                if (onSelect && e.points.length > 0) {
                    onSelect(e.points[0].pointIndex);
                }
            }

                        // Attaches the event listeners to the Plotly instance.
            plot.on('plotly_hover', handleHover);
            plot.on('plotly_unhover', onLeave);
            plot.on('plotly_click', handleClick);
            
            
            
                        // Cleanup function: removes all event listeners when the component unmounts
            // to prevent memory leaks and unexpected behavior.
            return () => {
                                if (plot.removeAllListeners) {
                                        plot.removeAllListeners();
                }
            };
        }
        }, [chartRef, onHover, onLeave, onSelect]);

        // This `useEffect` hook ensures the chart is responsive.
    // It calls `Plotly.Plots.resize` whenever the container's dimensions change,
    // which can be triggered by the splitter position (`splitPos`), a layout change (`verticalLayout`), or new data (`traces`).
    useEffect(() => {
        if (chartRef.current) {
            Plotly.Plots.resize(chartRef.current);
        }
    }, [splitPos, verticalLayout, traces]);
    
        // The div element that will contain the Plotly chart.
    // The ref is used by Plotly to target this specific element for rendering.
    return <div ref={chartRef} className="w-full h-full"></div>;
}