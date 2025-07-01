// src/components/ChartTableComponent/TablePagination.jsx

import React from 'react';
import { useIsDark } from '../../contexts/ThemeContext';

export default function TablePagination({ table, id_slug }) {
    const isDark = useIsDark();
    const currentPage = table.getState().pagination.pageIndex + 1;
    const pageCount = table.getPageCount();
    const canPreviousPage = table.getCanPreviousPage();
    const canNextPage = table.getCanNextPage();


    return (
        <div 
            id={id_slug ? `tbl-pagination-${id_slug}` : 'table-pagination'}
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
                    id={id_slug ? `tbl-pagination-${id_slug}-prev` : 'table-pagination-prev'}
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => table.previousPage()}
                    disabled={!canPreviousPage}
                    aria-label="Previous page"
                    title="Previous page"
                >
                    <span aria-hidden="true">‹</span>
                </button>


                <button
                    id={id_slug ? `tbl-pagination-${id_slug}-next` : 'table-pagination-next'}
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => table.nextPage()}
                    disabled={!canNextPage}
                    aria-label="Next page"
                    title="Next page"
                >
                    <span aria-hidden="true">›</span>
                </button>
            </div>
        </div>
    );
}
