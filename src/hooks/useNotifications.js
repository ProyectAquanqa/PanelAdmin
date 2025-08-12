import { useState, useCallback } from 'react';
import notificationsService from '../services/notificationsService';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para gestión de notificaciones
 * Sigue el patrón establecido en useChatbot
 */
const useNotifications = () => {
  // Estados principales
  const [notifications, setNotifications] = useState([]);
  const [devices, setDevices] = useState([]);
  const [statistics, setStatistics] = useState({});
  
  // Estados de carga
  const [loading, setLoading] = useState({
    notifications: false,
    devices: false,
    statistics: false,
    action: false,
    error: null
  });

  // Estado de paginación
  const [pagination, setPagination] = useState({
    notifications: {
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0
    },
    devices: {
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0
    }
  });

  /**
   * Actualizar estado de carga
   */
  const updateLoading = useCallback((key, value, error = null) => {
    setLoading(prev => ({
      ...prev,
      [key]: value,
      error: error
    }));
  }, []);

  // ============================================================================
  // NOTIFICACIONES
  // ============================================================================

  /**
   * Obtener todas las notificaciones
   */
  const fetchNotifications = useCallback(async (params = {}) => {
    updateLoading('notifications', true);
    
    try {
      const result = await notificationsService.getNotifications(params);
      
      if (result.status === 'success') {
        setNotifications(result.data.results || result.data);
        
        // Actualizar paginación si hay información disponible
        if (result.data.count !== undefined) {
          setPagination(prev => ({
            ...prev,
            notifications: {
              ...prev.notifications,
              total: result.data.count,
              totalPages: Math.ceil(result.data.count / (params.pageSize || 20)),
              page: params.page || 1
            }
          }));
        }
        
        updateLoading('notifications', false);
        return true;
      } else {
        updateLoading('notifications', false, result.message);
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      updateLoading('notifications', false, 'Error cargando notificaciones');
      toast.error('Error cargando notificaciones');
      return false;
    }
  }, [updateLoading]);

  /**
   * Crear nueva notificación
   */
  const createNotification = useCallback(async (notificationData) => {
    updateLoading('action', true);
    
    try {
      // Validar datos
      const validation = notificationsService.validateNotificationData(notificationData);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        toast.error(firstError);
        updateLoading('action', false);
        return false;
      }

      // Formatear datos
      const formattedData = notificationsService.formatNotificationData(notificationData);
      
      const result = await notificationsService.createNotification(formattedData);
      
      if (result.status === 'success') {
        // Agregar nueva notificación al estado
        setNotifications(prev => [result.data, ...prev]);
        
        updateLoading('action', false);
        toast.success(result.message);
        return true;
      } else {
        updateLoading('action', false, result.message);
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      updateLoading('action', false, 'Error creando notificación');
      toast.error('Error creando notificación');
      return false;
    }
  }, [updateLoading]);

  /**
   * Actualizar notificación existente
   */
  const updateNotification = useCallback(async (id, notificationData) => {
    updateLoading('action', true);
    
    try {
      // Validar datos
      const validation = notificationsService.validateNotificationData(notificationData);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        toast.error(firstError);
        updateLoading('action', false);
        return false;
      }

      // Formatear datos
      const formattedData = notificationsService.formatNotificationData(notificationData);
      
      const result = await notificationsService.updateNotification(id, formattedData);
      
      if (result.status === 'success') {
        // Actualizar notificación en el estado
    setNotifications(prev => 
      prev.map(notification => 
            notification.id === id ? result.data : notification
          )
        );
        
        updateLoading('action', false);
        toast.success(result.message);
        return true;
      } else {
        updateLoading('action', false, result.message);
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      updateLoading('action', false, 'Error actualizando notificación');
      toast.error('Error actualizando notificación');
      return false;
    }
  }, [updateLoading]);

  /**
   * Eliminar notificación
   */
  const deleteNotification = useCallback(async (id) => {
    updateLoading('action', true);
    
    try {
      const result = await notificationsService.deleteNotification(id);
      
      if (result.status === 'success') {
        // Remover notificación del estado
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        
        updateLoading('action', false);
        toast.success(result.message);
        return true;
      } else {
        updateLoading('action', false, result.message);
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      updateLoading('action', false, 'Error eliminando notificación');
      toast.error('Error eliminando notificación');
      return false;
    }
  }, [updateLoading]);

  /**
   * Enviar notificación broadcast
   */
  const sendBroadcast = useCallback(async (broadcastData) => {
    updateLoading('action', true);
    
    try {
      const result = await notificationsService.sendBroadcast(broadcastData);
      
      if (result.status === 'success') {
        // Opcional: Refrescar lista de notificaciones
        await fetchNotifications();
        
        updateLoading('action', false);
        toast.success(result.message);
        return true;
      } else {
        updateLoading('action', false, result.message);
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      updateLoading('action', false, 'Error enviando broadcast');
      toast.error('Error enviando broadcast');
      return false;
    }
  }, [updateLoading, fetchNotifications]);

  /**
   * Envío masivo de notificaciones
   */
  const sendBulkNotifications = useCallback(async (bulkData) => {
    updateLoading('action', true);
    
    try {
      const result = await notificationsService.sendBulkNotifications(bulkData);
      
      if (result.status === 'success') {
        // Opcional: Refrescar lista de notificaciones
        await fetchNotifications();
        
        updateLoading('action', false);
        toast.success(result.message);
        return result.data;
      } else {
        updateLoading('action', false, result.message);
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      updateLoading('action', false, 'Error enviando notificaciones');
      toast.error('Error enviando notificaciones');
      return false;
    }
  }, [updateLoading, fetchNotifications]);

  // ============================================================================
  // DISPOSITIVOS
  // ============================================================================

  /**
   * Obtener todos los dispositivos
   */
  const fetchDevices = useCallback(async (params = {}) => {
    updateLoading('devices', true);
    
    try {
      const result = await notificationsService.getDevices(params);
      
      if (result.status === 'success') {
        setDevices(result.data.results || result.data);
        
        // Actualizar paginación si hay información disponible
        if (result.data.count !== undefined) {
          setPagination(prev => ({
            ...prev,
            devices: {
              ...prev.devices,
              total: result.data.count,
              totalPages: Math.ceil(result.data.count / (params.pageSize || 20)),
              page: params.page || 1
            }
          }));
        }
        
        updateLoading('devices', false);
        return true;
      } else {
        updateLoading('devices', false, result.message);
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      updateLoading('devices', false, 'Error cargando dispositivos');
      toast.error('Error cargando dispositivos');
      return false;
    }
  }, [updateLoading]);

  /**
   * Crear/registrar nuevo dispositivo
   */
  const createDevice = useCallback(async (deviceData) => {
    updateLoading('action', true);
    
    try {
      const result = await notificationsService.createDevice(deviceData);
      
      if (result.status === 'success') {
        // Agregar nuevo dispositivo al estado
        setDevices(prev => [result.data, ...prev]);
        
        updateLoading('action', false);
        toast.success(result.message);
        return true;
      } else {
        updateLoading('action', false, result.message);
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      updateLoading('action', false, 'Error registrando dispositivo');
      toast.error('Error registrando dispositivo');
      return false;
    }
  }, [updateLoading]);

  /**
   * Actualizar dispositivo
   */
  const updateDevice = useCallback(async (id, deviceData) => {
    updateLoading('action', true);
    
    try {
      const result = await notificationsService.updateDevice(id, deviceData);
      
      if (result.status === 'success') {
        // Actualizar dispositivo en el estado
        setDevices(prev =>
          prev.map(device =>
            device.id === id ? result.data : device
          )
        );
        
        updateLoading('action', false);
        toast.success(result.message);
        return true;
      } else {
        updateLoading('action', false, result.message);
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      updateLoading('action', false, 'Error actualizando dispositivo');
      toast.error('Error actualizando dispositivo');
      return false;
    }
  }, [updateLoading]);

  /**
   * Eliminar dispositivo
   */
  const deleteDevice = useCallback(async (id) => {
    updateLoading('action', true);
    
    try {
      const result = await notificationsService.deleteDevice(id);
      
      if (result.status === 'success') {
        // Remover dispositivo del estado
        setDevices(prev => prev.filter(device => device.id !== id));
        
        updateLoading('action', false);
        toast.success(result.message);
        return true;
      } else {
        updateLoading('action', false, result.message);
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      updateLoading('action', false, 'Error eliminando dispositivo');
      toast.error('Error eliminando dispositivo');
      return false;
    }
  }, [updateLoading]);

  // ============================================================================
  // ESTADÍSTICAS
  // ============================================================================

  /**
   * Obtener estadísticas de notificaciones
   */
  const fetchStatistics = useCallback(async () => {
    updateLoading('statistics', true);
    
    try {
      const result = await notificationsService.getStatistics();
      
      if (result.status === 'success') {
        setStatistics(result.data);
        updateLoading('statistics', false);
        return true;
      } else {
        updateLoading('statistics', false, result.message);
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      updateLoading('statistics', false, 'Error cargando estadísticas');
      toast.error('Error cargando estadísticas');
      return false;
    }
  }, [updateLoading]);

  // ============================================================================
  // RETORNO DEL HOOK
  // ============================================================================

  return {
    // Estados
    notifications,
    devices,
    statistics,
    loading,
    pagination,
    
    // Funciones de notificaciones
    fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    sendBroadcast,
    sendBulkNotifications,
    
    // Funciones de dispositivos  
    fetchDevices,
    createDevice,
    updateDevice,
    deleteDevice,
    
    // Funciones de estadísticas
    fetchStatistics,
    
    // Utilidades
    clearError: () => updateLoading('error', null),
    resetPagination: () => setPagination({
      notifications: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      devices: { page: 1, pageSize: 20, total: 0, totalPages: 0 }
    })
  };
};

export default useNotifications;