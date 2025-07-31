/**
 * Página de gestión de conversaciones del chatbot
 * Refactorizada siguiendo el patrón modular de Categories y KnowledgeBase
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useChatbot } from '../../hooks/useChatbot';
import { useDataView } from '../../hooks/useDataView';
import toast from 'react-hot-toast';

// Componentes modulares
import {
  ConversationFilters,
  ConversationTable,
  ConversationModal,
  LoadingStates
} from '../../components/Chatbot/Conversations';

/**
 * Página principal de conversaciones
 */
const Conversations = () => {
  const {
    conversations,
    loading,
    fetchConversations,
    deleteConversation
  } = useChatbot();

  // Estados del modal y filtros
  const [showModal, setShowModal] = useState(false);
  const [viewingConversation, setViewingConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('');
  const [selectedMatchType, setSelectedMatchType] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Cargar conversaciones al montar
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Usar solo datos reales del backend
  const displayConversations = conversations || [];

  // Filtrado y ordenamiento de conversaciones
  const processedConversations = useMemo(() => {
    let filtered = [...(displayConversations || [])];

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(conversation => 
        (conversation.question_text && conversation.question_text.toLowerCase().includes(searchLower)) ||
        (conversation.answer_text && conversation.answer_text.toLowerCase().includes(searchLower)) ||
        (conversation.user?.username && conversation.user.username.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por usuario
    if (selectedUser.trim()) {
      const userLower = selectedUser.toLowerCase();
      filtered = filtered.filter(conversation => 
        conversation.user?.username && conversation.user.username.toLowerCase().includes(userLower)
      );
    }

    // Filtrar por estado
    if (selectedStatus === 'exitosa') {
      filtered = filtered.filter(conversation => 
        conversation.answer_text && conversation.answer_text.trim()
      );
    } else if (selectedStatus === 'fallida') {
      filtered = filtered.filter(conversation => 
        !conversation.answer_text || !conversation.answer_text.trim()
      );
    }

    // Filtrar por rango de fecha
    if (selectedDateRange) {
      const now = new Date();
      let startDate;
      
      switch (selectedDateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'yesterday':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          filtered = filtered.filter(conversation => {
            const conversationDate = new Date(conversation.created_at);
            return conversationDate >= startDate && conversationDate < endDate;
          });
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }
      
      if (startDate && selectedDateRange !== 'yesterday') {
        filtered = filtered.filter(conversation => 
          new Date(conversation.created_at) >= startDate
        );
      }
    }

    // Filtrar por tipo de coincidencia
    if (selectedMatchType === 'with_knowledge') {
      filtered = filtered.filter(conversation => 
        conversation.matched_knowledge && conversation.matched_knowledge !== null
      );
    } else if (selectedMatchType === 'no_knowledge') {
      filtered = filtered.filter(conversation => 
        !conversation.matched_knowledge || conversation.matched_knowledge === null
      );
    }

    // Ordenar por más recientes primero (por defecto)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return filtered;
  }, [displayConversations, searchTerm, selectedUser, selectedStatus, selectedDateRange, selectedMatchType]);

  // Hook personalizado para manejo de vista de datos
  const {
    paginatedData: paginatedConversations,
    sortField,
    sortDirection,
    pagination,
    pageNumbers,
    displayRange,
    navigation,
    handleSort,
    handlePageChange
  } = useDataView(processedConversations, {
    initialSortField: 'created_at',
    initialSortDirection: 'desc',
    itemsPerPage: 10
  });

  // Handlers de acciones
  const handleView = useCallback((conversation) => {
    setViewingConversation(conversation);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta conversación? Esta acción no se puede deshacer.')) {
      await deleteConversation(id);
    }
  }, [deleteConversation]);

  // Eliminar handleRefresh - la tabla debería ser dinámica

  // Handler de exportar
  const handleExport = useCallback(() => {
    try {
      const dataToExport = processedConversations.map(conversation => ({
        id: conversation.id,
        usuario: conversation.user?.username || 'Usuario Anónimo',
        pregunta: conversation.question_text || '',
        respuesta: conversation.answer_text || '',
        conocimiento_id: conversation.matched_knowledge || '',
        fecha_creacion: conversation.created_at || ''
      }));

      const csvContent = [
        ['ID', 'Usuario', 'Pregunta', 'Respuesta', 'ID Conocimiento', 'Fecha Creación'],
        ...dataToExport.map(item => [
          item.id,
          `"${item.usuario}"`,
          `"${item.pregunta}"`,
          `"${item.respuesta}"`,
          item.conocimiento_id,
          item.fecha_creacion
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `conversaciones_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${dataToExport.length} conversaciones exportadas exitosamente`);
    } catch (error) {
      toast.error('Error al exportar conversaciones');
      console.error('Export error:', error);
    }
  }, [processedConversations]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setViewingConversation(null);
  }, []);

  const handleToggleExpansion = useCallback((conversationId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  }, []);

  // Debug removido para código limpio en producción

  // Estados de carga
  if (loading.conversations && !displayConversations?.length) {
    return <LoadingStates.ConversationsLoading />;
  }

  return (
    <div className="bg-gray-50">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Filtros con todas las funciones */}
          <ConversationFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedUser={selectedUser}
            onUserChange={setSelectedUser}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedDateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
            selectedMatchType={selectedMatchType}
            onMatchTypeChange={setSelectedMatchType}
            totalItems={processedConversations.length}
            onExport={handleExport}
          />

          {/* Conversations Table */}
          <ConversationTable
            data={paginatedConversations}
            loading={loading.conversations}
            totalItems={processedConversations.length}
            sortField={sortField}
            sortDirection={sortDirection}
            pagination={pagination}
            pageNumbers={pageNumbers}
            displayRange={displayRange}
            navigation={navigation}
            onSort={handleSort}
            onPageChange={handlePageChange}
            onView={handleView}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Modal de Ver Detalles */}
      <ConversationModal
        show={showModal}
        onClose={handleCloseModal}
        conversation={viewingConversation}
        loading={loading.conversations}
      />
    </div>
  );
};

export default Conversations; 