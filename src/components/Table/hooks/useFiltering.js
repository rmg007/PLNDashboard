/**
 * @file useFiltering.js
 * @description Custom hook for managing filtering state in tables
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing filtering in tables
 * 
 * @param {Object} options - Hook options
 * @param {Array} options.data - The data array to filter
 * @param {string} [options.initialFilterTerm=''] - Initial filter term
 * @param {Function} [options.filterFunction] - Custom filter function
 * @param {Function} [options.onFilterChange] - External callback for filter changes
 * @returns {Object} Filtering state and handlers
 */
const useFiltering = ({
  data = [],
  initialFilterTerm = '',
  filterFunction,
  onFilterChange,
}) => {
  // Internal filtering state
  const [filterTerm, setFilterTerm] = useState(initialFilterTerm);
  
  // Default filter function
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
  
  // Handle filter change
  const handleFilterChange = useCallback((newFilterTerm) => {
    setFilterTerm(newFilterTerm);
    
    // Call external handler if provided
    if (onFilterChange) {
      onFilterChange(newFilterTerm);
    }
  }, [onFilterChange]);
  
  // Apply filtering to data
  const filteredData = useMemo(() => {
    const filterFn = filterFunction || defaultFilterFunction;
    return filterFn(data, filterTerm);
  }, [data, filterTerm, filterFunction, defaultFilterFunction]);
  
  // Clear filter
  const clearFilter = useCallback(() => {
    handleFilterChange('');
  }, [handleFilterChange]);
  
  return {
    filterTerm,
    handleFilterChange,
    filteredData,
    clearFilter,
    isFiltered: filterTerm !== '',
  };
};

export default useFiltering;
