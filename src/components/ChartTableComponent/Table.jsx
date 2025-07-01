// src/components/ChartTableComponent/Table.jsx

import React, { useCallback, useRef } from 'react';
import { useIsDark } from '../../contexts/ThemeContext';
import { flexRender } from '@tanstack/react-table';
import TablePagination from './TablePagination';

const ROW_HEIGHT = 40; // Reduced from 53px to make rows more compact

export default function Table({ 
    table, 
    highlightedIndex, 
    onRowHover, 
    onRowLeave,
    selectedIndices = [],
    onRowSelect,
    showPagination = false,
    disableSelection = false,
    disableHover = false,
    className = '',
    id_slug
}) {
    const tableContainerRef = useRef(null);
    const rows = table.getRowModel().rows;
    const isDark = useIsDark();
    const pageCount = table.getPageCount();
    
    // Only show pagination if there's more than one page and showPagination is true
    const shouldShowPagination = showPagination && pageCount > 1;
    
    const handleRowClick = useCallback((rowIndex, e) => {
        if (onRowSelect) {
            onRowSelect(rowIndex, e);
        }
    }, [onRowSelect]);

    const handleRowKeyDown = useCallback((rowIndex, e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onRowSelect) {
            e.preventDefault();
            onRowSelect(rowIndex, e);
        }
    }, [onRowSelect]);

    const handleHeaderKeyDown = useCallback((e, header) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const sortHandler = header.column.getToggleSortingHandler();
            if (sortHandler) {
                sortHandler(e);
            }
        }
    }, []);

    // Add compact table styling
    const tableClasses = `min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs ${className}`;
    const thClasses = 'px-2 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 text-center';
    const tdClasses = 'px-2 py-1 text-xs text-gray-800 dark:text-gray-200 text-center';

    return (
        <div className="flex flex-col h-full">
            <div
                ref={tableContainerRef}
                className={`relative rounded-lg border ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} shadow-sm`}
            >
                <table id={id_slug ? `tbl-${id_slug}` : 'table'} className={tableClasses}>
                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700/50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className={thClasses}
                                        onClick={header.column.getToggleSortingHandler()}
                                        onKeyDown={(e) => handleHeaderKeyDown(e, header)}
                                        style={{ width: header.getSize() }}
                                        role="columnheader"
                                        aria-sort={header.column.getIsSorted() || 'none'}
                                        tabIndex={header.column.getCanSort() ? 0 : -1}
                                    >
                                        <div className="flex items-center justify-center space-x-2">
                                            <span>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </span>
                                            <span className="text-gray-400">
                                                {{ asc: '▲', desc: '▼' }[header.column.getIsSorted()] ?? null}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row, index) => {
                            const isHighlighted = highlightedIndex === index;
                            let isSelected = false;
                            if (table.options.enableRowSelection) {
                                isSelected = row.getIsSelected();
                            } else if (!disableSelection && Array.isArray(selectedIndices) && selectedIndices.includes(index)) {
                                isSelected = true;
                            }

                            let rowClassBuilder = ['w-full', 'transition-colors', 'duration-150', 'border-b', 'border-dotted'];
                            if (isDark) {
                                rowClassBuilder.push('border-gray-700/50');
                            } else {
                                rowClassBuilder.push('border-gray-200');
                            }

                            if (isHighlighted && !disableHover) {
                                rowClassBuilder.push(isDark ? 'bg-blue-900/30' : 'bg-blue-100/70');
                            } else if (isSelected) {
                                rowClassBuilder.push(isDark ? 'bg-blue-900/40' : 'bg-blue-100');
                            } else {
                                if (index % 2 === 0) {
                                    rowClassBuilder.push(isDark ? 'dark:bg-gray-800' : 'bg-white');
                                } else {
                                    rowClassBuilder.push(isDark ? 'dark:bg-gray-800/60' : 'bg-gray-50');
                                }
                                if (!disableHover) {
                                    rowClassBuilder.push('cursor-pointer', isDark ? 'dark:hover:bg-gray-700' : 'hover:bg-gray-100');
                                }
                            }
                            const rowClasses = rowClassBuilder.join(' ');

                            return (
                                <tr
                                    key={row.id}
                                    onMouseEnter={() => !disableHover && onRowHover && onRowHover(row.index)}
                                    onMouseLeave={() => !disableHover && onRowLeave && onRowLeave()}
                                    onClick={(e) => handleRowClick(index, e)}
                                    className={rowClasses}
                                    style={{ height: '36px' }} // Set a fixed height to prevent shaking
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td 
                                            key={cell.id}
                                            className={tdClasses}
                                            style={{ width: cell.column.getSize() }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {/* Only show pagination if there's more than one page */}
            {shouldShowPagination && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                    <TablePagination table={table} id_slug={id_slug} />
                </div>
            )}
        </div>
    );
}