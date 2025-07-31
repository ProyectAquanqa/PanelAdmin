/**
 * Componente de vista de tabla reutilizable
 * Renderiza datos en formato de tabla con ordenamiento
 */

import React from 'react';
import PropTypes from 'prop-types';
import SortIcon from './SortIcon';

/**
 * Componente TableView
 * @param {Object} props - Props del componente
 * @returns {JSX.Element} Componente de tabla
 */
const TableView = ({
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
    const shouldTruncate = item.answer && item.answer.length > 100;
    
    return (
      <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
        {/* Pregunta */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            {item.question}
          </h4>
          {item.answer && (
            <div className="relative">
              <p className={`text-xs text-gray-600 leading-relaxed ${
                !isExpanded && shouldTruncate ? 'line-clamp-3' : ''
              }`}>
                {item.answer}
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
          {/* Categoría */}
          {item.category ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {item.category.name}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
              Sin categoría
            </span>
          )}
          
          {/* Estado */}
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

          {/* Embedding */}
          <span className={`inline-flex items-center px-2 py-1 rounded-full border ${
            item.question_embedding && item.question_embedding.length > 0
              ? 'bg-slate-50 text-slate-600 border-slate-200'
              : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              item.question_embedding && item.question_embedding.length > 0 ? 'bg-slate-500' : 'bg-gray-400'
            }`}></div>
            {item.question_embedding && item.question_embedding.length > 0 ? 'Con IA' : 'Sin IA'}
          </span>
        </div>

        {/* Keywords */}
        {item.keywords && (
          <div className="flex flex-wrap gap-1">
            {(typeof item.keywords === 'string' ? item.keywords.split(',') : item.keywords)
              .slice(0, 3)
              .map((keyword, idx) => (
                <span 
                  key={idx} 
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full border border-gray-200"
                >
                  {typeof keyword === 'string' ? keyword.trim() : keyword}
                </span>
              ))}
            {(typeof item.keywords === 'string' ? item.keywords.split(',').length : item.keywords?.length || 0) > 3 && (
              <span className="text-xs text-gray-400 px-2 py-1">
                +{(typeof item.keywords === 'string' ? item.keywords.split(',').length : item.keywords.length) - 3} más
              </span>
            )}
          </div>
        )}

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
    const isExpanded = expandedRows ? expandedRows.has(item.id) : false;
    const shouldTruncate = item.answer && item.answer.length > 100;
    
    return (
      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
        {/* Pregunta | Respuesta */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[400px] xl:max-w-[500px]">
            <div className="mb-2">
              <p className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-relaxed">
                {item.question}
              </p>
            </div>
            {item.answer && (
              <div className="relative">
                <p className={`text-[12px] text-gray-500 leading-relaxed ${
                  !isExpanded && shouldTruncate ? 'line-clamp-2' : ''
                }`}>
                  {item.answer}
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
            )}
          </div>
        </td>
        
        {/* Categoría */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden md:table-cell">
          <div className="flex items-center">
            {item.category ? (
              <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium bg-blue-100/50 text-blue-600 border border-blue-200/50 whitespace-nowrap">
                {item.category.name}
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium bg-gray-100 text-gray-500 border border-gray-200 whitespace-nowrap">
                Sin categoría
              </span>
            )}
          </div>
        </td>
        
        {/* Palabras Clave */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden lg:table-cell">
          <div className="flex flex-wrap gap-1.5 min-w-[140px] lg:min-w-[180px] max-w-[200px] lg:max-w-[280px] 2xl:max-w-[320px]">
            {item.keywords ? (
              typeof item.keywords === 'string' && item.keywords.trim() ? (
                <>
                  {item.keywords.split(',').slice(0, 3).map((keyword, idx) => 
                    keyword.trim() ? (
                      <span 
                        key={idx} 
                        className="inline-block px-2 lg:px-2.5 py-1 lg:py-1.5 text-[11px] lg:text-[12px] bg-gray-100 text-gray-600 rounded-full border border-gray-200 whitespace-nowrap font-medium leading-tight min-w-0 max-w-[70px] lg:max-w-[90px] truncate"
                        title={keyword.trim()}
                      >
                        {keyword.trim()}
                      </span>
                    ) : null
                  )}
                  {item.keywords.split(',').length > 3 && (
                    <span className="inline-flex items-center text-[11px] lg:text-[12px] text-gray-400 font-medium px-1 lg:px-1.5 py-1 lg:py-1.5">
                      +{item.keywords.split(',').length - 3} más
                    </span>
                  )}
                </>
              ) : Array.isArray(item.keywords) && item.keywords.length > 0 ? (
                <>
                  {item.keywords.slice(0, 3).map((keyword, idx) => (
                    <span 
                      key={idx} 
                      className="inline-block px-2 lg:px-2.5 py-1 lg:py-1.5 text-[11px] lg:text-[12px] bg-gray-100 text-gray-600 rounded-full border border-gray-200 whitespace-nowrap font-medium leading-tight min-w-0 max-w-[70px] lg:max-w-[90px] truncate"
                      title={keyword}
                    >
                      {keyword}
                    </span>
                  ))}
                  {item.keywords.length > 3 && (
                    <span className="inline-flex items-center text-[11px] lg:text-[12px] text-gray-400 font-medium px-1 lg:px-1.5 py-1 lg:py-1.5">
                      +{item.keywords.length - 3} más
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[11px] lg:text-[12px] text-gray-400 italic py-1 lg:py-1.5">Sin palabras clave</span>
              )
            ) : (
              <span className="text-[11px] lg:text-[12px] text-gray-400 italic py-1 lg:py-1.5">Sin palabras clave</span>
            )}
          </div>
        </td>

        {/* Embedding */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden xl:table-cell">
          <div className="flex items-center">
            {item.question_embedding && item.question_embedding.length > 0 ? (
              <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium bg-slate-50 text-slate-600 border border-slate-200 whitespace-nowrap">
                <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-slate-500"></div>
                Con IA
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium bg-gray-50 text-gray-600 border border-gray-200 whitespace-nowrap">
                <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-gray-400"></div>
                Sin IA
              </span>
            )}
          </div>
        </td>
        
        {/* Estado */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden sm:table-cell">
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium border whitespace-nowrap ${
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
        
        {/* Acciones */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 text-right">
          <div className="flex items-center justify-end gap-2">
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
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[250px] md:min-w-[300px] lg:min-w-[350px] xl:min-w-[400px]">
                Pregunta | Respuesta
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell min-w-[120px] w-[140px]">
                Categoría
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell w-[200px] lg:w-[240px] min-w-[140px] lg:min-w-[180px] max-w-[200px] lg:max-w-[280px] 2xl:w-[300px] 2xl:max-w-[320px]">
                Palabras Clave
              </th>
              <th 
                className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell cursor-pointer hover:bg-gray-200/50 transition-colors min-w-[100px] w-[120px]"
                onClick={() => onSort('has_embedding')}
              >
                <div className="flex items-center">
                  Embedding
                  <SortIcon field="has_embedding" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th 
                className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell cursor-pointer hover:bg-gray-200/50 transition-colors min-w-[80px] w-[100px]"
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
  );
};

TableView.propTypes = {
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

export default React.memo(TableView);