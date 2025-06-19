import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

/**
 * Permit Type Pie Chart component
 * @param {Object} props - Component props
 * @param {Array} props.data - Data for the pie chart
 */
const PermitTypePieChart = ({ data = [] }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    // Default data if none provided
    const chartData = data.length ? data : [
      { category: 'Residential', value: 45 },
      { category: 'Commercial', value: 30 },
      { category: 'Industrial', value: 15 },
      { category: 'Other', value: 10 }
    ];

    const plotData = [{
      values: chartData.map(item => item.value),
      labels: chartData.map(item => item.category),
      type: 'pie',
      hole: 0.4,
      marker: {
        colors: [
          '#3366CC', '#DC3912', '#FF9900', '#109618', 
          '#990099', '#0099C6', '#DD4477', '#66AA00'
        ]
      },
      textinfo: 'label+percent',
      insidetextorientation: 'radial',
      hoverinfo: 'label+value+percent'
    }];

    const layout = {
      margin: { t: 10, b: 10, l: 10, r: 10 },
      showlegend: false,
      height: 200,
      width: null, // Responsive width
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)'
    };

    const config = {
      displayModeBar: false,
      responsive: true
    };

    Plotly.newPlot(chartRef.current, plotData, layout, config);

    // Handle window resize
    const handleResize = () => {
      Plotly.relayout(chartRef.current, {
        width: null, // Responsive width
        height: 200
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  return (
    <div className="h-full">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Permit Types</h3>
      <div ref={chartRef} className="w-full h-[200px]"></div>
    </div>
  );
};

export default PermitTypePieChart;
