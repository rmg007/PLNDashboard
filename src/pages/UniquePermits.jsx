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

    // Sync state with URL
    useEffect(() => {
        const validReportType = reportType && ['annual', 'quarterly', 'monthly'].includes(reportType) ? reportType : 'annual';
        
        if (activeAnalysisType !== validReportType) {
            setActiveAnalysisType(validReportType);
        }

        // Update URL if it's not in sync with the state
        if (location.pathname !== `/uniquepermits/${validReportType}`) {
            navigate(`/uniquepermits/${validReportType}`, { replace: true });
        }
    }, [reportType, activeAnalysisType, navigate, location.pathname]);
    
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
        <div className="h-full">
            {globalError && <div className="text-red-500 text-center p-4">{globalError}</div>}
            
            <div className="flex flex-col md:flex-row gap-4">
                {/* Filters Panel */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
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
                    </div>
                </div>

                {/* Main Content */}
                <div id='unique-permits-container' className="flex-1 min-w-0">
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
