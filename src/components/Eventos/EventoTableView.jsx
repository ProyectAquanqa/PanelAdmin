/**
 * Vista de tabla específica para Eventos
 * Basado en TableView de KnowledgeBase con responsive correcto
 */

import React from 'react';
import PropTypes from 'prop-types';
import SortIcon from '../Common/DataView/SortIcon';

/**
 * Componente EventoTableView - Vista de tabla para eventos
 */
const EventoTableView = ({
  data,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  onViewDetails,
  className = ''
}) => {
  /**
   * Renderiza una fila de la tabla para móvil (card layout)
   */
  const renderMobileCard = (item, index) => {
    return (
      <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
        {/* Título */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1 line-clamp-1">
            {item.titulo}
          </h4>
          {item.descripcion && (
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
              {item.descripcion}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Categoría */}
          {item.categoria?.nombre ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {item.categoria.nombre}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
              Sin categoría
            </span>
          )}
          
          {/* Estado */}
          <span className={`inline-flex items-center px-2 py-1 rounded-full border ${
            item.publicado 
              ? 'bg-slate-50 text-slate-600 border-slate-200' 
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              item.publicado ? 'bg-slate-500' : 'bg-gray-400'
            }`}></div>
            {item.publicado ? 'Publicado' : 'Borrador'}
          </span>

          {/* Autor */}
          {item.autor?.full_name && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 max-w-[150px]">
              <span className="truncate">Por: {item.autor.full_name}</span>
            </span>
          )}

          {/* Fecha */}
          {item.fecha && (
            <span className="text-gray-500">
              {new Date(item.fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-100">
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
    );
  };

  /**
   * Renderiza una fila de la tabla para desktop
   */
  const renderTableRow = (item, index) => {
    return (
      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
        {/* Título | Descripción */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[250px] xl:max-w-[280px]">
            <div className="mb-2">
              <p className="text-[13px] font-semibold text-gray-700 line-clamp-1 leading-relaxed">
                {item.titulo}
              </p>
            </div>
            {item.descripcion && (
              <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">
                {item.descripcion}
              </p>
            )}
          </div>
        </td>
        
        {/* Categoría */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden md:table-cell">
          <div className="flex items-center">
            {item.categoria?.nombre ? (
              <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium bg-blue-100/50 text-blue-600 border border-blue-200/50 whitespace-nowrap">
                {item.categoria.nombre}
              </span>
            ) : (
              <span className="text-[12px] text-gray-400 italic">Sin categoría</span>
            )}
          </div>
        </td>

        {/* Autor */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden lg:table-cell">
          <div className="flex items-center">
            {item.autor?.full_name ? (
              <span className="text-[12px] text-gray-600 font-medium max-w-[120px] truncate" title={item.autor.full_name}>
                {item.autor.full_name}
              </span>
            ) : (
              <span className="text-[12px] text-gray-400 italic">-</span>
            )}
          </div>
        </td>

        {/* Estado */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden sm:table-cell">
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium border whitespace-nowrap ${
              item.publicado 
                ? 'bg-slate-50 text-slate-600 border-slate-200' 
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                item.publicado ? 'bg-slate-500' : 'bg-gray-400'
              }`}></div>
              {item.publicado ? 'Publicado' : 'Borrador'}
            </span>
          </div>
        </td>

        {/* Fecha del Evento */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden xl:table-cell">
          <div className="flex items-center">
            {item.fecha ? (
              <div className="text-[12px] text-gray-600">
                <div>{new Date(item.fecha).toLocaleDateString()}</div>
                <div className="text-[11px] text-gray-400">{new Date(item.fecha).toLocaleTimeString()}</div>
              </div>
            ) : (
              <span className="text-[12px] text-gray-400 italic">-</span>
            )}
          </div>
        </td>
        
        {/* Acciones */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 text-right">
          <div className="flex items-center justify-end gap-2">
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
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[200px] md:min-w-[220px] lg:min-w-[250px] w-[30%]">
                Título | Descripción
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell min-w-[100px] w-[15%]">
                Categoría
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell min-w-[100px] w-[15%]">
                Autor
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell min-w-[80px] w-[12%]">
                Estado
              </th>
              <th 
                className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell min-w-[100px] w-[13%] cursor-pointer hover:bg-gray-200/50 transition-colors"
                onClick={() => onSort?.('fecha')}
              >
                <div className="flex items-center">
                  Fecha
                  <SortIcon field="fecha" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-right text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[100px] w-[15%]">
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

EventoTableView.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortField: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc', null]),
  onSort: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onViewDetails: PropTypes.func,
  className: PropTypes.string,
};

export default React.memo(EventoTableView);