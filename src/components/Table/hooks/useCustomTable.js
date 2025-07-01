/**
 * @file useCustomTable.js
 * @description Custom hook for creating a table instance with proper configuration
 */

import { useMemo } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  getPaginationRowModel,
  getFilteredRowModel
} from '@tanstack/react-table';

/**
 * Custom hook to create a table instance with proper configuration
 * 
 * @param {Object} options - Hook options
 * @param {Array} options.data - Table data
 * @param {Array} options.columns - Table columns
 * @param {Object} options.state - Table state (sorting, pagination, etc.)
 * @param {Object} options.features - Feature flags
 * @returns {Object} Table instance
 */
const useCustomTable = ({
  data = [],
  columns = [],
  state = {},
  features = {
    sorting: false,
    pagination: false,
    filtering: false,
    selection: false
  },
  callbacks = {}
}) => {
  // Create the table instance
  const table = useReactTable({
    data,
    columns,
    state,
    
    // Core features
    getCoreRowModel: getCoreRowModel(),
    
    // Optional features based on flags
    ...(features.sorting ? { getSortedRowModel: getSortedRowModel() } : {}),
    ...(features.pagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    ...(features.filtering ? { getFilteredRowModel: getFilteredRowModel() } : {}),
    
    // Row selection
    enableRowSelection: features.selection,
    
    // Callbacks
    ...callbacks
  });
  
  return table;
};

export default useCustomTable;
