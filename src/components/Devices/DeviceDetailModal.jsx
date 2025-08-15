import React from 'react';
import PropTypes from 'prop-types';
import { formatRelativeTime, formatDateTime } from '../../utils/dateUtils';
import { Modal } from '../Common';

/**
 * Modal para mostrar detalles completos de un dispositivo
 * Vista de solo lectura con información detallada
 */
const DeviceDetailModal = ({
  isOpen,
  onClose,
  device,
  onEdit,
  onToggleStatus
}) => {
  if (!device) return null;

  // Formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return formatDateTime(dateString);
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const formatRelativeDate = (dateString) => {
    if (!dateString) return 'Nunca';
    try {
      return formatRelativeTime(dateString);
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para obtener color del estado
  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  // Función para obtener icono del tipo de dispositivo
  const getDeviceIcon = (deviceType) => {
    const iconClass = "w-8 h-8 text-gray-500";
    
    switch (deviceType?.name?.toLowerCase()) {
      case 'móvil':
      case 'smartphone':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
          </svg>
        );
      case 'tablet':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        );
      case 'escritorio':
      case 'pc':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Token de Dispositivo"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header con información básica */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            {getDeviceIcon({ name: device.device_type })}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Token {device.device_type || 'Dispositivo'}
                </h3>
                <p className="text-sm text-gray-600">
                  {device.device_type === 'android' ? 'Android' : device.device_type === 'ios' ? 'iOS' : 'Desconocido'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ID: {device.id}
                </p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(device.is_active)}`}>
                {device.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>

        {/* Token FCM */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
            Token Firebase Cloud Messaging
          </h4>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-mono text-xs text-gray-900 break-all leading-relaxed">
              {device.token || 'No especificado'}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Token único utilizado para enviar notificaciones push a este dispositivo
          </p>
        </div>

        {/* Usuario asignado */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
            Usuario Asignado
          </h4>
          {device.user ? (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {device.user.first_name?.charAt(0)}{device.user.last_name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {device.user.first_name} {device.user.last_name}
                  </p>
                  <p className="text-xs text-gray-600">{device.user.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 italic">Sin usuario asignado</p>
            </div>
          )}
        </div>

        {/* Fechas e historial */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
            Historial de Actividad
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de registro</label>
                <p className="text-sm text-gray-900">{formatDate(device.created_at)}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Última modificación</label>
                <p className="text-sm text-gray-900">{formatDate(device.updated_at)}</p>
              </div>
            </div>

          </div>
        </div>



        {/* Acciones */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={() => onToggleStatus?.(device.id, !device.is_active)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                device.is_active 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {device.is_active ? 'Desactivar' : 'Activar'} Token
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => onEdit?.(device)}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2D728F] rounded-lg hover:bg-[#2D728F]/90 transition-colors"
            >
              Editar Token
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

DeviceDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  device: PropTypes.shape({
    id: PropTypes.number.isRequired,
    token: PropTypes.string.isRequired,
    device_type: PropTypes.string.isRequired,
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
  onEdit: PropTypes.func,
  onToggleStatus: PropTypes.func
};

export default DeviceDetailModal;
