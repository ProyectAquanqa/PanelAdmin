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
        description: 'Generada automáticamente por un evento del sistema',
        hasEvent: true,
        title: notification.evento.titulo,
        date: notification.evento.fecha ? formatDate(notification.evento.fecha) : 'Sin fecha definida',
        image: notification.evento.imagen
      };
    } else {
      return {
        type: 'Manual',
        source: 'Creada manualmente',
        description: 'Notificación creada manualmente por un administrador',
        hasEvent: false
      };
    }
  };

  const statusInfo = getStatusInfo();
  const eventInfo = getEventInfo();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                Detalles de la Notificación
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                Información completa sobre la notificación enviada
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
                <span className="text-[13px] text-gray-500 font-mono">#{notification.id}</span>
                
                <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium border whitespace-nowrap ${
                  statusInfo.status === 'Leída' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                  'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    statusInfo.status === 'Leída' ? 'bg-slate-500' : 'bg-gray-400'
                  }`}></div>
                  {statusInfo.status}
                </span>

                <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-blue-100/50 text-blue-600 border border-blue-200/50">
                  {eventInfo.type}
                </span>

                <span className="text-[13px] text-gray-500">
                  {formatDate(notification.fecha_creacion || notification.created_at)}
                </span>
              </div>

              {/* Título - Protagonista */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Título de la Notificación</h5>
                </div>
                <div className="p-3">
                  <p className="text-[13px] text-gray-900 leading-relaxed font-medium">
                    {notification.titulo || 'Sin título definido'}
                  </p>
                </div>
              </div>

              {/* Mensaje - Protagonista */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Mensaje de la Notificación</h5>
                </div>
                <div className="p-3">
                  <p className="text-[13px] text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {notification.mensaje || 'Sin mensaje disponible'}
                  </p>
                </div>
              </div>

              {/* Información del Evento (si existe) */}
              {eventInfo.hasEvent && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Información del Evento</h5>
                  </div>
                  <div className="p-3 space-y-3">
                    <div>
                      <p className="text-[13px] text-gray-500 mb-1">Título del Evento</p>
                      <p className="text-[13px] font-medium text-gray-900">
                        {eventInfo.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-[13px] text-gray-500 mb-1">Fecha del Evento</p>
                      <p className="text-[13px] text-gray-700">
                        {eventInfo.date}
                      </p>
                    </div>
                    {eventInfo.image && (
                      <div>
                        <p className="text-[13px] text-gray-500 mb-2">Imagen del Evento</p>
                        <img 
                          src={eventInfo.image} 
                          alt="Imagen del evento"
                          className="w-full max-w-sm h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
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