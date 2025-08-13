/**
 * Vista de tabla específica para Perfiles (Django Groups)
 * Basado en TableView pero adaptado a los campos del modelo Group
 * Actualizado para la nueva lógica CRUD de permisos dinámicos
 */

import React from 'react';
import PropTypes from 'prop-types';
import SortIcon from '../Common/DataView/SortIcon';
import { calculatePermissionStats, formatPermissionCount } from '../../utils/profileUtils';
import ProfileDateBadge from './ProfileDateBadge';



/**
 * Componente ProfileTableView - Vista de tabla para perfiles/grupos
 */
const ProfileTableView = ({
  data,
  sortField,
  sortDirection,
  expandedRows,
  onSort,
  onEdit,
  onDelete,
  onToggleExpansion,
  className = ''
}) => {
  // Usar la función utilitaria mejorada
  const getPermissionStats = calculatePermissionStats;

  /**
   * Renderiza una fila de la tabla para móvil (card layout)
   */
  const renderMobileCard = (item, index) => {
    const profile = item._original || item;
    const permissionStats = getPermissionStats(profile);
    const canDelete = (profile.users_count || 0) === 0;
    
    return (
      <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 mx-auto max-w-lg">
        {/* Header centrado */}
        <div className="text-center mb-4">
          {/* Avatar centrado */}
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
            <span className="text-[12px] text-gray-600">
              {profile.name?.substring(0, 2).toUpperCase() || 'PR'}
            </span>
          </div>
          
          {/* Nombre y ID */}
          <h4 className="text-[14px] text-gray-900 mb-1">
            {profile.name}
          </h4>
          <span className="text-[11px] text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
            #{profile.id}
          </span>
        </div>

        {/* Stats centrados */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div>
            <div className="text-[16px] text-gray-900">{profile.users_count || 0}</div>
            <div className="text-[10px] text-gray-500 uppercase">Usuarios</div>
          </div>
          <div>
            <div className="text-[16px] text-gray-900">{permissionStats.total}</div>
            <div className="text-[10px] text-gray-500 uppercase">Permisos</div>
          </div>
        </div>

        {/* Acciones centradas */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onView?.(item)}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors rounded-lg"
            title="Ver"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => onEdit?.(item)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-lg"
            title="Editar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete?.(item.id)}
            disabled={!canDelete}
            className={`p-2 transition-colors rounded-lg ${
              canDelete 
                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                : 'text-gray-300 cursor-not-allowed opacity-50'
            }`}
            title={canDelete ? "Eliminar" : "No se puede eliminar"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  /**
   * Renderiza una fila de la tabla para desktop
   */
  const renderTableRow = (item, index) => {
    const isExpanded = expandedRows ? expandedRows.has(item.id) : false;
    const profile = item._original || item; // Obtener datos originales
    const permissionStats = getPermissionStats(profile);
    const shouldTruncatePermisos = permissionStats.shouldTruncate;
    
    // Lógica de eliminación: solo permitir si no tiene usuarios asignados
    const canDelete = (profile.users_count || 0) === 0;
    
    return (
      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
        {/* ID */}
        <td className="px-4 py-3 border-b border-gray-100 text-center">
          <span className="text-[12px] text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
            #{String(profile.id).padStart(3, '0')}
          </span>
        </td>
        
        {/* Nombre del Perfil */}
        <td className="px-4 py-3 border-b border-gray-100 text-center">
          <p className="text-[13px] text-gray-900">
            {profile.name}
          </p>
        </td>
        
        {/* Usuarios */}
        <td className="px-4 py-3 border-b border-gray-100 text-center">
          <span className="text-[13px] text-gray-900">
            {profile.users_count || 0}
          </span>
        </td>

        {/* Permisos */}
        <td className="px-4 py-3 border-b border-gray-100 text-center">
          <span className="text-[13px] text-gray-900">
            {permissionStats.total}
          </span>
        </td>

        {/* Acciones */}
        <td className="px-4 py-3 border-b border-gray-100 text-center">
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => onView?.(item)}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors rounded"
              title="Ver"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={() => onEdit?.(item)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded"
              title="Editar"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete?.(item.id)}
              disabled={!canDelete}
              className={`p-1.5 transition-colors rounded ${
                canDelete 
                  ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                  : 'text-gray-300 cursor-not-allowed opacity-50'
              }`}
              title={canDelete ? "Eliminar" : "No se puede eliminar"}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Vista móvil - Cards */}
      <div className="block md:hidden space-y-3">
        {data.map(renderMobileCard)}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-full table-auto">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-center text-[12px] text-gray-600 uppercase tracking-wider w-[80px]">
                ID
              </th>
              <th className="px-4 py-3 text-center text-[12px] text-gray-600 uppercase tracking-wider">
                Nombre
              </th>
              <th 
                className="px-4 py-3 text-center text-[12px] text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-[100px]"
                onClick={() => onSort('users_count')}
              >
                <div className="flex items-center justify-center gap-1">
                  Usuarios
                  <SortIcon field="users_count" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-[12px] text-gray-600 uppercase tracking-wider w-[100px]">
                Permisos
              </th>
              <th className="px-4 py-3 text-center text-[12px] text-gray-600 uppercase tracking-wider w-[140px]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map(renderTableRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

ProfileTableView.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortField: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc', null]),
  expandedRows: PropTypes.instanceOf(Set).isRequired,
  onSort: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleExpansion: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default React.memo(ProfileTableView);
 