/**
 * Hook para manejar notificaciones del header
 * Gestiona estado de notificaciones, dropdown y acciones
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * Hook para manejar sistema de notificaciones
 * @param {Array} initialNotifications - Notificaciones iniciales
 * @returns {Object} Estado y funciones para manejar notificaciones
 */
export const useNotifications = (initialNotifications = []) => {
  // Estado de notificaciones
  const [notifications, setNotifications] = useState(initialNotifications);
  
  // Estado del dropdown
  const [showNotifications, setShowNotifications] = useState(false);

  // Contador de notificaciones no leídas (memoizado)
  const unreadCount = useMemo(() => {
    return notifications.filter(notification => !notification.read).length;
  }, [notifications]);

  // Notificaciones no leídas (memoizadas)
  const unreadNotifications = useMemo(() => {
    return notifications.filter(notification => !notification.read);
  }, [notifications]);

  // Notificaciones leídas (memoizadas)
  const readNotifications = useMemo(() => {
    return notifications.filter(notification => notification.read);
  }, [notifications]);

  // Notificaciones recientes (últimas 5)
  const recentNotifications = useMemo(() => {
    return notifications
      .sort((a, b) => new Date(b.timestamp || b.time) - new Date(a.timestamp || a.time))
      .slice(0, 5);
  }, [notifications]);

  // Toggle del dropdown de notificaciones
  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  // Cerrar dropdown de notificaciones
  const closeNotifications = useCallback(() => {
    setShowNotifications(false);
  }, []);

  // Abrir dropdown de notificaciones
  const openNotifications = useCallback(() => {
    setShowNotifications(true);
  }, []);

  // Marcar una notificación como leída
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Marcar una notificación como no leída
  const markAsUnread = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: false }
          : notification
      )
    );
  }, []);

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Eliminar una notificación
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  // Limpiar todas las notificaciones
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Limpiar solo las notificaciones leídas
  const clearReadNotifications = useCallback(() => {
    setNotifications(prev => prev.filter(notification => !notification.read));
  }, []);

  // Agregar una nueva notificación
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  // Actualizar una notificación existente
  const updateNotification = useCallback((notificationId, updates) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, ...updates }
          : notification
      )
    );
  }, []);

  // Obtener notificación por ID
  const getNotificationById = useCallback((notificationId) => {
    return notifications.find(notification => notification.id === notificationId);
  }, [notifications]);

  // Filtrar notificaciones por tipo
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  // Obtener notificaciones de las últimas X horas
  const getRecentNotifications = useCallback((hours = 24) => {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return notifications.filter(notification => {
      const notificationTime = new Date(notification.timestamp || notification.time);
      return notificationTime > cutoffTime;
    });
  }, [notifications]);

  // Estadísticas de notificaciones
  const stats = useMemo(() => {
    const typeStats = notifications.reduce((acc, notification) => {
      const type = notification.type || 'general';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      total: notifications.length,
      unread: unreadCount,
      read: notifications.length - unreadCount,
      byType: typeStats,
      hasUnread: unreadCount > 0
    };
  }, [notifications, unreadCount]);

  // Configuración de notificaciones
  const config = useMemo(() => ({
    maxVisible: 5,
    autoMarkAsRead: false,
    showTimestamp: true,
    groupByType: false,
    enableSound: false
  }), []);

  return {
    // Estado principal
    notifications,
    showNotifications,
    
    // Contadores y filtros
    unreadCount,
    unreadNotifications,
    readNotifications,
    recentNotifications,
    
    // Funciones de control del dropdown
    toggleNotifications,
    closeNotifications,
    openNotifications,
    
    // Funciones de gestión de notificaciones
    markAsRead,
    markAsUnread,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    clearReadNotifications,
    addNotification,
    updateNotification,
    
    // Funciones de consulta
    getNotificationById,
    getNotificationsByType,
    getRecentNotifications,
    
    // Estadísticas y configuración
    stats,
    config,
    
    // Estados derivados
    hasNotifications: notifications.length > 0,
    hasUnreadNotifications: unreadCount > 0,
    isEmpty: notifications.length === 0
  };
};

export default useNotifications;