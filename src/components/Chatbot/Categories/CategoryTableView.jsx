/**
 * Componente de vista de tabla para categorías
 * Siguiendo el diseño minimalista y profesional de Knowledge Base
 */

import React from 'react';
import PropTypes from 'prop-types';
import SortIcon from '../../Common/DataView/SortIcon';
import Pagination from '../../Common/DataView/Pagination';

/**
 * Componente CategoryTableView
 */
const CategoryTableView = ({
  data,
  sortField,
  sortDirection,
  expandedRows,
  onSort,
  onEdit,
  onDelete,
  onToggleExpansion,
  loading,
  totalItems,
  pagination,
  pageNumbers,
  displayRange,
  navigation,
  onPageChange,
  onCreateFirst,
  className = ''
}) => {
  /**
   * Renderiza una fila de la tabla para móvil (card layout)
   */
  const renderMobileCard = (item, index) => {
    const isExpanded = expandedRows.has(item.id);
    const shouldTruncate = item.description && item.description.length > 100;
    
    return (
      <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
        {/* Nombre */}
        <div>
          <h4 className="text-[13px] font-semibold text-gray-900 mb-1">
            {item.name}
          </h4>
          {item.description && (
            <div className="relative">
              <p className={`text-[13px] text-gray-600 leading-relaxed ${
                !isExpanded && shouldTruncate ? 'line-clamp-3' : ''
              }`}>
                {item.description}
              </p>
              {shouldTruncate && (
                <button
                  onClick={() => onToggleExpansion(item.id)}
                  className="mt-1 text-[13px] text-[#2D728F] hover:text-[#235A6F] flex items-center gap-1"
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
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          {/* ID */}
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            ID: {item.id}
          </span>
          
          {/* Estado */}
          <span className="inline-flex items-center px-2 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
            <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-slate-500"></div>
            Activo
          </span>

          {/* Contador de preguntas */}
          {item.knowledge_count !== undefined && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
              {item.knowledge_count} {item.knowledge_count === 1 ? 'pregunta' : 'preguntas'}
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
    const isExpanded = expandedRows.has(item.id);
    const shouldTruncate = item.description && item.description.length > 100;
    
    return (
      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
        {/* Nombre */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="max-w-[120px] sm:max-w-[150px] md:max-w-[180px] lg:max-w-[220px]">
            <p className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-relaxed">
              {item.name}
            </p>
          </div>
        </td>
        
        {/* Descripción */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden md:table-cell">
          <div className="max-w-[180px] lg:max-w-[280px] xl:max-w-[350px]">
            {item.description ? (
              <div className="relative">
                <p className={`text-[13px] text-gray-500 leading-relaxed ${
                  !isExpanded && shouldTruncate ? 'line-clamp-2' : ''
                }`}>
                  {item.description}
                </p>
                {shouldTruncate && (
                  <button
                    onClick={() => onToggleExpansion(item.id)}
                    className="mt-1 text-[13px] text-[#2D728F] hover:text-[#235A6F] flex items-center gap-1 transition-colors"
                    title={isExpanded ? 'Mostrar menos' : 'Mostrar más'}
                  >
                    {isExpanded ? 'Ver menos' : 'Ver más'}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <span className="text-[13px] text-gray-400 italic">Sin descripción</span>
            )}
          </div>
        </td>
        
        {/* ID */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden sm:table-cell">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">
            {item.id}
          </span>
        </td>

        {/* Contador de Preguntas */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden lg:table-cell">
          <div className="flex items-center">
            {item.knowledge_count !== undefined ? (
              <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-blue-50 text-blue-600 border border-blue-200 whitespace-nowrap">
                {item.knowledge_count} {item.knowledge_count === 1 ? 'pregunta' : 'preguntas'}
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-gray-100 text-gray-500 border border-gray-200 whitespace-nowrap">
                Sin datos
              </span>
            )}
          </div>
        </td>

        {/* Estado */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden xl:table-cell">
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium border whitespace-nowrap bg-slate-50 text-slate-600 border-slate-200">
              <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-slate-500"></div>
              Activo
            </span>
          </div>
        </td>

        {/* Acciones */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => onEdit?.(item)}
              className="p-1.5 text-gray-400 hover:text-[#2D728F] transition-colors rounded-md hover:bg-gray-100"
              title="Editar categoría"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete?.(item.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
              title="Eliminar categoría"
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

  // Estado vacío
  if (!loading && (!data || data.length === 0)) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-16 text-center">
          {/* Ilustración moderna */}
          <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {totalItems === 0 ? 'No hay categorías registradas' : 'No se encontraron categorías'}
          </h3>
          
          <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
            {totalItems === 0 
              ? 'Comience creando categorías para organizar las preguntas del chatbot de manera eficiente.'
              : 'No se encontraron categorías que coincidan con los filtros aplicados. Intente ajustar su búsqueda.'
            }
          </p>
          
          {/* Elementos decorativos sutiles */}
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabla */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className={`w-full ${className}`}>
          {/* Vista móvil - Cards */}
          <div className="block md:hidden space-y-3 p-4">
            {data.map(renderMobileCard)}
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-300 table-auto">
              <thead className="bg-[#F2F3F5] border-b border-slate-300/60">
                <tr>
                  <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[120px] sm:min-w-[150px] md:min-w-[180px] lg:min-w-[220px]">
                    Nombre
                  </th>
                  <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell min-w-[180px] lg:min-w-[280px] xl:min-w-[350px]">
                    Descripción
                  </th>
                  <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell min-w-[80px] w-[100px]">
                    ID
                  </th>
                  <th 
                    className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell min-w-[120px] w-[140px] cursor-pointer hover:bg-gray-200/50 transition-colors"
                    onClick={() => onSort('knowledge_count')}
                  >
                    <div className="flex items-center">
                      Preguntas
                      <SortIcon field="knowledge_count" currentField={sortField} direction={sortDirection} />
                    </div>
                  </th>
                  <th 
                    className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell min-w-[80px] w-[100px] cursor-pointer hover:bg-gray-200/50 transition-colors"
                    onClick={() => onSort('is_active')}
                  >
                    <div className="flex items-center">
                      Estado
                      <SortIcon field="is_active" currentField={sortField} direction={sortDirection} />
                    </div>
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

CategoryTableView.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortField: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc', null]),
  expandedRows: PropTypes.instanceOf(Set).isRequired,
  onSort: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleExpansion: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  totalItems: PropTypes.number,
  pagination: PropTypes.object,
  pageNumbers: PropTypes.array,
  displayRange: PropTypes.object,
  navigation: PropTypes.object,
  onPageChange: PropTypes.func,
  onCreateFirst: PropTypes.func,
  className: PropTypes.string,
};

export default React.memo(CategoryTableView); 