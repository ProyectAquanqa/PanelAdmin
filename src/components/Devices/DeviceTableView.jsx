/**
 * Componente de tabla para Device Tokens
 * Diseño optimizado para mostrar tokens FCM de dispositivos
 */

import React from 'react';
import PropTypes from 'prop-types';
import SortIcon from '../Common/DataView/SortIcon';
import { formatRelativeTime } from '../../utils/dateUtils';

const DeviceTableView = ({
  data = [],
  sortField = '',
  sortDirection = 'asc',
  expandedRows = new Set(),
  onSort,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  onToggleExpansion,
  className = ''
}) => {

  /**
   * Renderiza una fila de la tabla para móvil (card layout)
   */
  const renderMobileCard = (device, index) => {
    return (
      <div key={device.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors">
        {/* Header del dispositivo */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              Token {device.device_type === 'android' ? 'Android' : device.device_type === 'ios' ? 'iOS' : 'Dispositivo'}
            </h4>
            <span className="text-xs text-gray-500">
              ID: {device.id}
            </span>
          </div>
          
          <span className={`inline-flex items-center px-2 py-1 rounded-full border text-xs ${
            device.is_active 
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              device.is_active ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            {device.is_active ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Token FCM */}
        <div>
          <span className="text-xs text-gray-500">Token FCM:</span>
          <p className="font-mono text-xs text-gray-700 bg-gray-50 p-2 rounded mt-1 break-all">
            {device.token ? `${device.token.substring(0, 50)}...` : 'N/A'}
          </p>
        </div>

        {/* Usuario */}
        {device.user && (
          <div>
            <span className="text-xs text-gray-500">Usuario:</span>
            <p className="text-xs text-gray-700">
              {device.user.username || device.user.email}
            </p>
          </div>
        )}

        {/* Fecha de registro */}
        <div>
          <span className="text-xs text-gray-500">Registrado:</span>
          <p className="text-xs text-gray-700">
            {device.created_at ? formatRelativeTime(device.created_at) : 'N/A'}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => onView?.(device)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Ver detalles
          </button>
          <button
            onClick={() => onEdit?.(device)}
            className="text-xs text-gray-600 hover:text-gray-800"
          >
            Editar
          </button>
          <button
            onClick={() => onToggleStatus?.(device.id, !device.is_active)}
            className={`text-xs ${device.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
          >
            {device.is_active ? 'Desactivar' : 'Activar'}
          </button>
          <button
            onClick={() => onDelete?.(device)}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Eliminar
          </button>
        </div>
      </div>
    );
  };

  /**
   * Renderiza el contenido de una celda
   */
  const renderCellContent = (device, field) => {
    switch (field) {
      case 'token':
        return (
          <div className="font-mono text-[13px] text-gray-600">
            {device.token ? `${device.token.substring(0, 32)}...` : 'N/A'}
          </div>
        );

      case 'device_type':
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full border text-[13px] ${
            device.device_type === 'android' 
              ? 'bg-green-50 text-green-700 border-green-200'
              : device.device_type === 'ios'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              device.device_type === 'android' ? 'bg-green-500' 
              : device.device_type === 'ios' ? 'bg-blue-500' 
              : 'bg-gray-400'
            }`}></div>
            {device.device_type === 'android' ? 'Android' 
             : device.device_type === 'ios' ? 'iOS' 
             : device.device_type}
          </span>
        );

      case 'user':
        return device.user ? (
          <div className="text-[13px]">
            <div className="font-medium text-gray-900">
              {device.user.first_name && device.user.last_name
                ? `${device.user.first_name} ${device.user.last_name}`
                : device.user.username}
            </div>
            {device.user.email && (
              <div className="text-[11px] text-gray-500">{device.user.email}</div>
            )}
          </div>
        ) : (
          <span className="text-[13px] text-gray-400">Sin asignar</span>
        );

      case 'is_active':
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full border text-[13px] ${
            device.is_active 
              ? 'bg-slate-50 text-slate-600 border-slate-200'
              : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              device.is_active ? 'bg-slate-500' : 'bg-gray-400'
            }`}></div>
            {device.is_active ? 'Activo' : 'Inactivo'}
          </span>
        );

      case 'created_at':
        return device.created_at ? (
          <span className="text-[13px] text-gray-600">
            {formatRelativeTime(device.created_at)}
          </span>
        ) : (
          <span className="text-[13px] text-gray-400">N/A</span>
        );

      default:
        return device[field] || 'N/A';
    }
  };

  // Configuración de columnas siguiendo patrón KnowledgeBase
  const columns = [
    { 
      key: 'token', 
      label: 'Token FCM', 
      sortable: false,
      className: 'w-1/4'
    },
    { 
      key: 'device_type', 
      label: 'Tipo', 
      sortable: false,
      className: 'w-[120px]'
    },
    { 
      key: 'user', 
      label: 'Usuario', 
      sortable: false,
      className: 'w-1/4'
    },
    { 
      key: 'is_active', 
      label: 'Estado', 
      sortable: false,
      className: 'w-[100px]'
    },
    { 
      key: 'created_at', 
      label: 'Registrado', 
      sortable: false,
      className: 'w-[140px]'
    },
    { 
      key: 'actions', 
      label: 'Acciones', 
      sortable: false,
      className: 'w-[120px]'
    }
  ];

  // Si no hay datos
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        No hay tokens de dispositivos para mostrar
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Vista móvil - Cards */}
      <div className="block md:hidden space-y-4">
        {data.map((device, index) => renderMobileCard(device, index))}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full">
          <thead className="bg-gray-50/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-[13px] font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 first:rounded-tl-lg last:rounded-tr-lg ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((device, index) => (
              <tr key={device.id} className="hover:bg-gray-50/50 transition-colors">
                {columns.map((column) => (
                  <td
                    key={`${device.id}-${column.key}`}
                    className={`px-4 py-3 text-[13px] ${column.className || ''}`}
                  >
                    {column.key === 'actions' ? (
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => onView?.(device)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-lg"
                          title="Ver detalles"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete?.(device)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      renderCellContent(device, column.key)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

DeviceTableView.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      token: PropTypes.string.isRequired,
      device_type: PropTypes.string.isRequired,
      is_active: PropTypes.bool,
      created_at: PropTypes.string,
      user: PropTypes.shape({
        id: PropTypes.number,
        username: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        email: PropTypes.string
      })
    })
  ),
  sortField: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  expandedRows: PropTypes.object,
  onSort: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
  onToggleStatus: PropTypes.func,
  onToggleExpansion: PropTypes.func,
  className: PropTypes.string
};

export default DeviceTableView;
