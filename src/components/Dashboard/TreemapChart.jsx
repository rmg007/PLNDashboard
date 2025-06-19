import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

/**
 * Horizontal Bar Chart component for visualizing permit distribution
 * @param {Object} props - Component props
 * @param {Array} props.data - Data for the chart
 * @param {string} props.title - Chart title
 * @param {string} props.xAxisTitle - X-axis title
 * @param {string} props.yAxisTitle - Y-axis title
 * @param {string} props.labelField - Field name for category labels (y-axis)
 * @param {string} props.valueField - Field name for values (x-axis)
 * @param {string} props.color - Bar color
 */
const HorizontalBarChart = ({
  data = [],
  title = 'Permit Distribution by Category',
  xAxisTitle = 'Number of Permits',
  yAxisTitle = 'Category',
  labelField = 'category',
  valueField = 'value',
  color = '#3B82F6'
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Default data if none is provided
    const defaultData = [
      { category: 'Residential Renovations', value: 312 },
      { category: 'Residential New Construction', value: 245 },
      { category: 'Commercial Tenant Improvements', value: 187 },
      { category: 'Residential Additions', value: 156 },
      { category: 'Commercial Renovations', value: 103 },
      { category: 'Commercial New Construction', value: 78 },
      { category: 'Industrial Equipment', value: 65 },
      { category: 'Industrial Expansions', value: 42 },
      { category: 'Industrial New Construction', value: 28 },
      { category: 'Miscellaneous', value: 18 }
    ];
    
    // Use provided data or fallback to default
    const chartData = data.length > 0 ? data : defaultData;
    
    if (chartRef.current) {
      // Sort data by value in descending order
      const sortedData = [...chartData].sort((a, b) => b[valueField] - a[valueField]);
      
      // Create the horizontal bar chart trace
      const trace = {
        type: 'bar',
        x: sortedData.map(item => item[valueField]),
        y: sortedData.map(item => item[labelField]),
        orientation: 'h',
        marker: {
          color: color,
          opacity: 0.8,
          line: {
            color: 'rgba(0, 0, 0, 0.3)',
            width: 1
          }
        },
        hovertemplate: '<b>%{y}</b><br>Permits: %{x}<extra></extra>',
        text: sortedData.map(item => item[valueField]),
        textposition: 'auto',
        insidetextanchor: 'middle',
        insidetextfont: {
          color: 'white'
        }
      };

      // Layout configuration with increased margins to prevent overlap
      const layout = {
        title: {
          text: title,
          font: {
            size: 18,
            color: '#333',
            family: 'Inter, system-ui, sans-serif'
          }
        },
        xaxis: {
          title: xAxisTitle,
          titlefont: {
            size: 14
          },
          gridcolor: 'rgba(200, 200, 200, 0.2)'
        },
        yaxis: {
          title: yAxisTitle,
          titlefont: {
            size: 14
          },
          automargin: true
        },
        margin: {
          l: 160,  // Significantly increased for category labels and y-axis title
          r: 50,   // Increased for better spacing
          t: 50,
          b: 80    // Increased for x-axis title
        },
        plot_bgcolor: 'rgba(255, 255, 255, 0.95)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        hovermode: 'closest',
        autosize: true,
        // Hide modebar buttons
        modeBarButtonsToRemove: ['toImage', 'pan2d', 'select2d', 'lasso2d', 'resetScale2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d'],
        displayModeBar: false
      };

      // Configuration options
      const config = {
        responsive: true,
        displayModeBar: false,
        displaylogo: false
      };

      // Create the plot
      Plotly.newPlot(chartRef.current, [trace], layout, config);
      
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
  }, [data, title, xAxisTitle, yAxisTitle, labelField, valueField, color]);

  return (
    <div className="w-full h-full">
      <div ref={chartRef} className="w-full h-full min-h-[350px]"></div>
    </div>
  );
};

export default HorizontalBarChart;
