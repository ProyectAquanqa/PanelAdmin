/**
 * Tabla específica para conversaciones del chatbot
 * Siguiendo exactamente el diseño y colores pizarra de KnowledgeBase
 */

import React from 'react';
import { Pagination } from '../../Common/DataView';
import LoadingStates from './LoadingStates';

const ConversationTable = ({
  data,
  loading,
  totalItems,
  sortField,
  sortDirection,
  pagination,
  pageNumbers,
  displayRange,
  navigation,
  onSort,
  onPageChange,
  onView,
  onDelete
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    return conversation.user_email || 'Sin email registrado';
  };

  const getStatusBadge = (conversation) => {
    const hasAnswer = conversation.answer_text && conversation.answer_text.trim();
    
    if (hasAnswer) {
      return (
        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium bg-slate-50 text-slate-600 border border-slate-200 whitespace-nowrap">
          <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-slate-500"></div>
          Exitosa
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium bg-gray-50 text-gray-600 border border-gray-200 whitespace-nowrap">
          <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-gray-400"></div>
          Sin respuesta
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <LoadingStates.EmptyState />;
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Tabla Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-gray-300 table-auto">
          <thead className="bg-[#F2F3F5] border-b border-slate-300/60">
            <tr>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell min-w-[120px]">
                ID Sesión
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[180px]">
                Usuario
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[300px]">
                Conversación
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell min-w-[100px]">
                Estado
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell min-w-[120px]">
                Fecha
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-right text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[100px]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((conversation) => (
              <tr key={conversation.id} className="hover:bg-gray-50 transition-colors">
                {/* ID Sesión */}
                <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden sm:table-cell">
                  <div className="text-[12px] font-mono text-gray-600 truncate">
                    {conversation.session_id ? conversation.session_id.substring(0, 12) + '...' : '-'}
                  </div>
                </td>

                {/* Usuario */}
                <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-gray-900 truncate">
                      {getUserDisplayName(conversation)}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {getUserEmail(conversation)}
                    </div>
                  </div>
                </td>

                {/* Conversación */}
                <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
                  <div className="space-y-2 max-w-sm">
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900 line-clamp-2 leading-relaxed">
                        {conversation.question_text || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-600 line-clamp-1 leading-relaxed italic">
                        {conversation.answer_text || 'Sin respuesta'}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Estado */}
                <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden sm:table-cell">
                  <div className="flex items-center">
                    {getStatusBadge(conversation)}
                  </div>
                </td>

                {/* Fecha */}
                <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden md:table-cell">
                  <div className="text-[12px] text-gray-600">
                    {formatDate(conversation.created_at)}
                  </div>
                </td>
                
                {/* Acciones */}
                <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView && onView(conversation)}
                      className="p-2 text-gray-400 hover:text-[#2D728F] transition-colors rounded-lg hover:bg-gray-100"
                      title="Ver detalles"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(conversation.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards Mobile - Siguiendo diseño KnowledgeBase */}
      <div className="block lg:hidden space-y-4 p-4">
        {data.map((conversation) => (
          <div key={conversation.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 hover:shadow-md transition-all duration-200">
            {/* Header con usuario */}
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-gray-900 truncate">
                  {getUserDisplayName(conversation)}
                </div>
                <div className="text-[11px] text-gray-500">
                  {getUserEmail(conversation)} • {formatDate(conversation.created_at)}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onView && onView(conversation)}
                  className="p-1.5 text-gray-400 hover:text-[#2D728F] transition-colors rounded-lg hover:bg-gray-100"
                  title="Ver detalles"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete && onDelete(conversation.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Pregunta */}
            <div>
              <div className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-2">Pregunta</div>
              <p className="text-[13px] font-medium text-gray-900 leading-relaxed">
                {conversation.question_text || '-'}
              </p>
            </div>

            {/* Respuesta */}
            <div>
              <div className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider mb-2">Respuesta</div>
              <p className="text-[13px] text-gray-700 leading-relaxed italic">
                {conversation.answer_text || 'Sin respuesta'}
              </p>
            </div>

            {/* Footer con estado */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                {getStatusBadge(conversation)}
              </div>
              {conversation.session_id && (
                <div className="text-[10px] font-mono text-gray-400 truncate max-w-[80px]">
                  {conversation.session_id.substring(0, 8)}...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Paginación - Siguiendo diseño KnowledgeBase */}
      {pagination && totalItems > pagination.itemsPerPage && (
        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <Pagination
            pagination={pagination}
            pageNumbers={pageNumbers}
            displayRange={displayRange}
            navigation={navigation}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ConversationTable;