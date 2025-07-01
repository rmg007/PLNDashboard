/**
 * @file types.ts
 * @description Type definitions for the modular table component system
 */

/**
 * Column definition for table components
 */
export interface ColumnDef<T> {
  /** The key in the data object to access the value */
  accessorKey: keyof T;
  
  /** The text to display in the column header */
  header: string | ((props: any) => React.ReactNode);
  
  /** Optional custom renderer for the cell */
  cell?: (info: any) => React.ReactNode;
  
  /** Optional unique identifier for the column */
  id?: string;
  
  /** Optional sorting function */
  sortingFn?: string | ((a: any, b: any) => number);
  
  /** Optional column width */
  size?: number;
  
  /** Optional minimum column width */
  minSize?: number;
  
  /** Optional maximum column width */
  maxSize?: number;
  
  /** Whether sorting is enabled for this column */
  enableSorting?: boolean;
}

/**
 * Base props for all table components
 */
export interface BaseTableProps<T> {
  /** The data to display in the table */
  data: T[];
  
  /** Column definitions */
  columns: ColumnDef<T>[];
  
  /** Optional CSS class name */
  className?: string;
  
  /** Optional ID for the table */
  id?: string;
  
  /** Whether the table is in a loading state */
  isLoading?: boolean;
}

/**
 * Props for selection functionality
 */
export interface SelectionProps {
  /** Selection mode: single or multi */
  mode: 'single' | 'multi';
  
  /** Set of selected row IDs */
  selectedRows: Set<string | number>;
  
  /** Callback when selection changes */
  onSelectionChange: (newSelectedRows: Set<string | number>) => void;
}

/**
 * Props for sorting functionality
 */
export interface SortingProps<T> {
  /** Current sort descriptor */
  sortDescriptor: { 
    column: keyof T | null; 
    direction: 'ascending' | 'descending' | null;
  };
  
  /** Callback when sort changes */
  onSortChange: (newSortDescriptor: { 
    column: keyof T | null; 
    direction: 'ascending' | 'descending' | null;
  }) => void;
}

/**
 * Props for pagination functionality
 */
export interface PaginationProps {
  /** Total number of items */
  totalItems: number;
  
  /** Number of items per page */
  itemsPerPage: number;
  
  /** Current page index */
  currentPage: number;
  
  /** Callback when page changes */
  onPageChange: (newPage: number) => void;
}

/**
 * Props for filtering functionality
 */
export interface FilterProps {
  /** Current filter term */
  filterTerm: string;
  
  /** Callback when filter changes */
  onFilterChange: (newFilterTerm: string) => void;
}
