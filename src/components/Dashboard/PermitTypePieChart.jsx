import React, { useEffect, useRef, useId } from 'react';
import Plotly from 'plotly.js-dist-min';

/**
 * Permit Type Pie Chart component
 * @param {Object} props - Component props
 * @param {Array} props.data - Data for the pie chart
 * @param {string} props.ariaLabelledBy - ID of the element that labels this chart
 * @param {string} props.id - Optional custom ID for the chart container
 */
const PermitTypePieChart = ({ 
  data = [], 
  ariaLabelledBy,
  id: propId 
}) => {
  const chartRef = useRef(null);
  const generatedId = useId();
  const chartId = propId || `permit-type-chart-${generatedId}`;

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

  // Generate a description for screen readers
  const getAccessibilityDescription = () => {
    if (!data || data.length === 0) return 'No data available';
    
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    const items = data.map(item => 
      `${item.category}: ${Math.round((item.value / total) * 100)}%`
    ).join(', ');
    
    return `Pie chart showing distribution of permit types: ${items}`;
  };

  return (
    <div 
      className="h-full"
      role="region"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={`${chartId}-desc`}
    >
      <h3 
        id={ariaLabelledBy}
        className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
      >
        Permit Types
      </h3>
      <div 
        ref={chartRef} 
        id={chartId}
        className="w-full h-[200px]"
        aria-hidden="true"
      ></div>
      <div id={`${chartId}-desc`} className="sr-only">
        {getAccessibilityDescription()}
      </div>
    </div>
  );
};

export default PermitTypePieChart;
