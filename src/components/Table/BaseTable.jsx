/**
 * @file BaseTable.jsx
 * @description Core table component that handles rendering and feature logic
 */

import React, { useMemo } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  getPaginationRowModel,
  flexRender
} from '@tanstack/react-table';
import IndeterminateCheckbox from '../common/IndeterminateCheckbox';

/**
 * BaseTable component - the core of the modular table system
 * This component handles all rendering logic and feature hooks
 */
const BaseTable = ({
  // Core props
  data = [],
  columns = [],
  className = '',
  id = 'base-table',
  isLoading = false,
  
  // Selection props
  selectionProps = null,
  
  // Sorting props
  sortingProps = null,
  
  // Pagination props
  paginationProps = null,
  
  // Filtering props
  filterProps = null,
  
  // Additional props
  onRowHover = null,
  onRowLeave = null,
  disableHover = false,
}) => {
  // Determine if features are enabled based on props
  const isSelectable = !!selectionProps;
  const isSortable = !!sortingProps;
  const isPaginated = !!paginationProps;
  const isFilterable = !!filterProps;
  
  // Prepare columns with selection checkbox if needed
  const tableColumns = useMemo(() => {
    let finalColumns = [...columns];
    
    // Add selection column if selection is enabled
    if (isSelectable && selectionProps.mode === 'multi') {
      finalColumns = [
        {
          id: 'select',
          header: ({ table }) => (
            <div className="px-1">
              <IndeterminateCheckbox
                {...{
                  checked: table.getIsAllRowsSelected(),
                  indeterminate: table.getIsSomeRowsSelected(),
                  onChange: table.getToggleAllRowsSelectedHandler(),
                }}
              />
            </div>
          ),
          cell: ({ row }) => (
            <div className="px-1">
              <IndeterminateCheckbox
                {...{
                  checked: row.getIsSelected(),
                  disabled: !row.getCanSelect(),
                  indeterminate: row.getIsSomeSelected(),
                  onChange: row.getToggleSelectedHandler(),
                }}
              />
            </div>
          ),
          size: 40,
          minSize: 40,
          maxSize: 40,
          enableSorting: false,
        },
        ...finalColumns,
      ];
    }
    
    return finalColumns;
  }, [columns, isSelectable, selectionProps]);
  
  // Convert external state to TanStack Table state
  const sorting = useMemo(() => {
    if (!isSortable || !sortingProps.sortDescriptor.column) return [];
    return [
      {
        id: String(sortingProps.sortDescriptor.column),
        desc: sortingProps.sortDescriptor.direction === 'descending',
      },
    ];
  }, [isSortable, sortingProps]);
  
  const pagination = useMemo(() => {
    if (!isPaginated) return { pageIndex: 0, pageSize: data.length };
    return {
      pageIndex: paginationProps.currentPage,
      pageSize: paginationProps.itemsPerPage,
    };
  }, [isPaginated, paginationProps, data.length]);
  
  // Row selection state from external control
  const rowSelection = useMemo(() => {
    if (!isSelectable) return {};
    
    // Convert Set of IDs to object format expected by TanStack Table
    const selection = {};
    if (selectionProps.selectedRows) {
      data.forEach((row, index) => {
        // Assuming each row has an 'id' property
        const rowId = row.id || index;
        if (selectionProps.selectedRows.has(rowId)) {
          selection[index] = true;
        }
      });
    }
    return selection;
  }, [isSelectable, selectionProps, data]);
  
  // Initialize the table instance
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting: isSortable ? sorting : undefined,
      pagination: isPaginated ? pagination : undefined,
      rowSelection,
    },
    enableRowSelection: isSelectable,
    // Default row ID function that uses the index if no ID is provided
    getRowId: (row, index) => row?.id || row?.year || String(index),
    onRowSelectionChange: isSelectable ? (updatedSelection) => {
      // Convert from TanStack Table's object format back to Set of IDs
      const newSelectedRows = new Set();
      Object.keys(updatedSelection).forEach(index => {
        if (updatedSelection[index]) {
          const rowId = data[parseInt(index)]?.id || parseInt(index);
          newSelectedRows.add(rowId);
        }
      });
      selectionProps.onSelectionChange(newSelectedRows);
    } : undefined,
    onSortingChange: isSortable ? (updatedSorting) => {
      if (updatedSorting.length === 0) {
        sortingProps.onSortChange({ column: null, direction: null });
      } else {
        const sortInfo = updatedSorting[0];
        sortingProps.onSortChange({
          column: sortInfo.id,
          direction: sortInfo.desc ? 'descending' : 'ascending',
        });
      }
    } : undefined,
    onPaginationChange: isPaginated ? (updatedPagination) => {
      paginationProps.onPageChange(updatedPagination.pageIndex);
    } : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: isSortable ? getSortedRowModel() : undefined,
    getPaginationRowModel: isPaginated ? getPaginationRowModel() : undefined,
  });
  
  // Event handlers for row interactions
  const handleRowMouseEnter = (rowIndex) => {
    if (onRowHover && !disableHover) {
      onRowHover(rowIndex);
    }
  };
  
  const handleRowMouseLeave = () => {
    if (onRowLeave && !disableHover) {
      onRowLeave();
    }
  };
  
  // Handle row click for single selection mode
  const handleRowClick = (rowIndex) => {
    if (isSelectable && selectionProps.mode === 'single') {
      const rowId = data[rowIndex]?.id || rowIndex;
      const newSelection = new Set([rowId]);
      selectionProps.onSelectionChange(newSelection);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }
  
  return (
    <div className={`overflow-auto ${className}`} id={id}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={isSortable && header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                      onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {isSortable && header.column.getCanSort() && (
                        <span className="ml-2">
                          {{
                            asc: '🔼',
                            desc: '🔽',
                          }[header.column.getIsSorted()] ?? '⏺️'}
                        </span>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {table.getRowModel().rows.map(row => (
            <tr
              key={row.id}
              className={`
                ${isSelectable ? 'cursor-pointer' : ''}
                ${row.getIsSelected() ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                ${!disableHover ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}
              `}
              onClick={() => handleRowClick(row.index)}
              onMouseEnter={() => handleRowMouseEnter(row.index)}
              onMouseLeave={handleRowMouseLeave}
            >
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination controls */}
      {isPaginated && (
        <div className="py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex gap-x-2 items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> of{' '}
                <span className="font-medium">{table.getPageCount()}</span>
              </span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="form-select rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:text-gray-200"
              >
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <span className="sr-only">First</span>
                  ⏮️
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  ◀️
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  ▶️
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <span className="sr-only">Last</span>
                  ⏭️
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseTable;
