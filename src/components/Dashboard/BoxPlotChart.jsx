import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

/**
 * Department Workload Heatmap component for visualizing department activity
 * @param {Object} props - Component props
 * @param {Array} props.data - Data for the chart
 * @param {string} props.title - Chart title
 * @param {string} props.xAxisTitle - X-axis title (time periods)
 * @param {string} props.yAxisTitle - Y-axis title (departments)
 * @param {string} props.xField - Field name for x-axis categories (time periods)
 * @param {string} props.yField - Field name for y-axis categories (departments)
 * @param {string} props.valueField - Field name for cell values (workload)
 */
const DepartmentWorkloadHeatmap = ({
  data = [],
  title = 'Department Workload Distribution',
  xAxisTitle = 'Time Period',
  yAxisTitle = 'Department',
  xField = 'period',
  yField = 'department',
  valueField = 'value'
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Create default data if none is provided
    const defaultData = [
      { department: 'Building', period: 'Jan', value: 65 },
      { department: 'Building', period: 'Feb', value: 59 },
      { department: 'Building', period: 'Mar', value: 70 },
      { department: 'Building', period: 'Apr', value: 62 },
      { department: 'Building', period: 'May', value: 58 },
      { department: 'Building', period: 'Jun', value: 66 },
      { department: 'Planning', period: 'Jan', value: 45 },
      { department: 'Planning', period: 'Feb', value: 48 },
      { department: 'Planning', period: 'Mar', value: 42 },
      { department: 'Planning', period: 'Apr', value: 49 },
      { department: 'Planning', period: 'May', value: 41 },
      { department: 'Planning', period: 'Jun', value: 44 },
      { department: 'Engineering', period: 'Jan', value: 30 },
      { department: 'Engineering', period: 'Feb', value: 32 },
      { department: 'Engineering', period: 'Mar', value: 28 },
      { department: 'Engineering', period: 'Apr', value: 33 },
      { department: 'Engineering', period: 'May', value: 29 },
      { department: 'Engineering', period: 'Jun', value: 31 },
      { department: 'Fire', period: 'Jan', value: 20 },
      { department: 'Fire', period: 'Feb', value: 22 },
      { department: 'Fire', period: 'Mar', value: 18 },
      { department: 'Fire', period: 'Apr', value: 21 },
      { department: 'Fire', period: 'May', value: 19 },
      { department: 'Fire', period: 'Jun', value: 23 },
      { department: 'Environmental', period: 'Jan', value: 15 },
      { department: 'Environmental', period: 'Feb', value: 17 },
      { department: 'Environmental', period: 'Mar', value: 14 },
      { department: 'Environmental', period: 'Apr', value: 16 },
      { department: 'Environmental', period: 'May', value: 13 },
      { department: 'Environmental', period: 'Jun', value: 18 },
      { department: 'Utilities', period: 'Jan', value: 25 },
      { department: 'Utilities', period: 'Feb', value: 27 },
      { department: 'Utilities', period: 'Mar', value: 23 },
      { department: 'Utilities', period: 'Apr', value: 26 },
      { department: 'Utilities', period: 'May', value: 24 },
      { department: 'Utilities', period: 'Jun', value: 28 }
    ];
    
    // Use provided data or fallback to default
    const chartData = data.length > 0 ? data : defaultData;
    
    if (chartRef.current) {
      // Extract unique x and y values (time periods and departments)
      const xValues = [...new Set(chartData.map(item => item[xField]))].sort();
      const yValues = [...new Set(chartData.map(item => item[yField]))].sort();
      
      // Create a 2D array for the heatmap values
      const zValues = [];
      yValues.forEach(dept => {
        const deptRow = [];
        xValues.forEach(period => {
          // Find the matching data point
          const dataPoint = chartData.find(item => item[xField] === period && item[yField] === dept);
          // Add the value or 0 if not found
          deptRow.push(dataPoint ? dataPoint[valueField] : 0);
        });
        zValues.push(deptRow);
      });
      
      // Create heatmap trace
      const trace = {
        x: xValues,
        y: yValues,
        z: zValues,
        type: 'heatmap',
        colorscale: [
          [0, '#f7fbff'],
          [0.2, '#deebf7'],
          [0.4, '#c6dbef'],
          [0.6, '#9ecae1'],
          [0.8, '#6baed6'],
          [1, '#3182bd']
        ],
        hoverongaps: false,
        hovertemplate: '<b>%{y}</b><br>%{x}<br>Workload: %{z}<extra></extra>'
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
          }
        },
        yaxis: {
          title: yAxisTitle,
          titlefont: {
            size: 14
          },
          zeroline: false,
          gridcolor: 'rgba(200, 200, 200, 0.2)'
        },
        margin: {
          l: 100, // Increased left margin to prevent y-axis title overlap
          r: 50,  // Increased right margin for legends
          t: 50,
          b: 80   // Increased bottom margin
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
  }, [data, title, xAxisTitle, yAxisTitle, xField, yField, valueField]);

  return (
    <div className="w-full h-full">
      <div ref={chartRef} className="w-full h-full min-h-[350px]"></div>
    </div>
  );
};

export default DepartmentWorkloadHeatmap;
