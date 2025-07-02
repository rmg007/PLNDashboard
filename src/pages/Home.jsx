import { useEffect, useState, useId } from 'react';
import { useLayout } from '../contexts/LayoutContext';
import { usePersistedState } from '../hooks/usePersistedState';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonKPICard, SkeletonChart } from '../components/common/Skeleton';
import '../styles/dashboard.css';
import '../styles/dashboard-custom.css';
import DashboardSidebar from '../components/Dashboard/DashboardSidebar';
import DashboardMainContent from '../components/Dashboard/DashboardMainContent';
import { loadDashboardData } from '../services/dashboardDataService';

export default function Home() {
  const { setTitle } = useLayout();
  const componentId = useId();
  const [dashboardData, setDashboardData] = useState({
    kpiData: {},
    chartData: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isTabsCollapsed, setIsTabsCollapsed] = usePersistedState('dashboardTabsCollapsed', false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Generate unique IDs for main sections
  const sectionIds = {
    dashboardContainer: `dashboard-container-${componentId}`,
    loadingIndicator: `loading-indicator-${componentId}`,
    headerSection: `header-section-${componentId}`,
    lastUpdated: `last-updated-${componentId}`,
    mainContent: `main-content-${componentId}`,
    footer: `footer-${componentId}`,
    sidebarToggleButton: `sidebar-toggle-${componentId}`
  };

  useEffect(() => {
    setTitle('Planning & Development Economics Indicators');
    
    // Load dashboard data
    const fetchData = async () => {
      try {
        const data = await loadDashboardData();
        setDashboardData(data);
        setLastUpdated(new Date().toLocaleString());
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Small delay to show skeleton loaders for better perceived performance
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    
    return () => {
      clearTimeout(timer);
      setTitle('Planning & Development Economics Indicators');
    };
  }, [setTitle]);
  
  const toggleTabs = () => {
    setIsTabsCollapsed(!isTabsCollapsed);
  };

  // Skeleton loading state
  if (isLoading) {
    return (
      <div 
        className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6"
        role="main"
        id={sectionIds.mainContent}
      >
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Skeleton */}
          <div className="lg:w-1/4 space-y-6">
            <SkeletonCard>
              <Skeleton className="h-6 w-3/4 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <SkeletonKPICard key={i} />
                ))}
              </div>
            </SkeletonCard>
            
            <SkeletonCard>
              <Skeleton className="h-6 w-3/4 mb-4" />
              <div className="h-64">
                <Skeleton className="h-full w-full" />
              </div>
            </SkeletonCard>
            
            <SkeletonCard>
              <Skeleton className="h-6 w-3/4 mb-4" />
              <SkeletonText lines={4} />
            </SkeletonCard>
          </div>
          
          {/* Main Content Skeleton */}
          <div className="lg:w-3/4 space-y-6">
            <SkeletonChart />
            <SkeletonChart />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonChart />
              <SkeletonChart />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
      role="main"
      id={sectionIds.mainContent}
    >
      <div 
        className="w-full max-w-screen-2xl mx-auto px-4 py-6 dashboard-container" 
        id={sectionIds.dashboardContainer}
      >
        {/* Page Header Section */}
        <header 
          id={sectionIds.headerSection}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
        >
          <div className="flex items-center">
            <button
              id={sectionIds.sidebarToggleButton}
              onClick={toggleTabs}
              className="mr-3 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={isTabsCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg 
                className="w-6 h-6 text-gray-500 dark:text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isTabsCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>
            <div 
              className="bg-blue-500 w-1 h-8 mr-3 rounded-full"
              aria-hidden="true"
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard Overview
            </h1>
          </div>
          <div 
            id={sectionIds.lastUpdated}
            className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <title>Last Updated</title>
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <span>{lastUpdated ? `Last updated: ${lastUpdated}` : 'Loading...'}</span>
          </div>
        </header>
        
        {/* Two-Panel Layout - With height alignment */}
        <div 
          className="flex flex-col lg:flex-row gap-6 lg:items-stretch"
          role="region"
          aria-label="Dashboard Content"
        >
          {/* Sidebar (25% width on large screens) */}
          <aside 
            className="w-full lg:w-1/4 dashboard-sidebar"
            aria-label="Dashboard Sidebar"
          >
            <DashboardSidebar 
              kpiData={dashboardData.kpiData} 
              isCollapsed={isTabsCollapsed}
              onToggleCollapse={toggleTabs}
              componentId={componentId}
            />
          </aside>
          
          {/* Main Content (75% width on large screens) */}
          <div 
            className="w-full lg:w-3/4"
            role="region"
            aria-label="Main Dashboard Content"
          >
            <DashboardMainContent 
              chartData={dashboardData.chartData} 
              isSidebarCollapsed={isTabsCollapsed}
              componentId={componentId}
            />
          </div>
        </div>
        
        {/* Footer with attribution */}
        <footer 
          id={sectionIds.footer}
          className="mt-12 pt-4 border-t border-gray-200 dark:border-gray-700"
          role="contentinfo"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Planning & Development Economics Indicators Dashboard © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
