// src/components/ChartTableComponent/MoreMenu.jsx

import React, { useState, useRef, useEffect } from 'react';
import { FiBarChart, FiMoreHorizontal } from 'react-icons/fi';
import { RiLineChartLine } from 'react-icons/ri';
import { TbTableDown, TbTableOff } from 'react-icons/tb';
import { GoDownload } from 'react-icons/go';
import { GrTable } from 'react-icons/gr';

export default function MoreMenu({ 
  id = 'more-menu',
  chartType, 
  setChartType, 
  onExportCsv, 
  onExportPng, 
  showChartTypeSwitcher = true, 
  tableVisible = true, 
  onToggleTable, 
  showTableToggle = true 
}) {
  // State for managing menu visibility
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Handle closing menu when clicking outside
  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) && 
        buttonRef.current && 
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    // Handle escape key press
    function handleEscapeKey(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  // Handle menu item keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;
    
    const menuItems = menuRef.current.querySelectorAll('button');
    const currentIndex = Array.from(menuItems).findIndex(item => item === document.activeElement);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < menuItems.length - 1) {
          menuItems[currentIndex + 1].focus();
        } else {
          menuItems[0].focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          menuItems[currentIndex - 1].focus();
        } else {
          menuItems[menuItems.length - 1].focus();
        }
        break;
      case 'Enter':
      case ' ':
        if (document.activeElement !== buttonRef.current) {
          e.preventDefault();
          document.activeElement.click();
        }
        break;
      default:
        break;
    }
  };

  // Focus first menu item when menu opens
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstButton = menuRef.current.querySelector('button');
      if (firstButton) {
        setTimeout(() => {
          firstButton.focus();
        }, 10);
      }
    }
  }, [isOpen]);

  return (
    <div id='more-menu-container' className="absolute top-0 left-0 z-10">
      {/* More Menu Button */}
      <button
        id={id}
        ref={buttonRef}
        aria-label="More actions"
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="p-1.5 rounded-tl-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
      >
        <FiMoreHorizontal className="text-lg" aria-hidden="true" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          ref={menuRef}
          className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={id}
        >
          <div className="py-1" role="none">
            {/* Chart Type Options - only shown if showChartTypeSwitcher is true */}
            {showChartTypeSwitcher && (
              <>
                <button
                  className={`flex items-center px-4 py-2 text-sm w-full text-left ${chartType === 'bar' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                  role="menuitem"
                  onClick={() => { setChartType('bar'); setIsOpen(false); }}
                >
                  <FiBarChart className="mr-3 text-lg" aria-hidden="true" />
                  Bar Chart
                </button>
                <button
                  className={`flex items-center px-4 py-2 text-sm w-full text-left ${chartType === 'line' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                  role="menuitem"
                  onClick={() => { setChartType('line'); setIsOpen(false); }}
                >
                  <RiLineChartLine className="mr-3 text-lg" aria-hidden="true" />
                  Line Chart
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-600" />
              </>
            )}
            
            {/* Table Toggle - only shown if showTableToggle is true */}
            {showTableToggle && (
              <>
                <button
                  className="flex items-center px-4 py-2 text-sm w-full text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                  onClick={() => { onToggleTable(); setIsOpen(false); }}
                >
                  {tableVisible ? (
                    <>
                      <TbTableOff className="mr-3 text-lg" aria-hidden="true" />
                      Hide Table
                    </>
                  ) : (
                    <>
                      <GrTable className="mr-3 text-lg" aria-hidden="true" />
                      Show Table
                    </>
                  )}
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-600" />
              </>
            )}
            
            {/* Export Options */}
            <button
              className="flex items-center px-4 py-2 text-sm w-full text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              onClick={() => { onExportCsv(); setIsOpen(false); }}
            >
              <TbTableDown className="mr-3 text-lg" aria-hidden="true" />
              Export XLSX
            </button>
            <button
              className="flex items-center px-4 py-2 text-sm w-full text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
              onClick={() => { onExportPng(); setIsOpen(false); }}
            >
              <GoDownload className="mr-3 text-lg" aria-hidden="true" />
              Export PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
