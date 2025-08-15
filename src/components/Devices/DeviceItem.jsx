import React from 'react';
import PropTypes from 'prop-types';
import { formatRelativeTime } from '../../utils/dateUtils';

/**
 * Componente para mostrar un dispositivo individual
 * Utilizado en la vista de tarjetas o elementos individuales
 */
const DeviceItem = ({
  device,
  onEdit,
  onDelete,
  onViewDetails,
  onToggleStatus
}) => {
  // Formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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
    const iconClass = "w-5 h-5 text-gray-500";
    
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
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
      <div className="space-y-4">
        {/* Header del token */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getDeviceIcon({ name: device.device_type })}
            <div>
              <h3 className="text-[14px] font-semibold text-gray-900 line-clamp-1">
                Token {device.device_type || 'Dispositivo'}
              </h3>
              <p className="text-[12px] text-gray-500">
                {device.device_type === 'android' ? 'Android' : device.device_type === 'ios' ? 'iOS' : 'Desconocido'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Estado */}
            <span className={`px-2 py-1 text-[11px] font-medium rounded-full border ${getStatusColor(device.is_active)}`}>
              {device.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        {/* Información del token */}
        <div className="text-[12px] space-y-2">
          <div>
            <span className="text-gray-500">Token FCM:</span>
            <p className="font-mono text-[11px] text-gray-900 bg-gray-50 p-2 rounded mt-1 break-all">
              {device.token ? `${device.token.substring(0, 40)}...` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Usuario asignado */}
        {device.user && (
          <div className="p-2 bg-gray-50 rounded-md">
            <span className="text-[11px] text-gray-500 uppercase tracking-wider">Usuario</span>
            <p className="text-[12px] font-medium text-gray-900">
              {device.user.first_name} {device.user.last_name}
            </p>
            {device.user.email && (
              <p className="text-[11px] text-gray-500 truncate">{device.user.email}</p>
            )}
          </div>
        )}

        {/* Fecha de registro */}
        <div className="text-[11px] text-gray-500">
          <span>Registrado: </span>
          <span className="font-medium">
            {device.created_at ? formatDate(device.created_at) : 'N/A'}
          </span>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails?.(device)}
              className="text-[11px] text-[#2D728F] hover:text-[#2D728F]/80 font-medium transition-colors"
            >
              Ver detalles
            </button>
            
            <span className="text-gray-300">•</span>
            
            <button
              onClick={() => onToggleStatus?.(device.id, !device.is_active)}
              className={`text-[11px] font-medium transition-colors ${
                device.is_active 
                  ? 'text-red-600 hover:text-red-500' 
                  : 'text-green-600 hover:text-green-500'
              }`}
            >
              {device.is_active ? 'Desactivar' : 'Activar'}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit?.(device)}
              className="p-1.5 text-gray-400 hover:text-[#2D728F] transition-colors"
              title="Editar token"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button
              onClick={() => onDelete?.(device)}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              title="Eliminar token"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

DeviceItem.propTypes = {
  device: PropTypes.shape({
    id: PropTypes.number.isRequired,
    token: PropTypes.string.isRequired,
    device_type: PropTypes.string.isRequired, // 'android' o 'ios'
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
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onViewDetails: PropTypes.func,
  onToggleStatus: PropTypes.func
};

export default DeviceItem;
