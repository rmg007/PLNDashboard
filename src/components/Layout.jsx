import { Suspense, useEffect, useState, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useLayout } from '../contexts/LayoutContext';
import { useTheme, useIsDark } from '../contexts/ThemeContext';
import { useFilter } from '../contexts/FilterContext';
import { useId } from 'react';
import LayoutSkeleton from './common/LayoutSkeleton';
import { FiSun, FiMoon, FiMenu, FiPieChart, FiFilter } from 'react-icons/fi';
import FilterPanel from './Filters/FilterPanel';
import { FaChevronDown } from 'react-icons/fa';
import { FaListCheck } from 'react-icons/fa6';
import { ImCalendar } from 'react-icons/im';
import { TbCalendarMonthFilled, TbLicense } from 'react-icons/tb';
import { MdOutlinePolicy } from 'react-icons/md';

/**
 * @file Layout.jsx
 * @description The main layout component for the application.
 * It includes the header, navigation (both desktop and mobile),
 * a theme switcher, a filter panel toggle, and the main content area where
 * routed pages are rendered via `<Outlet />`.
 * It uses contexts for layout properties, theme, and filter visibility.
 */

/**
 * Renders the main application layout.
 * This component orchestrates the primary UI structure including the header, navigation, main content, and footer.
 * @returns {React.Component} The main layout structure of the application.
 */
export default function Layout() {
    // SECTION: Hooks and Contexts
  // ---------------------------
  // Consuming contexts to get global state and functionality.
  const { title } = useLayout(); // For setting the page title.
  const location = useLocation(); // From React Router, to track the current URL.
  const navId = useId(); // Generates unique IDs for accessible navigation elements.
  const { theme, setTheme } = useTheme(); // For getting and setting the current theme (dark/light).
  const isDark = useIsDark(); // A boolean hook to easily check if the dark theme is active.
  const { isFilterVisible, setIsFilterVisible } = useFilter(); // Manages the visibility of the filter panel.

  // SECTION: State Management
  // ---------------------------
  // Internal state for managing UI elements like mobile menus and submenus.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Toggles the mobile navigation menu.
  const [openSubmenus, setOpenSubmenus] = useState({}); // Tracks which dropdown submenus are open.

  // SECTION: Refs
  // ---------------------------
  // Refs for direct DOM access, primarily for handling clicks outside of elements.
  const menuRefs = useRef({}); // Holds refs to submenu containers to detect outside clicks.
  const filterPanelRef = useRef(null); // Ref for the filter panel to detect outside clicks.
  
    // SECTION: Navigation Configuration
  // ---------------------------------
  // Defines the structure of the navigation menu, including items and submenus.
  // Using a configuration object like this makes the navigation easy to manage and update.
  const navItems = [
    { to: '/', label: 'Home', id: `${navId}-home` },
    { 
      label: 'Permits Analysis', 
      id: `${navId}-permits`, 
      title: 'Unique Permits Analysis',
      hasSubmenu: true,
      submenuItems: [
        { to: '/uniquepermits/annual', label: 'Annual Analysis', id: `${navId}-permits-annual`, icon: ImCalendar },
        { to: '/uniquepermits/quarterly', label: 'Quarterly Analysis', id: `${navId}-permits-quarterly`, icon: FiPieChart },
        { to: '/uniquepermits/monthly', label: 'Monthly Analysis', id: `${navId}-permits-monthly`, icon: TbCalendarMonthFilled }
      ]
    },
    {
      to: '/deptactivity',
      label: 'Dept Activity',
      id: `${navId}-dept-activity`,
      title: 'Department Activity Analysis',
      hasSubmenu: true,
      submenuItems: [
        { to: '/deptactivity/PSC', label: 'PSC Activity', id: `${navId}-dept-psc`, icon: TbLicense },
        { to: '/deptactivity/LU', label: 'LU Activity', id: `${navId}-dept-lu`, icon: MdOutlinePolicy },
        { to: '/deptactivity/PLN Check', label: 'PLN Check Activity', id: `${navId}-dept-pln`, icon: FaListCheck }
      ]
    }
  ];

    // SECTION: Event Handlers
  // -------------------------

  /**
   * Toggles the application theme between 'light' and 'dark'.
   */
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

    /**
   * Toggles the visibility of the filter panel.
   */
  const toggleFilterPanel = () => {
    setIsFilterVisible(prev => !prev);
  };

    // SECTION: Side Effects (useEffect)
  // ---------------------------------

  // This effect closes the mobile menu and any open submenus whenever the user navigates to a new page.
  // This provides a better user experience on mobile devices.
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenSubmenus({});
  }, [location]);

    // This effect adds a global click listener to handle closing menus and panels when the user clicks outside of them.
  // This is a common pattern for dropdowns and off-canvas panels.
  useEffect(() => {
        /**
     * Handles clicks outside of specified elements (submenus, filter panel) to close them.
     * @param {MouseEvent} event - The mouse down event.
     */
    function handleClickOutside(event) {
      // Close submenus when clicking outside
      Object.keys(menuRefs.current).forEach(key => {
        if (menuRefs.current[key] && !menuRefs.current[key].contains(event.target)) {
          setOpenSubmenus(prev => ({ ...prev, [key]: false }));
        }
      });
      
      // Close filter panel when clicking outside
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target) && 
          !event.target.closest('[data-filter-toggle]')) {
        setIsFilterVisible(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

    // SECTION: Component Rendering (JSX)
  // ----------------------------------
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {/* Application Header: Contains the logo, main navigation, and action buttons. It's sticky to the top. */}
      <header id="app-header" className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Title */}
            <div className="flex-shrink-0 flex items-center">
              <h1 id="app-title" className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav 
              id="desktop-nav"
              className="hidden md:flex items-center space-x-1" 
              aria-label="Main navigation"
            >
              {navItems.map((item) => {
                // For items with submenu
                if (item.hasSubmenu) {
                  const isActive = item.submenuItems.some(sub => location.pathname.startsWith(sub.to.substring(0, sub.to.lastIndexOf('/'))));
                  return (
                    <div key={item.id} className="relative z-50" ref={el => menuRefs.current[item.id] = el}>
                      <button
                        id={item.id}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                          isActive 
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-semibold' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setOpenSubmenus(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                        aria-expanded={openSubmenus[item.id]}
                        aria-haspopup="true"
                        title={item.title}
                      >
                        {item.label}
                        <FaChevronDown className={`ml-1 w-3 h-3 transition-transform ${openSubmenus[item.id] ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {openSubmenus[item.id] && (
                        <div 
                          id={`submenu-${item.id}`}
                          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby={item.id}
                        >
                          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby={item.id}>
                            {item.submenuItems.map((subItem) => (
                              <NavLink
                                key={subItem.id}
                                id={subItem.id}
                                to={subItem.to}
                                className={({ isActive }) =>
                                  `flex items-center px-4 py-2 text-sm transition-colors ${
                                    isActive 
                                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-semibold' 
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                  }`
                                }
                                role="menuitem"
                              >
                                <subItem.icon className="w-4 h-4 mr-3" />
                                {subItem.label}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                
                // For regular items without submenu
                return (
                  <NavLink
                    key={item.id}
                    id={item.id}
                    to={item.to}
                    end={item.to === '/'}
                    title={item.title}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-semibold' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`
                    }
                    aria-current={location.pathname === item.to ? 'page' : undefined}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* Theme Toggle and Mobile Menu Button */}
            <div className="flex items-center space-x-2">
              <button
                id="filter-toggle-button"
                onClick={toggleFilterPanel}
                data-filter-toggle
                aria-label="Toggle filter panel"
                aria-expanded={isFilterVisible}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
              >
                <FiFilter className={`w-5 h-5 ${isFilterVisible ? 'text-blue-500 dark:text-blue-400' : ''}`} />
              </button>
              
              <button
                id="theme-toggle-button"
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
              >
                {isDark ? (
                  <FiSun className="w-5 h-5" />
                ) : (
                  <FiMoon className="w-5 h-5" />
                )}
              </button>

              <button
                id="mobile-menu-button"
                type="button"
                className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-expanded="false"
                aria-controls="mobile-menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <FiMenu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900">
              {navItems.map((item) => {
                // For items with submenu in mobile view
                if (item.hasSubmenu) {
                  return (
                    <div key={`mobile-${item.id}`} className="space-y-1">
                      <button
                        id={`mobile-${item.id}`}
                        className={`flex justify-between items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                          item.submenuItems.some(sub => location.pathname.startsWith(sub.to.substring(0, sub.to.lastIndexOf('/'))))
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setOpenSubmenus(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                        aria-expanded={openSubmenus[item.id]}
                        title={item.title}
                      >
                        {item.label}
                        <FaChevronDown className={`ml-1 w-3 h-3 transition-transform ${openSubmenus[item.id] ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {openSubmenus[item.id] && (
                        <div className="pl-4 space-y-1">
                          {item.submenuItems.map((subItem) => (
                            <NavLink
                              key={`mobile-${subItem.id}`}
                              id={`mobile-${subItem.id}`}
                              to={subItem.to}
                              className={({ isActive }) =>
                                `flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive 
                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`
                              }
                            >
                              <subItem.icon className="w-4 h-4 mr-3" />
                              {subItem.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                
                // For regular items without submenu
                return (
                  <NavLink
                    key={`mobile-${item.id}`}
                    id={`mobile-${item.id}`}
                    to={item.to}
                    end={item.to === '/'}
                    title={item.title}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium ${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`
                    }
                    aria-current={location.pathname === item.to ? 'page' : undefined}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </header>
            {/* Filter Panel: A slide-out panel for applying data filters. Its visibility is controlled by `isFilterVisible` state. */}
      {isFilterVisible && (
        <div 
          id="filter-panel"
          ref={filterPanelRef}
          className="fixed right-0 top-16 h-full w-72 bg-white dark:bg-gray-800 shadow-lg z-20 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 overflow-y-auto"
          aria-labelledby="filter-panel-title"
        >
          <FilterPanel />
        </div>
      )}
      
            {/* Main Content Area: This is where the content for each page is rendered via the `<Outlet />` component from React Router. */}
      <main 
        id="main-content" 
        className="flex-1 px-2 py-6 sm:px-4 lg:px-6 max-w-screen-2xl mx-auto w-full"
        aria-labelledby="page-title"
      >
        <h2 id="page-title" className="sr-only">{title}</h2>
        <Suspense fallback={<LayoutSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      
            {/* Application Footer: Contains copyright information. */}
      <footer id="app-footer" className="border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-screen-2xl mx-auto py-6 px-2 sm:px-4 lg:px-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {new Date().getFullYear()} {title}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
