import React, { useEffect, useRef } from 'react';

/**
 * @file IndeterminateCheckbox.jsx
 * @description A checkbox component that supports an 'indeterminate' state, commonly used in 'select all' table headers.
 * The indeterminate state is set programmatically via a ref.
 */

/**
 * Renders a checkbox that can be in a checked, unchecked, or indeterminate state.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.indeterminate - If true, the checkbox will be in an indeterminate state.
 * @param {string} [props.className=''] - Additional CSS classes to apply to the input element.
 * @param {object} rest - Any other props to be passed to the underlying HTML input element (e.g., `checked`, `onChange`).
 * @returns {React.Component} An HTML input element of type 'checkbox'.
 */
export default function IndeterminateCheckbox({ indeterminate, className = '', ...rest }) {
    // A ref is used to get direct access to the DOM node of the input element.
  // This is necessary because the `indeterminate` property is not a standard React prop
  // and must be set imperatively on the DOM element itself.
  const ref = useRef(null);

    // This effect synchronizes the `indeterminate` prop with the DOM element's property.
  // It runs whenever the `indeterminate` or `checked` state changes.
  useEffect(() => {
        // The `indeterminate` property on the checkbox element is a boolean.
    // It's set to true only if the `indeterminate` prop is true AND the checkbox is not explicitly checked.
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={`${className} cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600`}
      {...rest}
    />
  );
}
