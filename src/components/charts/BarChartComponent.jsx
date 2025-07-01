// src/components/charts/BarChartComponent.jsx

import React, { useRef, useEffect, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useIsDark } from '../../contexts/ThemeContext';
import { getPalette, getPlotlyLayout } from '../../utils/chartTheme';

/**
 * A standalone bar chart component that displays data visually without a table.
 * 
 * @param {object} props - The component props
 * @param {string} props.id - Unique identifier for the chart
 * @param {Array<object>} props.data - The dataset for the chart
 * @param {string} props.xField - The key in data representing the x-axis values
 * @param {string} props.yField - The key in data representing the y-axis values
 * @param {string} props.title - The title of the chart
 * @param {string} [props.xAxisLabel] - Label for the x-axis
 * @param {string} [props.yAxisLabel] - Label for the y-axis
 * @param {string} [props.color] - Default bar color
 * @param {boolean} [props.showLabels=true] - Toggle data labels on bars
 * @param {Function} [props.labelFormat] - Custom formatting of bar labels
 * @param {number} [props.height=400] - Chart height
 * @param {boolean} [props.showTrendLine=true] - Display a simple trend line if numerical data
 * @param {object} [props.otherPlotlyProps] - Any additional Plotly-specific props
 * @returns {React.Component} The BarChartComponent
 */
const BarChartComponent = forwardRef(({
  id,
  data,
  xField,
  yField,
  title,
  xAxisLabel,
  yAxisLabel,
  color = 'rgb(189, 135, 143)',
  showLabels = true,
  labelFormat = (value) => value.toLocaleString(),
  height = 400,
  showTrendLine = true,
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

  // Extract highlightedIndex from props for easier access
  const { highlightedIndex } = otherPlotlyProps;

  // Generate the chart traces
  const traces = useMemo(() => {
    if (!data || !xField || !yField || data.length === 0) return [];

    const xValues = data.map(item => item[xField]);
    const yValues = data.map(item => item[yField]);
    
    // Create colors array based on highlightedIndex
    const colors = yValues.map((_, index) => {
      if (highlightedIndex === index) {
        // Highlighted bar color
        return isDark ? 'rgb(59, 130, 246)' : 'rgb(37, 99, 235)';
      }
      // Default color
      return color;
    });
    
    // Main bar trace
    const barTrace = {
      x: xValues,
      y: yValues,
      type: 'bar',
      name: yAxisLabel || yField,
      marker: {
        color: colors,
        line: {
          width: highlightedIndex !== null && highlightedIndex !== undefined ? 1 : 0,
          color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'
        }
      },
      text: showLabels ? yValues.map(labelFormat) : undefined,
      textposition: 'auto',
      textpositionmode: 'middle center',
      hoverinfo: 'text',
      hovertemplate: [
        '<b>%{x}</b>',
        '%{y:,.0f}',
        '<extra></extra>'
      ].join('<br>'),
      hoverlabel: {
        bgcolor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        bordercolor: isDark ? '#4B5563' : '#E5E7EB',
        font: {
          family: 'Inter, system-ui, -apple-system, sans-serif',
          size: 12,
          color: isDark ? '#F9FAFB' : '#111827'
        },
        align: 'left',
        namelength: -1,
        padding: { t: 8, b: 8, l: 12, r: 12 }
      },
      insidetextanchor: 'middle',
      textfont: {
        color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        size: 10,
        family: 'Inter, system-ui, -apple-system, sans-serif'
      },
    };
    
    const result = [barTrace];
    
    // Add trend line if enabled and we have numerical x values
    if (showTrendLine && yValues.length > 1) {
      try {
        // Check if x values can be converted to numbers for trend line
        const numericXValues = xValues.map((x, i) => i);
        const n = numericXValues.length;
        
        // Simple linear regression
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
          sumX += numericXValues[i];
          sumY += yValues[i];
          sumXY += numericXValues[i] * yValues[i];
          sumXX += numericXValues[i] * numericXValues[i];
        }
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Create trend line trace
        const trendY = numericXValues.map(x => slope * x + intercept);
        
        result.push({
          x: xValues,
          y: trendY,
          type: 'scatter',
          mode: 'lines',
          name: 'Trend',
          line: {
            color: 'rgba(255, 127, 14, 0.7)',
            width: 2,
            dash: 'dash',
          },
          hoverinfo: 'none',
        });
      } catch (error) {
        console.warn('Could not calculate trend line:', error);
      }
    }
    
    return result;
  }, [data, xField, yField, color, showLabels, labelFormat, showTrendLine, yAxisLabel, highlightedIndex, isDark]);

  // Generate the chart layout
  const layout = useMemo(() => {
    const themeLayout = getPlotlyLayout(isDark);
    
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
      margin: { l: 50, r: 30, t: 50, b: 80 },
      xaxis: {
        ...themeLayout.xaxis,
        title: {
          text: xAxisLabel || xField,
          font: { ...themeLayout.font, family: 'Inter, system-ui, -apple-system, sans-serif' },
        },
        tickangle: -45,
        type: 'category', // Explicitly set as categorical
        categoryorder: 'trace', // Maintain order from data
        tickfont: { ...themeLayout.xaxis.tickfont, family: 'Inter, system-ui, -apple-system, sans-serif' }
      },
      yaxis: {
        ...themeLayout.yaxis,
        title: {
          text: yAxisLabel || yField,
          font: { ...themeLayout.font, family: 'Inter, system-ui, -apple-system, sans-serif' },
        },
        tickfont: { ...themeLayout.yaxis.tickfont, family: 'Inter, system-ui, -apple-system, sans-serif' }
      },
      hovermode: 'closest',
      hoverdistance: 20,
      ...otherPlotlyProps,
    };
  }, [isDark, title, height, xAxisLabel, yAxisLabel, xField, yField, otherPlotlyProps]);

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
      Plotly.react(chartRef.current, traces, layout, config).then(() => {
        // Add event listeners for hover synchronization after chart is initialized
        if (typeof otherPlotlyProps.onHover === 'function' || typeof otherPlotlyProps.onLeave === 'function') {
          // Check if the chart has Plotly methods before calling them
          if (chartRef.current && typeof chartRef.current.removeAllListeners === 'function') {
            // Remove existing event listeners to prevent duplicates
            chartRef.current.removeAllListeners('plotly_hover');
            chartRef.current.removeAllListeners('plotly_unhover');
          }
          
          // Add hover event listener
          if (chartRef.current && typeof chartRef.current.on === 'function') {
            chartRef.current.on('plotly_hover', (eventData) => {
              if (typeof otherPlotlyProps.onHover === 'function' && eventData.points && eventData.points.length > 0) {
                // Get the index of the hovered point
                const pointIndex = eventData.points[0].pointIndex;
                otherPlotlyProps.onHover(pointIndex);
              }
            });
            
            // Add unhover event listener
            chartRef.current.on('plotly_unhover', () => {
              if (typeof otherPlotlyProps.onLeave === 'function') {
                otherPlotlyProps.onLeave();
              }
            });
          }
        }
      }).catch(error => {
        console.error('Error initializing chart:', error);
      });
    }
  }, [traces, layout, config, otherPlotlyProps.onHover, otherPlotlyProps.onLeave]);

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

  // Event handlers for hover synchronization
  useEffect(() => {
    if (chartRef.current && typeof otherPlotlyProps.onHover === 'function') {
      // Check if the chart has Plotly methods before calling them
      if (typeof chartRef.current.removeAllListeners === 'function') {
        // Remove existing event listeners to prevent duplicates
        chartRef.current.removeAllListeners('plotly_hover');
        chartRef.current.removeAllListeners('plotly_unhover');
      }
      
      // Add hover event listener
      if (typeof chartRef.current.on === 'function') {
        chartRef.current.on('plotly_hover', (eventData) => {
          if (eventData.points && eventData.points.length > 0) {
            // Get the index of the hovered point
            const pointIndex = eventData.points[0].pointIndex;
            otherPlotlyProps.onHover(pointIndex);
          }
        });
        
        // Add unhover event listener
        chartRef.current.on('plotly_unhover', () => {
          if (typeof otherPlotlyProps.onLeave === 'function') {
            otherPlotlyProps.onLeave();
          }
        });
      }
    }
  }, [otherPlotlyProps.onHover, otherPlotlyProps.onLeave]);

  return (
    <div 
      id={id} 
      className="w-full h-full flex flex-col relative"
      style={{ minHeight: `${height}px` }}
    >
      <div ref={chartRef} className="w-full h-full flex-grow"></div>
    </div>
  );
});

export default BarChartComponent;
