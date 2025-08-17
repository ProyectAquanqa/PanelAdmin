import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar mensajes de validación de formularios
 * Muestra errores específicos de campos con estilos consistentes
 */
const ValidationMessage = ({ error, field, className = '', show = true }) => {
  // No mostrar nada si no hay error o show es false
  if (!error || !show) {
    return null;
  }

  // Determinar el mensaje a mostrar
  const message = typeof error === 'string' ? error : error.message || 'Error de validación';

  return (
    <div 
      className={`text-red-600 text-sm mt-1 flex items-center ${className}`}
      role="alert"
      aria-live="polite"
      data-testid={`validation-message-${field || 'generic'}`}
    >
      <svg 
        className="w-4 h-4 mr-1 flex-shrink-0" 
        fill="currentColor" 
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path 
          fillRule="evenodd" 
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
          clipRule="evenodd" 
        />
      </svg>
      <span>{message}</span>
    </div>
  );
};

ValidationMessage.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      message: PropTypes.string,
      type: PropTypes.string,
      field: PropTypes.string
    })
  ]),
  field: PropTypes.string,
  className: PropTypes.string,
  show: PropTypes.bool
};

export default ValidationMessage;