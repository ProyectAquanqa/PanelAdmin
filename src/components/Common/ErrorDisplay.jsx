import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar errores generales de la aplicación
 * Soporta diferentes tipos de errores con estilos apropiados
 */
const ErrorDisplay = ({ 
  error, 
  type = 'general', 
  dismissible = false, 
  onDismiss,
  className = '',
  showIcon = true 
}) => {
  // No mostrar nada si no hay error
  if (!error) {
    return null;
  }

  // Determinar el mensaje a mostrar
  const message = typeof error === 'string' ? error : error.message || 'Ha ocurrido un error';

  // Estilos según el tipo de error
  const getErrorStyles = () => {
    switch (type) {
      case 'api':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'network':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'form':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  // Icono según el tipo de error
  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div 
      className={`border rounded-md p-4 ${getErrorStyles()} ${className}`}
      role="alert"
      aria-live="assertive"
      data-testid={`error-display-${type}`}
    >
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            {getErrorIcon()}
          </div>
        )}
        <div className={`${showIcon ? 'ml-3' : ''} flex-1`}>
          <p className="text-sm font-medium">
            {message}
          </p>
          {error.details && (
            <p className="mt-1 text-sm opacity-75">
              {error.details}
            </p>
          )}
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex rounded-md p-1.5 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                onClick={onDismiss}
                aria-label="Cerrar mensaje de error"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ErrorDisplay.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      message: PropTypes.string,
      details: PropTypes.string,
      type: PropTypes.string
    })
  ]),
  type: PropTypes.oneOf(['general', 'api', 'network', 'form', 'warning']),
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  className: PropTypes.string,
  showIcon: PropTypes.bool
};

export default ErrorDisplay;