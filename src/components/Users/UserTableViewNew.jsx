import React from 'react';
import PropTypes from 'prop-types';
import SortIcon from '../Common/DataView/SortIcon';

/**
 * Vista de tabla para usuarios siguiendo el patrón de KnowledgeBase
 * Diseño limpio y consistente con el resto de módulos
 */
const UserTableViewNew = ({
  data = [],
  sortField = '',
  sortDirection = 'asc',
  expandedRows = new Set(),
  onSort,
  onEdit,
  onDelete,
  onView,

  onToggleExpansion,
  className = ''
}) => {
  
  /**
   * Renderiza una fila de la tabla para móvil (card layout)
   */
  const renderMobileCard = (item, index) => {
    return (
      <div key={item.id} className="bg-white border-l-4 border-l-blue-500 p-4 space-y-3 hover:bg-gray-50 transition-colors">
        {/* Nombre del usuario */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            {item.first_name} {item.last_name}
          </h4>
          <span className="text-xs text-gray-500">
            {item.username}
          </span>
        </div>

        {/* Email y estado */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-600">
            {item.email}
          </span>
          
          <span className={`inline-flex items-center px-2 py-1 rounded-full border ${
            item.is_active 
              ? 'bg-slate-50 text-slate-600 border-slate-200'
              : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              item.is_active ? 'bg-slate-500' : 'bg-gray-400'
            }`}></div>
            {item.is_active ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Grupos/Roles */}
        {item.groups && Array.isArray(item.groups) && item.groups.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {item.groups.slice(0, 2).map((group, idx) => (
              <span 
                key={idx} 
                className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200"
              >
                {typeof group === 'string' ? group : (group.name || group.nombre)}
              </span>
            ))}
            {item.groups.length > 2 && (
              <span className="text-xs text-gray-400 px-2 py-1">
                +{item.groups.length - 2} más
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic px-2 py-1">Sin perfil asignado</span>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-100">
          {onView && (
            <button
              onClick={() => onView?.(item)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-lg"
              title="Ver detalles"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onEdit?.(item)}
            className="p-2 text-gray-400 hover:text-[#2D728F] transition-colors rounded-lg hover:bg-gray-100"
            title="Editar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={() => onDelete?.(item.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
            title="Eliminar"
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
    return (
      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
        {/* Nombre y Username */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="max-w-[200px] min-w-0">
            <div className="mb-1">
              <p className="text-[13px] font-semibold text-gray-800 truncate">
                {item.first_name} {item.last_name}
              </p>
            </div>
            <p className="text-[13px] text-gray-500 truncate">
              {item.username}
            </p>
          </div>
        </td>
        
        {/* Email */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden md:table-cell">
          <div className="max-w-[180px] min-w-0">
            <span className="text-[13px] text-gray-700 truncate block">
              {item.email}
            </span>
          </div>
        </td>
        
        {/* Grupos/Roles */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden lg:table-cell">
          <div className="max-w-[200px] min-w-0">
            {item.groups && Array.isArray(item.groups) && item.groups.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {item.groups.map((group, idx) => (
                  <span 
                    key={idx} 
                    className="inline-block px-2 py-1 text-[13px] bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                  >
                    {typeof group === 'string' ? group : (group.name || group.nombre)}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[13px] text-gray-400 italic">Sin perfil asignado</span>
            )}
          </div>
        </td>

        {/* Estado */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden sm:table-cell">
          <div className="w-full min-w-0">
            <span className={`inline-flex items-center px-2 py-1 rounded-full border text-[13px] font-medium ${
              item.is_active 
                ? 'bg-slate-50 text-slate-600 border-slate-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                item.is_active ? 'bg-slate-500' : 'bg-gray-400'
              }`}></div>
              {item.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </td>

        {/* Fecha de registro */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden xl:table-cell">
          <span className="text-[13px] text-gray-500">
            {item.date_joined ? new Date(item.date_joined).toLocaleDateString('es-ES') : '-'}
          </span>
        </td>

        {/* Acciones */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 text-center">
          <div className="flex items-center justify-center gap-2">
            {onView && (
              <button
                onClick={() => onView?.(item)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-lg"
                title="Ver detalles"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => onEdit?.(item)}
              className="p-2 text-gray-400 hover:text-[#2D728F] transition-colors rounded-lg hover:bg-gray-100"
              title="Editar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            <button
              onClick={() => onDelete?.(item.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
              title="Eliminar"
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
    <div className={`bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 ${className}`}>
      {/* Vista móvil */}
      <div className="block md:hidden divide-y divide-gray-200">
        {data.map((item, index) => renderMobileCard(item, index))}
      </div>

      {/* Vista desktop */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <th 
                className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => onSort?.('first_name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Usuario</span>
                  <SortIcon field="first_name" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                Email
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                Perfil
              </th>
              <th 
                className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors hidden sm:table-cell"
                onClick={() => onSort?.('is_active')}
              >
                <div className="flex items-center space-x-1">
                  <span>Estado</span>
                  <SortIcon field="is_active" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th 
                className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors hidden xl:table-cell"
                onClick={() => onSort?.('date_joined')}
              >
                <div className="flex items-center space-x-1">
                  <span>Registro</span>
                  <SortIcon field="date_joined" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-center text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => renderTableRow(item, index))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

UserTableViewNew.propTypes = {
  data: PropTypes.array.isRequired,
  sortField: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  expandedRows: PropTypes.instanceOf(Set),
  onSort: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,

  onToggleExpansion: PropTypes.func,
  className: PropTypes.string
};



export default UserTableViewNew;
