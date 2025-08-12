/**
 * Vista de tabla específica para Almuerzos
 * Basado en EventoTableView pero adaptado a los campos del modelo Almuerzo
 */

import React from 'react';
import PropTypes from 'prop-types';
import SortIcon from '../Common/DataView/SortIcon';

/**
 * Componente AlmuerzoTableView - Vista de tabla para almuerzos
 */
const AlmuerzoTableView = ({
  data,
  sortField,
  sortDirection,
  expandedRows,
  onSort,
  onEdit,
  onDelete,
  onToggleExpansion,
  onToggleStatus,
  className = ''
}) => {
  /**
   * Renderiza una fila de la tabla para móvil (card layout)
   */
  const renderMobileCard = (item, index) => {
    const isExpanded = expandedRows ? expandedRows.has(item.id) : false;
    const shouldTruncateEntrada = item.entrada && item.entrada.length > 50;
    const shouldTruncatePlatoFondo = item.plato_fondo && item.plato_fondo.length > 50;
    
    return (
      <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
        {/* Fecha y día */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              {item.nombre_dia}
            </h4>
            <p className="text-xs text-gray-600">
              {new Date(item.fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          {/* Estado */}
          <div className="flex flex-col items-end gap-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
              item.active 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                item.active ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {item.active ? 'Activo' : 'Inactivo'}
            </span>
            
            {item.es_feriado && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 text-xs">
                Feriado
              </span>
            )}
          </div>
        </div>

        {/* Menú */}
        <div className="space-y-2 text-xs">
          <div>
            <span className="font-medium text-gray-700">Entrada:</span>
            <div className="mt-1">
              {item.entrada ? (
                <div>
                  <p className={`text-gray-600 ${
                    !isExpanded && shouldTruncateEntrada ? 'truncate' : ''
                  }`}>
                    {item.entrada}
                  </p>
                  {shouldTruncateEntrada && (
                    <button
                      onClick={() => onToggleExpansion(item.id)}
                      className="mt-1 text-[#2D728F] hover:text-[#235A6F]"
                    >
                      {isExpanded ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-gray-400 italic">No especificado</span>
              )}
            </div>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Plato de fondo:</span>
            <div className="mt-1">
              {item.plato_fondo ? (
                <div>
                  <p className={`text-gray-600 ${
                    !isExpanded && shouldTruncatePlatoFondo ? 'truncate' : ''
                  }`}>
                    {item.plato_fondo}
                  </p>
                  {shouldTruncatePlatoFondo && !shouldTruncateEntrada && (
                    <button
                      onClick={() => onToggleExpansion(item.id)}
                      className="mt-1 text-[#2D728F] hover:text-[#235A6F]"
                    >
                      {isExpanded ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-gray-400 italic">No especificado</span>
              )}
            </div>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Refresco:</span>
            <span className="ml-2 text-gray-600">
              {item.refresco || <span className="text-gray-400 italic">No especificado</span>}
            </span>
          </div>
          
          {item.dieta && (
            <div>
              <span className="font-medium text-gray-700">Dieta:</span>
              <span className="ml-2 text-gray-600">{item.dieta}</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#2D728F] hover:text-[#235A6F] underline"
              >
                Ver pedido
              </a>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleStatus?.(item)}
              className={`p-2 transition-colors rounded-lg ${
                item.active
                  ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
              }`}
              title={item.active ? 'Desactivar' : 'Activar'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={item.active 
                        ? "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
              </svg>
            </button>
            
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
      </div>
    );
  };

  /**
   * Renderiza una fila de la tabla para desktop
   */
  const renderTableRow = (item, index) => {
    const isExpanded = expandedRows ? expandedRows.has(item.id) : false;
    const shouldTruncateEntrada = item.entrada && item.entrada.length > 60;
    const shouldTruncatePlatoFondo = item.plato_fondo && item.plato_fondo.length > 60;
    
    return (
      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
        {/* Fecha */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="min-w-[120px]">
            <p className="text-[13px] font-semibold text-gray-800">
              {item.nombre_dia}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              {new Date(item.fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </td>
        
        {/* Entrada */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden md:table-cell">
          <div className="max-w-[200px] lg:max-w-[250px]">
            {item.entrada ? (
              <div>
                <p className={`text-[12px] text-gray-600 leading-relaxed ${
                  !isExpanded && shouldTruncateEntrada ? 'line-clamp-2' : ''
                }`}>
                  {item.entrada}
                </p>
                {shouldTruncateEntrada && (
                  <button
                    onClick={() => onToggleExpansion(item.id)}
                    className="mt-1 text-[11px] text-[#2D728F] hover:text-[#235A6F]"
                  >
                    {isExpanded ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </div>
            ) : (
              <span className="text-[12px] text-gray-400 italic">No especificado</span>
            )}
          </div>
        </td>
        
        {/* Plato de Fondo */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden lg:table-cell">
          <div className="max-w-[200px] xl:max-w-[250px]">
            {item.plato_fondo ? (
              <div>
                <p className={`text-[12px] text-gray-600 leading-relaxed ${
                  !isExpanded && shouldTruncatePlatoFondo ? 'line-clamp-2' : ''
                }`}>
                  {item.plato_fondo}
                </p>
                {shouldTruncatePlatoFondo && !shouldTruncateEntrada && (
                  <button
                    onClick={() => onToggleExpansion(item.id)}
                    className="mt-1 text-[11px] text-[#2D728F] hover:text-[#235A6F]"
                  >
                    {isExpanded ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </div>
            ) : (
              <span className="text-[12px] text-gray-400 italic">No especificado</span>
            )}
          </div>
        </td>

        {/* Refresco */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden sm:table-cell">
          <div className="max-w-[120px]">
            {item.refresco ? (
              <span className="text-[12px] text-gray-600">{item.refresco}</span>
            ) : (
              <span className="text-[12px] text-gray-400 italic">-</span>
            )}
          </div>
        </td>

        {/* Dieta */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden xl:table-cell">
          <div className="max-w-[120px]">
            {item.dieta ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-[11px]">
                {item.dieta}
              </span>
            ) : (
              <span className="text-[12px] text-gray-400 italic">-</span>
            )}
          </div>
        </td>

        {/* Estado */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col items-center gap-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap ${
              item.active 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                item.active ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {item.active ? 'Activo' : 'Inactivo'}
            </span>
            
            {item.es_feriado && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 text-[11px]">
                Feriado
              </span>
            )}
          </div>
        </td>
        
        {/* Acciones */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 text-right">
          <div className="flex items-center justify-end gap-1">
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-[#2D728F] transition-colors rounded-lg hover:bg-gray-100"
                title="Ver pedido"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            
            <button
              onClick={() => onToggleStatus?.(item)}
              className={`p-2 transition-colors rounded-lg ${
                item.active
                  ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
              }`}
              title={item.active ? 'Desactivar' : 'Activar'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={item.active 
                        ? "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
              </svg>
            </button>

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
              <th 
                className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[120px] w-[140px] cursor-pointer hover:bg-gray-200/50 transition-colors"
                onClick={() => onSort('fecha')}
              >
                <div className="flex items-center">
                  Fecha
                  <SortIcon field="fecha" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell min-w-[200px] max-w-[250px]">
                Entrada
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell min-w-[200px] max-w-[250px]">
                Plato de Fondo
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell min-w-[100px] w-[120px]">
                Refresco
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-center text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell min-w-[120px] w-[140px]">
                Dieta
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-center text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[120px] w-[140px]">
                Estado
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-right text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[140px] w-[160px]">
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

AlmuerzoTableView.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortField: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc', null]),
  expandedRows: PropTypes.instanceOf(Set).isRequired,
  onSort: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleExpansion: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func,
  className: PropTypes.string,
};

export default React.memo(AlmuerzoTableView);
