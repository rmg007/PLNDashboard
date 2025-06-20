import React, { useEffect, useState } from 'react';
import { useLayout } from '../contexts/LayoutContext';
import { RiLoader5Fill } from 'react-icons/ri';
import { useParams, useNavigate } from 'react-router-dom';
import { useFilter } from '../contexts/FilterContext';

import PSCActivityReport from '../components/DeptActivity/PSCActivityReport';
import LUActivityReport from '../components/DeptActivity/LUActivityReport';
import PLNCheckActivityReport from '../components/DeptActivity/PLNCheckActivityReport';

export default function DeptActivity() {
    const { setTitle } = useLayout();
    const { deptType } = useParams();
    const navigate = useNavigate();
    const { 
        isLoadingDeptData: isLoadingData, 
        filteredPSCData,
        filteredLUData,
        filteredPLNCheckData
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
            <div className="flex justify-center items-center h-64">
                <RiLoader5Fill className="animate-spin text-blue-600 w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="h-full">
            {globalError && <div className="text-red-500 text-center p-4">{globalError}</div>}

            <div className="w-full">
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
