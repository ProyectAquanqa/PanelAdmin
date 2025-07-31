/**
 * Modal para ver detalles de una conversación
 * Diseño minimalista profesional con colores slate
 */

import React from 'react';

const ConversationModal = ({ 
  show, 
  onClose, 
  conversation,
  loading = false 
}) => {
  if (!show || !conversation) return null;

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

  const getUserInitials = (username) => {
    if (!username) return 'A';
    return username.charAt(0).toUpperCase();
  };

  const getStatusInfo = () => {
    const hasAnswer = conversation.answer_text && conversation.answer_text.trim();
    const isMatched = conversation.matched_knowledge;
    
    if (hasAnswer && isMatched) {
      return {
        status: 'Completada',
        color: 'green',
        description: 'Conversación completada exitosamente con coincidencia en la base de conocimientos'
      };
    } else if (hasAnswer) {
      return {
        status: 'Respondida',
        color: 'yellow',
        description: 'Conversación respondida pero sin coincidencia específica'
      };
    } else {
      return {
        status: 'Fallida',
        color: 'red',
        description: 'No se pudo generar una respuesta para esta conversación'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                Detalles de la Conversación
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                Información completa sobre la interacción del usuario con el chatbot
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
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-32 bg-slate-200 rounded"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Información del Usuario y Sesión */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Usuario</h4>
                  <div className="space-y-2">
                    <p className="text-[13px] font-medium text-gray-900">
                      {conversation.user?.username || 'Usuario Anónimo'}
                    </p>
                    <p className="text-[13px] text-gray-500">
                      {conversation.user?.email || 'Sin email registrado'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Estado</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[13px] text-gray-500 mb-1">ID de Sesión</p>
                      <p className="text-[13px] font-mono text-gray-700 break-all">
                        {conversation.session_id ? conversation.session_id.substring(0, 20) + '...' : 'No disponible'}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium border whitespace-nowrap ${
                        statusInfo.status === 'Completada' ? 'bg-green-50 text-green-600 border-green-200' :
                        statusInfo.status === 'Respondida' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          statusInfo.status === 'Completada' ? 'bg-green-500' :
                          statusInfo.status === 'Respondida' ? 'bg-amber-500' :
                          'bg-gray-400'
                        }`}></div>
                        {statusInfo.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversación */}
              <div className="space-y-4">
                <h4 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Contenido de la Conversación</h4>
                
                {/* Pregunta */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Pregunta del Usuario</h5>
                  </div>
                  <div className="p-4">
                    <p className="text-[13px] text-gray-900 leading-relaxed whitespace-pre-wrap font-semibold">
                      {conversation.question_text || 'Sin pregunta registrada'}
                    </p>
                  </div>
                </div>

                {/* Respuesta */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Respuesta del Chatbot</h5>
                  </div>
                  <div className="p-4">
                    <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                      {conversation.answer_text || 'No se generó respuesta'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información técnica */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Información Técnica</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <span className="text-gray-500 block mb-1">ID de Conversación</span>
                    <span className="font-mono text-gray-700">#{conversation.id || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Conocimiento</span>
                    {conversation.matched_knowledge ? (
                      <span className="font-mono text-gray-700">#{conversation.matched_knowledge}</span>
                    ) : (
                      <span className="text-gray-500 italic">Sin coincidencia</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Fecha de creación</span>
                    <span className="text-gray-700">{formatDate(conversation.created_at)}</span>
                  </div>
                  {conversation.updated_at && conversation.updated_at !== conversation.created_at && (
                    <div>
                      <span className="text-gray-500 block mb-1">Última actualización</span>
                      <span className="text-gray-700">{formatDate(conversation.updated_at)}</span>
                    </div>
                  )}
                </div>
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

export default ConversationModal;