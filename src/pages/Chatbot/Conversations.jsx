import React, { useEffect, useState } from 'react';
import { useChatbot } from '../../hooks/useChatbot';

/**
 * Página de gestión de conversaciones del chatbot
 * Implementa el submódulo 1: "Vista General de Conversaciones"
 */
const Conversations = () => {
  const {
    conversations,
    loading,
    pagination,
    fetchConversations,
    deleteConversation
  } = useChatbot();

  const [filters, setFilters] = useState({
    user: '',
    date: '',
    status: 'all'
  });

  useEffect(() => {
    fetchConversations(1);
  }, [fetchConversations]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      await deleteConversation(id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          💬 Conversaciones del Chatbot
        </h1>
        <p className="text-gray-600">
          Gestiona y revisa todas las conversaciones entre usuarios y el chatbot
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filtros</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              placeholder="Buscar por usuario..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D728F] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D728F] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D728F] focus:border-transparent"
            >
              <option value="all">Todas</option>
              <option value="active">Activas</option>
              <option value="resolved">Resueltas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Historial de Conversaciones ({pagination.conversations.total || 0})
          </h2>
        </div>

        {loading.conversations ? (
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="flex space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : conversations.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-[#2D728F] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {conversation.user?.username?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {conversation.user?.username || 'Usuario Anónimo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(conversation.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-900 mb-1">Pregunta:</p>
                        <p className="text-sm text-blue-800">{conversation.question_text}</p>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-green-900 mb-1">Respuesta:</p>
                        <p className="text-sm text-green-800">{conversation.answer_text}</p>
                      </div>
                      
                      {conversation.matched_knowledge && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>🎯 Coincidencia encontrada</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            ID: {conversation.matched_knowledge}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completada
                    </span>
                    
                    <button
                      onClick={() => handleDelete(conversation.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay conversaciones
            </h3>
            <p className="text-gray-500">
              Las conversaciones del chatbot aparecerán aquí cuando los usuarios interactúen con el bot.
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.conversations.total > pagination.conversations.limit && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Mostrando {Math.min(pagination.conversations.limit, pagination.conversations.total)} de {pagination.conversations.total} conversaciones
              </p>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchConversations(pagination.conversations.current - 1)}
                  disabled={pagination.conversations.current <= 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Anterior
                </button>
                <button
                  onClick={() => fetchConversations(pagination.conversations.current + 1)}
                  disabled={pagination.conversations.current * pagination.conversations.limit >= pagination.conversations.total}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations; 