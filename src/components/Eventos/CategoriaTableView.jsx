/**
 * Vista de tabla específica para Categorías
 * Basado en TableView pero adaptado a los campos del modelo Categoria
 */

import React from 'react';
import PropTypes from 'prop-types';
import SortIcon from '../Common/DataView/SortIcon';

/**
 * Componente CategoriaTableView - Vista de tabla para categorías
 */
const CategoriaTableView = ({
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
    const shouldTruncate = item.descripcion && item.descripcion.length > 100;
    
    return (
      <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
        {/* ID y Nombre */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 font-mono">{String(item.id).padStart(2, '0')}</span>
            <h4 className="text-sm font-semibold text-gray-900">
              {item.nombre}
            </h4>
          </div>
          {item.descripcion && (
            <div className="relative">
              <p className={`text-xs text-gray-600 leading-relaxed ${
                !isExpanded && shouldTruncate ? 'line-clamp-3' : ''
              }`}>
                {item.descripcion}
              </p>
              {shouldTruncate && (
                <button
                  onClick={() => onToggleExpansion(item.id)}
                  className="mt-1 text-xs text-[#2D728F] hover:text-[#235A6F] flex items-center gap-1"
                >
                  {isExpanded ? 'Ver menos' : 'Ver más'}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Contador de eventos */}
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
            {item.eventos_count !== undefined ? item.eventos_count : (item.eventos?.length || 0)} eventos
          </span>
          
          {/* Estado */}
          <span className={`inline-flex items-center px-2 py-1 rounded-full border ${
            item.is_active 
              ? 'bg-slate-50 text-slate-600 border-slate-200' 
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
              item.is_active ? 'bg-slate-500' : 'bg-gray-400'
            }`}></div>
            {item.is_active ? 'Activa' : 'Inactiva'}
          </span>
          
          {/* Fecha de creación */}
          {item.created_at && (
            <span className="text-gray-500 text-xs">
              {new Date(item.created_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: '2-digit'
              })} • {new Date(item.created_at).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
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
            onClick={() => onDelete?.(item)}
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
    const isExpanded = expandedRows ? expandedRows.has(item.id) : false;
    const shouldTruncate = item.descripcion && item.descripcion.length > 100;
    
    return (
      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
        {/* ID */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 text-center">
          <span className="text-[13px] text-gray-500 font-mono font-medium">
            {String(item.id).padStart(2, '0')}
          </span>
        </td>
        
        {/* Nombre */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="min-w-[120px] max-w-[200px]">
            <p className="text-[13px] font-semibold text-gray-800 truncate" title={item.nombre}>
              {item.nombre}
            </p>
          </div>
        </td>
        
        {/* Descripción */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden md:table-cell">
          <div className="max-w-[250px] lg:max-w-[300px] xl:max-w-[400px]">
            {item.descripcion ? (
              <div className="relative">
                <p className={`text-[12px] text-gray-600 leading-relaxed ${
                  !isExpanded && shouldTruncate ? 'line-clamp-3' : ''
                }`}>
                  {item.descripcion}
                </p>
                {shouldTruncate && (
                  <button
                    onClick={() => onToggleExpansion(item.id)}
                    className="mt-1 text-[11px] text-[#2D728F] hover:text-[#235A6F] flex items-center gap-1 transition-colors"
                    title={isExpanded ? 'Mostrar menos' : 'Mostrar más'}
                  >
                    {isExpanded ? (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        Ver menos
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Ver más
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <span className="text-[12px] text-gray-400 italic">Sin descripción</span>
            )}
          </div>
        </td>
        
        {/* Estado */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden md:table-cell">
          <div className="flex items-center justify-center">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium border ${
              item.is_active 
                ? 'bg-slate-50 text-slate-600 border-slate-200' 
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                item.is_active ? 'bg-slate-500' : 'bg-gray-400'
              }`}></div>
              {item.is_active ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </td>
        
        {/* Contador de Eventos */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden lg:table-cell">
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium bg-blue-100/50 text-blue-600 border border-blue-200/50 whitespace-nowrap">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {item.eventos_count !== undefined ? item.eventos_count : (item.eventos?.length || 0)}
            </span>
          </div>
        </td>
        
        {/* Fecha de Creación */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden lg:table-cell">
          <div className="flex items-center justify-center">
            {item.created_at ? (
              <div className="text-center">
                <div className="text-[12px] text-gray-600 font-medium whitespace-nowrap">
                  {new Date(item.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: '2-digit'
                  })}
                </div>
                <div className="text-[11px] text-gray-500">
                  {new Date(item.created_at).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ) : (
              <span className="text-[12px] text-gray-400 italic">-</span>
            )}
          </div>
        </td>
        
        {/* Acciones */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 text-center">
          <div className="flex items-center justify-center gap-2">
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
              onClick={() => onDelete?.(item)}
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
              <th className="px-3 sm:px-4 md:px-6 py-4 text-center text-[13px] font-semibold text-gray-500 uppercase tracking-wider w-[60px] min-w-[50px]">
                ID
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[120px] w-[160px]">
                Nombre
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell min-w-[200px] max-w-[300px]">
                Descripción
              </th>
              <th 
                className="px-3 sm:px-4 md:px-6 py-4 text-center text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell cursor-pointer hover:bg-gray-200/50 transition-colors min-w-[80px] w-[100px]"
                onClick={() => onSort('is_active')}
              >
                <div className="flex items-center justify-center">
                  Estado
                  <SortIcon field="is_active" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-center text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell min-w-[100px] w-[120px]">
                Eventos
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-center text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell min-w-[110px] w-[130px]">
                Fecha
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-center text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[100px] w-[120px]">
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

CategoriaTableView.propTypes = {
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

export default React.memo(CategoriaTableView);