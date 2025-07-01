/**
 * @file FullFeaturedTable.jsx
 * @description A comprehensive table component that combines all features
 */

import React, { useState, useCallback, useMemo } from 'react';
import BaseTable from './BaseTable';

/**
 * FullFeaturedTable - A wrapper around BaseTable that combines all table features
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Data to display
 * @param {Array} props.columns - Column definitions
 * @param {string} [props.className] - Optional CSS class
 * @param {string} [props.id] - Optional ID for the table
 * @param {boolean} [props.isLoading] - Whether the table is in a loading state
 * 
 * @param {string} [props.selectionMode='multi'] - Selection mode: 'single' or 'multi'
 * @param {Set} [props.selectedRows] - Controlled prop for selected row IDs
 * @param {Function} [props.onSelectionChange] - Callback when selection changes
 * 
 * @param {Object} [props.sortDescriptor] - Controlled prop for sort state
 * @param {Function} [props.onSortChange] - Callback when sort changes
 * 
 * @param {number} [props.itemsPerPage=10] - Number of items per page
 * @param {number} [props.currentPage] - Controlled prop for current page index
 * @param {Function} [props.onPageChange] - Callback when page changes
 * 
 * @param {string} [props.filterTerm] - Controlled prop for filter term
 * @param {Function} [props.onFilterChange] - Callback when filter changes
 * @param {Function} [props.filterFunction] - Custom filter function
 * 
 * @returns {React.Component} FullFeaturedTable component
 */
const FullFeaturedTable = ({
  data,
  columns,
  className,
  id = 'full-featured-table',
  isLoading,
  
  // Selection props
  selectionMode = 'multi',
  selectedRows: externalSelectedRows,
  onSelectionChange: externalOnSelectionChange,
  
  // Sorting props
  sortDescriptor: externalSortDescriptor,
  onSortChange: externalOnSortChange,
  
  // Pagination props
  itemsPerPage = 10,
  currentPage: externalCurrentPage,
  onPageChange: externalOnPageChange,
  
  // Filtering props
  filterTerm: externalFilterTerm,
  onFilterChange: externalOnFilterChange,
  filterFunction,
  
  ...otherProps
}) => {
  // Internal state for features if not controlled externally
  const [internalSelectedRows, setInternalSelectedRows] = useState(new Set());
  const [internalSortDescriptor, setInternalSortDescriptor] = useState({ column: null, direction: null });
  const [internalCurrentPage, setInternalCurrentPage] = useState(0);
  const [internalFilterTerm, setInternalFilterTerm] = useState('');
  
  // Determine if we're using controlled or uncontrolled state for each feature
  const isSelectionControlled = externalSelectedRows !== undefined && externalOnSelectionChange !== undefined;
  const isSortingControlled = externalSortDescriptor !== undefined && externalOnSortChange !== undefined;
  const isPaginationControlled = externalCurrentPage !== undefined && externalOnPageChange !== undefined;
  const isFilteringControlled = externalFilterTerm !== undefined && externalOnFilterChange !== undefined;
  
  // Use either controlled or internal state
  const selectedRows = isSelectionControlled ? externalSelectedRows : internalSelectedRows;
  const sortDescriptor = isSortingControlled ? externalSortDescriptor : internalSortDescriptor;
  const currentPage = isPaginationControlled ? externalCurrentPage : internalCurrentPage;
  const filterTerm = isFilteringControlled ? externalFilterTerm : internalFilterTerm;
  
  // Handle state changes
  const handleSelectionChange = useCallback((newSelectedRows) => {
    if (isSelectionControlled) {
      externalOnSelectionChange(newSelectedRows);
    } else {
      setInternalSelectedRows(newSelectedRows);
    }
  }, [isSelectionControlled, externalOnSelectionChange]);
  
  const handleSortChange = useCallback((newSortDescriptor) => {
    if (isSortingControlled) {
      externalOnSortChange(newSortDescriptor);
    } else {
      setInternalSortDescriptor(newSortDescriptor);
    }
  }, [isSortingControlled, externalOnSortChange]);
  
  const handlePageChange = useCallback((newPage) => {
    if (isPaginationControlled) {
      externalOnPageChange(newPage);
    } else {
      setInternalCurrentPage(newPage);
    }
  }, [isPaginationControlled, externalOnPageChange]);
  
  const handleFilterChange = useCallback((newFilterTerm) => {
    if (isFilteringControlled) {
      externalOnFilterChange(newFilterTerm);
    } else {
      setInternalFilterTerm(newFilterTerm);
      // Reset to first page when filter changes
      if (!isPaginationControlled) {
        setInternalCurrentPage(0);
      } else if (externalOnPageChange) {
        externalOnPageChange(0);
      }
    }
  }, [isFilteringControlled, externalOnFilterChange, isPaginationControlled, externalOnPageChange]);
  
  // Default filter function if none provided
  const defaultFilterFunction = useCallback((data, filterTerm) => {
    if (!filterTerm) return data;
    
    const lowerCaseFilterTerm = filterTerm.toLowerCase();
    return data.filter(item => {
      return Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerCaseFilterTerm);
      });
    });
  }, []);
  
  // Apply filtering to data
  const filteredData = useMemo(() => {
    const filterFn = filterFunction || defaultFilterFunction;
    return filterFn(data, filterTerm);
  }, [data, filterTerm, filterFunction, defaultFilterFunction]);
  
  // Calculate total items from filtered data length
  const totalItems = filteredData.length;
  
  return (
    <div className="flex flex-col gap-4">
      {/* Filter input */}
      <div className="flex items-center">
        <label htmlFor={`${id}-filter`} className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter:
        </label>
        <input
          id={`${id}-filter`}
          type="text"
          value={filterTerm}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-gray-200 text-sm"
          placeholder="Filter table..."
        />
      </div>
      
      {/* Table with all features enabled */}
      <BaseTable
        data={filteredData}
        columns={columns}
        className={className}
        id={id}
        isLoading={isLoading}
        selectionProps={{
          mode: selectionMode,
          selectedRows,
          onSelectionChange: handleSelectionChange,
        }}
        sortingProps={{
          sortDescriptor,
          onSortChange: handleSortChange,
        }}
        paginationProps={{
          totalItems,
          itemsPerPage,
          currentPage,
          onPageChange: handlePageChange,
        }}
        filterProps={{
          filterTerm,
          onFilterChange: handleFilterChange,
        }}
        {...otherProps}
      />
    </div>
  );
};

export default FullFeaturedTable;
