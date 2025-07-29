import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente CustomDropdown - Reemplaza los selects nativos con un diseño personalizado
 */
const CustomDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = "Seleccionar...",
  className = "",
  disabled = false,
  showIcon = false,
  iconComponent = null,
  optionTextSize = "text-sm"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F] focus:border-transparent transition-all bg-white text-left justify-between items-center ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'
        } ${className.includes('h-[') ? className : ''}`}
      >
        <span className={`truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-900'} ${showIcon ? 'flex items-center gap-2' : ''}`}>
          {showIcon && iconComponent && (
            <span className="flex-shrink-0">
              {iconComponent}
            </span>
          )}
          {displayText}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menú desplegable */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="overflow-y-auto max-h-60 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            {options.map((option) => (
              <div
                key={option.value}
                className={`py-2.5 px-4 ${optionTextSize} text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ease-in-out border-b border-gray-50 last:border-b-0`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

CustomDropdown.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  placeholder: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  showIcon: PropTypes.bool,
  iconComponent: PropTypes.node,
  optionTextSize: PropTypes.string
};

export default CustomDropdown; 