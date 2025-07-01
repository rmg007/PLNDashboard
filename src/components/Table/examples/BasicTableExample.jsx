/**
 * @file BasicTableExample.jsx
 * @description Example component demonstrating the use of the modular table components
 */

import React, { useState } from 'react';
import { 
  ReadOnlyTable, 
  SelectableTable, 
  SortableTable, 
  PaginatedTable, 
  FilterableTable, 
  FullFeaturedTable 
} from '../index';

// Sample data for the examples
const sampleData = [
  { id: 1, name: 'John Doe', age: 30, department: 'Engineering', status: 'Active' },
  { id: 2, name: 'Jane Smith', age: 25, department: 'Marketing', status: 'Active' },
  { id: 3, name: 'Bob Johnson', age: 40, department: 'Finance', status: 'Inactive' },
  { id: 4, name: 'Alice Brown', age: 35, department: 'Engineering', status: 'Active' },
  { id: 5, name: 'Charlie Wilson', age: 28, department: 'HR', status: 'Active' },
  { id: 6, name: 'Diana Miller', age: 42, department: 'Marketing', status: 'Inactive' },
  { id: 7, name: 'Edward Davis', age: 33, department: 'Finance', status: 'Active' },
  { id: 8, name: 'Fiona Clark', age: 29, department: 'Engineering', status: 'Active' },
  { id: 9, name: 'George White', age: 45, department: 'HR', status: 'Inactive' },
  { id: 10, name: 'Hannah Green', age: 31, department: 'Marketing', status: 'Active' },
  { id: 11, name: 'Ian Black', age: 38, department: 'Finance', status: 'Active' },
  { id: 12, name: 'Julia Red', age: 27, department: 'Engineering', status: 'Inactive' },
];

// Column definitions for the examples
const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: info => info.getValue(),
  },
  {
    accessorKey: 'age',
    header: 'Age',
    cell: info => info.getValue(),
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: info => info.getValue(),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: info => (
      <span className={info.getValue() === 'Active' ? 'text-green-600' : 'text-red-600'}>
        {info.getValue()}
      </span>
    ),
  },
];

/**
 * BasicTableExample - Demonstrates the use of the modular table components
 */
const BasicTableExample = () => {
  // State for the selectable table
  const [selectedRows, setSelectedRows] = useState(new Set());
  
  // State for the sortable table
  const [sortDescriptor, setSortDescriptor] = useState({ column: null, direction: null });
  
  // State for the paginated table
  const [currentPage, setCurrentPage] = useState(0);
  
  // State for the filterable table
  const [filterTerm, setFilterTerm] = useState('');
  
  return (
    <div className="space-y-8 p-4">
      <div>
        <h2 className="text-xl font-bold mb-4">Read-Only Table</h2>
        <ReadOnlyTable 
          data={sampleData.slice(0, 5)} 
          columns={columns} 
          className="border border-gray-200 rounded-lg"
        />
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">Selectable Table</h2>
        <div className="mb-2">
          Selected IDs: {Array.from(selectedRows).join(', ')}
        </div>
        <SelectableTable 
          data={sampleData.slice(0, 5)} 
          columns={columns} 
          className="border border-gray-200 rounded-lg"
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
        />
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">Sortable Table</h2>
        <div className="mb-2">
          {sortDescriptor.column 
            ? `Sorted by ${sortDescriptor.column} (${sortDescriptor.direction})` 
            : 'Not sorted'}
        </div>
        <SortableTable 
          data={sampleData.slice(0, 5)} 
          columns={columns} 
          className="border border-gray-200 rounded-lg"
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
        />
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">Paginated Table</h2>
        <div className="mb-2">
          Page {currentPage + 1}
        </div>
        <PaginatedTable 
          data={sampleData} 
          columns={columns} 
          className="border border-gray-200 rounded-lg"
          itemsPerPage={5}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">Filterable Table</h2>
        <FilterableTable 
          data={sampleData} 
          columns={columns} 
          className="border border-gray-200 rounded-lg"
          filterTerm={filterTerm}
          onFilterChange={setFilterTerm}
        />
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">Full-Featured Table</h2>
        <FullFeaturedTable 
          data={sampleData} 
          columns={columns} 
          className="border border-gray-200 rounded-lg"
          itemsPerPage={5}
        />
      </div>
    </div>
  );
};

export default BasicTableExample;
