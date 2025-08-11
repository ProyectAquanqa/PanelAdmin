/**
 * Vista de tabla específica para Perfiles (Django Groups)
 * Basado en TableView pero adaptado a los campos del modelo Group
 */

import React from 'react';
import PropTypes from 'prop-types';
import SortIcon from '../Common/DataView/SortIcon';



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
  /**
   * Renderiza una fila de la tabla para móvil (card layout)
   */
  const renderMobileCard = (item, index) => {
    const isExpanded = expandedRows ? expandedRows.has(item.id) : false;
    const profile = item._original || item; // Obtener datos originales
    const shouldTruncatePermisos = profile.permissions && profile.permissions.length > 3;
    
    // Lógica de eliminación: solo permitir si no tiene usuarios asignados
    const canDelete = (profile.users_count || 0) === 0;
    
    return (
      <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
        {/* Header: ID, Nombre y Acciones */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[13px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                #{String(profile.id).padStart(3, '0')}
              </span>
            </div>
            <h4 className="text-[13px] font-semibold text-gray-900">
              {profile.name}
            </h4>
          </div>
          
          {/* Acciones en el header */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit?.(item)}
              className="p-1.5 text-gray-400 hover:text-[#2D728F] transition-colors rounded hover:bg-gray-100"
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
              title={canDelete ? "Eliminar perfil" : `No se puede eliminar: tiene ${profile.users_count} usuario(s) asignado(s)`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
      </div>
    </div>

        {/* Estadísticas */}
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          {/* Usuarios */}
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-[13px]">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
            {profile.users_count || 0} {(profile.users_count || 0) === 1 ? 'usuario' : 'usuarios'}
          </span>
          
          {/* Permisos */}
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 text-[13px]">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {profile.permissions?.length || 0} {(profile.permissions?.length || 0) === 1 ? 'permiso' : 'permisos'}
          </span>
        </div>

        {/* Lista de permisos principales */}
        {profile.permissions && profile.permissions.length > 0 ? (
          <div className="relative">
            <div className="text-[13px] text-gray-500 mb-1">Permisos:</div>
            <div className={`text-[13px] text-gray-600 leading-relaxed ${
              !isExpanded && shouldTruncatePermisos ? 'line-clamp-2' : ''
            }`}>
              {isExpanded ? 
                profile.permissions.map(p => p.name).join(', ') :
                profile.permissions.slice(0, 3).map(p => p.name).join(', ')
              }
              {shouldTruncatePermisos && !isExpanded && '...'}
            </div>
            {shouldTruncatePermisos && (
              <button
                onClick={() => onToggleExpansion(item.id)}
                className="mt-1 text-[13px] text-[#2D728F] hover:text-[#235A6F] flex items-center gap-1"
              >
                {isExpanded ? 'Ver menos' : `Ver todos (${profile.permissions.length})`}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="text-[13px] text-gray-400 italic">Sin permisos asignados</div>
        )}


      </div>
    );
  };

  /**
   * Renderiza una fila de la tabla para desktop
   */
  const renderTableRow = (item, index) => {
    const isExpanded = expandedRows ? expandedRows.has(item.id) : false;
    const profile = item._original || item; // Obtener datos originales
    const shouldTruncatePermisos = profile.permissions && profile.permissions.length > 3;
    
    // Lógica de eliminación: solo permitir si no tiene usuarios asignados
    const canDelete = (profile.users_count || 0) === 0;
    
    return (
      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
        {/* ID */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 text-center">
          <span className="text-[13px] text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
            #{String(profile.id).padStart(3, '0')}
          </span>
        </td>
        
        {/* Nombre del Grupo */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="max-w-[250px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px]">
            <p className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-relaxed">
              {profile.name}
            </p>
          </div>
        </td>
        
        {/* Usuarios Asignados */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden sm:table-cell">
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap">
              <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              {profile.users_count || 0}
            </span>
          </div>
        </td>

        {/* Permisos */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden lg:table-cell">
          <div className="min-w-[180px] lg:min-w-[280px] max-w-[200px] lg:max-w-[320px]">
            {profile.permissions && profile.permissions.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-green-100 text-green-700 border border-green-200">
                      <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {profile.permissions.length}
      </span>
                    {shouldTruncatePermisos && (
                      <button
                        onClick={() => onToggleExpansion(item.id)}
                        className="text-[13px] text-[#2D728F] hover:text-[#235A6F] flex items-center gap-1 transition-colors"
                        title={isExpanded ? 'Mostrar menos' : 'Mostrar más'}
                      >
                        {isExpanded ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            Menos
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Ver todos
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <p className={`text-[13px] text-gray-500 leading-relaxed ${
                    !isExpanded && shouldTruncatePermisos ? 'line-clamp-2' : ''
                  }`}>
                    {isExpanded ? 
                      profile.permissions.map(p => p.name).join(', ') :
                      profile.permissions.slice(0, 3).map(p => p.name).join(', ')
                    }
                    {shouldTruncatePermisos && !isExpanded && '...'}
                  </p>
                </div>
              ) : (
                <span className="text-[13px] text-gray-400 italic">Sin permisos asignados</span>
              )}
          </div>
        </td>
        

        
        {/* Acciones */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onEdit?.(item)}
              className="p-2 text-gray-400 hover:text-[#2D728F] transition-colors rounded-lg hover:bg-gray-100"
              title="Editar perfil"
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
              title={canDelete ? "Eliminar perfil" : `No se puede eliminar: tiene ${profile.users_count} usuario(s) asignado(s)`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <table className="w-full min-w-full divide-y divide-gray-300 table-auto">
          <thead className="bg-[#F2F3F5] border-b border-slate-300/60">
            <tr>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-center text-[13px] font-semibold text-gray-500 uppercase tracking-wider w-[80px]">
                ID
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[200px] md:min-w-[250px] lg:min-w-[300px] xl:min-w-[400px]">
                Nombre del Grupo
              </th>
              <th 
                className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell cursor-pointer hover:bg-gray-200/50 transition-colors min-w-[100px] w-[120px]"
                onClick={() => onSort('users_count')}
              >
                <div className="flex items-center">
                  Usuarios
                  <SortIcon field="users_count" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell min-w-[200px] lg:min-w-[300px] max-w-[250px] lg:max-w-[350px]">
                Permisos
              </th>
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
 