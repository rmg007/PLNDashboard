// src/hooks/usePlotlyChart.js

import { useEffect, useCallback } from 'react';
import Plotly from 'plotly.js-dist-min';
import { calculateLinearRegression, calculateAverage } from '../utils/chartCalculations';

export function usePlotlyChart({
    chartRef, chartContainerRef, data, hasData, isLoading, showChartPanel,
    // Chart props
    chartType, xAxisType, xAccessor, yAccessor, yAxisTickFormat,
    // Style props
    baseBarColor, highlightBarColor, barColorScale,
    // Line props
    showTrendLine, trendLineColor, trendLineStyle,
    showAverageLine, averageLineColor, averageLineStyle,
    // Label props
    showBarLabels, barLabelFormat, barLabelPosition, barLabelFontSize, barLabelFontColor, barLabelRotation, barLabelInsideAnchor,
    // Other props
    hoverTemplate, showZoomControls, additionalTraces,
    // Interactive state from parent
    isDragging, table, selectedIndices, hoverIndex, barHoverIndex, setBarHoverIndex, onChartBarClick, onChartBarHover,
}) {
    const updateChart = useCallback(() => {
        // The entire, large updateChart function goes here...
        // It uses the props passed into the hook.
    }, [/*...all dependencies...*/]);

    useEffect(() => {
        if (!isLoading && hasData && showChartPanel && chartContainerRef.current && chartRef.current && !isDragging) {
            updateChart();
        }
    }, [data, updateChart, isDragging, isLoading, hasData, showChartPanel]);
}