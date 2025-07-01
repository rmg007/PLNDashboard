// src/components/common/MultiSelectDropdown.jsx

import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Icons for dropdown toggle

/**
 * @file MultiSelectDropdown.jsx
 * @description A reusable and customizable multi-select dropdown component with checkboxes.
 * It allows users to select multiple options from a list and provides feedback on the number of selected items.
 */

/**
 * Renders a multi-select dropdown with checkboxes for each option.
 *
 * @param {object} props - The component props.
 * @param {string} props.label - The base label for the dropdown button.
 * @param {Array<{label: string, value: any}>} props.options - The list of options to display in the dropdown.
 * @param {Array<any>} props.selectedValues - An array of the values of the currently selected options.
 * @param {function(any, boolean): void} props.onChange - A callback function that is fired when a checkbox is changed. It receives the option's value and its new checked state.
 * @param {string} [props.buttonClasses=''] - Optional additional CSS classes for the dropdown button.
 * @param {string} [props.dropdownClasses=''] - Optional additional CSS classes for the dropdown panel.
 * @returns {React.Component} A multi-select dropdown component.
 */
export default function MultiSelectDropdown({
  id = 'multi-select-dropdown',
  label,
  options,
  selectedValues,
  onChange,
  buttonClasses = '',
  dropdownClasses = '',
}) {
    // State to manage the visibility of the dropdown panel.
  const [isOpen, setIsOpen] = useState(false);

  // Refs to the dropdown panel and the toggle button.
  // These are used to detect clicks outside the component to close the dropdown.
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

    // This effect adds a global event listener to handle clicks outside of the dropdown.
  // When a click occurs outside the component, the dropdown is closed.
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

    /**
   * Handles the change event for each checkbox in the dropdown.
   * It calls the `onChange` prop passed from the parent component.
   * @param {*} optionValue - The value of the option that was changed.
   * @param {boolean} isChecked - The new checked state of the checkbox.
   */
  const handleCheckboxChange = (optionValue, isChecked) => {
    onChange(optionValue, isChecked);
  };

    /**
   * Determines the text to display on the dropdown button based on the current selection.
   * This provides useful feedback to the user about the state of their selection.
   * @returns {string} The text to be displayed on the button.
   */
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
        // The main container for the dropdown component.
    // `relative` positioning is essential for placing the dropdown panel correctly.
    <div className="relative inline-block w-full text-left">
      <div>
                {/* The button that toggles the dropdown's visibility. */}
        <button
          ref={buttonRef}
          type="button"
          className={`inline-flex justify-between items-center w-full px-3 py-2 text-sm font-medium border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-blue-500 ${buttonClasses}`}
          id={id}
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

            {/* The dropdown panel, which is rendered conditionally based on the `isOpen` state. */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-30 max-h-60 overflow-y-auto
            dark:bg-gray-800 dark:ring-gray-700 ${dropdownClasses}`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={id}
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
