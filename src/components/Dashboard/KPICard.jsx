import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

/**
 * KPI Card component with sparkline visualization
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main KPI value to display
 * @param {string} props.icon - Icon class or emoji
 * @param {Array} props.sparklineData - Array of data points for the sparkline
 * @param {string} props.trend - 'up', 'down', or 'neutral'
 * @param {string} props.trendValue - Value representing the trend (e.g., "+12%")
 * @param {string} props.color - Accent color for the card (tailwind class)
 */
const KPICard = ({ 
  title, 
  value, 
  icon, 
  sparklineData = [], 
  trend = 'neutral', 
  trendValue = '', 
  color = 'blue' 
}) => {
  const sparklineRef = useRef(null);
  
  // Color mapping for trends
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  };
  
  // Icon mapping for trends
  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→'
  };
  
  // Generate the sparkline chart
  useEffect(() => {
    if (sparklineRef.current && sparklineData.length > 0) {
      const data = [{
        y: sparklineData,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#6B7280',
          width: 2,
        },
        fill: 'tozeroy',
        fillcolor: trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 
                   trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 
                   'rgba(107, 114, 128, 0.1)'
      }];
      
      const layout = {
        autosize: true,
        height: 50,
        width: 120,
        margin: { t: 0, r: 0, l: 0, b: 0, pad: 0 },
        xaxis: {
          showgrid: false,
          zeroline: false,
          showticklabels: false,
          fixedrange: true
        },
        yaxis: {
          showgrid: false,
          zeroline: false,
          showticklabels: false,
          fixedrange: true
        },
        showlegend: false,
        hovermode: false,
        plot_bgcolor: 'transparent',
        paper_bgcolor: 'transparent'
      };
      
      const config = {
        displayModeBar: false,
        responsive: true
      };
      
      Plotly.newPlot(sparklineRef.current, data, layout, config);
    }
    
    // Cleanup
    return () => {
      if (sparklineRef.current) {
        Plotly.purge(sparklineRef.current);
      }
    };
  }, [sparklineData, trend]);
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-${color}-500 h-full kpi-card`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {trendValue && (
              <span className={`ml-2 text-sm font-medium ${trendColors[trend]}`}>
                {trendIcons[trend]} {trendValue}
              </span>
            )}
          </div>
        </div>
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
          <span className="text-xl">{icon}</span>
        </div>
      </div>
      <div className="mt-4">
        <div ref={sparklineRef} className="w-full h-12"></div>
      </div>
    </div>
  );
};

export default KPICard;
