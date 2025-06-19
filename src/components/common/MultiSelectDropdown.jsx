// src/components/common/MultiSelectDropdown.jsx

import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Icons for dropdown toggle

/**
 * A customizable multi-select dropdown component with checkboxes.
 *
 * @param {object} props - Component props.
 * @param {string} props.label - The label displayed on the dropdown button.
 * @param {Array<Object>} props.options - An array of objects: [{ label: 'Option Text', value: 'optionValue' }].
 * @param {Array<any>} props.selectedValues - An array of the currently selected values.
 * @param {function(any, boolean): void} props.onChange - Callback function: (value, isChecked) => void.
 * @param {string} [props.buttonClasses=''] - Additional Tailwind CSS classes for the dropdown button.
 * @param {string} [props.dropdownClasses=''] - Additional Tailwind CSS classes for the dropdown menu.
 */
export default function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  buttonClasses = '',
  dropdownClasses = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCheckboxChange = (optionValue, isChecked) => {
    onChange(optionValue, isChecked);
  };

  // Determine button text based on selection
  const getButtonText = () => {
    if (!selectedValues || selectedValues.length === 0) {
      return `${label}: All`;
    }
    if (selectedValues.length === options.length) {
      return `${label}: All (${options.length})`;
    }
    if (selectedValues.length === 1) {
      const selectedOption = options.find(opt => opt.value === selectedValues[0]);
      return `${label}: ${selectedOption ? selectedOption.label : '1 Selected'}`;
    }
    return `${label}: ${selectedValues.length} Selected`;
  };

  return (
    <div className="relative inline-block w-full text-left">
      <div>
        <button
          ref={buttonRef}
          type="button"
          className={`inline-flex justify-between items-center w-full px-3 py-2 text-sm font-medium border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-blue-500 ${buttonClasses}`}
          id="multi-select-menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          {getButtonText()}
          {isOpen ? (
            <FaChevronUp className="-mr-1 ml-2 h-3 w-3" aria-hidden="true" />
          ) : (
            <FaChevronDown className="-mr-1 ml-2 h-3 w-3" aria-hidden="true" />
          )}
        </button>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-30 max-h-60 overflow-y-auto
            dark:bg-gray-800 dark:ring-gray-700 ${dropdownClasses}`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="multi-select-menu-button"
        >
          <div className="py-1" role="none">
            {options.map(option => (
              <label
                key={option.value}
                htmlFor={`checkbox-${option.value}`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                role="menuitem"
              >
                <input
                  id={`checkbox-${option.value}`}
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-blue-600"
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
                />
                <span className="ml-2">{option.label}</span>
              </label>
            ))}
            {options.length === 0 && (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No options available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
