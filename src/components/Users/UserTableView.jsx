/**
 * Vista de tabla para el módulo de Usuarios
 * Siguiendo el patrón de CategoryTableView.jsx
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Pagination, SortIcon } from '../Common';
import { EnvelopeIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
// import LoadingStates from './LoadingStates';

const UserTableView = ({
  data = [],
  loading = false,
  totalItems = 0,
  sortField = '',
  sortDirection = 'asc',
  expandedRows = new Set(),
  pagination,
  pageNumbers = [],
  displayRange = {},
  navigation = {},
  onSort,
  onPageChange,
  onToggleExpansion,
  onEdit,
  onDelete,
  onToggleStatus,
  onView,
  onCreateNew,
  className = ''
}) => {
  
  /**
   * Renderiza una fila de la tabla para móvil (card layout)
   */
  const renderMobileCard = (user) => {
    const isExpanded = expandedRows.has(user.id);
    
    return (
      <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
        {/* Header con ID, foto y DNI */}
        <div className="flex items-center space-x-3">
          {/* ID prominente */}
          <div className="text-[13px] font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border">
            #{String(user.id).padStart(3, '0')}
          </div>
          
          {/* Foto de perfil - Placeholder profesional */}
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          
          {/* DNI y nombre */}
          <div className="flex-1 min-w-0">
            <div className="space-y-1">
              <h4 className="text-[13px] text-gray-900 truncate">
                DNI: {user.username}
              </h4>
              {user.is_staff && (
                <div>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                    Staff
                  </span>
                </div>
              )}
            </div>
            <p className="text-[13px] text-gray-500 truncate">
              {user.full_name || `${user.first_name} ${user.last_name}`.trim() || '-'}
            </p>
          </div>
        </div>

        {/* Información adicional mejorada */}
        <div className="space-y-2">
          <div className="text-[13px] text-gray-600 truncate">
            <EnvelopeIcon className="w-4 h-4 inline mr-1" />
            {user.email || 'Sin email registrado'}
          </div>
          
          <div className="flex items-center justify-start">
            {/* Estado */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[13px] font-medium border ${
              user.is_active
                ? 'bg-slate-50 text-slate-600 border-slate-200'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              <div className={`w-1 h-1 rounded-full mr-1.5 ${
                user.is_active ? 'bg-slate-500' : 'bg-slate-400'
              }`}></div>
              {user.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          
          {/* Información de Perfil y Tipo de Usuario */}
          <div className="space-y-1">
            {/* Tipo de usuario */}
            {user.tipo_usuario && (
              <div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  user.tipo_usuario === 'Admin' 
                    ? 'bg-purple-100 text-purple-600 border border-purple-200' 
                    : 'bg-blue-100 text-blue-600 border border-blue-200'
                }`}>
                  {user.tipo_usuario === 'Admin' ? (
                    <span className="flex items-center">
                      <ShieldCheckIcon className="w-4 h-4 mr-1" />
                      Admin
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-1" />
                      Trabajador
                    </span>
                  )}
                </span>
              </div>
            )}
            
            {/* Grupos asignados */}
            {user.groups && user.groups.length > 0 && (
              <div className="text-[12px] text-slate-600">
                {user.groups.map(group => 
                  typeof group === 'object' ? group.name || group.nombre : group
                ).join(', ')}
              </div>
            )}
            
            {/* Empresa si existe */}
            {user.empresa && (
              <div className="text-[11px] text-slate-500">
                {user.empresa}
              </div>
            )}
          </div>
        </div>

        {/* Fecha de registro */}
        <div className="text-[13px] text-gray-500">
          Registrado: {user.date_joined_formatted || new Date(user.date_joined).toLocaleDateString()}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => onView?.(user)}
            className="p-2 text-gray-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
            title="Ver usuario"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => onEdit?.(user)}
            className="p-2 text-gray-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
            title="Editar usuario"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onToggleStatus?.(user.id)}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
            title={user.is_active ? 'Desactivar usuario' : 'Activar usuario'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {user.is_active ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              )}
            </svg>
          </button>
        </div>
      </div>
    );
  };

  /**
   * Renderiza una fila de la tabla para desktop con nueva disposición responsive mejorada
   */
  const renderTableRow = (user) => {
    return (
      <tr key={user.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
        {/* ID - Primera columna siempre visible */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="text-[13px] font-mono text-slate-700">
            {String(user.id).padStart(3, '0')}
          </div>
        </td>
        
        {/* Foto de perfil - Siempre visible */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="flex justify-center">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
        </td>
        
        {/* DNI (username) - Siempre visible */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <div className="space-y-1">
              <p className="text-[13px] text-gray-900 truncate">
                {user.username}
              </p>
              {user.is_staff && (
                <div>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                    Staff
                  </span>
                </div>
              )}
            </div>
          </div>
        </td>

        {/* Nombre completo - Desde tablet */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden md:table-cell">
          <div className="min-w-0">
            <p className="text-[13px] text-gray-800 truncate">
              {user.full_name || `${user.first_name} ${user.last_name}`.trim() || '-'}
            </p>
          </div>
        </td>

        {/* Email - Desde desktop */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden lg:table-cell">
          <div className="min-w-0">
            <p className="text-[13px] text-gray-600 truncate">
              {user.email || 'Sin email registrado'}
            </p>
          </div>
        </td>

        {/* Estado - Desde mobile */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden sm:table-cell">
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium border whitespace-nowrap ${
              user.is_active
                ? 'bg-slate-50 text-slate-600 border-slate-200'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              <div className={`w-1 h-1 rounded-full mr-1.5 ${
                user.is_active ? 'bg-slate-500' : 'bg-slate-400'
              }`}></div>
              {user.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </td>

        {/* Perfil y Tipo - Desktop grande */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden xl:table-cell">
          <div className="space-y-1">
            {/* Tipo de usuario */}
            {user.tipo_usuario ? (
              <div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  user.tipo_usuario === 'Admin' 
                    ? 'bg-purple-100 text-purple-600 border border-purple-200' 
                    : 'bg-blue-100 text-blue-600 border border-blue-200'
                }`}>
                  {user.tipo_usuario === 'Admin' ? (
                    <span className="flex items-center">
                      <ShieldCheckIcon className="w-4 h-4 mr-1" />
                      Admin
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-1" />
                      Trabajador
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <span className="text-[13px] text-gray-400 italic">Sin tipo</span>
            )}
            
            {/* Grupos asignados */}
            {user.groups && user.groups.length > 0 && (
              <div className="text-[11px] text-slate-600 truncate">
                {user.groups.map(group => 
                  typeof group === 'object' ? group.name || group.nombre : group
                ).join(', ')}
              </div>
            )}
          </div>
        </td>

        {/* Acciones - Siempre visible */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-end space-x-1">
            <button
              onClick={() => onView?.(user)}
              className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Ver usuario"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={() => onEdit?.(user)}
              className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Editar usuario"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onToggleStatus?.(user.id)}
              className="inline-flex items-center justify-center w-8 h-8 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-gray-100"
              title={user.is_active ? 'Desactivar usuario' : 'Activar usuario'}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {user.is_active ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="flex space-x-4">
            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado vacío
  if (!loading && (!data || data.length === 0)) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <UserIcon className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios registrados</h3>
        <p className="text-gray-500 mb-4">Los usuarios aparecerán aquí cuando se registren en el sistema. Puedes agregar nuevos usuarios desde el panel deAdministración.</p>
        <button
          onClick={onCreateNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Crear Usuario
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabla */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className={`w-full ${className}`}>
            {/* Vista móvil - Cards */}
            <div className="block md:hidden space-y-3">
              {data.map(renderMobileCard)}
            </div>

            {/* Vista desktop - Tabla */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-300 table-auto">
              <thead className="bg-[#F2F3F5] border-b border-slate-300/60">
                <tr>
                  {/* ID - Primera columna siempre visible */}
                  <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider w-[70px]">
                    ID
                  </th>
                  
                  {/* Foto - Siempre visible */}
                  <th className="px-3 sm:px-4 md:px-6 py-4 text-center text-[13px] font-semibold text-gray-500 uppercase tracking-wider w-[60px]">
                    Foto
                  </th>
                  
                  {/* DNI - Siempre visible */}
                  <th 
                    className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-200/50 transition-colors"
                    onClick={() => onSort('username')}
                  >
                    <div className="flex items-center">
                      DNI
                      <SortIcon field="username" currentField={sortField} direction={sortDirection} />
                    </div>
                  </th>
                  
                  {/* Nombre Completo - Desde tablet */}
                  <th 
                    className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell min-w-[160px] cursor-pointer hover:bg-gray-200/50 transition-colors"
                    onClick={() => onSort('first_name')}
                  >
                    <div className="flex items-center">
                      Nombre Completo
                      <SortIcon field="first_name" currentField={sortField} direction={sortDirection} />
                    </div>
                  </th>
                  
                  {/* Email - Desde desktop */}
                  <th 
                    className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell min-w-[180px] cursor-pointer hover:bg-gray-200/50 transition-colors"
                    onClick={() => onSort('email')}
                  >
                    <div className="flex items-center">
                      Email
                      <SortIcon field="email" currentField={sortField} direction={sortDirection} />
                    </div>
                  </th>
                  
                  {/* Estado - Desde mobile */}
                  <th 
                    className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell cursor-pointer hover:bg-gray-200/50 transition-colors min-w-[80px] w-[100px]"
                    onClick={() => onSort('is_active')}
                  >
                    <div className="flex items-center">
                      Estado
                      <SortIcon field="is_active" currentField={sortField} direction={sortDirection} />
                    </div>
                  </th>
                  
                  {/* Perfil - Desktop grande */}
                  <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell min-w-[120px] w-[140px]">
                    Perfil
                  </th>
                  
                  {/* Acciones - Siempre visible */}
                  <th className="px-3 sm:px-4 md:px-6 py-4 text-right text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[100px] w-[120px]">
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
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Pagination
            pagination={pagination}
            pageNumbers={pageNumbers}
            displayRange={displayRange}
            navigation={navigation}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

UserTableView.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  totalItems: PropTypes.number,
  sortField: PropTypes.string,
  sortDirection: PropTypes.string,
  expandedRows: PropTypes.instanceOf(Set),
  pagination: PropTypes.object,
  pageNumbers: PropTypes.array,
  displayRange: PropTypes.object,
  navigation: PropTypes.object,
  onSort: PropTypes.func,
  onPageChange: PropTypes.func,
  onToggleExpansion: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleStatus: PropTypes.func,
  onView: PropTypes.func,
  onCreateNew: PropTypes.func,
  className: PropTypes.string
};

export default UserTableView;
