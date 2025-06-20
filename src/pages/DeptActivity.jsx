import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLayout } from '../contexts/LayoutContext';
import { RiLoader5Fill } from 'react-icons/ri';
import { FaBuilding, FaLandmark, FaClipboardCheck } from 'react-icons/fa';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';

import PSCActivityReport from '../components/DeptActivity/PSCActivityReport';
import LUActivityReport from '../components/DeptActivity/LUActivityReport';
import PLNCheckActivityReport from '../components/DeptActivity/PLNCheckActivityReport';
import MultiSelectDropdown from '../components/common/MultiSelectDropdown';

export default function DeptActivity() {
    const { setTitle } = useLayout();
    const { deptType } = useParams();
    const navigate = useNavigate();
    
    const [activityData, setActivityData] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [globalError, setGlobalError] = useState(null);
    const [activeActivityType, setActiveActivityType] = useState(deptType || 'PSC');
    const [selectedYears, setSelectedYears] = useState([]);

    // Sync state with URL
    useEffect(() => {
        const validDeptType = deptType && ['PSC', 'LU', 'PLN Check'].includes(deptType) ? deptType : 'PSC';

        if (activeActivityType !== validDeptType) {
            setActiveActivityType(validDeptType);
        }

        if (location.pathname !== `/deptactivity/${validDeptType}`) {
            navigate(`/deptactivity/${validDeptType}`, { replace: true });
        }
    }, [deptType, activeActivityType, navigate, location.pathname]);
    
    useEffect(() => {
        setTitle('Department Activity Analysis Dashboard');
        return () => setTitle('My Dashboard');
    }, [setTitle]);

    const allYears = useMemo(() => {
        if (!Array.isArray(activityData) || activityData.length === 0) {
            return [];
        }
        const years = new Set(activityData.map(d => d.year));
        return Array.from(years).sort((a, b) => b - a);
    }, [activityData]);

    useEffect(() => {
        const fetchActivityData = async () => {
            setIsLoadingData(true);
            setGlobalError(null);
            try {
                const response = await fetch('./data/UniquePermitsAnalysisData/DeptAnnualActivityJson.json');
                
                if (!response.ok) {
                    throw new Error(`HTTP error during data fetch.`);
                }
                
                const data = await response.json();
                // Data fetched successfully
                setActivityData(data);
            } catch (e) {
                console.error("Failed to fetch department activity data:", e);
                setGlobalError("Failed to load department activity data.");
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchActivityData();
    }, []);

    // Select all years by default
    useEffect(() => {
        if (!isLoadingData && allYears.length > 0) {
            setSelectedYears([...allYears]);
        }
    }, [isLoadingData, allYears]);

    const handleYearChange = useCallback((value, isChecked) => {
        setSelectedYears(prev => isChecked ? [...prev, value] : prev.filter(v => v !== value));
    }, []);

    const getFilteredData = useCallback((department) => {
        // Filtering data for department and selected years
        
        if (!Array.isArray(activityData)) {
            if (!isLoadingData) { // Only log error if not loading and it's still not an array
                console.error(`Activity data is not an array for department ${department}. Received:`, activityData);
            }
            return [];
        }
        
        if (activityData.length === 0) {
            // Data is an empty array. This can be normal during init or if filters result in no data.
            // Avoid noisy console.error here unless it's unexpected post-load.
            if (!isLoadingData) {
                // Activity data is empty for department after loading
            }
            return [];
        }
        
        let currentData = [...activityData]; // Create a copy to avoid mutation
        
        // Filter by department 
        currentData = currentData.filter(d => d.department === department);
        
        // Filter by selected years
        if (selectedYears.length > 0) {
            currentData = currentData.filter(d => selectedYears.includes(d.year));
        }
        // Final filtered data ready for display
        return currentData;
    }, [activityData, selectedYears, isLoadingData]);

    const filteredPSCData = useMemo(() => {
        const result = getFilteredData('PSC');
        // PSC data filtered
        return result;
    }, [getFilteredData, activityData, selectedYears, isLoadingData]);
    
    const filteredLUData = useMemo(() => {
        const result = getFilteredData('LU');
        // LU data filtered
        return result;
    }, [getFilteredData, activityData, selectedYears]);
    
    const filteredPLNCheckData = useMemo(() => {
        const result = getFilteredData('PLN Check');
        // PLN Check data filtered
        return result;
    }, [getFilteredData, activityData, selectedYears]);

    if (isLoadingData) {
        return (
            <div className="flex justify-center items-center h-64">
                <RiLoader5Fill className="animate-spin text-blue-600 w-12 h-12" />
            </div>
        );
    }

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
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {activeActivityType === 'PSC' && (
                        <PSCActivityReport data={filteredPSCData} isLoading={isLoadingData} />
                    )}
                    {activeActivityType === 'LU' && (
                        <LUActivityReport data={filteredLUData} isLoading={isLoadingData} />
                    )}
                    {activeActivityType === 'PLN Check' && (
                        <PLNCheckActivityReport data={filteredPLNCheckData} isLoading={isLoadingData} />
                    )}
                </div>
            </div>
        </div>
    );
}
