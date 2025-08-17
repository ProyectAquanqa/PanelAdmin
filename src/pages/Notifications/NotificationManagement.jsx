import React, { useState, useEffect, useCallback, useMemo } from "react";
import useNotifications from "../../hooks/useNotifications";
import { useUsers } from "../../hooks/useUsers";
import { useEventos } from "../../hooks/useEventos";
import {
  NotificationActions,
  NotificationList,
  NotificationModal,
  NotificationDetailModal,
  LoadingStates,
} from "../../components/Notifications";
import { normalizeText } from "../../utils/searchUtils";
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Estados de filtros locales (solo búsqueda)
  const [searchTerm, setSearchTerm] = useState('');

  // Función de filtrado personalizada para notificaciones (solo búsqueda con normalización)
  const filteredNotifications = useMemo(() => {
    if (!notifications || !Array.isArray(notifications)) return [];

    return notifications.filter(notification => {
      // Filtro de búsqueda con normalización de strings (ignora tildes)
      if (searchTerm) {
        const searchNormalized = normalizeText(searchTerm);
        const tituloNormalized = normalizeText(notification.titulo || '');
        const mensajeNormalized = normalizeText(notification.mensaje || '');
        
        const matchesTitulo = tituloNormalized.includes(searchNormalized);
        const matchesMensaje = mensajeNormalized.includes(searchNormalized);
        
        if (!matchesTitulo && !matchesMensaje) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, searchTerm]);

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
        // Error cargando datos iniciales
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

  // Handler de búsqueda
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // Handlers para modal de detalles
  const handleViewDetails = useCallback((notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedNotification(null);
  }, []);

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
          onSearchChange={handleSearchChange}
          totalItems={filteredNotifications.length}
        />

        <NotificationList
          notifications={filteredNotifications}
          loading={loading.notifications}
          error={loading.error}
          totalItems={filteredNotifications.length}
          onViewDetails={handleViewDetails}
          onRetry={() => fetchNotifications()}
        />
      </div>

      {/* Modal de detalles */}
      <NotificationDetailModal
        show={showDetailModal}
        onClose={handleCloseDetailModal}
        notification={selectedNotification}
        loading={false}
      />
    </div>
  );
};

export default NotificationManagement;
