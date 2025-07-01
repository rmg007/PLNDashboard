# Modular Table Component System

This directory contains a flexible, maintainable, and highly reusable table component system. The architecture is based on a core `BaseTable` component that contains all logic, with specialized wrapper components for specific use cases.

## Core Philosophy

- **Composition over Configuration**: Import the exact table you need (SelectableTable, SortableTable) rather than configuring a monolithic component with many boolean props.
- **Developer Experience**: Easy to understand, especially for new or junior developers. Clear props, excellent documentation, and helpful error messages.
- **Performance & Accessibility**: Performant with large datasets and fully accessible to all users.

## Component Structure

### Core Component

- **BaseTable**: The central, "headless" component. Contains all rendering logic and feature hooks with minimal styling.

### Wrapper Components

- **ReadOnlyTable**: For simple data display.
- **SelectableTable**: For rows that can be selected.
- **SortableTable**: For columns that can be sorted.
- **PaginatedTable**: For data split across pages.
- **FilterableTable**: For client-side data filtering.
- **FullFeaturedTable**: An all-in-one component that combines all features for complex use cases.

### Feature Hooks

- **useSelection**: Manages row selection state.
- **useSorting**: Manages column sorting state.
- **usePagination**: Manages pagination state.
- **useFiltering**: Manages filtering state.

## Usage Examples

### Basic Table

```jsx
import { ReadOnlyTable } from '../components/Table';

const MyComponent = () => {
  const data = [
    { id: 1, name: 'John Doe', age: 30 },
    { id: 2, name: 'Jane Smith', age: 25 },
  ];
  
  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'age', header: 'Age' },
  ];
  
  return (
    <ReadOnlyTable 
      data={data} 
      columns={columns} 
    />
  );
};
```

### Selectable Table

```jsx
import { SelectableTable } from '../components/Table';
import { useState } from 'react';

const MyComponent = () => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  
  const data = [
    { id: 1, name: 'John Doe', age: 30 },
    { id: 2, name: 'Jane Smith', age: 25 },
  ];
  
  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'age', header: 'Age' },
  ];
  
  return (
    <div>
      <SelectableTable 
        data={data} 
        columns={columns} 
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        selectionMode="multi"
      />
      <div>
        Selected: {Array.from(selectedRows).join(', ')}
      </div>
    </div>
  );
};
```

### Full-Featured Table

```jsx
import { FullFeaturedTable } from '../components/Table';

const MyComponent = () => {
  const data = [
    { id: 1, name: 'John Doe', age: 30 },
    { id: 2, name: 'Jane Smith', age: 25 },
    // ... more data
  ];
  
  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'age', header: 'Age' },
  ];
  
  return (
    <FullFeaturedTable 
      data={data} 
      columns={columns} 
      itemsPerPage={10}
    />
  );
};
```

### Using Hooks Directly

```jsx
import { useSelection, useSorting, usePagination } from '../components/Table/hooks';
import { BaseTable } from '../components/Table';

const MyCustomTable = ({ data, columns }) => {
  // Use the hooks to manage state
  const selection = useSelection({ data });
  const sorting = useSorting({ data });
  const pagination = usePagination({ data: sorting.sortedData });
  
  return (
    <div>
      <BaseTable 
        data={pagination.paginatedData}
        columns={columns}
        selectionProps={{
          mode: 'multi',
          selectedRows: selection.selectedRows,
          onSelectionChange: selection.handleRowSelect,
        }}
        sortingProps={{
          sortDescriptor: sorting.sortDescriptor,
          onSortChange: sorting.handleSort,
        }}
        paginationProps={{
          totalItems: data.length,
          itemsPerPage: pagination.itemsPerPage,
          currentPage: pagination.currentPage,
          onPageChange: pagination.handlePageChange,
        }}
      />
      
      <div className="pagination-controls">
        <button onClick={pagination.firstPage} disabled={!pagination.canPreviousPage}>First</button>
        <button onClick={pagination.previousPage} disabled={!pagination.canPreviousPage}>Previous</button>
        <span>
          Page {pagination.currentPage + 1} of {pagination.totalPages}
        </span>
        <button onClick={pagination.nextPage} disabled={!pagination.canNextPage}>Next</button>
        <button onClick={pagination.lastPage} disabled={!pagination.canNextPage}>Last</button>
      </div>
    </div>
  );
};
```

## Migration Guide

When migrating from the old table components to this new system:

1. Identify which features you need (selection, sorting, pagination, filtering)
2. Choose the appropriate wrapper component or use FullFeaturedTable
3. Map your existing props to the new component props

### Common Prop Mappings

| Old Prop | New Component/Prop |
|---------|-------------------|
| `data` | `data` (all components) |
| `columns` | `columns` (all components) |
| `enableRowSelection` | Use `SelectableTable` or `selectionProps` |
| `onRowSelectionChange` | `onSelectionChange` in `SelectableTable` |
| `enableSorting` | Use `SortableTable` or `sortingProps` |
| `showPagination` | Use `PaginatedTable` or `paginationProps` |

## Best Practices

1. **Choose the Right Component**: Use the most specific component for your needs rather than always using FullFeaturedTable.
2. **Controlled vs. Uncontrolled**: All wrapper components support both controlled and uncontrolled modes.
3. **Performance**: For large datasets, consider server-side pagination and filtering.
4. **Accessibility**: The tables are built with accessibility in mind, but ensure you maintain proper labeling and keyboard navigation.
5. **Customization**: Use the provided hooks to build custom table components when needed.

## TypeScript Support

All components and hooks are fully typed. Import types from the `types.ts` file:

```tsx
import { ColumnDef } from '../components/Table/types';

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
];
```
