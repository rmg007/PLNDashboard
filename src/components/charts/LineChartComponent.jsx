// src/components/charts/LineChartComponent.jsx

import React, { useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useIsDark } from '../../contexts/ThemeContext';
import { getPalette, getPlotlyLayout } from '../../utils/chartTheme';

/**
 * A standalone line chart component that displays time series or continuous data visually without a table.
 * 
 * @param {object} props - The component props
 * @param {string} props.id - Unique identifier for the chart
 * @param {Array<object>} props.data - The dataset for the chart
 * @param {string|function} props.xField - The key in data representing the x-axis values (often date/time) or a function that returns the x value
 * @param {string} props.yField - The key in data representing the y-axis values
 * @param {string} props.title - The title of the chart
 * @param {string} [props.xAxisLabel] - Label for the x-axis
 * @param {string} [props.yAxisLabel] - Label for the y-axis
 * @param {string} [props.lineColor] - Default line color
 * @param {string} [props.lineStyle='solid'] - Line style ('solid', 'dash', 'dot')
 * @param {number} [props.markerSize=6] - Size of data points/markers
 * @param {boolean} [props.showArea=false] - Toggle area fill below the line
 * @param {boolean|number} [props.smoothing] - Apply line smoothing
 * @param {number} [props.height=400] - Chart height
 * @returns {React.Component} The LineChartComponent
 */
const LineChartComponent = forwardRef(({
  id,
  data,
  xField,
  yField,
  title,
  xAxisLabel,
  yAxisLabel,
  lineColor,
  lineStyle = 'solid',
  markerSize = 6,
  showArea = false,
  smoothing,
  height = 400,
  ...otherPlotlyProps
}, ref) => {
  const chartRef = useRef(null);
  const isDark = useIsDark();

  // Expose methods to parent components through ref
  useImperativeHandle(ref, () => ({
    exportAsPNG: () => {
      if (chartRef.current) {
        return Plotly.toImage(chartRef.current, { format: 'png', height, width: chartRef.current.clientWidth })
          .then(url => url);
      }
      return Promise.reject('Chart not initialized');
    },
    chartRef: chartRef,
  }));

  // Generate the chart traces
  const traces = useMemo(() => {
    if (!data || !xField || !yField || data.length === 0) return [];

    // Handle xField as either a string key or a function
    const xValues = typeof xField === 'function' 
      ? data.map(item => xField(item))
      : data.map(item => item[xField]);
    
    const yValues = data.map(item => item[yField]);
    
    // Get color from theme palette if not provided
    const palette = getPalette(isDark);
    const defaultColor = lineColor || palette[0];
    
    // Determine line dash pattern based on lineStyle
    let dash = 'solid';
    if (lineStyle === 'dash') dash = 'dash';
    if (lineStyle === 'dot') dash = 'dot';
    
    // Main line trace
    const lineTrace = {
      x: xValues,
      y: yValues,
      type: 'scatter',
      mode: 'lines+markers',
      name: yAxisLabel || yField,
      line: {
        color: defaultColor,
        dash: dash,
        shape: smoothing ? 'spline' : 'linear',
        smoothing: typeof smoothing === 'number' ? smoothing : 0.65,
        width: 2,
      },
      marker: {
        size: markerSize,
        color: defaultColor,
      },
      hoverinfo: 'x+y',
    };
    
    // Add fill if showArea is true
    if (showArea) {
      lineTrace.fill = 'tozeroy';
      lineTrace.fillcolor = `${defaultColor.replace('rgb', 'rgba').replace(')', ', 0.2)')}`;
    }
    
    return [lineTrace];
  }, [data, xField, yField, lineColor, lineStyle, markerSize, showArea, smoothing, yAxisLabel, isDark]);

  // Generate the chart layout
  const layout = useMemo(() => {
    const themeLayout = getPlotlyLayout(isDark);
    
    // Determine if x-axis should be a date type
    let xAxisType = 'category';
    if (data && data.length > 0) {
      if (typeof xField === 'function') {
        const sampleValue = xField(data[0]);
        if (sampleValue instanceof Date) {
          xAxisType = 'date';
        }
      } else if (data[0][xField] instanceof Date) {
        xAxisType = 'date';
      }
    }
    
    return {
      ...themeLayout,
      title: {
        text: title || '',
        font: {
          ...themeLayout.font,
          size: 18,
        },
      },
      height: height,
      margin: { l: 50, r: 30, t: 50, b: 50 },
      xaxis: {
        ...themeLayout.xaxis,
        title: {
          text: xAxisLabel || (typeof xField === 'string' ? xField : ''),
          font: themeLayout.font,
        },
        type: xAxisType,
      },
      yaxis: {
        ...themeLayout.yaxis,
        title: {
          text: yAxisLabel || yField,
          font: themeLayout.font,
        },
      },
      ...otherPlotlyProps,
    };
  }, [isDark, title, height, xAxisLabel, yAxisLabel, xField, yField, otherPlotlyProps, data]);

  // Config for the Plotly chart
  const config = useMemo(() => ({
    responsive: true,
    displayModeBar: false, // Hide the mode bar completely
    displaylogo: false,
    modeBarButtonsToRemove: [
      'zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d',
      'resetScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'toggleSpikelines'
    ],
  }), []);

  // Initialize and update the chart
  useEffect(() => {
    if (chartRef.current && traces.length > 0) {
      Plotly.react(chartRef.current, traces, layout, config);
    }
  }, [traces, layout, config]);

  // Handle resizing
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        Plotly.Plots.resize(chartRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      id={id} 
      className="w-full h-full flex flex-col"
      style={{ minHeight: `${height}px` }}
    >
      <div ref={chartRef} className="w-full h-full flex-grow"></div>
    </div>
  );
});

export default LineChartComponent;
