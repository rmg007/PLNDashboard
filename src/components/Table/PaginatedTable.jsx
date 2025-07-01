/**
 * @file PaginatedTable.jsx
 * @description A table component that supports pagination
 */

import React, { useState, useCallback, useMemo } from 'react';
import BaseTable from './BaseTable';

/**
 * PaginatedTable - A wrapper around BaseTable that adds pagination functionality
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Data to display
 * @param {Array} props.columns - Column definitions
 * @param {string} [props.className] - Optional CSS class
 * @param {string} [props.id] - Optional ID for the table
 * @param {boolean} [props.isLoading] - Whether the table is in a loading state
 * @param {number} [props.itemsPerPage=10] - Number of items per page
 * @param {number} [props.currentPage] - Controlled prop for current page index
 * @param {Function} [props.onPageChange] - Callback when page changes
 * @returns {React.Component} PaginatedTable component
 */
const PaginatedTable = ({
  data,
  columns,
  className,
  id = 'paginated-table',
  isLoading,
  itemsPerPage = 10,
  currentPage: externalCurrentPage,
  onPageChange: externalOnPageChange,
  ...otherProps
}) => {
  // Internal state for pagination if not controlled externally
  const [internalCurrentPage, setInternalCurrentPage] = useState(0);
  
  // Determine if we're using controlled or uncontrolled pagination
  const isControlled = externalCurrentPage !== undefined && externalOnPageChange !== undefined;
  const currentPage = isControlled ? externalCurrentPage : internalCurrentPage;
  
  // Calculate total items from data length
  const totalItems = data.length;
  
  // Handle page changes
  const handlePageChange = useCallback((newPage) => {
    if (isControlled) {
      externalOnPageChange(newPage);
    } else {
      setInternalCurrentPage(newPage);
    }
  }, [isControlled, externalOnPageChange]);
  
  // Memoize pagination props to avoid unnecessary re-renders
  const paginationProps = useMemo(() => ({
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange: handlePageChange,
  }), [totalItems, itemsPerPage, currentPage, handlePageChange]);
  
  return (
    <BaseTable
      data={data}
      columns={columns}
      className={className}
      id={id}
      isLoading={isLoading}
      paginationProps={paginationProps}
      {...otherProps}
    />
  );
};

export default PaginatedTable;
