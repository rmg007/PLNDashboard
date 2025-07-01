/**
 * @file index.js
 * @description Entry point for the modular table component system
 */

// Core component
export { default as BaseTable } from './BaseTable';

// Feature-specific wrapper components
export { default as ReadOnlyTable } from './ReadOnlyTable';
export { default as SelectableTable } from './SelectableTable';
export { default as SortableTable } from './SortableTable';
export { default as PaginatedTable } from './PaginatedTable';
export { default as FilterableTable } from './FilterableTable';
export { default as FullFeaturedTable } from './FullFeaturedTable';

// Feature hooks
export { default as useSelection } from './hooks/useSelection';
export { default as useSorting } from './hooks/useSorting';
export { default as usePagination } from './hooks/usePagination';
export { default as useFiltering } from './hooks/useFiltering';

// Types
// Note: TypeScript types are not exported here as they're automatically imported when needed
