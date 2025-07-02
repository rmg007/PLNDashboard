import { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import PageSkeleton from './components/common/PageSkeleton';
import ErrorBoundary from './components/common/ErrorBoundary';
import { FilterProvider } from './contexts/FilterContext';

// Lazy load heavy components
const Home = lazy(() => import('./pages/Home.jsx'));
const UniquePermits = lazy(() => import('./pages/UniquePermits.jsx'));
const DeptActivity = lazy(() => import('./pages/DeptActivity.jsx'));

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <FilterProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
              <Route 
                index 
                element={
                  <ErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <Home />
                    </Suspense>
                  </ErrorBoundary>
                } 
              />
              
              {/* Unique Permits Routes */}
              <Route 
                path="uniquepermits" 
                element={
                  <ErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <UniquePermits />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
              <Route 
                path="uniquepermits/:reportType" 
                element={
                  <ErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <UniquePermits />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
              
              {/* Department Activity Routes */}
              <Route 
                path="deptactivity" 
                element={
                  <ErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <DeptActivity />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
            <Route 
              path="deptactivity/:deptType" 
              element={
                <ErrorBoundary>
                  <Suspense fallback={<PageSkeleton />}>
                    <DeptActivity />
                  </Suspense>
                </ErrorBoundary>
              }
            />
              </Route>
            </Routes>
          </FilterProvider>
        </Suspense>
      </ErrorBoundary>
    </Router>
  )
}
