/**
 * Modal para ver detalles de una notificación
 * Diseño minimalista profesional siguiendo el patrón de ConversationModal
 */

import React from 'react';
import PropTypes from 'prop-types';

const NotificationDetailModal = ({ 
  show, 
  onClose, 
  notification,
  loading = false 
}) => {
  if (!show || !notification) return null;

  const formatDate = (dateString) => {
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
    const isRead = notification.leida || notification.leido;
    
    if (isRead) {
      return {
        status: 'Leída',
        color: 'green',
        description: 'Esta notificación ha sido leída por el usuario'
      };
    } else {
      return {
        status: 'No leída',
        color: 'gray',
        description: 'Esta notificación aún no ha sido leída'
      };
    }
  };

  const getEventInfo = () => {
    if (notification.evento) {
      return {
        type: 'Automática',
        source: notification.evento.titulo || 'Evento sin título',
        description: 'Generada automáticamente por un evento del sistema'
      };
    } else {
      return {
        type: 'Manual',
        source: 'Creada manualmente',
        description: 'Notificación creada manualmente por un administrador'
      };
    }
  };

  const statusInfo = getStatusInfo();
  const eventInfo = getEventInfo();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                Detalles de la Notificación
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                Información completa sobre esta notificación del sistema
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
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Información</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[13px] text-gray-500 mb-1">Fecha de Creación</p>
                      <p className="text-[13px] font-medium text-gray-900">
                        {formatDate(notification.fecha_creacion || notification.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[13px] text-gray-500 mb-1">ID de Notificación</p>
                      <p className="text-[13px] font-mono text-gray-700">
                        #{notification.id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Estado</h4>
                  <div className="space-y-3">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium border whitespace-nowrap ${
                        statusInfo.status === 'Leída' ? 'bg-green-50 text-green-600 border-green-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          statusInfo.status === 'Leída' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        {statusInfo.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-[13px] text-gray-500 mb-1">Tipo</p>
                      <p className="text-[13px] text-gray-700">
                        {eventInfo.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-[13px] text-gray-500 mb-1">Origen</p>
                      <p className="text-[13px] text-gray-600">
                        {eventInfo.source}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido de la Notificación */}
              <div className="space-y-4">
                <h4 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Contenido de la Notificación</h4>
                
                {/* Título */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Título</h5>
                  </div>
                  <div className="p-4">
                    <p className="text-[13px] text-gray-900 leading-relaxed whitespace-pre-wrap font-semibold">
                      {notification.titulo || 'Sin título'}
                    </p>
                  </div>
                </div>

                {/* Mensaje */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Mensaje</h5>
                  </div>
                  <div className="p-4">
                    {notification.mensaje ? (
                      <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                        {notification.mensaje}
                      </p>
                    ) : (
                      <p className="text-[13px] text-gray-400 italic">
                        Sin mensaje de contenido
                      </p>
                    )}
                  </div>
                </div>

                {/* Información del Evento (si existe) */}
                {notification.evento && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Información Técnica</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                      <div>
                        <span className="text-gray-500 block mb-1">Título del Evento</span>
                        <span className="text-gray-700">{notification.evento.titulo || 'Sin título'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">ID del Evento</span>
                        <span className="font-mono text-gray-700">#{notification.evento.id}</span>
                      </div>
                      {notification.evento.autor && (
                        <div>
                          <span className="text-gray-500 block mb-1">Autor del Evento</span>
                          <span className="text-gray-700">{notification.evento.autor.full_name || 'Sin autor'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Datos adicionales (si existen) */}
                {notification.datos && Object.keys(notification.datos).length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                        Datos Adicionales
                      </h5>
                    </div>
                    <div className="p-4">
                      <pre className="text-[13px] text-gray-600 bg-gray-50 p-3 rounded border overflow-x-auto">
                        {JSON.stringify(notification.datos, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer con botón */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl flex-shrink-0">
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

NotificationDetailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  notification: PropTypes.shape({
    id: PropTypes.number,
    titulo: PropTypes.string,
    mensaje: PropTypes.string,
    fecha_creacion: PropTypes.string,
    created_at: PropTypes.string,
    leida: PropTypes.bool,
    leido: PropTypes.bool,
    evento: PropTypes.object,
    datos: PropTypes.object
  }),
  loading: PropTypes.bool
};

export default NotificationDetailModal;
