// src/components/charts/GroupedBarChartTableComponent.jsx

import React, { useState, useMemo, useRef, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import Plotly from 'plotly.js-dist-min';

import { useIsDark } from '../../contexts/ThemeContext';
import { getPalette, getPlotlyLayout } from '../../utils/chartTheme';

/**
 * A component that displays a grouped bar chart and a synchronized data table.
 * 
 * @param {object} props - The component props
 * @param {string} props.id - Unique identifier for the component
 * @param {Array<object>} props.data - The dataset for the chart and table
 * @param {string} props.xField - The key in data representing the x-axis categories
 * @param {Array<string>} props.yFields - Array of keys in data representing the y-axis values for each group
 * @param {Array<string>} [props.yLabels] - Display labels for each yField (defaults to yFields if not provided)
 * @param {string} props.title - The title of the chart
 * @param {string} [props.xAxisLabel] - Label for the x-axis
 * @param {string} [props.yAxisLabel] - Label for the y-axis
 * @param {Array<string>} [props.colors] - Custom colors for each group
 * @param {Array<object>} props.columns - Defining the table columns (React Table format)
 * @param {string|number} [props.initialTableWidth='50%'] - Initial width of the table section
 * @param {string} [props.tablePosition='right'] - Position of the table ('right' or 'bottom')
 * @param {boolean} [props.showTable=true] - Toggle table visibility
 * @param {number} [props.defaultRowsPerPage=10] - Default rows per page for table pagination
 * @param {string} [props.barMode='group'] - Bar chart mode ('group' or 'stack')
 * @param {number} [props.height=400] - Chart height
 * @param {boolean} [props.enableSelection=false] - Enable row selection in the table
 * @returns {React.Component} The GroupedBarChartTableComponent
 */
const GroupedBarChartTableComponent = forwardRef(({
  id,
  data = [],
  xField,
  yFields = [],
  yLabels,
  title,
  xAxisLabel,
  yAxisLabel,
  colors,
  columns = [],
  initialTableWidth = '100%',
  tablePosition = 'bottom',
  showTable = true,
  defaultRowsPerPage = 10,
  barMode = 'group',
  height = 400,
  enableSelection = false,
  ...otherProps
}, ref) => {
  // Refs
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  
  // State
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultRowsPerPage,
  });
  const [tableVisible, setTableVisible] = useState(showTable);
  const [rowSelection, setRowSelection] = useState({});
  
  const isDark = useIsDark();

  // Expose methods to parent components through ref
  useImperativeHandle(ref, () => ({
    exportAsXLSX: handleExportExcel,
    exportAsPNG: handleExportImage,
    toggleTable: () => setTableVisible(prev => !prev),
    isTableVisible: () => tableVisible,
    chartRef: chartRef,
  }));

  // Table setup with React Table
  const tableColumns = useMemo(() => {
    // Create selection column if selection is enabled
    const selectionColumn = enableSelection ? [
      {
        id: 'selection',
        header: ({ table }) => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={table.getIsAllRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
            />
          </div>
        ),
        size: 40,
      }
    ] : [];
    
    return [...selectionColumn, ...columns];
  }, [columns, enableSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
    enableRowSelection: enableSelection,
    enableSorting: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: defaultRowsPerPage,
      },
      columnSizing: {
        // Set default column widths to be more compact
        ...columns.reduce((acc, col) => {
          acc[col.accessorKey || col.id] = col.size || 60; // Default to 60px if not specified
          return acc;
        }, {})
      },
    },
  });

  // Event handlers
  const handleRowHover = useCallback((rowIndex) => {
    setHighlightedIndex(rowIndex);
  }, []);

  const handleLeave = useCallback(() => {
    setHighlightedIndex(null);
  }, []);

  // Export functions
  const handleExportExcel = useCallback(() => {
    if (data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      XLSX.writeFile(workbook, `${title || 'data'}.xlsx`);
    }
  }, [data, title]);

  const handleExportImage = useCallback(() => {
    if (chartRef.current) {
      return Plotly.toImage(chartRef.current, { 
        format: 'png', 
        height: height, 
        width: chartRef.current.clientWidth 
      })
      .then(url => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'chart'}.png`;
        a.click();
        return url;
      });
    }
    return Promise.reject('Chart not initialized');
  }, [chartRef, height, title]);

  // Generate the chart traces
  const traces = useMemo(() => {
    if (!data || !xField || !yFields || yFields.length === 0 || data.length === 0) return [];

    const palette = getPalette(isDark);
    const customColors = colors || palette;
    const labels = yLabels || yFields;

    // Extract unique x values to ensure consistent ordering
    const xValues = [...new Set(data.map(item => item[xField]))];

    return yFields.map((field, index) => {
      // For each y field, create a trace
      return {
        x: xValues,
        y: xValues.map(x => {
          const matchingItem = data.find(item => item[xField] === x);
          return matchingItem ? matchingItem[field] : null;
        }),
        type: 'bar',
        name: labels[index] || field,
        marker: {
          color: customColors[index % customColors.length],
        },
        hoverinfo: 'x+y+name',
      };
    });
  }, [data, xField, yFields, yLabels, colors, isDark]);

  /* ---------- 1.  Default legend position (below the plot) ---------- */
  const defaultLegend = useMemo(() => ({
    orientation: 'h',   // horizontal row
    x: 0.5,             // centred horizontally
    xanchor: 'center',
    y: -0.2,            // a little below the x-axis
    yanchor: 'top'
  }), []);

  /* ---------- 2.  Build Plotly layout ---------- */
  const layout = useMemo(() => {
    // base layout from theme helper (already in the file)
    const baseLayout = getPlotlyLayout(isDark);

    /* existing block that merges user-supplied layout / config
       assume it was something like:                   */
    const merged = {
      ...baseLayout,
      title: {
        text: title || '',
        font: {
          ...baseLayout.font,
          size: 18,
        },
      },
      height: height,
      barmode: barMode,
      bargap: 0.15,
      bargroupgap: 0.1,
      margin: { l: 50, r: 30, t: 50, b: 80 },
      xaxis: {
        ...baseLayout.xaxis,
        title: {
          text: '',
          font: baseLayout.font,
          standoff: 10,
        },
        type: 'category',
        categoryorder: 'trace',
        tickangle: 0,
        automargin: true,
      },
      yaxis: {
        ...baseLayout.yaxis,
        title: {
          text: yAxisLabel || '',
          font: baseLayout.font,
        },
      },
      legend: {
        ...defaultLegend,
        ...(baseLayout.legend || {})   // keep any user extras (colours, font …)
      },
      ...otherProps,
    };

    return merged;
  }, [isDark, title, height, xAxisLabel, yAxisLabel, xField, barMode, otherProps, defaultLegend]);  // add defaultLegend to deps

  // Config for the Plotly chart
  const config = useMemo(() => ({
    responsive: true,
    displayModeBar: false,
    displaylogo: false,
    modeBarButtonsToRemove: [
      'zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d',
      'resetScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'toggleSpikelines'
    ],
    toImageButtonOptions: {
      format: 'png',
      filename: title || 'grouped-bar-chart',
      height: height,
      width: chartRef.current?.clientWidth || 800,
      scale: 2,
    },
  }), [title, height]);

  // Initialize and update the chart
  useEffect(() => {
    if (chartRef.current && traces.length > 0) {
      // Create a new Plotly chart if it doesn't exist yet
      if (!chartRef.current._fullLayout) {
        Plotly.newPlot(chartRef.current, traces, layout, config);
      } else {
        // Update existing chart
        Plotly.react(chartRef.current, traces, layout, config);
      }
    }
    
    // Handle highlighting when hovering over table rows
    if (highlightedIndex !== null) {
      // Implement highlighting logic here if needed
    }
  }, [traces, layout, config, highlightedIndex]);

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

  // Layout styles based on props
  const containerStyle = useMemo(() => {
    return {
      display: 'flex',
      flexDirection: tablePosition === 'bottom' ? 'column' : 'row',
      height: '100%',
      width: '100%',
      gap: '8px', // Add consistent gap control for both layouts
    };
  }, [tablePosition]);

  const chartStyle = useMemo(() => {
    if (!tableVisible) {
      return { width: '100%', height: '100%' };
    }
    
    if (tablePosition === 'bottom') {
      return { width: '100%', height: '40%', marginBottom: '8px' };
    }
    
    // Convert initialTableWidth to a percentage if it's a number
    const tableWidthStr = typeof initialTableWidth === 'number' 
      ? `${initialTableWidth}px` 
      : initialTableWidth;
    
    // For right position, calculate chart width based on table width
    return { 
      width: `calc(100% - ${tableWidthStr})`,
      height: '100%',
    };
  }, [tableVisible, tablePosition, initialTableWidth]);

  const tableStyle = useMemo(() => {
    if (!tableVisible) {
      return { display: 'none' };
    }
    
    if (tablePosition === 'bottom') {
      return { width: '100%', height: '60%', marginTop: '8px' };
    }
    
    // For right position, use the initialTableWidth
    return { 
      width: typeof initialTableWidth === 'number' ? `${initialTableWidth}px` : initialTableWidth,
      height: '100%',
      overflow: 'auto',
    };
  }, [tableVisible, tablePosition, initialTableWidth]);

  // Event handlers for highlighting
  useEffect(() => {
    // Only attempt to remove listeners if the chart has been initialized with Plotly
    // and the Plotly instance is available on the DOM node
    if (chartRef.current && chartRef.current._fullLayout && chartRef.current.on) {
      // This is a proper Plotly chart instance with event handling methods
      chartRef.current.removeAllListeners('plotly_hover');
      chartRef.current.removeAllListeners('plotly_unhover');
      
      // Add event listeners for highlighting if needed
    }
  }, []);

  // Render the Chart component
  const renderChart = () => {
    return (
      <div 
        className="w-full h-full relative"
        style={chartStyle}
      >
        <div 
          ref={chartRef} 
          className="w-full h-full flex items-center justify-center"
          style={tablePosition === 'bottom' ? {} : { minHeight: `${height}px` }}
          id={`${id}-chart-container`}
        ></div>
      </div>
    );
  };

  // Render the Table component
  const renderTable = () => {
    if (!tableVisible) return null;
    
    return (
      <div 
        className={`bg-white dark:bg-gray-800 border ${isDark ? 'border-gray-700' : 'border-gray-200'} rounded-lg shadow-sm overflow-hidden`}
        style={tableStyle}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700/50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-2 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 text-center cursor-pointer"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        <span className="text-gray-400">
                          {{
                            asc: '▲',
                            desc: '▼',
                          }[header.column.getIsSorted()] || null}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {table.getRowModel().rows.map((row, i) => (
                <tr 
                  key={row.id}
                  className={`
                    w-full transition-colors duration-150 border-b border-dotted
                    ${isDark ? 'border-gray-700/50' : 'border-gray-200'}
                    ${highlightedIndex === i ? (isDark ? 'bg-blue-900/30' : 'bg-blue-100/70') : ''}
                    ${highlightedIndex !== i ? (i % 2 === 0 ? (isDark ? 'dark:bg-gray-800' : 'bg-white') : (isDark ? 'dark:bg-gray-800/60' : 'bg-gray-50')) : ''}
                    ${highlightedIndex !== i ? (isDark ? 'dark:hover:bg-gray-700' : 'hover:bg-gray-100') : ''}
                  `}
                  style={{ height: '36px' }}
                  onMouseEnter={() => handleRowHover(i)}
                  onMouseLeave={handleLeave}
                >
                  {row.getVisibleCells().map(cell => (
                    <td 
                      key={cell.id}
                      className="px-2 py-1.5 whitespace-nowrap text-center"
                    >
                      <div className="truncate">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing{' '}
                  <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                      data.length
                    )}
                  </span>{' '}
                  of <span className="font-medium">{data.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    &lt;
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    &gt;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={chartRef} 
      className="w-full h-full"
      style={containerStyle}
    >
      {renderChart()}
      {renderTable()}
    </div>
  );
});

export default GroupedBarChartTableComponent;
