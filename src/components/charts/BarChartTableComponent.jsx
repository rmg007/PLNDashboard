// src/components/charts/BarChartTableComponent.jsx

import React, { useState, useMemo, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, createColumnHelper } from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import Plotly from 'plotly.js-dist-min';

import BarChartComponent from './BarChartComponent';
import { useIsDark } from '../../contexts/ThemeContext';

/**
 * A component that displays a bar chart and a synchronized data table side-by-side.
 * 
 * @param {object} props - The component props
 * @param {string} props.id - Unique identifier for the component
 * @param {Array<object>} props.data - The dataset for the chart and table
 * @param {string} props.xField - The key in data representing the x-axis values
 * @param {string} props.yField - The key in data representing the y-axis values
 * @param {string} props.title - The title of the chart
 * @param {Array<object>} props.columns - Defining the table columns (React Table format)
 * @param {string|number} [props.initialTableWidth='50%'] - Initial width of the table section
 * @param {string} [props.tablePosition='right'] - Position of the table ('right' or 'bottom')
 * @param {boolean} [props.enableSelection=false] - Enable row selection in the table
 * @param {number} [props.defaultRowsPerPage=10] - Default rows per page for table pagination
 * @param {boolean} [props.showTable=true] - Toggle table visibility
 * @param {string} [props.xAxisLabel] - Label for the x-axis
 * @param {string} [props.yAxisLabel] - Label for the y-axis
 * @param {string} [props.color] - Default bar color
 * @param {boolean} [props.showLabels=true] - Toggle data labels on bars
 * @param {Function} [props.labelFormat=(value) => value.toLocaleString()] - Custom formatting of bar labels
 * @param {number} [props.height=380] - Chart height
 * @param {boolean} [props.showTrendLine=true] - Display a simple trend line if numerical data
 * @param {Array<object>} [props.defaultSorting=[]] - Default sorting configuration for the table
 * @returns {React.Component} The BarChartTableComponent
 */
const BarChartTableComponent = forwardRef(({
  id,
  data = [],
  xField,
  yField,
  title,
  columns = [],
  initialTableWidth = '25%',
  tablePosition = 'right',
  enableSelection = false,
  defaultRowsPerPage = 10,
  showTable = true,
  xAxisLabel,
  yAxisLabel,
  color = 'rgb(189, 135, 143)',
  showLabels = true,
  labelFormat = (value) => value !== undefined && value !== null ? value.toLocaleString() : '',
  height = 380,
  showTrendLine = false,
  defaultSorting = [],
  ...otherProps
}, ref) => {
  // Refs
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  
  // State
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
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
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
      rowSelection,
      sorting,
    },
    enableRowSelection: enableSelection,
    enableSorting: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    initialState: {
      pagination: {
        pageSize: defaultRowsPerPage,
      },
      sorting: defaultSorting ? [...defaultSorting] : [],
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
    // Update the state
    setHighlightedIndex(rowIndex);
    
    // Directly update the chart's bar colors for immediate feedback
    if (chartRef.current?.chartRef?.current) {
      const chart = chartRef.current.chartRef.current;
      const currentTraces = chart.data;
      
      if (currentTraces && currentTraces[0]) {
        // Create a new colors array
        const newColors = (currentTraces[0].y || []).map((_, index) => {
          if (index === rowIndex) {
            // Highlighted bar color
            return isDark ? 'rgb(59, 130, 246)' : 'rgb(37, 99, 235)';
          }
          // Default color
          return color || 'rgb(189, 135, 143)';
        });
        
        // Update the chart with new colors
        Plotly.restyle(chart, {
          'marker.color': [newColors],
          'marker.line.width': rowIndex !== null ? 1 : 0
        }, [0]);
      }
    }
    
    // Scroll to the corresponding row if it's not visible
    const tableRows = document.querySelectorAll(`#${id} table tbody tr`);
    if (tableRows && tableRows[rowIndex]) {
      const tableContainer = tableRows[rowIndex].closest('.overflow-x-auto');
      if (tableContainer) {
        const rowTop = tableRows[rowIndex].offsetTop;
        const containerScrollTop = tableContainer.scrollTop;
        const containerHeight = tableContainer.clientHeight;
        
        // Check if row is outside visible area
        if (rowTop < containerScrollTop || rowTop > containerScrollTop + containerHeight) {
          tableContainer.scrollTop = rowTop - containerHeight / 2;
        }
      }
    }
  }, [id, isDark, color]);

  const handleLeave = useCallback(() => {
    // Reset state
    setHighlightedIndex(null);
    
    // Directly reset the chart's bar colors
    if (chartRef.current?.chartRef?.current) {
      const chart = chartRef.current.chartRef.current;
      const currentTraces = chart.data;
      
      if (currentTraces && currentTraces[0]) {
        // Reset all bars to default color
        const defaultColors = new Array((currentTraces[0].y || []).length).fill(color || 'rgb(189, 135, 143)');
        
        // Update the chart with default colors
        Plotly.restyle(chart, {
          'marker.color': [defaultColors],
          'marker.line.width': 0
        }, [0]);
      }
    }
  }, [color]);

  const handleRowSelect = useCallback((rowIndex, event) => {
    if (!enableSelection) return;
    
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex);
      } else {
        newSet.add(rowIndex);
      }
      return newSet;
    });
  }, [enableSelection]);

  const handleChartHover = useCallback((pointIndex) => {
    // Update highlighted index for both chart and table
    setHighlightedIndex(pointIndex);
    
    // Find and scroll to the corresponding table row
    const tableRows = document.querySelectorAll(`#${id} table tbody tr`);
    if (tableRows && tableRows[pointIndex]) {
      const tableContainer = tableRows[pointIndex].closest('.overflow-x-auto');
      if (tableContainer) {
        // Add a visual highlight effect
        tableRows[pointIndex].classList.add('highlight-pulse');
        setTimeout(() => {
          tableRows[pointIndex].classList.remove('highlight-pulse');
        }, 1000);
        
        // Scroll to make the row visible
        const rowTop = tableRows[pointIndex].offsetTop;
        const containerScrollTop = tableContainer.scrollTop;
        const containerHeight = tableContainer.clientHeight;
        
        // Check if row is outside visible area
        if (rowTop < containerScrollTop || rowTop > containerScrollTop + containerHeight) {
          tableContainer.scrollTop = rowTop - containerHeight / 2;
        }
      }
    }
  }, [id]);

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
    if (chartRef.current?.chartRef?.current) {
      return Plotly.toImage(chartRef.current.chartRef.current, { format: 'png', height, width: chartRef.current.chartRef.current.clientWidth })
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

  // Layout styles based on props
  const containerStyle = useMemo(() => {
    return {
      display: 'flex',
      flexDirection: tablePosition === 'bottom' ? 'column' : 'row',
      height: '100%',
      width: '100%',
    };
  }, [tablePosition]);

  const chartStyle = useMemo(() => {
    if (!tableVisible) {
      return { width: '100%', height: '100%' };
    }
    
    if (tablePosition === 'bottom') {
      return { width: '100%', height: '50%' };
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
      return { width: '100%', height: '50%' };
    }
    
    // For right position, use the initialTableWidth
    return { 
      width: typeof initialTableWidth === 'number' ? `${initialTableWidth}px` : initialTableWidth,
      height: '100%',
      overflow: 'auto',
    };
  }, [tableVisible, tablePosition, initialTableWidth]);

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
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                          <span className="ml-1">
                            {header.column.getIsSorted() === 'asc' ? '↑' : header.column.getIsSorted() === 'desc' ? '↓' : '⇅'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => {
                const isHighlighted = highlightedIndex === i;
                const isSelected = selectedIndices.has(i);
                
                return (
                  <tr
                    key={row.id}
                    className={`
                      w-full transition-colors duration-150 border-b border-dotted
                      ${isDark ? 'border-gray-700/50' : 'border-gray-200'}
                      ${isHighlighted ? (isDark ? 'bg-blue-900/30' : 'bg-blue-100/70') : ''}
                      ${isSelected ? (isDark ? 'bg-blue-900/40' : 'bg-blue-100') : ''}
                      ${!isHighlighted && !isSelected ? (i % 2 === 0 ? (isDark ? 'dark:bg-gray-800' : 'bg-white') : (isDark ? 'dark:bg-gray-800/60' : 'bg-gray-50')) : ''}
                      ${enableSelection ? 'cursor-pointer' : ''}
                      ${!isHighlighted && !isSelected ? (isDark ? 'dark:hover:bg-gray-700' : 'hover:bg-gray-100') : ''}
                    `}
                    style={{ height: '36px' }}
                    onMouseEnter={() => handleRowHover(i)}
                    onMouseLeave={handleLeave}
                    onClick={enableSelection ? (e) => handleRowSelect(i, e) : undefined}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td 
                        key={cell.id}
                        className="px-2 py-1 text-xs text-gray-800 dark:text-gray-200 text-center"
                      >
                        <div className="truncate">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
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

  // Get sorted and filtered data for the chart
  const sortedAndFilteredData = useMemo(() => {
    // Start with filtered data based on selection
    let result = Array.isArray(data) ? [...data] : [];
    
    // Apply selection filter if needed
    if (enableSelection && 
        Object.keys(rowSelection || {}).length > 0 && 
        Object.keys(rowSelection || {}).length < (result.length || 0)) {
      // Get all row IDs from the table
      const tableRows = table?.getRowModel()?.rows || [];
      const rowMap = {};
      
      // Create a map of row index to row ID
      tableRows.forEach((row, index) => {
        if (row?.id) {
          rowMap[row.id] = index;
        }
      });
      
      // Filter based on selected rows
      result = result.filter((_, index) => {
        // Find the corresponding row ID for this index
        for (const rowId in rowSelection || {}) {
          if (rowMap[rowId] === index && rowSelection[rowId]) {
            return true;
          }
        }
        return Object.keys(rowSelection || {}).length === 0; // Show all if none selected
      });
    }
    
    // Apply sorting if any column is sorted
    if (Array.isArray(sorting) && sorting.length > 0) {
      // Sort the data based on the current sorting state
      sorting.forEach(sort => {
        if (!sort || typeof sort !== 'object') return;
        
        const { id, desc } = sort;
        if (!id) return;
        
        result.sort((a, b) => {
          const valueA = a?.[id];
          const valueB = b?.[id];
          
          // Handle different data types
          if (typeof valueA === 'number' && typeof valueB === 'number') {
            return desc ? valueB - valueA : valueA - valueB;
          } else {
            // String comparison
            const strA = String(valueA || '');
            const strB = String(valueB || '');
            return desc ? strB.localeCompare(strA) : strA.localeCompare(strB);
          }
        });
      });
    }
    
    return result;
  }, [data, rowSelection, enableSelection, table, sorting]);

  // Add CSS for highlight pulse animation
  useEffect(() => {
    // Create a style element if it doesn't exist
    let styleElement = document.getElementById('barchart-table-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'barchart-table-styles';
      document.head.appendChild(styleElement);
      
      // Add the highlight pulse animation
      styleElement.innerHTML = `
        @keyframes highlightPulse {
          0% { background-color: inherit; }
          50% { background-color: ${isDark ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)'}; }
          100% { background-color: inherit; }
        }
        
        .highlight-pulse {
          animation: highlightPulse 1s ease-in-out;
        }
      `;
    }
    
    return () => {
      // Clean up only if component is unmounted
      if (styleElement && !document.getElementById(id)) {
        // Remove the style element only if it is still attached to <head>
        if (styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      }
    };
  }, [id, isDark]);
  
  return (
    <div 
      ref={containerRef}
      id={id} 
      className="w-full h-full"
      style={containerStyle}
    >
      <div style={chartStyle}>
        <BarChartComponent
          ref={chartRef}
          id={`${id}-chart`}
          data={sortedAndFilteredData}
          xField={xField}
          yField={yField}
          title={title}
          xAxisLabel={xAxisLabel}
          yAxisLabel={yAxisLabel}
          color={color}
          showLabels={showLabels}
          labelFormat={labelFormat}
          height={height}
          showTrendLine={showTrendLine}
          highlightedIndex={highlightedIndex}
          onHover={handleChartHover}
          onLeave={handleLeave}
          {...otherProps}
        />
      </div>
      {renderTable()}
    </div>
  );
});

// Import at the top of the file
import { flexRender } from '@tanstack/react-table';

export default BarChartTableComponent;
