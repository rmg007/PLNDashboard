import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

/**
 * Combination Chart component that displays a bar chart with a line chart overlay
 * @param {Object} props - Component props
 * @param {Array} props.barData - Data for the bar chart
 * @param {Array} props.lineData - Data for the line chart
 * @param {string} props.title - Chart title
 * @param {string} props.xAxisTitle - X-axis title
 * @param {string} props.yAxisTitle - Y-axis title for bars
 * @param {string} props.y2AxisTitle - Y-axis title for line
 * @param {string} props.xField - Field name for x-axis values
 * @param {string} props.barField - Field name for bar values
 * @param {string} props.lineField - Field name for line values
 */
const CombinationChart = ({
  data = [],
  title = '',
  xAxisTitle = '',
  yAxisTitle = '',
  y2AxisTitle = '',
  xField = '',
  barField = '',
  lineField = '',
  barColor = 'rgb(54, 162, 235)',
  lineColor = 'rgb(255, 99, 132)'
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Default data if none is provided
    const defaultData = [
      { year: '2019', permitCount: 950, avgValuation: 1800000 },
      { year: '2020', permitCount: 850, avgValuation: 1950000 },
      { year: '2021', permitCount: 1050, avgValuation: 2100000 },
      { year: '2022', permitCount: 1150, avgValuation: 2300000 },
      { year: '2023', permitCount: 1245, avgValuation: 2450000 }
    ];
    
    // Default field names if none provided
    const defaultXField = 'year';
    const defaultBarField = 'permitCount';
    const defaultLineField = 'avgValuation';
    
    // Use provided data or fallback to default
    const chartData = data.length > 0 ? data : defaultData;
    const chartXField = xField || defaultXField;
    const chartBarField = barField || defaultBarField;
    const chartLineField = lineField || defaultLineField;
    
    if (chartRef.current) {
      // Extract data for plotting
      const xValues = chartData.map(item => item[chartXField]);
      const barValues = chartData.map(item => item[chartBarField]);
      const lineValues = chartData.map(item => item[chartLineField]);
      
      // Default titles if none provided
      const chartTitle = title || 'Permit Volume and Average Valuation';
      const chartXAxisTitle = xAxisTitle || 'Year';
      const chartYAxisTitle = yAxisTitle || 'Number of Permits';
      const chartY2AxisTitle = y2AxisTitle || 'Average Valuation ($)';

      // Create traces for the chart
      const traces = [
        {
          x: xValues,
          y: barValues,
          type: 'bar',
          name: chartYAxisTitle,
          marker: {
            color: barColor
          },
          hovertemplate: `${chartYAxisTitle}: %{y}<extra></extra>`
        },
        {
          x: xValues,
          y: lineValues,
          type: 'scatter',
          mode: 'lines+markers',
          name: chartY2AxisTitle,
          marker: {
            color: lineColor,
            size: 8
          },
          line: {
            color: lineColor,
            width: 3
          },
          yaxis: 'y2',
          hovertemplate: `${chartY2AxisTitle}: %{y}<extra></extra>`
        }
      ];

      // Layout configuration with increased margins to prevent overlap
      const layout = {
        title: {
          text: chartTitle,
          font: {
            size: 18,
            color: '#333',
            family: 'Inter, system-ui, sans-serif'
          }
        },
        xaxis: {
          title: chartXAxisTitle,
          tickangle: -45,
          tickfont: {
            size: 12
          }
        },
        yaxis: {
          title: chartYAxisTitle,
          titlefont: {
            color: barColor
          },
          tickfont: {
            color: barColor
          },
          side: 'left',
          showgrid: true,
          gridcolor: 'rgba(200, 200, 200, 0.2)'
        },
        yaxis2: {
          title: chartY2AxisTitle,
          titlefont: {
            color: lineColor
          },
          tickfont: {
            color: lineColor
          },
          side: 'right',
          overlaying: 'y',
          showgrid: false
        },
        legend: {
          orientation: 'h',
          y: -0.3,  // Moved down to avoid overlap
          x: 0.5,
          xanchor: 'center',
          traceorder: 'normal'
        },
        margin: {
          l: 100,  // Increased for y-axis title
          r: 100,  // Increased for y2-axis title
          t: 50,
          b: 100   // Significantly increased for legend and x-axis title
        },
        plot_bgcolor: 'rgba(255, 255, 255, 0.95)',
        paper_bgcolor: 'rgba(0, 0, 0, 0)',
        hovermode: 'closest',
        barmode: 'group',
        showlegend: true,
        autosize: true, // Enable autosize for better responsiveness
        modeBarButtonsToRemove: ['toImage', 'pan2d', 'select2d', 'lasso2d', 'resetScale2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displayModeBar: false
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
  }, [data, title, xAxisTitle, yAxisTitle, y2AxisTitle, xField, barField, lineField, barColor, lineColor]);

  return (
    <div className="w-full h-full">
      <div ref={chartRef} className="w-full h-full"></div>
    </div>
  );
};

export default CombinationChart;
