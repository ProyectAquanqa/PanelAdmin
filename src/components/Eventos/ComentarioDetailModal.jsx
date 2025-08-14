/**
 * Modal para ver detalles de un comentario
 * Diseño exactamente igual al de EventoDetailModal
 */

import React from 'react';

const ComentarioDetailModal = ({ 
  show, 
  onClose, 
  comentario,
  loading = false 
}) => {
  if (!show || !comentario) return null;

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
    if (comentario.is_active) {
      return {
        status: 'Activo',
        color: 'green',
        description: 'Comentario visible para los usuarios'
      };
    } else {
      return {
        status: 'Inactivo',
        color: 'gray',
        description: 'Comentario oculto para los usuarios'
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
                Detalles del Comentario
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                Información completa sobre el comentario y su autor
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
                <span className="text-[13px] text-gray-500 font-mono">#{comentario.id}</span>
                
                {comentario.evento && (
                  <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-blue-100/50 text-blue-600 border border-blue-200/50">
                    {comentario.evento.titulo}
                  </span>
                )}
                
                <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium border whitespace-nowrap ${
                  statusInfo.status === 'Activo' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                  'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    statusInfo.status === 'Activo' ? 'bg-slate-500' : 'bg-gray-400'
                  }`}></div>
                  {statusInfo.status}
                </span>

                {comentario.created_at && (
                  <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-slate-500"></div>
                    {formatDate(comentario.created_at)}
                  </span>
                )}

                {comentario.usuario && (
                  <span className="text-[13px] text-gray-500">
                    por {comentario.usuario.full_name || comentario.usuario.username || 'Usuario'}
                  </span>
                )}
              </div>

              {/* Contenido del Comentario - Protagonista */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Contenido del Comentario</h5>
                </div>
                <div className="p-3">
                  <p className="text-[13px] text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {comentario.contenido || 'Sin contenido disponible'}
                  </p>
                </div>
              </div>

              {/* Información del Usuario */}
              {comentario.usuario && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Usuario que Comentó</h5>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-3">
                      {comentario.usuario.foto_perfil && (
                        <img 
                          src={comentario.usuario.foto_perfil} 
                          alt="Foto de perfil"
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <p className="text-[13px] font-medium text-gray-900">
                          {comentario.usuario.full_name || comentario.usuario.username}
                        </p>
                        {comentario.usuario.username && comentario.usuario.full_name && (
                          <p className="text-[12px] text-gray-500">
                            @{comentario.usuario.username}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Información del Evento */}
              {comentario.evento && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Evento Relacionado</h5>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-[13px] text-gray-900 font-medium">
                        {comentario.evento.titulo}
                      </p>
                      <span className="text-[12px] text-gray-500">
                        (ID: #{comentario.evento.id})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Fechas sutiles */}
              <div className="text-[13px] text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-4">
                  <span>Creado: {formatCreatedDate(comentario.created_at)}</span>
                  {comentario.updated_at && comentario.updated_at !== comentario.created_at && (
                    <span>Actualizado: {formatCreatedDate(comentario.updated_at)}</span>
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

export default ComentarioDetailModal;