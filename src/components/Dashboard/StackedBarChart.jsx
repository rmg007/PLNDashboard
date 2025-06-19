import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

/**
 * Stacked Bar Chart component for visualizing composition data
 * @param {Object} props - Component props
 * @param {Array} props.data - Data for the chart
 * @param {string} props.title - Chart title
 * @param {string} props.xAxisTitle - X-axis title
 * @param {string} props.yAxisTitle - Y-axis title
 * @param {string} props.xField - Field name for x-axis values
 * @param {Array} props.categories - Categories to stack
 * @param {Array} props.colors - Colors for each category
 */
const StackedBarChart = ({
  data = [],
  title = '',
  xAxisTitle = '',
  yAxisTitle = '',
  xField = '',
  categories = [],
  colors = []
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Default data if none is provided
    const defaultData = [
      { year: '2019', '<$100K': 450, '$100K-$1M': 320, '$1M-$10M': 150, '>$10M': 30 },
      { year: '2020', '<$100K': 400, '$100K-$1M': 300, '$1M-$10M': 120, '>$10M': 30 },
      { year: '2021', '<$100K': 480, '$100K-$1M': 350, '$1M-$10M': 180, '>$10M': 40 },
      { year: '2022', '<$100K': 520, '$100K-$1M': 380, '$1M-$10M': 200, '>$10M': 50 },
      { year: '2023', '<$100K': 550, '$100K-$1M': 420, '$1M-$10M': 220, '>$10M': 55 }
    ];
    
    const defaultCategories = ['<$100K', '$100K-$1M', '$1M-$10M', '>$10M'];
    const defaultXField = 'year';
    
    // Use provided data or fallback to default
    const chartData = data.length > 0 ? data : defaultData;
    const chartCategories = categories.length > 0 ? categories : defaultCategories;
    const chartXField = xField || defaultXField;
    
    if (chartRef.current) {
      // Extract x values
      const xValues = chartData.map(item => item[chartXField]);
      
      // Default color palette if none provided
      const colorPalette = colors.length > 0 ? colors : [
        '#3B82F6', // Blue (primary)
        '#10B981', // Green (success)
        '#F59E0B', // Amber (warning)
        '#6366F1', // Indigo (info)
        '#8B5CF6', // Purple (secondary)
        '#EC4899', // Pink (accent)
        '#14B8A6', // Teal (tertiary)
        '#F97316', // Orange (alt)
        '#64748B', // Slate (neutral)
        '#6B7280'  // Gray (muted)
      ];
      
      // Create a trace for each category
      const traces = chartCategories.map((category, index) => ({
        x: xValues,
        y: chartData.map(item => item[category] || 0),
        name: category,
        type: 'bar',
        marker: {
          color: colorPalette[index % colorPalette.length]
        },
        hovertemplate: `${category}: %{y}<extra></extra>`
      }));

      // Layout configuration with increased margins to prevent overlap
      const layout = {
        title: {
          text: title || 'Permit Volume by Valuation Range',
          font: {
            size: 18,
            color: '#333',
            family: 'Inter, system-ui, sans-serif'
          }
        },
        // Hide modebar buttons
        modeBarButtonsToRemove: ['toImage', 'pan2d', 'select2d', 'lasso2d', 'resetScale2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d'],
        displayModeBar: false,
        xaxis: {
          title: xAxisTitle || 'Year',
          titlefont: {
            size: 14
          },
          tickangle: -45
        },
        yaxis: {
          title: yAxisTitle || 'Number of Permits',
          titlefont: {
            size: 14
          },
          gridcolor: 'rgba(200, 200, 200, 0.2)'
        },
        barmode: 'stack',
        legend: {
          orientation: 'h',
          y: -0.3,  // Moved down to avoid overlap
          x: 0.5,
          xanchor: 'center',
          traceorder: 'normal'
        },
        margin: {
          l: 100,  // Increased for y-axis title
          r: 50,   // Increased for better spacing
          t: 50,
          b: 100   // Significantly increased for legend and x-axis title
        },
        plot_bgcolor: 'rgba(255, 255, 255, 0.95)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        hovermode: 'closest',
        autosize: true // Enable autosize for better responsiveness
      };

      // Configuration options
      const config = {
        responsive: true,
        displayModeBar: false,
        displaylogo: false
      };

      // Create the plot
      Plotly.newPlot(chartRef.current, traces, layout, config);
      
      // Add window resize handler for responsiveness
      const handleResize = () => {
        Plotly.Plots.resize(chartRef.current);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Return cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    // Cleanup function
    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [data, title, xAxisTitle, yAxisTitle, xField, categories, colors]);

  return (
    <div className="w-full h-full">
      <div ref={chartRef} className="w-full h-full min-h-[350px]"></div>
    </div>
  );
};

export default StackedBarChart;
