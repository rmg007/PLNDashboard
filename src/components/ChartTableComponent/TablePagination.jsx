// src/components/ChartTableComponent/TablePagination.jsx

import React from 'react';
import { useIsDark } from '../../contexts/ThemeContext';

export default function TablePagination({ table }) {
    const isDark = useIsDark();
    const currentPage = table.getState().pagination.pageIndex + 1;
    const pageCount = table.getPageCount();
    const canPreviousPage = table.getCanPreviousPage();
    const canNextPage = table.getCanNextPage();

    // Generate page numbers to show in pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        const halfMax = Math.floor(maxPagesToShow / 2);
        
        let startPage = Math.max(1, currentPage - halfMax);
        let endPage = Math.min(pageCount, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();
    const showEllipsisStart = pageNumbers[0] > 1;
    const showEllipsisEnd = pageNumbers[pageNumbers.length - 1] < pageCount;

    return (
        <div 
            className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 gap-4"
            role="navigation"
            aria-label="Table pagination"
        >
            <div className="text-sm text-gray-700 dark:text-gray-300">
                <span>
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{pageCount}</span>
                </span>
            </div>
            
            <div className="flex items-center space-x-1">
                <button
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!canPreviousPage}
                    aria-label="First page"
                    title="First page"
                >
                    <span aria-hidden="true">««</span>
                </button>
                <button
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => table.previousPage()}
                    disabled={!canPreviousPage}
                    aria-label="Previous page"
                    title="Previous page"
                >
                    <span aria-hidden="true">‹</span>
                </button>

                {showEllipsisStart && (
                    <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                )}

                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        className={`min-w-[2rem] px-2 py-1 rounded-md transition-colors ${
                            currentPage === page
                                ? 'bg-blue-600 text-white dark:bg-blue-700'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                        }`}
                        onClick={() => table.setPageIndex(page - 1)}
                        aria-current={currentPage === page ? 'page' : undefined}
                        aria-label={`Page ${page}`}
                    >
                        {page}
                    </button>
                ))}

                {showEllipsisEnd && (
                    <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                )}

                <button
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => table.nextPage()}
                    disabled={!canNextPage}
                    aria-label="Next page"
                    title="Next page"
                >
                    <span aria-hidden="true">›</span>
                </button>
                <button
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => table.setPageIndex(pageCount - 1)}
                    disabled={!canNextPage}
                    aria-label="Last page"
                    title="Last page"
                >
                    <span aria-hidden="true">»»</span>
                </button>
            </div>

            <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-700 dark:text-gray-300">Go to page:</span>
                <input
                    type="number"
                    min={1}
                    max={pageCount}
                    defaultValue={currentPage}
                    onChange={(e) => {
                        const page = e.target.value ? Number(e.target.value) - 1 : 0;
                        table.setPageIndex(Math.min(Math.max(0, page), pageCount - 1));
                    }}
                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    aria-label="Page number"
                />
            </div>
        </div>
    );
}
