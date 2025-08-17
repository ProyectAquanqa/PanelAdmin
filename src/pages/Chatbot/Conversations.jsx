/**
 * Página de gestión de conversaciones del chatbot
 * Refactorizada siguiendo el patrón modular de Categories y KnowledgeBase
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useChatbot } from '../../hooks/useChatbot';
import { useDataView } from '../../hooks/useDataView';
import { searchInFields } from '../../utils/searchUtils';
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

  const [selectedDateRange, setSelectedDateRange] = useState({ start: '', end: '' });
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Cargar conversaciones al montar
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Usar solo datos reales del backend
  const displayConversations = conversations || [];

  // Obtener usuarios únicos para el filtro dinámico (usando datos del backend)
  const uniqueUsers = useMemo(() => {
    const userMap = new Map();
    displayConversations.forEach(conversation => {
      if (conversation.user_username) {
        const userId = conversation.user?.id || conversation.user_username;
        userMap.set(userId, {
          id: userId,
          username: conversation.user_username,
          email: conversation.user?.email || conversation.user_email || '',
          full_name: conversation.user_full_name || conversation.user_username
        });
      }
    });
    return Array.from(userMap.values()).sort((a, b) => a.username.localeCompare(b.username));
  }, [displayConversations]);

  // Handler de exportar - definido antes para evitar problemas de hoisting
  const handleExport = useCallback(() => {
    try {
      const dataToExport = displayConversations.map(conversation => ({
        id: conversation.id,
        usuario: getUserDisplayName(conversation),
        pregunta: conversation.question_text || '',
        respuesta: conversation.answer_text || '',
        fecha_creacion: conversation.created_at || ''
      }));

      const csvContent = [
        ['ID', 'Usuario', 'Pregunta', 'Respuesta', 'Fecha Creación'],
        ...dataToExport.map(item => [
          item.id,
          `"${item.usuario}"`,
          `"${item.pregunta}"`,
          `"${item.respuesta}"`,
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
    }
  }, [displayConversations]);

  // Función helper para getUserDisplayName (usando datos del backend)
  const getUserDisplayName = (conversation) => {
    // El backend ya envía user_full_name calculado correctamente
    if (conversation.user_full_name) return conversation.user_full_name;
    if (conversation.user?.username) return conversation.user.username;
    return 'Usuario Anónimo';
  };

  // Configuración dinámica de filtros
  const dynamicFiltersConfig = useMemo(() => {
    const userOptions = [
      { value: '', label: 'Todos los usuarios' },
      ...uniqueUsers.map(user => ({
        value: user.username,
        label: user.full_name !== user.username ? `${user.full_name} (${user.username})` : user.username
      }))
    ];

    return {
      searchConfig: {
        key: 'searchTerm',
        placeholder: 'Buscar conversaciones, usuarios, preguntas o respuestas...',
        variant: 'simple'
      },
      filterGroups: [
        {
          key: 'selectedUser',
          title: 'Usuario',
          type: 'dropdown',
          options: userOptions,
          placeholder: 'Seleccionar usuario...',
          showIcon: true,
          iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
        },

        {
          key: 'dateRange',
          title: 'Fecha',
          type: 'dateRange',
          placeholder: 'Seleccionar fechas...',
          showIcon: true,
          iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
          className: 'h-[42px]',
          responsive: {
            mobile: 'w-full',
            tablet: 'w-auto',
            desktop: 'w-auto'
          },
          containerClass: 'min-w-0 max-w-[240px] lg:max-w-[280px] xl:max-w-[320px] transition-all duration-300 ease-in-out'
        }
      ],
      actions: [
        {
          label: 'Exportar',
          variant: 'primary',
          icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
          onClick: handleExport
        }
      ],
      itemLabel: 'conversaciones encontradas'
    };
  }, [uniqueUsers, handleExport]);

  // Filtrado y ordenamiento de conversaciones
  const processedConversations = useMemo(() => {
    let filtered = [...(displayConversations || [])];

    // Filtrar por búsqueda (usando searchUtils para manejar acentos como Knowledge Base)
    if (searchTerm.trim()) {
      filtered = filtered.filter(conversation => 
        searchInFields(conversation, searchTerm, [
          'question_text',
          'answer_text',
          'user_username',
          'user_full_name'
        ])
      );
    }

    // Filtrar por usuario
    if (selectedUser.trim()) {
      filtered = filtered.filter(conversation => 
        conversation.user_username === selectedUser
      );
    }



    // Filtrar por rango de fecha (between)
    if (selectedDateRange?.start || selectedDateRange?.end) {
      filtered = filtered.filter(conversation => {
        if (!conversation.created_at) return false;
        
        const conversationDate = new Date(conversation.created_at);
        const startDate = selectedDateRange.start ? new Date(selectedDateRange.start) : null;
        const endDate = selectedDateRange.end ? new Date(selectedDateRange.end + ' 23:59:59') : null;
        
        if (startDate && endDate) {
          return conversationDate >= startDate && conversationDate <= endDate;
        } else if (startDate) {
          return conversationDate >= startDate;
        } else if (endDate) {
          return conversationDate <= endDate;
        }
        
        return true;
      });
    }

    // Ordenar por más recientes primero (por defecto)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return filtered;
  }, [displayConversations, searchTerm, selectedUser, selectedDateRange]);

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

  // Estados de carga
  if (loading.conversations && !displayConversations?.length) {
    return <LoadingStates.ConversationsLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Filtros con todas las funciones */}
          <ConversationFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedUser={selectedUser}
            onUserChange={setSelectedUser}
            selectedDateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
            totalItems={processedConversations.length}
            onExport={handleExport}
            uniqueUsers={uniqueUsers}
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