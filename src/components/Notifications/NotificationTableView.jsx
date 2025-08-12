import React from 'react';
import PropTypes from 'prop-types';
import notificationsService from '../../services/notificationsService';

/**
 * Tabla específica para Notificaciones
 * Muestra campos reales del backend: titulo, mensaje, destinatario, tipo, fecha, evento
 */
const NotificationTableView = ({
  data,
  onEdit,
  onDelete,
  // Props no usados pero mantenidos para compatibilidad con DataViewSwitcher
  sortField,
  sortDirection,
  expandedRows,
  onSort,
  onToggleExpansion,
  onTogglePublish,
  onTogglePin,
}) => {
  // Funciones de validación del servicio
  const canEdit = (item) => notificationsService.canEdit(item);
  const canDelete = (item) => notificationsService.canDelete(item);
  const isAutomatic = (item) => notificationsService.isAutomatic(item);
  const isSent = (item) => notificationsService.isSent(item);
  const renderMobileCard = (item) => {
    const recipientName = item.recipient || (item.destinatario
      ? `${item.destinatario.first_name || ''} ${item.destinatario.last_name || ''}`.trim() || item.destinatario.username
      : 'Todos');

    const tipoDisplay = item.tipo_display || (item.tipo === 'individual' ? 'Individual' : 'Broadcast');
    const fecha = item.fecha_creacion || item.created_at || item.date || '';
    const eventoTitulo = item.evento_title || item.evento?.titulo || '';

    return (
      <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
        {/* Título */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">{item.titulo}</h4>
        </div>

        {/* Mensaje */}
        {item.mensaje && (
          <div className="border-l-4 border-slate-200 pl-3">
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{item.mensaje}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Tipo */}
          <span className={`inline-flex items-center px-2 py-1 rounded-full border text-[11px] font-medium ${
            item.tipo === 'individual' 
              ? 'bg-slate-50 text-slate-700 border-slate-200' 
              : 'bg-purple-50 text-purple-700 border-purple-200'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              item.tipo === 'individual' ? 'bg-slate-500' : 'bg-purple-500'
            }`}></div>
            {tipoDisplay}
          </span>
          
          {/* Destinatario */}
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-[11px] font-medium">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {recipientName}
          </span>

          {/* Fecha */}
          <span className="text-[11px] text-gray-500">{fecha ? new Date(fecha).toLocaleDateString() : '-'}</span>
        </div>

        {/* Evento si existe */}
        {eventoTitulo && (
          <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
            <span className="font-medium">Evento:</span> {eventoTitulo}
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          {/* Mostrar botón editar solo si es manual y no enviada */}
          {canEdit(item) && (
            <button
              onClick={() => onEdit?.(item)}
              className="p-2 text-gray-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
              title="Editar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {/* Mostrar botón eliminar solo si es manual */}
          {canDelete(item) && (
            <button
              onClick={() => onDelete?.(item.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
              title="Eliminar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          
          {/* Mostrar icono de solo lectura si es automática */}
          {isAutomatic(item) && (
            <div 
              className="p-2 text-gray-300 rounded-lg"
              title="Notificación automática de evento - Solo lectura"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          )}
          
          {/* Si no tiene acciones disponibles, mostrar mensaje */}
          {!canEdit(item) && !canDelete(item) && !isAutomatic(item) && (
            <span className="text-gray-400 text-xs">Sin acciones</span>
          )}
        </div>
      </div>
    );
  };

  const renderRow = (item) => {
    const recipientName = item.recipient || (item.destinatario
      ? `${item.destinatario.first_name || ''} ${item.destinatario.last_name || ''}`.trim() || item.destinatario.username
      : 'Todos');

    const tipoDisplay = item.tipo_display || (item.tipo === 'individual' ? 'Individual' : 'Broadcast');
    const fecha = item.fecha_creacion || item.created_at || item.date || '';
    const eventoTitulo = item.evento_title || item.evento?.titulo || '';

    return (
      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
        {/* Título */}
        <td className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-100 align-top">
          <div className="max-w-[200px] lg:max-w-[250px]">
            <div className="text-[13px] font-semibold text-gray-800 line-clamp-2" title={item.titulo}>
              {item.titulo}
            </div>
          </div>
        </td>
        
        {/* Mensaje */}
        <td className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-100 hidden sm:table-cell align-top">
          <div className="max-w-[250px] lg:max-w-[300px]">
            {item.mensaje ? (
              <div className="text-[12px] text-gray-600 line-clamp-3 leading-relaxed" title={item.mensaje}>
                {item.mensaje}
              </div>
            ) : (
              <span className="text-[12px] text-gray-400 italic">Sin mensaje</span>
            )}
          </div>
        </td>
        
        {/* Destinatario */}
        <td className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-100 hidden md:table-cell align-top">
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium bg-slate-50 text-slate-700 border border-slate-200 whitespace-nowrap max-w-[140px] truncate" title={recipientName}>
              <svg className="w-3 h-3 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {recipientName}
            </span>
          </div>
        </td>
        
        {/* Tipo */}
        <td className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-100 hidden lg:table-cell align-top">
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium border whitespace-nowrap ${
              item.tipo === 'individual' 
                ? 'bg-slate-50 text-slate-700 border-slate-200' 
                : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                item.tipo === 'individual' ? 'bg-slate-500' : 'bg-purple-500'
              }`}></div>
              {tipoDisplay}
            </span>
          </div>
        </td>
        
        {/* Fecha */}
        <td className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-100 hidden xl:table-cell align-top">
          <div className="text-[12px] text-gray-600 whitespace-nowrap">
            {fecha ? (
              <div>
                <div>{new Date(fecha).toLocaleDateString()}</div>
                <div className="text-[11px] text-gray-400">{new Date(fecha).toLocaleTimeString()}</div>
              </div>
            ) : '-'}
          </div>
        </td>
        
        {/* Evento */}
        <td className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-100 hidden 2xl:table-cell align-top">
          <div className="max-w-[140px]">
            {eventoTitulo ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap truncate" title={eventoTitulo}>
                <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h6l2 2h6a2 2 0 012 2v4m-6 12H6a2 2 0 01-2-2v-7h16v7a2 2 0 01-2 2z" />
                </svg>
                {eventoTitulo}
              </span>
            ) : (
              <span className="text-[12px] text-gray-400">-</span>
            )}
          </div>
        </td>
        
        {/* Acciones */}
        <td className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-100 text-right align-top">
          <div className="flex items-center justify-end gap-2">
            {/* Mostrar botón editar solo si es manual y no enviada */}
            {canEdit(item) && (
              <button
                onClick={() => onEdit?.(item)}
                className="p-2 text-gray-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
                title="Editar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            {/* Mostrar botón eliminar solo si es manual */}
            {canDelete(item) && (
              <button
                onClick={() => onDelete?.(item.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                title="Eliminar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            
            {/* Mostrar icono de solo lectura si es automática */}
            {isAutomatic(item) && (
              <div 
                className="p-2 text-gray-300 rounded-lg"
                title="Notificación automática de evento - Solo lectura"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            )}
            
            {/* Si no tiene acciones disponibles, mostrar guión */}
            {!canEdit(item) && !canDelete(item) && !isAutomatic(item) && (
              <span className="text-gray-400 text-sm">-</span>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="w-full">
      {/* Vista móvil - Cards */}
      <div className="block md:hidden space-y-3">
        {data.map(renderMobileCard)}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-gray-300 table-auto">
          <thead className="bg-[#F2F3F5] border-b border-slate-300/60">
            <tr>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-[13px] font-semibold text-gray-600 uppercase tracking-wider min-w-[200px] lg:min-w-[250px]">Título</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-[13px] font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell min-w-[250px] lg:min-w-[300px]">Mensaje</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-[13px] font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell min-w-[160px]">Destinatario</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-[13px] font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell min-w-[120px]">Tipo</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-[13px] font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell min-w-[140px]">Fecha</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-[13px] font-semibold text-gray-600 uppercase tracking-wider hidden 2xl:table-cell min-w-[160px]">Evento</th>
              <th className="px-3 sm:px-4 md:px-6 py-3 text-right text-[13px] font-semibold text-gray-600 uppercase tracking-wider min-w-[100px]">Acciones</th>
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
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  sortField: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc', null]),
  expandedRows: PropTypes.instanceOf(Set),
  onSort: PropTypes.func,
  onToggleExpansion: PropTypes.func,
  onTogglePublish: PropTypes.func,
  onTogglePin: PropTypes.func,
};

export default React.memo(NotificationTableView);


