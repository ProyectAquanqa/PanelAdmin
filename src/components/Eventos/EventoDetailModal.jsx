/**
 * Modal para ver detalles de un evento
 * Diseño basado en ConversationModal con adaptaciones para eventos
 */

import React from 'react';

const EventoDetailModal = ({ 
  show, 
  onClose, 
  evento,
  loading = false 
}) => {
  if (!show || !evento) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCreatedDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusInfo = () => {
    if (evento.publicado) {
      return {
        status: 'Publicado',
        color: 'green',
        description: 'Evento publicado y visible para los usuarios'
      };
    } else {
      return {
        status: 'Borrador',
        color: 'gray',
        description: 'Evento en borrador, no visible para los usuarios'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                Detalles del Evento
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                Información completa sobre el evento y sus notificaciones
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-lg p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido Principal con scroll controlado */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header con info básica en una línea */}
              <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-gray-200">
                <span className="text-[13px] text-gray-500 font-mono">#{evento.id}</span>
                
                {evento.categoria && (
                  <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-blue-100/50 text-blue-600 border border-blue-200/50">
                    {evento.categoria.nombre}
                  </span>
                )}
                
                <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium border whitespace-nowrap ${
                  statusInfo.status === 'Publicado' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                  'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    statusInfo.status === 'Publicado' ? 'bg-slate-500' : 'bg-gray-400'
                  }`}></div>
                  {statusInfo.status}
                </span>

                {evento.fecha && (
                  <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-slate-500"></div>
                    {formatDate(evento.fecha)}
                  </span>
                )}

                {evento.autor && (
                  <span className="text-[13px] text-gray-500">
                    por {evento.autor.full_name || evento.autor.username || 'Usuario'}
                  </span>
                )}
              </div>

              {/* Título del Evento - Protagonista */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Título del Evento</h5>
                </div>
                <div className="p-3">
                  <p className="text-[13px] text-gray-900 leading-relaxed font-medium">
                    {evento.titulo || 'Sin título definido'}
                  </p>
                </div>
              </div>

              {/* Descripción - Protagonista */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Descripción del Evento</h5>
                </div>
                <div className="p-3">
                  <p className="text-[13px] text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {evento.descripcion || 'Sin descripción disponible'}
                  </p>
                </div>
              </div>

              {/* Imagen del Evento - Si existe */}
              {evento.imagen && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Imagen del Evento</h5>
                  </div>
                  <div className="p-3">
                    <div className="flex justify-center">
                      <img 
                        src={evento.imagen} 
                        alt={evento.titulo || 'Imagen del evento'}
                        className="max-w-full h-auto max-h-32 rounded-lg shadow-sm border border-gray-200 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="hidden text-center py-8">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-[13px] text-gray-500">Error al cargar la imagen</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Datos Adicionales - Si existen */}
              {evento.datos && Object.keys(evento.datos).length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Datos Adicionales</h5>
                  </div>
                  <div className="p-3">
                    <pre className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded border">
                      {JSON.stringify(evento.datos, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Fechas sutiles */}
              <div className="text-[13px] text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-4">
                  <span>Creado: {formatCreatedDate(evento.created_at)}</span>
                  {evento.updated_at && evento.updated_at !== evento.created_at && (
                    <span>Actualizado: {formatCreatedDate(evento.updated_at)}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botón */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 rounded-b-xl flex-shrink-0">
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventoDetailModal;
