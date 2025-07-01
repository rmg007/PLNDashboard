/**
 * @file usePagination.js
 * @description Custom hook for managing pagination state in tables
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing pagination in tables
 * 
 * @param {Object} options - Hook options
 * @param {Array} options.data - The data array to paginate
 * @param {number} [options.itemsPerPage=10] - Number of items per page
 * @param {number} [options.initialPage=0] - Initial page index (0-based)
 * @param {Function} [options.onPageChange] - External callback for page changes
 * @returns {Object} Pagination state and handlers
 */
const usePagination = ({
  data = [],
  itemsPerPage = 10,
  initialPage = 0,
  onPageChange,
}) => {
  // Internal pagination state
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(data.length / itemsPerPage);
  }, [data.length, itemsPerPage]);
  
  // Ensure current page is valid
  const validatedCurrentPage = useMemo(() => {
    if (totalPages === 0) return 0;
    return Math.min(Math.max(0, currentPage), totalPages - 1);
  }, [currentPage, totalPages]);
  
  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = validatedCurrentPage * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);
    return data.slice(startIndex, endIndex);
  }, [data, validatedCurrentPage, itemsPerPage]);
  
  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    const validPage = Math.min(Math.max(0, newPage), totalPages - 1);
    setCurrentPage(validPage);
    
    // Call external handler if provided
    if (onPageChange) {
      onPageChange(validPage);
    }
  }, [totalPages, onPageChange]);
  
  // Go to next page
  const nextPage = useCallback(() => {
    if (validatedCurrentPage < totalPages - 1) {
      handlePageChange(validatedCurrentPage + 1);
    }
  }, [validatedCurrentPage, totalPages, handlePageChange]);
  
  // Go to previous page
  const previousPage = useCallback(() => {
    if (validatedCurrentPage > 0) {
      handlePageChange(validatedCurrentPage - 1);
    }
  }, [validatedCurrentPage, handlePageChange]);
  
  // Go to first page
  const firstPage = useCallback(() => {
    handlePageChange(0);
  }, [handlePageChange]);
  
  // Go to last page
  const lastPage = useCallback(() => {
    handlePageChange(totalPages - 1);
  }, [handlePageChange, totalPages]);
  
  // Check if can go to next/previous page
  const canNextPage = validatedCurrentPage < totalPages - 1;
  const canPreviousPage = validatedCurrentPage > 0;
  
  return {
    currentPage: validatedCurrentPage,
    totalPages,
    paginatedData,
    handlePageChange,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    canNextPage,
    canPreviousPage,
    itemsPerPage,
  };
};

export default usePagination;
