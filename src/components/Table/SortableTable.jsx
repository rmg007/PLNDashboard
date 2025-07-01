/**
 * @file SortableTable.jsx
 * @description A table component that supports column sorting
 */

import React, { useState, useCallback } from 'react';
import BaseTable from './BaseTable';

/**
 * SortableTable - A wrapper around BaseTable that adds column sorting functionality
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Data to display
 * @param {Array} props.columns - Column definitions
 * @param {string} [props.className] - Optional CSS class
 * @param {string} [props.id] - Optional ID for the table
 * @param {boolean} [props.isLoading] - Whether the table is in a loading state
 * @param {Object} [props.sortDescriptor] - Controlled prop for sort state
 * @param {Function} [props.onSortChange] - Callback when sort changes
 * @returns {React.Component} SortableTable component
 */
const SortableTable = ({
  data,
  columns,
  className,
  id = 'sortable-table',
  isLoading,
  sortDescriptor: externalSortDescriptor,
  onSortChange: externalOnSortChange,
  ...otherProps
}) => {
  // Internal state for sorting if not controlled externally
  const [internalSortDescriptor, setInternalSortDescriptor] = useState({ 
    column: null, 
    direction: null 
  });
  
  // Determine if we're using controlled or uncontrolled sorting
  const isControlled = externalSortDescriptor !== undefined && externalOnSortChange !== undefined;
  const sortDescriptor = isControlled ? externalSortDescriptor : internalSortDescriptor;
  
  // Handle sort changes
  const handleSortChange = useCallback((newSortDescriptor) => {
    if (isControlled) {
      externalOnSortChange(newSortDescriptor);
    } else {
      setInternalSortDescriptor(newSortDescriptor);
    }
  }, [isControlled, externalOnSortChange]);
  
  return (
    <BaseTable
      data={data}
      columns={columns}
      className={className}
      id={id}
      isLoading={isLoading}
      sortingProps={{
        sortDescriptor,
        onSortChange: handleSortChange,
      }}
      {...otherProps}
    />
  );
};

export default SortableTable;
