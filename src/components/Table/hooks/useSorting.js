/**
 * @file useSorting.js
 * @description Custom hook for managing column sorting state in tables
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing column sorting in tables
 * 
 * @param {Object} options - Hook options
 * @param {Array} options.data - The data array to sort
 * @param {Object} [options.initialSortDescriptor] - Initial sort descriptor {column, direction}
 * @param {Function} [options.onSortChange] - External callback for sort changes
 * @returns {Object} Sorting state and handlers
 */
const useSorting = ({
  data = [],
  initialSortDescriptor = { column: null, direction: null },
  onSortChange,
}) => {
  // Internal sorting state
  const [sortDescriptor, setSortDescriptor] = useState(initialSortDescriptor);
  
  // Handle column sort
  const handleSort = useCallback((column) => {
    let newDirection;
    
    // Toggle sort direction or set to ascending if it's a new column
    if (sortDescriptor.column === column) {
      if (sortDescriptor.direction === 'ascending') {
        newDirection = 'descending';
      } else if (sortDescriptor.direction === 'descending') {
        newDirection = null;
      } else {
        newDirection = 'ascending';
      }
    } else {
      newDirection = 'ascending';
    }
    
    const newSortDescriptor = {
      column: newDirection ? column : null,
      direction: newDirection,
    };
    
    setSortDescriptor(newSortDescriptor);
    
    // Call external handler if provided
    if (onSortChange) {
      onSortChange(newSortDescriptor);
    }
  }, [sortDescriptor, onSortChange]);
  
  // Apply sorting to data
  const sortedData = useMemo(() => {
    if (!sortDescriptor.column || !sortDescriptor.direction) {
      return [...data]; // Return a copy of the original data
    }
    
    return [...data].sort((a, b) => {
      const aValue = a[sortDescriptor.column];
      const bValue = b[sortDescriptor.column];
      
      // Handle undefined or null values
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      
      // Compare based on value type
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDescriptor.direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Default numeric comparison
      return sortDescriptor.direction === 'ascending'
        ? aValue - bValue
        : bValue - aValue;
    });
  }, [data, sortDescriptor]);
  
  // Get sort direction for a specific column
  const getSortDirection = useCallback((column) => {
    if (sortDescriptor.column !== column) return null;
    return sortDescriptor.direction;
  }, [sortDescriptor]);
  
  // Check if a column is sorted
  const isColumnSorted = useCallback((column) => {
    return sortDescriptor.column === column;
  }, [sortDescriptor]);
  
  return {
    sortDescriptor,
    handleSort,
    sortedData,
    getSortDirection,
    isColumnSorted,
  };
};

export default useSorting;
