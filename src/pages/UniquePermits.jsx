import React, { useEffect, useMemo, useId } from 'react';
import { useLayout } from '../contexts/LayoutContext';
import { RiLoader5Fill } from 'react-icons/ri';
import { FaCalendarAlt, FaChartLine, FaChartBar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { updateTitle } from '../utils/titleManager';
import { useParams, useNavigate } from 'react-router-dom';
import { useFilter } from '../contexts/FilterContext';

import AnnualUniquePermitsReport from '../components/UniquePermitAnalysis/AnnualUniquePermitsReport';
import QuarterlyUniquePermitsReport from '../components/UniquePermitAnalysis/QuarterlyUniquePermitsReport';
import MonthlyUniquePermitsReport from '../components/UniquePermitAnalysis/MonthlyUniquePermitsReport';

export default function UniquePermits() {
  const componentId = useId();
  const ids = {
    mainContainer: `unique-permits-page-${componentId}`,
    contentContainer: `unique-permits-content-${componentId}`,
    loadingIndicator: `unique-permits-loading-${componentId}`,
  };
  const { setTitle } = useLayout();
  const { reportType } = useParams();
  const navigate = useNavigate();

  const {
    // Filter state from context
    selectedPermitYears,
    selectedQuarters,
    selectedMonths,
    isLoadingPermitData,
    filteredYearlyData,
    filteredQuarterlyData,
    filteredMonthlyData,
  } = useFilter();

  const activeAnalysisType = reportType || 'annual';

  // Sync state with URL
  useEffect(() => {
    const validReportType = reportType && ['annual', 'quarterly', 'monthly'].includes(reportType) ? reportType : 'annual';
    
    if (activeAnalysisType !== validReportType) {
      navigate(`/uniquepermits/${validReportType}`, { replace: true });
    }
  }, [reportType, activeAnalysisType, navigate]);

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

  return (
    <div id={ids.mainContainer} className="h-full">
      {/* Main Content */}
      <div id={ids.contentContainer} className="w-full">
        {isLoadingPermitData ? (
          <div id={ids.loadingIndicator} className="flex flex-col items-center justify-center h-full min-h-[600px]">
            <RiLoader5Fill className="animate-spin text-blue-500 w-12 h-12 mb-4" />
            <p className="text-lg text-gray-700 dark:text-gray-300">Loading data...</p>
          </div>
        ) : (
          <>
            {activeAnalysisType === 'annual' && (
              <AnnualUniquePermitsReport
                data={filteredYearlyData}
                isLoading={isLoadingPermitData}
                selectedItemsCount={selectedPermitYears.length}
              />
            )}
            {activeAnalysisType === 'quarterly' && (
              <QuarterlyUniquePermitsReport
                data={filteredQuarterlyData}
                isLoading={isLoadingPermitData}
              />
            )}
            {activeAnalysisType === 'monthly' && (
              <MonthlyUniquePermitsReport
                data={filteredMonthlyData}
                isLoading={isLoadingPermitData}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
