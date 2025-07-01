/**
 * @file useSelection.js
 * @description Custom hook for managing row selection state in tables
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing row selection in tables
 * 
 * @param {Object} options - Hook options
 * @param {Array} options.data - The data array to select from
 * @param {string} [options.idField='id'] - The field to use as the unique identifier
 * @param {string} [options.mode='multi'] - Selection mode: 'single' or 'multi'
 * @param {Set} [options.initialSelection] - Initial selection state
 * @param {Function} [options.onSelectionChange] - External callback for selection changes
 * @returns {Object} Selection state and handlers
 */
const useSelection = ({
  data = [],
  idField = 'id',
  mode = 'multi',
  initialSelection = new Set(),
  onSelectionChange,
}) => {
  // Internal selection state
  const [selectedRows, setSelectedRows] = useState(initialSelection);
  
  // Get row ID helper function
  const getRowId = useCallback((row, index) => {
    return row[idField] !== undefined ? row[idField] : index;
  }, [idField]);
  
  // Handle row selection
  const handleRowSelect = useCallback((rowId) => {
    let newSelection;
    
    if (mode === 'single') {
      // Single selection mode: replace the current selection
      newSelection = new Set([rowId]);
    } else {
      // Multi selection mode: toggle the selection
      newSelection = new Set(selectedRows);
      if (newSelection.has(rowId)) {
        newSelection.delete(rowId);
      } else {
        newSelection.add(rowId);
      }
    }
    
    setSelectedRows(newSelection);
    
    // Call external handler if provided
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  }, [selectedRows, mode, onSelectionChange]);
  
  // Select all rows
  const selectAll = useCallback(() => {
    if (mode !== 'multi') return;
    
    const newSelection = new Set();
    data.forEach((row, index) => {
      newSelection.add(getRowId(row, index));
    });
    
    setSelectedRows(newSelection);
    
    // Call external handler if provided
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  }, [data, mode, getRowId, onSelectionChange]);
  
  // Deselect all rows
  const deselectAll = useCallback(() => {
    setSelectedRows(new Set());
    
    // Call external handler if provided
    if (onSelectionChange) {
      onSelectionChange(new Set());
    }
  }, [onSelectionChange]);
  
  // Check if a row is selected
  const isRowSelected = useCallback((row, index) => {
    const rowId = getRowId(row, index);
    return selectedRows.has(rowId);
  }, [selectedRows, getRowId]);
  
  // Check if all rows are selected
  const areAllRowsSelected = useMemo(() => {
    if (data.length === 0) return false;
    return data.length === selectedRows.size;
  }, [data, selectedRows]);
  
  // Check if some rows are selected
  const areSomeRowsSelected = useMemo(() => {
    return selectedRows.size > 0 && selectedRows.size < data.length;
  }, [data, selectedRows]);
  
  // Get selected row data
  const selectedRowsData = useMemo(() => {
    return data.filter((row, index) => isRowSelected(row, index));
  }, [data, isRowSelected]);
  
  return {
    selectedRows,
    handleRowSelect,
    selectAll,
    deselectAll,
    isRowSelected,
    areAllRowsSelected,
    areSomeRowsSelected,
    selectedRowsData,
  };
};

export default useSelection;
