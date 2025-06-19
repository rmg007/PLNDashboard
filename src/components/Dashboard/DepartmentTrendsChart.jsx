import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

/**
 * Department Trends Chart component
 * Shows department activity trends over time similar to Permit Volume & Valuation Trends
 * @param {Object} props - Component props
 * @param {Array} props.data - Department activity data
 * @param {string} props.title - Chart title
 * @param {string} props.xAxisTitle - X-axis title
 * @param {string} props.yAxisTitle - Y-axis title
 */
const DepartmentTrendsChart = ({
  data = [],
  title = 'Department Activity Trends',
  xAxisTitle = 'Fiscal Year',
  yAxisTitle = 'Activity Count'
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Default data if none provided
    const chartData = data.length ? data : [
      { department: 'Building', year: '2020', value: 850 },
      { department: 'Building', year: '2021', value: 920 },
      { department: 'Building', year: '2022', value: 980 },
      { department: 'Building', year: '2023', value: 1050 },
      { department: 'Building', year: '2024', value: 1120 },
      { department: 'Planning', year: '2020', value: 650 },
      { department: 'Planning', year: '2021', value: 700 },
      { department: 'Planning', year: '2022', value: 780 },
      { department: 'Planning', year: '2023', value: 820 },
      { department: 'Planning', year: '2024', value: 880 },
      { department: 'Fire', year: '2020', value: 450 },
      { department: 'Fire', year: '2021', value: 480 },
      { department: 'Fire', year: '2022', value: 520 },
      { department: 'Fire', year: '2023', value: 540 },
      { department: 'Fire', year: '2024', value: 590 }
    ];

    // Group data by department
    const departments = [...new Set(chartData.map(item => item.department))];
    const years = [...new Set(chartData.map(item => item.year))].sort();
    
    // Create traces for each department
    const traces = departments.map((dept, index) => {
      const deptData = chartData.filter(item => item.department === dept);
      const sortedData = years.map(year => {
        const match = deptData.find(item => item.year === year);
        return match ? match.value : 0;
      });
      
      // Colors for different departments
      const colors = [
        'rgb(54, 162, 235)', // Blue
        'rgb(255, 99, 132)', // Red
        'rgb(75, 192, 192)', // Teal
        'rgb(255, 159, 64)', // Orange
        'rgb(153, 102, 255)', // Purple
        'rgb(255, 205, 86)'  // Yellow
      ];
      
      return {
        x: years,
        y: sortedData,
        type: 'scatter',
        mode: 'lines+markers',
        name: dept,
        line: {
          width: 3,
          color: colors[index % colors.length]
        },
        marker: {
          size: 8,
          color: colors[index % colors.length]
        }
      };
    });

    // Add a bar chart showing total activity per year
    const totalsByYear = years.map(year => {
      return chartData
        .filter(item => item.year === year)
        .reduce((sum, item) => sum + item.value, 0);
    });

    traces.push({
      x: years,
      y: totalsByYear,
      type: 'bar',
      name: 'Total Activity',
      marker: {
        color: 'rgba(55, 83, 109, 0.7)',
        opacity: 0.7
      },
      yaxis: 'y2'
    });

    const layout = {
      title: title,
      xaxis: {
        title: xAxisTitle,
        tickangle: -45
      },
      yaxis: {
        title: yAxisTitle,
        titlefont: { color: 'rgb(54, 162, 235)' },
        tickfont: { color: 'rgb(54, 162, 235)' }
      },
      yaxis2: {
        title: 'Total Activity',
        titlefont: { color: 'rgb(55, 83, 109)' },
        tickfont: { color: 'rgb(55, 83, 109)' },
        overlaying: 'y',
        side: 'right'
      },
      legend: {
        orientation: 'h',
        y: -0.2
      },
      margin: { t: 50, b: 100, l: 70, r: 70 },
      hovermode: 'closest',
      barmode: 'group',
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)'
    };

    const config = {
      displayModeBar: false,
      responsive: true
    };

    Plotly.newPlot(chartRef.current, traces, layout, config);

    // Handle window resize
    const handleResize = () => {
      Plotly.relayout(chartRef.current, {
        width: chartRef.current.clientWidth,
        height: chartRef.current.clientHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, title, xAxisTitle, yAxisTitle]);

  return <div ref={chartRef} className="w-full h-full"></div>;
};

export default DepartmentTrendsChart;
