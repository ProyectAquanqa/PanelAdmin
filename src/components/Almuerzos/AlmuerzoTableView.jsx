/**
 * Vista de tabla específica para Almuerzos
 * Basado en EventoTableView pero adaptado a los campos del modelo Almuerzo
 */

import React from 'react';
import PropTypes from 'prop-types';
import SortIcon from '../Common/DataView/SortIcon';

/**
 * Función helper para formatear fechas sin problemas de zona horaria
 */
const formatDateSafe = (dateString, options = {}) => {
  if (!dateString) return '';
  
  // Crear fecha directamente desde el string YYYY-MM-DD sin conversión de zona horaria
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
  
  return date.toLocaleDateString('es-ES', options);
};

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
  onViewDetails,
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
      <div key={item.id} className="bg-white border-l-4 border-l-blue-500 p-4 space-y-3 hover:bg-gray-50 transition-colors">
        {/* Fecha y día */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              {item.nombre_dia}
            </h4>
            <p className="text-xs text-gray-600">
              {formatDateSafe(item.fecha, {
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
                ? 'bg-slate-50 text-slate-600 border-slate-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                item.active ? 'bg-slate-500' : 'bg-red-500'
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
              onClick={() => onViewDetails?.(item)}
              className="p-2 text-gray-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Ver detalles"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
              {formatDateSafe(item.fecha, {
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
              <span className="text-[12px] text-gray-600">{item.dieta}</span>
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
                ? 'bg-slate-50 text-slate-600 border-slate-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                item.active ? 'bg-slate-500' : 'bg-red-500'
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
              onClick={() => onViewDetails?.(item)}
              className="p-2 text-gray-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Ver detalles"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
    <div className={`bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 ${className}`}>
      {/* Vista móvil - Cards */}
      <div className="block md:hidden">
        <div className="divide-y divide-gray-200">
          {data.map(renderMobileCard)}
        </div>
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
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
  onViewDetails: PropTypes.func,
  className: PropTypes.string,
};

export default React.memo(AlmuerzoTableView);