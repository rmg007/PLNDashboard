// src/components/charts/LineChartTableComponent.jsx

import React, { useState, useMemo, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import Plotly from 'plotly.js-dist-min';

import LineChartComponent from './LineChartComponent';
import { useIsDark } from '../../contexts/ThemeContext';

/**
 * A component that displays a line chart and a synchronized data table side-by-side.
 * 
 * @param {object} props - The component props
 * @param {string} props.id - Unique identifier for the component
 * @param {Array<object>} props.data - The dataset for the chart
 * @param {Array<object>} [props.tableData] - Optional separate dataset for the table. If not provided, props.data will be used.
 * @param {string} props.xField - The key in data representing the x-axis values
 * @param {string} props.yField - The key in data representing the y-axis values
 * @param {string} props.title - The title of the chart
 * @param {Array<object>} props.columns - Defining the table columns (React Table format)
 * @param {string|number} [props.initialTableWidth='50%'] - Initial width of the table section
 * @param {string} [props.tablePosition='right'] - Position of the table ('right' or 'bottom')
 * @param {boolean} [props.enableSelection=false] - Enable row selection in the table
 * @param {number} [props.defaultRowsPerPage=10] - Default rows per page for table pagination
 * @param {boolean} [props.showTable=true] - Toggle table visibility
 * @returns {React.Component} The LineChartTableComponent
 */
const LineChartTableComponent = forwardRef(({
  id,
  data = [],
  tableData,
  xField,
  yField,
  title,
  columns = [],
  initialTableWidth = '50%',
  tablePosition = 'right',
  enableSelection = false,
  defaultRowsPerPage = 10,
  showTable = true,
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

  // Use tableData if provided, otherwise use data
  const tableDataToUse = useMemo(() => tableData || data, [tableData, data]);

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
    data: tableDataToUse,
    columns: tableColumns,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
    enableRowSelection: enableSelection,
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
    setHighlightedIndex(pointIndex);
  }, []);

  // Export functions
  const handleExportExcel = useCallback(() => {
    if (tableDataToUse.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(tableDataToUse);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      XLSX.writeFile(workbook, `${title || 'data'}.xlsx`);
    }
  }, [tableDataToUse, title]);

  const handleExportImage = useCallback(() => {
    if (chartRef.current?.chartRef?.current) {
      return Plotly.toImage(chartRef.current.chartRef.current, { format: 'png', height: otherProps.height || 400, width: chartRef.current.chartRef.current.clientWidth })
        .then(url => {
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title || 'chart'}.png`;
          a.click();
          return url;
        });
    }
    return Promise.reject('Chart not initialized');
  }, [chartRef, otherProps.height, title]);

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
            <tbody>
              {table.getRowModel().rows.map((row, i) => {
                const isHighlighted = highlightedIndex === i;
                const isSelected = enableSelection && selectedIndices.has(i);
                
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
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

  return (
    <div 
      ref={containerRef}
      id={id} 
      className="w-full h-full"
      style={containerStyle}
    >
      <div style={chartStyle}>
        <LineChartComponent
          ref={chartRef}
          id={`${id}-chart`}
          data={data}
          xField={xField}
          yField={yField}
          title={title}
          highlightedIndex={highlightedIndex}
          onHover={handleChartHover}
          onLeave={handleLeave}
          {...otherProps.chartConfig || {}}
          {...otherProps}
        />
      </div>
      {renderTable()}
    </div>
  );
});

export default LineChartTableComponent;
