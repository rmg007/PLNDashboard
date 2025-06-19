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
    const [isTabsCollapsed, setIsTabsCollapsed] = useState(true);

    // Update URL when active department type changes
    useEffect(() => {
        navigate(`/deptactivity/${activeActivityType}`, { replace: true });
    }, [activeActivityType, navigate]);
    
    // Update active department type when URL changes
    useEffect(() => {
        if (deptType && ['PSC', 'LU', 'PLN Check'].includes(deptType)) {
            setActiveActivityType(deptType);
        }
    }, [deptType]);
    
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
                console.log('Fetched activity data:', data);
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
        // console.log('Filtering for department:', department, 'isLoadingData:', isLoadingData); // For debugging
        // console.log('All activity data:', activityData);
        // console.log('Selected years:', selectedYears);
        
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
                // console.log(`Activity data is an empty array for department ${department} after loading.`); // Optional: less severe log
            }
            return [];
        }
        
        let currentData = [...activityData]; // Create a copy to avoid mutation
        
        // Filter by department - log all unique departments for debugging
        console.log('All unique departments:', [...new Set(currentData.map(d => d.department))]);
        currentData = currentData.filter(d => d.department === department);
        console.log('After department filter:', currentData);
        
        // Filter by selected years
        if (selectedYears.length > 0) {
            currentData = currentData.filter(d => selectedYears.includes(d.year));
        }
        console.log(`Filtered data for ${department} (final):`, currentData); // Moved to show final data
        return currentData;
    }, [activityData, selectedYears, isLoadingData]);

    const filteredPSCData = useMemo(() => {
        const result = getFilteredData('PSC');
        console.log('Filtered PSC data:', result);
        return result;
    }, [getFilteredData, activityData, selectedYears, isLoadingData]);
    
    const filteredLUData = useMemo(() => {
        const result = getFilteredData('LU');
        console.log('Filtered LU data:', result);
        return result;
    }, [getFilteredData, activityData, selectedYears]);
    
    const filteredPLNCheckData = useMemo(() => {
        const result = getFilteredData('PLN Check');
        console.log('Filtered PLN Check data:', result);
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
        <div className="dept-activity-dashboard" id='dept-activity-dashboard'>
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
                            { type: 'PSC', label: 'PSC Activity', icon: FaBuilding },
                            { type: 'LU', label: 'LU Activity', icon: FaLandmark },
                            { type: 'PLN Check', label: 'PLN Check Activity', icon: FaClipboardCheck }
                        ].map(({ type, label, icon: Icon }) => (
                            <li key={type} className="relative group">
                                <button
                                    className={`inline-flex items-center px-3 py-2 rounded-lg w-full ${activeActivityType === type ? 'text-white bg-blue-700 dark:bg-blue-600' : 'hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white'}`}
                                    onClick={() => {
                                        setActiveActivityType(type);
                                        navigate(`/deptactivity/${type}`);
                                    }}
                                >
                                    <Icon className={`w-4 h-4 ${isTabsCollapsed ? 'mx-auto' : 'me-2'} ${activeActivityType === type ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
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
                            </li>
                        )}
                    </ul>
                </div>

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
