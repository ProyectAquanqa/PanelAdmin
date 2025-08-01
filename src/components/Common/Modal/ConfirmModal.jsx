/**
 * Componente ConfirmModal para confirmaciones
 * Extiende el Modal base con funcionalidad específica de confirmación
 */

import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';

/**
 * Modal de confirmación con botones de acción
 * @param {Object} props - Props del componente
 * @returns {JSX.Element} Componente modal de confirmación
 */
const ConfirmModal = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message = '¿Estás seguro de que deseas continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700 text-white',
  cancelButtonClass = 'bg-gray-300 hover:bg-gray-400 text-gray-700',
  isLoading = false,
  type = 'danger', // 'danger', 'warning', 'info', 'success'
  icon = null,
  children
}) => {
  // Manejar confirmación
  const handleConfirm = () => {
    onConfirm?.();
  };

  // Iconos por tipo
  const getIcon = () => {
    if (icon) return icon;
    
    const iconClasses = "w-6 h-6 mx-auto mb-4";
    
    switch (type) {
      case 'danger':
        return (
          <div className="text-red-600">
            <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="text-yellow-600">
            <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="text-blue-600">
            <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="text-green-600">
            <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  // Clases de botón por tipo
  const getConfirmButtonClass = () => {
    if (confirmButtonClass !== 'bg-red-600 hover:bg-red-700 text-white') {
      return confirmButtonClass;
    }
    
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="text-center">
        {/* Icono */}
        {getIcon()}
        
        {/* Mensaje */}
        <div className="mb-6">
          <p className="text-gray-700 text-sm leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Contenido adicional */}
        {children && (
          <div className="mb-6">
            {children}
          </div>
        )}
        
        {/* Botones */}
        <div className="flex space-x-3 justify-center">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              ${cancelButtonClass}
            `}
          >
            {cancelText}
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              ${getConfirmButtonClass()}
            `}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Procesando...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmButtonClass: PropTypes.string,
  cancelButtonClass: PropTypes.string,
  isLoading: PropTypes.bool,
  type: PropTypes.oneOf(['danger', 'warning', 'info', 'success']),
  icon: PropTypes.node,
  children: PropTypes.node
};

export default React.memo(ConfirmModal);