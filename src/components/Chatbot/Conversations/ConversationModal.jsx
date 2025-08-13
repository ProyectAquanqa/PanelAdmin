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

  const getUserInitials = (user) => {
    if (!user || !user.username) return 'A';
    if (user.first_name) return user.first_name.charAt(0).toUpperCase();
    return user.username.charAt(0).toUpperCase();
  };

  const getUserDisplayName = (conversation) => {
    // El backend ya envía user_full_name calculado correctamente
    return conversation.user_full_name || 'Usuario Anónimo';
  };

  const getUserEmail = (conversation) => {
    return conversation.user?.email || conversation.user_email || 'Sin email registrado';
  };



  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
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
                <span className="text-[13px] text-gray-500 font-mono">#{conversation.id}</span>
                
                <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-blue-100/50 text-blue-600 border border-blue-200/50">
                  {getUserDisplayName(conversation)}
                </span>

                {conversation.session_id && (
                  <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-slate-500"></div>
                    {conversation.session_id.substring(0, 8)}...
                  </span>
                )}
              </div>

              {/* Pregunta del Usuario - Protagonista */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Pregunta del Usuario</h5>
                </div>
                <div className="p-3">
                  <p className="text-[13px] text-gray-900 leading-relaxed font-medium whitespace-pre-wrap">
                    {(conversation.question_text || 'Sin pregunta registrada').replace(/[''‚‛""„‟«»]/g, '"').replace(/[–—]/g, '-')}
                  </p>
                </div>
              </div>

              {/* Respuesta del Chatbot - Protagonista */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Respuesta del Chatbot</h5>
                </div>
                <div className="p-3">
                  <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {(conversation.answer_text || 'No se generó respuesta').replace(/[''‚‛""„‟«»]/g, '"').replace(/[–—]/g, '-')}
                  </p>
                </div>
              </div>

              {/* Fechas sutiles */}
              <div className="text-[13px] text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-4">
                  <span>Creado: {formatDate(conversation.created_at)}</span>
                  {conversation.updated_at && conversation.updated_at !== conversation.created_at && (
                    <span>Actualizado: {formatDate(conversation.updated_at)}</span>
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

export default ConversationModal;