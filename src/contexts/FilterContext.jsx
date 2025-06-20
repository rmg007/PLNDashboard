import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

// Create context
const FilterContext = createContext();

// Custom hook to use the filter context
export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const location = useLocation();
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  // DeptActivity filters
  const [selectedYears, setSelectedYears] = useState([]);
  const [allYears, setAllYears] = useState([]);
  const [deptActivityData, setDeptActivityData] = useState([]);
  const [isLoadingDeptData, setIsLoadingDeptData] = useState(false);
  
  // UniquePermits filters
  const [selectedPermitYears, setSelectedPermitYears] = useState([]);
  const [selectedQuarters, setSelectedQuarters] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoadingPermitData, setIsLoadingPermitData] = useState(false);
  
  const allQuarters = useMemo(() => [1, 2, 3, 4], []);
  const allMonths = useMemo(() => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], []);
  
  // Reset selected filters when route changes
  useEffect(() => {
    // Keep the selected years but update the visibility of filters based on the route
    const isDeptActivityRoute = location.pathname.includes('/deptactivity');
    const isUniquePermitsRoute = location.pathname.includes('/uniquepermits');
    
    // If we're not on a route that needs filters, hide them
    if (!isDeptActivityRoute && !isUniquePermitsRoute) {
      setIsFilterVisible(false);
    }
  }, [location.pathname]);

  // Fetch department activity data
  useEffect(() => {
    const fetchDeptActivityData = async () => {
      if (location.pathname.includes('/deptactivity')) {
        setIsLoadingDeptData(true);
        try {
          const response = await fetch('./data/UniquePermitsAnalysisData/DeptAnnualActivityJson.json');
          
          if (!response.ok) {
            throw new Error(`HTTP error during data fetch.`);
          }
          
          const data = await response.json();
          setDeptActivityData(data);
          
          // Extract all years from the data
          const years = new Set(data.map(d => d.year));
          const sortedYears = Array.from(years).sort((a, b) => b - a);
          setAllYears(sortedYears);
          
          // Select all years by default
          setSelectedYears(sortedYears);
        } catch (e) {
          console.error("Failed to fetch department activity data:", e);
        } finally {
          setIsLoadingDeptData(false);
        }
      }
    };
    
    fetchDeptActivityData();
  }, [location.pathname]);
  
  // Fetch unique permits data
  useEffect(() => {
    const fetchUniquePermitsData = async () => {
      if (location.pathname.includes('/uniquepermits')) {
        setIsLoadingPermitData(true);
        try {
          const [yearlyRes, quarterlyRes, monthlyRes] = await Promise.all([
            fetch('./data/UniquePermitsAnalysisData/UniquePermitYearlyJson.json'),
            fetch('./data/UniquePermitsAnalysisData/UniquePermitQuarterlyJson.json'),
            fetch('./data/UniquePermitsAnalysisData/UniquePermitMonthlyJson.json'),
          ]);

          if (!yearlyRes.ok || !quarterlyRes.ok || !monthlyRes.ok) {
            throw new Error(`HTTP error during data fetch.`);
          }
          
          const yearlyDataResult = await yearlyRes.json();
          setYearlyData(yearlyDataResult);
          
          setQuarterlyData(await quarterlyRes.json());
          setMonthlyData(await monthlyRes.json());
          
          // Extract all years from the yearly data
          const years = new Set(yearlyDataResult.map(d => d.FiscalYear));
          const sortedYears = Array.from(years).sort((a, b) => b - a);
          
          // Select all years, quarters, and months by default
          setSelectedPermitYears(sortedYears);
          setSelectedQuarters([1, 2, 3, 4]);
          setSelectedMonths(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
          
        } catch (e) {
          console.error("Failed to fetch unique permits data:", e);
        } finally {
          setIsLoadingPermitData(false);
        }
      }
    };
    
    fetchUniquePermitsData();
  }, [location.pathname]);

  // Handle year selection for DeptActivity
  const handleYearChange = (value, isChecked) => {
    setSelectedYears(prev => isChecked ? [...prev, value] : prev.filter(v => v !== value));
  };

  // Handle filter changes for UniquePermits
  const handlePermitYearChange = (value, isChecked) => {
    setSelectedPermitYears(prev => isChecked ? [...prev, value] : prev.filter(v => v !== value));
  };

  const handleQuarterChange = (value, isChecked) => {
    setSelectedQuarters(prev => isChecked ? [...prev, value] : prev.filter(v => v !== value));
  };

  const handleMonthChange = (value, isChecked) => {
    setSelectedMonths(prev => isChecked ? [...prev, value] : prev.filter(v => v !== value));
  };

  // Filter department data based on selected years and department
  const getFilteredDeptData = (department) => {
    if (!Array.isArray(deptActivityData) || deptActivityData.length === 0) {
      return [];
    }
    
    let currentData = [...deptActivityData]; // Create a copy to avoid mutation
    
    // Filter by department 
    currentData = currentData.filter(d => d.department === department);
    
    // Filter by selected years
    if (selectedYears.length > 0) {
      currentData = currentData.filter(d => selectedYears.includes(d.year));
    }
    
    return currentData;
  };

  // Filter unique permits data based on selected filters
  const getFilteredPermitData = (data, analysisType) => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    let currentData = [...data]; // Create a copy to avoid mutation
    
    // Filter by selected years
    if (selectedPermitYears.length > 0) {
      currentData = currentData.filter(d => selectedPermitYears.includes(d.FiscalYear));
    }
    
    // Apply additional filters based on analysis type
    if (analysisType !== 'annual' && selectedQuarters.length > 0) {
      currentData = currentData.filter(d => selectedQuarters.includes(d.FiscalQuarter));
    }
    
    if (analysisType === 'monthly' && selectedMonths.length > 0) {
      currentData = currentData.filter(d => selectedMonths.includes(d.FiscalMonth));
    }
    
    return currentData;
  };

  // Memoize filtered data for each department
  const filteredPSCData = useMemo(() => {
    return getFilteredDeptData('PSC');
  }, [deptActivityData, selectedYears]);
  
  const filteredLUData = useMemo(() => {
    return getFilteredDeptData('LU');
  }, [deptActivityData, selectedYears]);
  
  const filteredPLNCheckData = useMemo(() => {
    return getFilteredDeptData('PLN Check');
  }, [deptActivityData, selectedYears]);
  
  // Memoize filtered data for unique permits
  const filteredYearlyData = useMemo(() => {
    return getFilteredPermitData(yearlyData, 'annual');
  }, [yearlyData, selectedPermitYears]);
  
  const filteredQuarterlyData = useMemo(() => {
    return getFilteredPermitData(quarterlyData, 'quarterly');
  }, [quarterlyData, selectedPermitYears, selectedQuarters]);
  
  const filteredMonthlyData = useMemo(() => {
    return getFilteredPermitData(monthlyData, 'monthly');
  }, [monthlyData, selectedPermitYears, selectedQuarters, selectedMonths]);

  // Context value
  const value = {
    // General filter state
    isFilterVisible,
    setIsFilterVisible,
    
    // DeptActivity filters
    allYears,
    selectedYears,
    handleYearChange,
    isLoadingDeptData,
    filteredPSCData,
    filteredLUData,
    filteredPLNCheckData,
    
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
    filteredYearlyData,
    filteredQuarterlyData,
    filteredMonthlyData,
    yearlyData,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};
