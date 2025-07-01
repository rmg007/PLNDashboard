/**
 * @file FilterableTable.jsx
 * @description A table component that supports client-side filtering
 */

import React, { useState, useCallback, useMemo } from 'react';
import BaseTable from './BaseTable';

/**
 * FilterableTable - A wrapper around BaseTable that adds filtering functionality
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Data to display
 * @param {Array} props.columns - Column definitions
 * @param {string} [props.className] - Optional CSS class
 * @param {string} [props.id] - Optional ID for the table
 * @param {boolean} [props.isLoading] - Whether the table is in a loading state
 * @param {string} [props.filterTerm] - Controlled prop for filter term
 * @param {Function} [props.onFilterChange] - Callback when filter changes
 * @param {Function} [props.filterFunction] - Custom filter function
 * @returns {React.Component} FilterableTable component
 */
const FilterableTable = ({
  data,
  columns,
  className,
  id = 'filterable-table',
  isLoading,
  filterTerm: externalFilterTerm,
  onFilterChange: externalOnFilterChange,
  filterFunction,
  ...otherProps
}) => {
  // Internal state for filtering if not controlled externally
  const [internalFilterTerm, setInternalFilterTerm] = useState('');
  
  // Determine if we're using controlled or uncontrolled filtering
  const isControlled = externalFilterTerm !== undefined && externalOnFilterChange !== undefined;
  const filterTerm = isControlled ? externalFilterTerm : internalFilterTerm;
  
  // Handle filter changes
  const handleFilterChange = useCallback((newFilterTerm) => {
    if (isControlled) {
      externalOnFilterChange(newFilterTerm);
    } else {
      setInternalFilterTerm(newFilterTerm);
    }
  }, [isControlled, externalOnFilterChange]);
  
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
      
      {/* Table with filtered data */}
      <BaseTable
        data={filteredData}
        columns={columns}
        className={className}
        id={id}
        isLoading={isLoading}
        filterProps={{
          filterTerm,
          onFilterChange: handleFilterChange,
        }}
        {...otherProps}
      />
    </div>
  );
};

export default FilterableTable;
