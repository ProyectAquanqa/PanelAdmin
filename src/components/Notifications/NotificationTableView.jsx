import React from 'react';
import PropTypes from 'prop-types';
import notificationsService from '../../services/notificationsService';
import { normalizeText } from '../../utils/searchUtils';

/**
 * Tabla específica para Notificaciones
 * Muestra campos reales del backend: titulo, mensaje, destinatario, tipo, fecha, evento
 */
const NotificationTableView = ({
  data,
  onViewDetails, // Nueva función para ver detalles
  // Props no usados pero mantenidos para compatibilidad con DataViewSwitcher
  sortField,
  sortDirection,
  expandedRows,
  onSort,
  onToggleExpansion,
  onTogglePublish,
  onTogglePin,
}) => {

  // Funciones de validación del servicio (solo lectura)
  const isAutomatic = (item) => notificationsService.isAutomatic(item);
  const isRead = (item) => notificationsService.isRead(item);


  const renderMobileCard = (item) => {
    const recipientName = item.recipient || (item.destinatario
      ? `${item.destinatario.first_name || ''} ${item.destinatario.last_name || ''}`.trim() || item.destinatario.username
      : 'Todos');

    const tipoDisplay = item.tipo_display || (item.tipo === 'individual' ? 'Individual' : 'Broadcast');
    const fecha = item.fecha_creacion || item.created_at || item.date || '';
    const eventoTitulo = item.evento_title || item.evento?.titulo || '';

    return (
      <div key={item.id} className="bg-white border-l-4 border-l-blue-500 p-4 space-y-3 hover:bg-gray-50 transition-colors">
        {/* Título */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">{item.titulo}</h4>
        </div>

        {/* Mensaje */}
        {item.mensaje && (
          <div className="border-l-4 border-slate-200 pl-3">
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
              {item.mensaje}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Estado Leído */}
          <span className={`inline-flex items-center px-2 py-1 rounded-full border text-[13px] font-medium ${
            isRead(item)
              ? 'bg-slate-50 text-slate-600 border-slate-200' 
              : 'bg-gray-50 text-gray-500 border-gray-300'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              isRead(item) ? 'bg-slate-500' : 'bg-gray-400'
            }`}></div>
            {isRead(item) ? 'Leída' : 'No leída'}
          </span>

          {/* Fecha */}
          <span className="text-[11px] text-gray-500">{fecha ? new Date(fecha).toLocaleDateString() : '-'}</span>
          
          {/* Evento si existe */}
          {eventoTitulo && (
            <span className="inline-block text-blue-700 text-[12px] font-medium max-w-[200px] truncate" title={eventoTitulo}>
              {eventoTitulo}
            </span>
          )}
        </div>


      </div>
    );
  };

  const renderRow = (item) => {
    const fecha = item.fecha_creacion || item.created_at || item.date || '';
    const eventoTitulo = item.evento_title || item.evento?.titulo || '';

    return (
      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
        {/* Título */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 align-top">
          <div className="w-full min-w-0">
            <div className="text-[13px] font-bold text-gray-800 line-clamp-2 break-words" title={item.titulo}>
              {item.titulo}
            </div>
          </div>
        </td>
        
        {/* Mensaje */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden sm:table-cell align-top">
          <div className="max-w-[200px] min-w-0">
            {item.mensaje ? (
              <div className="text-[13px] text-gray-600 break-words line-clamp-2" title={item.mensaje}>
                {item.mensaje}
              </div>
            ) : (
              <span className="text-[13px] text-gray-400 italic">Sin mensaje</span>
            )}
          </div>
        </td>
        
        {/* Estado Leído */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden md:table-cell align-top">
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[13px] font-medium border whitespace-nowrap ${
              isRead(item)
                ? 'bg-slate-50 text-slate-600 border-slate-200' 
                : 'bg-gray-50 text-gray-500 border-gray-300'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                isRead(item) ? 'bg-slate-500' : 'bg-gray-400'
              }`}></div>
              {isRead(item) ? 'Leída' : 'No leída'}
            </span>
          </div>
        </td>
        
        {/* Evento */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden lg:table-cell align-top">
          <div className="max-w-[180px] min-w-0">
            {eventoTitulo ? (
              <div className="text-[13px] text-gray-900 break-words line-clamp-2" title={eventoTitulo}>
                {eventoTitulo}
              </div>
            ) : (
              <span className="text-[13px] text-gray-400">Manual</span>
            )}
          </div>
        </td>
        
        {/* Fecha */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden xl:table-cell align-top">
          <div className="text-[13px] text-gray-600 whitespace-nowrap">
            {fecha ? (
              <div>
                <div>{new Date(fecha).toLocaleDateString()}</div>
                <div className="text-[12px] text-gray-400">{new Date(fecha).toLocaleTimeString()}</div>
              </div>
            ) : '-'}
          </div>
        </td>
        
        {/* Acción Ver */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 text-center">
          <button
            onClick={() => onViewDetails?.(item)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-lg"
            title="Ver detalles"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
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
                      <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[200px] w-[30%]">Título</th>
                      <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell min-w-[150px] w-[20%]">Mensaje</th>
                      <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell min-w-[100px] w-[12%]">Estado</th>
                      <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell min-w-[150px] w-[22%]">Evento</th>
                      <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell min-w-[120px] w-[13%]">Fecha</th>
                      <th className="px-3 sm:px-4 md:px-6 py-4 text-center text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[60px] w-[3%]">Ver</th>
                    </tr>
                  </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map(renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

NotificationTableView.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onViewDetails: PropTypes.func,
  sortField: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc', null]),
  expandedRows: PropTypes.instanceOf(Set),
  onSort: PropTypes.func,
  onToggleExpansion: PropTypes.func,
  onTogglePublish: PropTypes.func,
  onTogglePin: PropTypes.func,
};

export default React.memo(NotificationTableView);


