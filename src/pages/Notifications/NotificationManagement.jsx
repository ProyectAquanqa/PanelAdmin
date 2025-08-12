import React, { useState, useEffect, useCallback } from "react";
import useNotifications from "../../hooks/useNotifications";
import { useUsers } from "../../hooks/useUsers";
import { useEventos } from "../../hooks/useEventos";
import { useSearch } from "../../hooks/useSearch";
import {
  NotificationActions,
  NotificationList,
  NotificationModal,
  LoadingStates,
} from "../../components/Notifications";
import toast from "react-hot-toast";

/**
 * Página principal de Gestión de Notificaciones
 * Sigue el patrón de KnowledgeBase con adaptaciones para notificaciones
 */
const NotificationManagement = () => {
  const {
    notifications,
    loading,
    fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    sendBroadcast,
    sendBulkNotifications,
  } = useNotifications();

  const { users, fetchUsers } = useUsers();
  const { eventos, fetchEventos } = useEventos();

  // Estados locales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Hook de búsqueda con filtros específicos para notificaciones
  const {
    filteredData: filteredNotifications,
    searchTerm,
    filters,
    updateSearchTerm,
    updateFilter,
  } = useSearch(notifications, {
    searchFields: ["titulo", "mensaje", "destinatario.username", "destinatario.first_name", "destinatario.last_name"],
    customFilters: {
      tipo: (item, value) => {
        if (!value) return true;
        return item.tipo === value;
      },
      destinatario: (item, value) => {
        if (!value) return true;
        if (value === 'broadcast') return !item.destinatario;
        return item.destinatario?.id?.toString() === value;
      }
    }
  });

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchNotifications(),
          fetchUsers(),
          fetchEventos()
        ]);
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
      }
    };

    loadInitialData();
  }, [fetchNotifications, fetchUsers, fetchEventos]);

  // Handlers de acciones principales
  const handleCreateNew = useCallback(() => {
    setEditingItem(null);
    setShowCreateModal(true);
  }, []);

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setShowCreateModal(true);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (
        window.confirm(
          "¿Está seguro de que desea eliminar esta notificación? Esta acción no se puede deshacer."
        )
      ) {
        await deleteNotification(id);
      }
    },
    [deleteNotification]
  );

  // Handler para envío de broadcast
  const handleSendBroadcast = useCallback(() => {
    // Pre-configurar modal para broadcast
    setEditingItem({
      titulo: '',
      mensaje: '',
      tipo: 'broadcast',
      destinatario: null
    });
    setShowCreateModal(true);
  }, []);

  // Handler para envío masivo
  const handleSendBulk = useCallback(() => {
    toast.info('Función de envío masivo próximamente disponible');
    // TODO: Implementar modal específico para envío masivo
  }, []);

  // Manejar envío del formulario
  const handleSubmit = useCallback(
    async (formData) => {
      try {
        let success = false;

        if (editingItem && editingItem.id) {
          // Modo edición
          success = await updateNotification(editingItem.id, formData);
        } else if (formData.tipo === 'broadcast') {
          // Envío de broadcast
          success = await sendBroadcast({
            titulo: formData.titulo,
            mensaje: formData.mensaje,
            datos: formData.datos
          });
        } else {
          // Creación normal
          success = await createNotification(formData);
        }

        return success;
      } catch (error) {
        console.error('Error en envío de formulario:', error);
        toast.error('Error procesando la solicitud');
        return false;
      }
    },
    [editingItem, updateNotification, sendBroadcast, createNotification]
  );

  const handleCloseModal = useCallback(() => {
    setShowCreateModal(false);
    setEditingItem(null);
  }, []);

  // Handlers de filtros
  const handleTipoChange = useCallback((value) => {
    updateFilter('tipo', value);
  }, [updateFilter]);

  const handleDestinatarioChange = useCallback((value) => {
    updateFilter('destinatario', value);
  }, [updateFilter]);

  // Estado de carga general
  if (loading.notifications && !notifications?.length) {
    return (
      <div className="w-full bg-slate-50">
        <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LoadingStates.NotificationListLoading />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50">
      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <NotificationActions
          searchTerm={searchTerm}
          onSearchChange={updateSearchTerm}
          selectedTipo={filters.tipo || ''}
          onTipoChange={handleTipoChange}
          selectedDestinatario={filters.destinatario || ''}
          onDestinatarioChange={handleDestinatarioChange}
          usuarios={users}
          totalItems={filteredNotifications.length}
          onCreateNew={handleCreateNew}
          onSendBroadcast={handleSendBroadcast}
          onSendBulk={handleSendBulk}
        />

        <NotificationList
          notifications={filteredNotifications}
          loading={loading.notifications}
          error={loading.error}
          totalItems={filteredNotifications.length}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateFirst={handleCreateNew}
          onRetry={() => fetchNotifications()}
        />
      </div>

      {/* Modal de Crear/Editar Notificación */}
      <NotificationModal
        show={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingItem={editingItem}
        usuarios={users}
        eventos={eventos}
        loading={loading.action}
      />
    </div>
  );
};

export default NotificationManagement;
