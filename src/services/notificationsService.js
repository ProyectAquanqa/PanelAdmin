import { apiClient } from '../api';
import endpoints from '../api/endpoints';

/**
 * Servicio para gestión de notificaciones
 * Maneja notificaciones y dispositivos push siguiendo el patrón del backend
 */
class NotificationsService {
  constructor() {
    this.baseURL = endpoints.notifications.list;
    this.devicesURL = endpoints.notifications.devices;
  }

  // ============================================================================
  // NOTIFICACIONES
  // ============================================================================

  /**
   * Obtener todas las notificaciones con filtros y búsqueda
   */
  async getNotifications(params = {}) {
    try {
      const response = await apiClient.get(this.baseURL, {
        params: {
          search: params.search || '',
          evento: params.evento || '',
          ordering: params.ordering || '-created_at',
          page: params.page || 1,
          page_size: params.pageSize || 20,
          ...params
        }
      });
      
      return {
        status: 'success',
        data: response
      };
    } catch (error) {
      console.error('❌ Error obteniendo notificaciones:', error);
      return this.handleError(error, 'Error al cargar notificaciones');
    }
  }

  /**
   * Obtener notificación por ID
   */
  async getNotification(id) {
    try {
      const response = await apiClient.get(endpoints.notifications.detail(id));
      
      return {
        status: 'success',
        data: response
      };
    } catch (error) {
      console.error('❌ Error obteniendo notificación:', error);
      return this.handleError(error, 'Error al cargar notificación');
    }
  }

  /**
   * Crear nueva notificación
   */
  async createNotification(notificationData) {
    try {
      // Transformar datos para el backend
      const transformedData = {
        titulo: notificationData.titulo,
        mensaje: notificationData.mensaje,
        tipo: notificationData.tipo,
        destinatario_id: notificationData.destinatario,
        evento_id: notificationData.evento,
        datos: notificationData.datos
      };

      const response = await apiClient.post(this.baseURL, transformedData);
      
      return {
        status: 'success',
        data: response,
        message: 'Notificación creada exitosamente'
      };
    } catch (error) {
      console.error('❌ Error creando notificación:', error);
      return this.handleError(error, 'Error al crear notificación');
    }
  }

  /**
   * Actualizar notificación existente
   */
  async updateNotification(id, notificationData) {
    try {
      // Transformar datos para el backend
      const transformedData = {
        titulo: notificationData.titulo,
        mensaje: notificationData.mensaje,
        tipo: notificationData.tipo,
        destinatario_id: notificationData.destinatario,
        evento_id: notificationData.evento,
        datos: notificationData.datos
      };

      const response = await apiClient.put(endpoints.notifications.update(id), transformedData);
      
      return {
        status: 'success',
        data: response,
        message: 'Notificación actualizada exitosamente'
      };
    } catch (error) {
      console.error('❌ Error actualizando notificación:', error);
      return this.handleError(error, 'Error al actualizar notificación');
    }
  }

  /**
   * Eliminar notificación
   */
  async deleteNotification(id) {
    try {
      await apiClient.delete(endpoints.notifications.delete(id));
      
      return {
        status: 'success',
        message: 'Notificación eliminada exitosamente'
      };
    } catch (error) {
      console.error('❌ Error eliminando notificación:', error);
      return this.handleError(error, 'Error al eliminar notificación');
    }
  }

  /**
   * Enviar notificación broadcast
   */
  async sendBroadcast(broadcastData) {
    try {
      const response = await apiClient.post(endpoints.notifications.sendBroadcast, broadcastData);
      
      return {
        status: 'success',
        data: response,
        message: 'Notificación broadcast enviada exitosamente'
      };
    } catch (error) {
      console.error('❌ Error enviando broadcast:', error);
      return this.handleError(error, 'Error al enviar notificación broadcast');
    }
  }

  /**
   * Envío masivo de notificaciones
   */
  async sendBulkNotifications(bulkData) {
    try {
      const response = await apiClient.post(endpoints.notifications.sendBulk, bulkData);
      
      return {
        status: 'success',
        data: response,
        message: 'Notificaciones enviadas exitosamente'
      };
    } catch (error) {
      console.error('❌ Error enviando notificaciones masivas:', error);
      return this.handleError(error, 'Error al enviar notificaciones masivas');
    }
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  async getStatistics() {
    try {
      const response = await apiClient.get(endpoints.notifications.statistics);
      // Normalizar: el backend devuelve { status, data: { total, sent, ... } }
      const normalized = (response && response.status === 'success' && response.data)
        ? response.data
        : response;
      return {
        status: 'success',
        data: normalized
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return this.handleError(error, 'Error al cargar estadísticas');
    }
  }

  // ============================================================================
  // DISPOSITIVOS (DEVICE TOKENS)
  // ============================================================================

  /**
   * Obtener todos los dispositivos registrados
   */
  async getDevices(params = {}) {
    try {
      const response = await apiClient.get(this.devicesURL, {
        params: {
          search: params.search || '',
          device_type: params.deviceType || '',
          is_active: params.isActive || '',
          ordering: params.ordering || '-created_at',
          page: params.page || 1,
          page_size: params.pageSize || 20,
          ...params
        }
      });
      
      return {
        status: 'success',
        data: response
      };
    } catch (error) {
      console.error('❌ Error obteniendo dispositivos:', error);
      return this.handleError(error, 'Error al cargar dispositivos');
    }
  }

  /**
   * Obtener dispositivo por ID
   */
  async getDevice(id) {
    try {
      const response = await apiClient.get(endpoints.notifications.deviceDetail(id));
      
      return {
        status: 'success',
        data: response
      };
    } catch (error) {
      console.error('❌ Error obteniendo dispositivo:', error);
      return this.handleError(error, 'Error al cargar dispositivo');
    }
  }

  /**
   * Crear/registrar nuevo dispositivo
   */
  async createDevice(deviceData) {
    try {
      const response = await apiClient.post(this.devicesURL, deviceData);
      
      return {
        status: 'success',
        data: response,
        message: 'Dispositivo registrado exitosamente'
      };
    } catch (error) {
      console.error('❌ Error registrando dispositivo:', error);
      return this.handleError(error, 'Error al registrar dispositivo');
    }
  }

  /**
   * Actualizar dispositivo
   */
  async updateDevice(id, deviceData) {
    try {
      const response = await apiClient.put(endpoints.notifications.deviceDetail(id), deviceData);
      
      return {
        status: 'success',
        data: response,
        message: 'Dispositivo actualizado exitosamente'
      };
    } catch (error) {
      console.error('❌ Error actualizando dispositivo:', error);
      return this.handleError(error, 'Error al actualizar dispositivo');
    }
  }

  /**
   * Eliminar dispositivo
   */
  async deleteDevice(id) {
    try {
      await apiClient.delete(endpoints.notifications.deviceDetail(id));
      
      return {
        status: 'success',
        message: 'Dispositivo eliminado exitosamente'
      };
    } catch (error) {
      console.error('❌ Error eliminando dispositivo:', error);
      return this.handleError(error, 'Error al eliminar dispositivo');
    }
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  /**
   * Manejo estandarizado de errores
   */
  handleError(error, defaultMessage = 'Error en operación') {
    if (error.response?.status === 404) {
      return {
        status: 'error',
        message: 'Recurso no encontrado',
        details: error.response?.data || {}
      };
    }

    if (error.response?.status === 403) {
      return {
        status: 'error',
        message: 'No tienes permisos para realizar esta acción',
        details: error.response?.data || {}
      };
    }

    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error?.message
        || 'Datos inválidos';
      
      return {
        status: 'error',
        message: errorMessage,
        details: error.response?.data || {}
      };
    }

    // Error de red o servidor
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return {
        status: 'error',
        message: 'Error de conexión. Verifica tu internet.',
        details: { networkError: true }
      };
    }

    return {
      status: 'error',
      message: defaultMessage,
      details: error.response?.data || { originalError: error.message }
    };
  }

  /**
   * Validar datos de notificación
   */
  validateNotificationData(data) {
    const errors = {};

    if (!data.titulo?.trim()) {
      errors.titulo = 'El título es requerido';
    } else if (data.titulo.length > 255) {
      errors.titulo = 'El título no puede exceder 255 caracteres';
    }

    if (!data.mensaje?.trim()) {
      errors.mensaje = 'El mensaje es requerido';
    }

    // Validación para notificaciones individuales
    if (data.tipo === 'individual' && !data.destinatario) {
      errors.destinatario = 'El destinatario es requerido para notificaciones individuales';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Formatear datos de notificación para el backend
   */
  formatNotificationData(formData) {
    const data = {
      titulo: formData.titulo?.trim(),
      mensaje: formData.mensaje?.trim(),
      tipo: formData.tipo || 'individual',
      destinatario: formData.destinatario || null,
      evento: formData.evento || null,
      datos: formData.datos || null
    };

    // Limpiar campos vacíos
    Object.keys(data).forEach(key => {
      if (data[key] === '' || data[key] === undefined) {
        data[key] = null;
      }
    });

    return data;
  }

  // ============================================================================
  // LÓGICA DE NEGOCIO (Solo lectura)
  // ============================================================================

  /**
   * Determinar si una notificación es automática (generada por evento)
   */
  isAutomatic(notification) {
    return !!notification.evento;
  }

  /**
   * Determinar si una notificación ya fue leída
   */
  isRead(notification) {
    return !!notification.leida || !!notification.leido;
  }
}

// Exportar instancia única
const notificationsService = new NotificationsService();
export default notificationsService;
