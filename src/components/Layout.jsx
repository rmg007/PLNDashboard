import { Suspense, useEffect, useState, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useLayout } from '../contexts/LayoutContext';
import { useTheme, useIsDark } from '../contexts/ThemeContext';
import { useFilter } from '../contexts/FilterContext';
import { useId } from 'react';
import LayoutSkeleton from './Common/LayoutSkeleton';
import { FiSun, FiMoon, FiMenu, FiPieChart, FiFilter } from 'react-icons/fi';
import FilterPanel from './Filters/FilterPanel';
import { FaChevronDown } from 'react-icons/fa';
import { FaListCheck } from 'react-icons/fa6';
import { ImCalendar } from 'react-icons/im';
import { TbCalendarMonthFilled, TbLicense } from 'react-icons/tb';
import { MdOutlinePolicy } from 'react-icons/md';

export default function Layout() {
  const { title } = useLayout();
  const location = useLocation();
  const navId = useId();
  const { theme, setTheme } = useTheme();
  const isDark = useIsDark();
  const { isFilterVisible, setIsFilterVisible } = useFilter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const menuRefs = useRef({});
  const filterPanelRef = useRef(null);
  
  // Generate unique IDs for navigation items
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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleFilterPanel = () => {
    setIsFilterVisible(prev => !prev);
  };

  // Close mobile menu and submenus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenSubmenus({});
  }, [location]);

  // Close submenus and filter panel when clicking outside
  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Title */}
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav 
              className="hidden md:flex items-center space-x-1" 
              aria-label="Main navigation"
              id={`${navId}-desktop-nav`}
            >
              {navItems.map((item) => {
                // For items with submenu
                if (item.hasSubmenu) {
                  const isActive = item.submenuItems.some(sub => location.pathname.startsWith(sub.to.substring(0, sub.to.lastIndexOf('/'))));
                  return (
                    <div key={item.id} className="relative" ref={el => menuRefs.current[item.id] = el}>
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
                          className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby={item.id}
                        >
                          <div className="py-1" role="none">
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
                onClick={toggleFilterPanel}
                data-filter-toggle
                aria-label="Toggle filter panel"
                aria-expanded={isFilterVisible}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
              >
                <FiFilter className={`w-5 h-5 ${isFilterVisible ? 'text-blue-500 dark:text-blue-400' : ''}`} />
              </button>
              
              <button
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
      {/* Filter Panel */}
      {isFilterVisible && (
        <div 
          ref={filterPanelRef}
          className="fixed right-0 top-16 h-full w-72 bg-white dark:bg-gray-800 shadow-lg z-20 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 overflow-y-auto"
          aria-labelledby="filter-panel-title"
        >
          <FilterPanel />
        </div>
      )}
      
      <main 
        id="main-content" 
        className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
        aria-labelledby="page-title"
      >
        <h2 id="page-title" className="sr-only">{title}</h2>
        <Suspense fallback={<LayoutSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} {title}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
