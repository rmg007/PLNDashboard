import React, { useEffect, useState, useId } from 'react';
import { useLayout } from '../contexts/LayoutContext';
import { RiLoader5Fill } from 'react-icons/ri';
import { useParams, useNavigate } from 'react-router-dom';
import { useFilter } from '../contexts/FilterContext';

import PSCActivityReport from '../components/DeptActivity/PSCActivityReport';
import LUActivityReport from '../components/DeptActivity/LUActivityReport';
import PLNCheckActivityReport from '../components/DeptActivity/PLNCheckActivityReport';

export default function DeptActivity() {
    const componentId = useId();
    const ids = {
        mainContainer: `dept-activity-container-${componentId}`,
        loadingIndicator: `dept-activity-loading-${componentId}`,
        globalError: `dept-activity-error-${componentId}`,
        mainContent: `dept-activity-content-${componentId}`,
    };
    const { setTitle } = useLayout();
    const { deptType } = useParams();
    const navigate = useNavigate();
    const { 
        isLoadingDeptData: isLoadingData, 
        filteredPSCData,
        filteredLUData,
        filteredPLNCheckData,
        filteredPSCWeekdayData,
        filteredLUWeekdayData,
        filteredPLNCheckWeekdayData
    } = useFilter();
    
    const [globalError, setGlobalError] = useState(null);
    const [activeActivityType, setActiveActivityType] = useState(deptType || 'PSC');

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

    if (isLoadingData) {
        return (
            <div id={ids.loadingIndicator} className="flex justify-center items-center h-64">
                <RiLoader5Fill className="animate-spin text-blue-600 w-12 h-12" />
            </div>
        );
    }

    return (
        <div id={ids.mainContainer} className="h-full">
            {globalError && <div id={ids.globalError} className="text-red-500 text-center p-4">{globalError}</div>}

            <div className="w-full">
                {/* Main Content */}
                <div id={ids.mainContent} className="flex-1 min-w-0">
                    {activeActivityType === 'PSC' && (
                        <PSCActivityReport isLoading={isLoadingData} />
                    )}
                    {activeActivityType === 'LU' && (
                        <LUActivityReport isLoading={isLoadingData} />
                    )}
                    {activeActivityType === 'PLN Check' && (
                        <PLNCheckActivityReport isLoading={isLoadingData} />
                    )}
                </div>
            </div>
        </div>
    );
}
