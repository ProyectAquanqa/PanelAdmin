import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../Common';
import { LoadingStates } from '.';

/**
 * Modal para crear y editar dispositivos
 * Incluye validaciones y manejo de errores
 */
const DeviceModal = ({
  isOpen,
  onClose,
  onSubmit,
  device = null,
  deviceTypes = [],
  users = [],
  loading = false,
  error = null
}) => {
  const isEditing = Boolean(device);
  
  // Estado del formulario - Adaptado al modelo DeviceToken real
  const [formData, setFormData] = useState({
    token: '',
    device_type: '',
    user_id: '',
    is_active: true
  });

  // Errores de validación
  const [validationErrors, setValidationErrors] = useState({});

  // Cargar datos del dispositivo si está editando
  useEffect(() => {
    if (device) {
      setFormData({
        token: device.token || '',
        device_type: device.device_type || '',
        user_id: device.user?.id?.toString() || '',
        is_active: device.is_active ?? true
      });
    } else {
      // Resetear formulario para nuevo dispositivo
      setFormData({
        token: '',
        device_type: '',
        user_id: '',
        is_active: true
      });
    }
    setValidationErrors({});
  }, [device, isOpen]);

  // Manejar cambios en el formulario
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error de validación al modificar el campo
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.token.trim()) {
      errors.token = 'El token del dispositivo es obligatorio';
    }

    if (!formData.device_type) {
      errors.device_type = 'El tipo de dispositivo es obligatorio';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Preparar datos para envío - Modelo DeviceToken
      const submitData = {
        token: formData.token,
        device_type: formData.device_type,
        is_active: formData.is_active
        // user se establece automáticamente en el backend
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Token de Dispositivo' : 'Registrar Token de Dispositivo'}
      size="lg"
    >
      <div className="space-y-6">
        {loading ? (
          <LoadingStates.ModalLoading />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error general */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Token del dispositivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token FCM del dispositivo *
              </label>
              <textarea
                value={formData.token}
                onChange={(e) => handleChange('token', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F]/30 ${
                  validationErrors.token ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Token Firebase Cloud Messaging del dispositivo"
              />
              {validationErrors.token && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.token}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Token único proporcionado por Firebase para envío de notificaciones push
              </p>
            </div>

            {/* Tipo de dispositivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de dispositivo *
              </label>
              <select
                value={formData.device_type}
                onChange={(e) => handleChange('device_type', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F]/30 ${
                  validationErrors.device_type ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar tipo...</option>
                {(Array.isArray(deviceTypes) ? deviceTypes : []).map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {validationErrors.device_type && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.device_type}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                  className="rounded border-gray-300 text-[#2D728F] focus:ring-[#2D728F]"
                />
                <span className="text-sm font-medium text-gray-700">Token activo para notificaciones</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Los tokens inactivos no recibirán notificaciones push
              </p>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/20 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-[#2D728F] rounded-lg hover:bg-[#2D728F]/90 focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                                  {isEditing ? 'Actualizar' : 'Registrar'} Token
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

DeviceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  device: PropTypes.shape({
    id: PropTypes.number,
    token: PropTypes.string,
    device_type: PropTypes.string,
    device_type_display: PropTypes.string,
    is_active: PropTypes.bool,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    user: PropTypes.shape({
      id: PropTypes.number,
      username: PropTypes.string,
      full_name: PropTypes.string,
      email: PropTypes.string,
      first_name: PropTypes.string,
      last_name: PropTypes.string
    })
  }),
  deviceTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default DeviceModal;
