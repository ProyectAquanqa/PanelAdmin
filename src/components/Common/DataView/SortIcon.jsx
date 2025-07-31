/**
 * Componente de ícono de ordenamiento para tablas
 * Muestra el estado de ordenamiento de una columna
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente SortIcon
 * @param {Object} props - Props del componente
 * @returns {JSX.Element} Componente de ícono de ordenamiento
 */
const SortIcon = ({ field, currentField = null, direction = null }) => {
  // Si no es el campo actual o no hay dirección, mostrar ícono neutral
  if (field !== currentField || !direction) {
    return (
      <svg 
        className="w-3 h-3 ml-1 text-gray-400 opacity-50" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" 
        />
      </svg>
    );
  }
  
  // Mostrar ícono activo con dirección
  return (
    <svg 
      className={`w-3 h-3 ml-1 text-[#2D728F] transition-transform ${
        direction === 'asc' ? 'rotate-180' : ''
      }`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19 9l-7 7-7-7" 
      />
    </svg>
  );
};

SortIcon.propTypes = {
  field: PropTypes.string.isRequired,
  currentField: PropTypes.string,
  direction: PropTypes.oneOf(['asc', 'desc', null]),
};

export default React.memo(SortIcon);