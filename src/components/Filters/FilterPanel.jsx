import React from 'react';
import { useLocation } from 'react-router-dom';
import { useFilter } from '../../contexts/FilterContext';
import MultiSelectDropdown from '../Common/MultiSelectDropdown';

export default function FilterPanel() {
  const location = useLocation();
  const { 
    // DeptActivity filters
    allYears, 
    selectedYears, 
    handleYearChange,
    isLoadingDeptData,
    
    // UniquePermits filters
    selectedPermitYears,
    selectedQuarters,
    selectedMonths,
    allQuarters,
    allMonths,
    handlePermitYearChange,
    handleQuarterChange,
    handleMonthChange,
    isLoadingPermitData,
    yearlyData
  } = useFilter();

  // Determine which filters to show based on the current route
  const isDeptActivityRoute = location.pathname.includes('/deptactivity');
  const isUniquePermitsRoute = location.pathname.includes('/uniquepermits');
  
  // Extract years from UniquePermits data
  const permitYears = React.useMemo(() => {
    if (!yearlyData || yearlyData.length === 0) return [];
    const years = new Set(yearlyData.map(item => item.FiscalYear));
    return Array.from(years).sort((a, b) => b - a);
  }, [yearlyData]);
  
  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Filters</h2>
      
      {isDeptActivityRoute && (
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Department Activity Filters</h3>
          
          {isLoadingDeptData ? (
            <p className="text-gray-500 dark:text-gray-400">Loading filters...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                <MultiSelectDropdown 
                  options={allYears.map(year => ({ value: year, label: year.toString() }))}
                  selectedValues={selectedYears}
                  onChange={handleYearChange}
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {isUniquePermitsRoute && (
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Unique Permits Filters</h3>
          
          {isLoadingPermitData ? (
            <p className="text-gray-500 dark:text-gray-400">Loading filters...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fiscal Year</label>
                <MultiSelectDropdown 
                  options={permitYears.map(year => ({ value: year, label: year.toString() }))}
                  selectedValues={selectedPermitYears}
                  onChange={handlePermitYearChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quarter</label>
                <MultiSelectDropdown 
                  options={allQuarters.map(quarter => ({ value: quarter, label: `Q${quarter}` }))}
                  selectedValues={selectedQuarters}
                  onChange={handleQuarterChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
                <MultiSelectDropdown 
                  options={allMonths.map(month => ({ value: month, label: month }))}
                  selectedValues={selectedMonths}
                  onChange={handleMonthChange}
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {!isDeptActivityRoute && !isUniquePermitsRoute && (
        <p className="text-gray-500 dark:text-gray-400">No filters available for this page.</p>
      )}
    </div>
  );
}
