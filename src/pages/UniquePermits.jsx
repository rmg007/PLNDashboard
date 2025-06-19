import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLayout } from '../contexts/LayoutContext';
import { RiLoader5Fill } from 'react-icons/ri';
import { FaCalendarAlt, FaChartLine, FaChartBar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { updateTitle } from '../utils/titleManager';
import { useParams, useNavigate } from 'react-router-dom';

import AnnualUniquePermitsReport from '../components/UniquePermitAnalysis/AnnualUniquePermitsReport';
import QuarterlyUniquePermitsReport from '../components/UniquePermitAnalysis/QuarterlyUniquePermitsReport';
import MonthlyUniquePermitsReport from '../components/UniquePermitAnalysis/MonthlyUniquePermitsReport';
import MultiSelectDropdown from '../components/common/MultiSelectDropdown';

export default function UniquePermits() {
    const { setTitle } = useLayout();
    const { reportType } = useParams();
    const navigate = useNavigate();
    
    const [yearlyData, setYearlyData] = useState([]);
    const [quarterlyData, setQuarterlyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [isLoadingAllData, setIsLoadingAllData] = useState(true);
    const [globalError, setGlobalError] = useState(null);
    const [activeAnalysisType, setActiveAnalysisType] = useState(reportType || 'annual');
    const [selectedYears, setSelectedYears] = useState([]);
    const [selectedQuarters, setSelectedQuarters] = useState([]);
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [isTabsCollapsed, setIsTabsCollapsed] = useState(true);

    // Update URL when active analysis type changes
    useEffect(() => {
        navigate(`/uniquepermits/${activeAnalysisType}`, { replace: true });
    }, [activeAnalysisType, navigate]);
    
    // Update active analysis type when URL changes
    useEffect(() => {
        if (reportType && ['annual', 'quarterly', 'monthly'].includes(reportType)) {
            setActiveAnalysisType(reportType);
        }
    }, [reportType]);
    
    useEffect(() => {
        // Update title based on active analysis type
        const getActiveComponentName = () => {
            switch(activeAnalysisType) {
                case 'annual': return 'AnnualUniquePermitsReport';
                case 'quarterly': return 'QuarterlyUniquePermitsReport';
                case 'monthly': return 'MonthlyUniquePermitsReport';
                default: return 'default';
            }
        };
        
        updateTitle(getActiveComponentName(), setTitle);
        return () => setTitle('My Dashboard');
    }, [setTitle, activeAnalysisType]);

    const allYears = useMemo(() => {
        const years = new Set(yearlyData.map(d => d.FiscalYear));
        return Array.from(years).sort((a, b) => b - a);
    }, [yearlyData]);

    const allQuarters = useMemo(() => [1, 2, 3, 4], []);
    const allMonths = useMemo(() => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], []);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoadingAllData(true);
            setGlobalError(null);
            try {
                const [yearlyRes, quarterlyRes, monthlyRes] = await Promise.all([
                    fetch('./data/UniquePermitsAnalysisData/UniquePermitYearlyJson.json'),
                    fetch('./data/UniquePermitsAnalysisData/UniquePermitQuarterlyJson.json'),
                    fetch('./data/UniquePermitsAnalysisData/UniquePermitMonthlyJson.json'),
                ]);

                if (!yearlyRes.ok || !quarterlyRes.ok || !monthlyRes.ok) {
                    throw new Error(`HTTP error during data fetch.`);
                }
                
                setYearlyData(await yearlyRes.json());
                setQuarterlyData(await quarterlyRes.json());
                setMonthlyData(await monthlyRes.json());

            } catch (e) {
                console.error("Failed to fetch unique permit data:", e);
                setGlobalError("Failed to load analysis data.");
            } finally {
                setIsLoadingAllData(false);
            }
        };
        fetchAllData();
    }, []);

    // MODIFIED: This effect selects years based on the active analysis type
    useEffect(() => {
        if (!isLoadingAllData && allYears.length > 0) {
            // For Monthly report, select only the last 4 years
            // For Annual and Quarterly reports, select all years
            if (activeAnalysisType === 'monthly') {
                const last4Years = [...allYears].slice(0, 4); // Get the 4 most recent years
                setSelectedYears(last4Years);
            } else {
                // Select all years by default for annual and quarterly
                setSelectedYears([...allYears]);
            }
            
            // Keep all quarters and months selected by default.
            setSelectedQuarters(allQuarters);
            setSelectedMonths(allMonths);
        }
    }, [isLoadingAllData, allYears, allQuarters, allMonths, activeAnalysisType]);

    const createMultiSelectHandler = (setter) => useCallback((value, isChecked) => {
        setter(prev => isChecked ? [...prev, value] : prev.filter(v => v !== value));
    }, []);

    const handleYearChange = createMultiSelectHandler(setSelectedYears);
    const handleQuarterChange = createMultiSelectHandler(setSelectedQuarters);
    const handleMonthChange = createMultiSelectHandler(setSelectedMonths);

    const getFilteredData = useCallback((rawData, type) => {
        let currentData = rawData;
        // The check 'selectedYears.length !== allYears.length' is removed
        // so that the initial view with 3 years is correctly filtered.
        if (selectedYears.length > 0) {
            currentData = currentData.filter(d => selectedYears.includes(d.FiscalYear));
        }
        const allQuartersSelected = selectedQuarters.length === allQuarters.length;
        if (type !== 'annual' && selectedQuarters.length > 0 && !allQuartersSelected) {
            currentData = currentData.filter(d => selectedQuarters.includes(d.FiscalQuarter));
        }
        const allMonthsSelected = selectedMonths.length === allMonths.length;
        if (type === 'monthly' && selectedMonths.length > 0 && !allMonthsSelected) {
            currentData = currentData.filter(d => selectedMonths.includes(d.FiscalMonth));
        }
        return currentData;
    }, [selectedYears, selectedQuarters, selectedMonths, allQuarters.length, allMonths.length]);

    const filteredYearlyData = useMemo(() => getFilteredData(yearlyData, 'annual'), [yearlyData, getFilteredData]);
    const filteredQuarterlyData = useMemo(() => getFilteredData(quarterlyData, 'quarterly'), [quarterlyData, getFilteredData]);
    const filteredMonthlyData = useMemo(() => getFilteredData(monthlyData, 'monthly'), [monthlyData, getFilteredData]);

    return (
        <div className="unique-permits-dashboard" id='unique-permits-dashboard'>
             {globalError && <div className="text-red-600 dark:text-red-400 text-center text-lg mb-4">{globalError}</div>}
            
            <div className="md:flex gap-4">
                <div className={`md:flex-shrink-0 mb-4 md:mb-0 transition-all duration-300 ${isTabsCollapsed ? 'md:w-16' : 'md:w-64'}`}>
                    <button
                        onClick={() => setIsTabsCollapsed(!isTabsCollapsed)}
                        className="hidden md:flex items-center justify-center w-full p-1.5 mb-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200"
                        title={isTabsCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
                    >
                        {isTabsCollapsed ? <FaChevronRight className="w-5 h-5" /> : <FaChevronLeft className="w-5 h-5" />}
                    </button>
                    <ul className={`flex-column space-y-1 text-sm font-medium text-gray-500 dark:text-gray-400 ${isTabsCollapsed ? 'hidden md:block' : ''}`}>
                         {[
                            { type: 'annual', label: 'Annual Analysis', icon: FaCalendarAlt },
                            { type: 'quarterly', label: 'Quarterly Analysis', icon: FaChartBar },
                            { type: 'monthly', label: 'Monthly Analysis', icon: FaChartLine }
                        ].map(({ type, label, icon: Icon }) => (
                            <li key={type} className="relative group">
                                <button
                                    className={`inline-flex items-center px-3 py-2 rounded-lg w-full ${activeAnalysisType === type ? 'text-white bg-blue-700 dark:bg-blue-600' : 'hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white'}`}
                                    onClick={() => {
                                        setActiveAnalysisType(type);
                                        navigate(`/uniquepermits/${type}`);
                                    }}
                                >
                                    <Icon className={`w-4 h-4 ${isTabsCollapsed ? 'mx-auto' : 'me-2'} ${activeAnalysisType === type ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                                    {!isTabsCollapsed && label}
                                </button>
                                {isTabsCollapsed && (
                                    <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-auto min-w-max p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        {label}
                                    </span>
                                )}
                            </li>
                        ))}
                        {!isTabsCollapsed && (
                            <li className="p-3 mt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                <MultiSelectDropdown
                                    label="Select Years"
                                    options={allYears.map(y => ({ label: String(y), value: y }))}
                                    selectedValues={selectedYears}
                                    onChange={handleYearChange}
                                />
                                {activeAnalysisType !== 'annual' && (
                                    <MultiSelectDropdown
                                        label="Select Quarters"
                                        options={allQuarters.map(q => ({ label: `Q${q}`, value: q }))}
                                        selectedValues={selectedQuarters}
                                        onChange={handleQuarterChange}
                                    />
                                )}
                                {activeAnalysisType === 'monthly' && (
                                    <MultiSelectDropdown
                                        label="Select Months"
                                        options={allMonths.map(m => ({ label: m, value: m }))}
                                        selectedValues={selectedMonths}
                                        onChange={handleMonthChange}
                                    />
                                )}
                            </li>
                        )}
                    </ul>
                </div>

                <div id='unique-permits-container' className="w-full bg-white dark:bg-gray-800">
                    {isLoadingAllData ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[600px]">
                            <RiLoader5Fill className="animate-spin text-blue-500 w-12 h-12 mb-4" />
                            <p className="text-lg text-gray-700 dark:text-gray-300">Loading data...</p>
                        </div>
                    ) : (
                        <>
                           {activeAnalysisType === 'annual' && (
                               <AnnualUniquePermitsReport
                                   data={filteredYearlyData}
                                   isLoading={isLoadingAllData}
                                   selectedItemsCount={selectedYears.length}
                               />
                           )}
                           {activeAnalysisType === 'quarterly' && (
                               <QuarterlyUniquePermitsReport
                                   data={filteredQuarterlyData}
                                   isLoading={isLoadingAllData}
                               />
                           )}
                           {activeAnalysisType === 'monthly' && (
                               <MonthlyUniquePermitsReport
                                   data={filteredMonthlyData}
                                   isLoading={isLoadingAllData}
                               />
                           )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
