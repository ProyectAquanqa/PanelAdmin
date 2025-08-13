/**
 * Componente de tabla para mostrar conversaciones
 * Siguiendo el patrón de CategoryTableView
 */

import React from 'react';
import { TableView } from '../../Common/DataView';

const ConversationTableView = ({
  data,
  loading,
  totalItems,
  sortField,
  sortDirection,
  expandedRows,
  pagination,
  pageNumbers,
  displayRange,
  navigation,
  onSort,
  onPageChange,
  onDelete,
  onView,
  onExport,
  onToggleExpansion
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



  const columns = [
    {
      key: 'session_id',
      label: 'Sesión',
      sortable: true,
      render: (conversation) => (
        <div className="text-sm font-mono text-gray-600">
          {conversation.session_id ? conversation.session_id.substring(0, 8) + '...' : '-'}
        </div>
      )
    },
    {
      key: 'user',
      label: 'Usuario',
      sortable: true,
      render: (conversation) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {getUserInitials(conversation.user)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {getUserDisplayName(conversation)}
            </p>
            <p className="text-xs text-gray-500">
              {conversation.user?.email || conversation.user_email || 'Sin email'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'question_text',
      label: 'Pregunta',
      sortable: false,
      render: (conversation) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-900 line-clamp-2">
            {(conversation.question_text || '-').replace(/[''‚‛""„‟«»]/g, '"').replace(/[–—]/g, '-')}
          </p>
        </div>
      )
    },
    {
      key: 'answer_text',
      label: 'Respuesta',
      sortable: false,
      render: (conversation) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-600 line-clamp-2">
            {(conversation.answer_text || 'Sin respuesta').replace(/[''‚‛""„‟«»]/g, '"').replace(/[–—]/g, '-')}
          </p>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      render: (conversation) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView && onView(conversation)}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            title="Ver detalles"
          >
            Ver
          </button>
          <button
            onClick={() => onDelete && onDelete(conversation.id)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
            title="Eliminar conversación"
          >
            Eliminar
          </button>
        </div>
      )
    }
  ];

  const emptyState = {
    icon: (
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'No hay conversaciones',
    description: 'Las conversaciones del chatbot aparecerán aquí cuando los usuarios interactúen con el bot.',
    action: null
  };

  return (
    <TableView
      data={data}
      columns={columns}
      loading={loading}
      emptyState={emptyState}
      sortField={sortField}
      sortDirection={sortDirection}
      expandedRows={expandedRows || new Set()}
      pagination={pagination}
      pageNumbers={pageNumbers}
      displayRange={displayRange}
      navigation={navigation}
      onSort={onSort}
      onPageChange={onPageChange}
      onToggleExpansion={onToggleExpansion || (() => {})}
      className="bg-white rounded-lg shadow-sm border border-gray-200"
    />
  );
};

export default ConversationTableView;