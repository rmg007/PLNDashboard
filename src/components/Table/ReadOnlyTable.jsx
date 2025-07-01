/**
 * @file ReadOnlyTable.jsx
 * @description A simple read-only table component for displaying data
 */

import React from 'react';
import BaseTable from './BaseTable';

/**
 * ReadOnlyTable - A simple wrapper around BaseTable for read-only data display
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Data to display
 * @param {Array} props.columns - Column definitions
 * @param {string} [props.className] - Optional CSS class
 * @param {string} [props.id] - Optional ID for the table
 * @param {boolean} [props.isLoading] - Whether the table is in a loading state
 * @returns {React.Component} ReadOnlyTable component
 */
const ReadOnlyTable = ({
  data,
  columns,
  className,
  id = 'readonly-table',
  isLoading,
  ...otherProps
}) => {
  return (
    <BaseTable
      data={data}
      columns={columns}
      className={className}
      id={id}
      isLoading={isLoading}
      {...otherProps}
    />
  );
};

export default ReadOnlyTable;
