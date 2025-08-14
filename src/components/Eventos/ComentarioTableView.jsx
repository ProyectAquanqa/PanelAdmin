/**
 * Vista de tabla específica para Comentarios
 * Basado en EventoTableView adaptado para comentarios con solo ver/eliminar
 */

import React from 'react';
import PropTypes from 'prop-types';
import SortIcon from '../Common/DataView/SortIcon';

/**
 * Componente ComentarioTableView - Vista de tabla para comentarios
 */
const ComentarioTableView = ({
  data,
  sortField,
  sortDirection,
  onSort,
  onDelete,
  onViewDetails,
  className = ''
}) => {
  /**
   * Trunca el contenido del comentario para mostrar en la tabla
   */
  const truncateContent = (content, maxLength = 80) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return `${content.substring(0, maxLength)}...`;
  };

  /**
   * Renderiza una fila de la tabla para móvil (card layout)
   */
  const renderMobileCard = (item, index) => {
    return (
      <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
        {/* Contenido del comentario */}
        <div>
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
            {item.contenido}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Usuario */}
          {item.usuario?.full_name && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 max-w-[150px]">
              <span className="truncate">{item.usuario.full_name}</span>
            </span>
          )}

          {/* Evento */}
          {item.evento?.titulo && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200 max-w-[150px]">
              <span className="truncate">{item.evento.titulo}</span>
            </span>
          )}
          


          {/* Fecha */}
          {item.created_at && (
            <span className="text-gray-500">
              {new Date(item.created_at).toLocaleDateString('es-ES', {
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
            onClick={() => onDelete?.(item)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
            title="Eliminar comentario"
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
        {/* Contenido del comentario */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[350px]">
            <p className="text-[13px] text-gray-700 leading-relaxed line-clamp-3" title={item.contenido}>
              {item.contenido}
            </p>
          </div>
        </td>
        
        {/* Usuario */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden md:table-cell">
          <div className="flex items-center">
            {item.usuario?.full_name ? (
              <span className="text-[12px] text-gray-600 font-medium max-w-[120px] truncate" title={item.usuario.full_name}>
                {item.usuario.full_name}
              </span>
            ) : (
              <span className="text-[12px] text-gray-400 italic">-</span>
            )}
          </div>
        </td>

        {/* Evento */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden lg:table-cell">
          <div className="flex items-center">
            {item.evento?.titulo ? (
              <span className="text-[12px] text-gray-600 max-w-[150px] truncate" title={item.evento.titulo}>
                {item.evento.titulo}
              </span>
            ) : (
              <span className="text-[12px] text-gray-400 italic">Sin evento</span>
            )}
          </div>
        </td>



        {/* Fecha de creación */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden xl:table-cell">
          <div className="flex items-center">
            {item.created_at ? (
              <div className="text-[12px] text-gray-600">
                <div>{new Date(item.created_at).toLocaleDateString()}</div>
                <div className="text-[11px] text-gray-400">{new Date(item.created_at).toLocaleTimeString()}</div>
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
              onClick={() => onDelete?.(item)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
              title="Eliminar comentario"
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
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[200px] md:min-w-[250px] lg:min-w-[300px] w-[40%]">
                Contenido
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell min-w-[100px] w-[15%]">
                Usuario
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell min-w-[120px] w-[25%]">
                Evento
              </th>
              <th 
                className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell min-w-[100px] w-[15%] cursor-pointer hover:bg-gray-200/50 transition-colors"
                onClick={() => onSort?.('created_at')}
              >
                <div className="flex items-center">
                  Fecha
                  <SortIcon field="created_at" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-right text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[80px] w-[10%]">
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

ComentarioTableView.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    contenido: PropTypes.string.isRequired,
    is_active: PropTypes.bool,
    created_at: PropTypes.string,
    usuario: PropTypes.shape({
      full_name: PropTypes.string,
      username: PropTypes.string
    }),
    evento: PropTypes.shape({
      titulo: PropTypes.string
    })
  })).isRequired,
  sortField: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc', null]),
  onSort: PropTypes.func,
  onDelete: PropTypes.func,
  onViewDetails: PropTypes.func,
  className: PropTypes.string,
};

export default React.memo(ComentarioTableView);
