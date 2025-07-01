/**
 * @file SelectableTable.jsx
 * @description A table component that supports row selection
 */

import React, { useState, useCallback } from 'react';
import BaseTable from './BaseTable';

/**
 * SelectableTable - A wrapper around BaseTable that adds row selection functionality
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Data to display
 * @param {Array} props.columns - Column definitions
 * @param {string} [props.className] - Optional CSS class
 * @param {string} [props.id] - Optional ID for the table
 * @param {boolean} [props.isLoading] - Whether the table is in a loading state
 * @param {string} [props.selectionMode='multi'] - Selection mode: 'single' or 'multi'
 * @param {Set} [props.selectedRows] - Controlled prop for selected row IDs
 * @param {Function} [props.onSelectionChange] - Callback when selection changes
 * @returns {React.Component} SelectableTable component
 */
const SelectableTable = ({
  data,
  columns,
  className,
  id = 'selectable-table',
  isLoading,
  selectionMode = 'multi',
  selectedRows: externalSelectedRows,
  onSelectionChange: externalOnSelectionChange,
  ...otherProps
}) => {
  // Internal state for selection if not controlled externally
  const [internalSelectedRows, setInternalSelectedRows] = useState(new Set());
  
  // Determine if we're using controlled or uncontrolled selection
  const isControlled = externalSelectedRows !== undefined && externalOnSelectionChange !== undefined;
  const selectedRows = isControlled ? externalSelectedRows : internalSelectedRows;
  
  // Handle selection changes
  const handleSelectionChange = useCallback((newSelectedRows) => {
    if (isControlled) {
      externalOnSelectionChange(newSelectedRows);
    } else {
      setInternalSelectedRows(newSelectedRows);
    }
  }, [isControlled, externalOnSelectionChange]);
  
  return (
    <BaseTable
      data={data}
      columns={columns}
      className={className}
      id={id}
      isLoading={isLoading}
      selectionProps={{
        mode: selectionMode,
        selectedRows,
        onSelectionChange: handleSelectionChange,
      }}
      {...otherProps}
    />
  );
};

export default SelectableTable;
