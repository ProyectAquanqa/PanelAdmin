import { useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para sistema de notificaciones mejorado
 * Extiende react-hot-toast con funciones específicas y estilos consistentes
 * 
 * Basado en los requirements:
 * - 3.1: Confirmaciones claras para acciones exitosas
 * - 3.2: Mensajes de guardado exitoso
 * - 3.3: Mensajes de eliminación exitosa
 * - 3.4: Mensajes de actualización exitosa
 * - 5.3: Estilos visuales consistentes
 */
const useNotification = () => {

  /**
   * Configuración base para todos los toasts
   */
  const baseConfig = {
    duration: 4000,
    position: 'top-right',
    style: {
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '400px',
      padding: '12px 16px',
    },
  };

  /**
   * Mostrar notificación de éxito
   * Requirement 3.1, 3.2, 3.3, 3.4: Confirmaciones claras para acciones exitosas
   */
  const showSuccess = useCallback((message, options = {}) => {
    return toast.success(message, {
      ...baseConfig,
      style: {
        ...baseConfig.style,
        background: '#10B981',
        color: '#FFFFFF',
        border: '1px solid #059669',
      },
      iconTheme: {
        primary: '#FFFFFF',
        secondary: '#10B981',
      },
      ...options,
    });
  }, []);

  /**
   * Mostrar notificación de error
   * Requirement 5.3: Estilos visuales consistentes para errores
   */
  const showError = useCallback((message, options = {}) => {
    return toast.error(message, {
      ...baseConfig,
      duration: 6000, // Errores duran más tiempo
      style: {
        ...baseConfig.style,
        background: '#EF4444',
        color: '#FFFFFF',
        border: '1px solid #DC2626',
      },
      iconTheme: {
        primary: '#FFFFFF',
        secondary: '#EF4444',
      },
      ...options,
    });
  }, []);

  /**
   * Mostrar notificación de advertencia
   * Requirement 5.3: Estilos visuales consistentes
   */
  const showWarning = useCallback((message, options = {}) => {
    return toast(message, {
      ...baseConfig,
      icon: '!',
      style: {
        ...baseConfig.style,
        background: '#F59E0B',
        color: '#FFFFFF',
        border: '1px solid #D97706',
      },
      ...options,
    });
  }, []);

  /**
   * Mostrar notificación informativa
   * Requirement 5.3: Estilos visuales consistentes
   */
  const showInfo = useCallback((message, options = {}) => {
    return toast(message, {
      ...baseConfig,
      icon: 'info',
      style: {
        ...baseConfig.style,
        background: '#3B82F6',
        color: '#FFFFFF',
        border: '1px solid #2563EB',
      },
      ...options,
    });
  }, []);

  /**
   * Funciones específicas para diferentes tipos de acciones
   * Requirement 3.2: "Información guardada correctamente"
   */
  const showSaveSuccess = useCallback((entityName = 'Información') => {
    return showSuccess(`${entityName} guardada correctamente`);
  }, [showSuccess]);

  /**
   * Requirement 3.3: "Elemento eliminado correctamente"
   */
  const showDeleteSuccess = useCallback((entityName = 'Elemento') => {
    return showSuccess(`${entityName} eliminado correctamente`);
  }, [showSuccess]);

  /**
   * Requirement 3.4: "Datos actualizados correctamente"
   */
  const showUpdateSuccess = useCallback((entityName = 'Datos') => {
    return showSuccess(`${entityName} actualizados correctamente`);
  }, [showSuccess]);

  /**
   * Notificación de carga/procesamiento
   */
  const showLoading = useCallback((message = 'Procesando...', options = {}) => {
    return toast.loading(message, {
      ...baseConfig,
      style: {
        ...baseConfig.style,
        background: '#6B7280',
        color: '#FFFFFF',
        border: '1px solid #4B5563',
      },
      ...options,
    });
  }, []);

  /**
   * Actualizar un toast existente (útil para cambiar de loading a success/error)
   */
  const updateToast = useCallback((toastId, message, type = 'success', options = {}) => {
    const updateConfig = {
      id: toastId,
      ...options,
    };

    switch (type) {
      case 'success':
        return toast.success(message, updateConfig);
      case 'error':
        return toast.error(message, updateConfig);
      case 'warning':
        return showWarning(message, updateConfig);
      case 'info':
        return showInfo(message, updateConfig);
      default:
        return toast(message, updateConfig);
    }
  }, [showWarning, showInfo]);

  /**
   * Cerrar un toast específico
   */
  const dismissToast = useCallback((toastId) => {
    toast.dismiss(toastId);
  }, []);

  /**
   * Cerrar todos los toasts
   */
  const dismissAll = useCallback(() => {
    toast.dismiss();
  }, []);

  /**
   * Notificación con promesa (útil para operaciones async)
   * Automáticamente maneja loading -> success/error
   */
  const showPromise = useCallback((promise, messages = {}) => {
    const defaultMessages = {
      loading: 'Procesando...',
      success: 'Operación completada correctamente',
      error: 'Error en la operación',
    };

    const finalMessages = { ...defaultMessages, ...messages };

    return toast.promise(promise, finalMessages, {
      ...baseConfig,
      success: {
        style: {
          ...baseConfig.style,
          background: '#10B981',
          color: '#FFFFFF',
          border: '1px solid #059669',
        },
      },
      error: {
        style: {
          ...baseConfig.style,
          background: '#EF4444',
          color: '#FFFFFF',
          border: '1px solid #DC2626',
        },
      },
      loading: {
        style: {
          ...baseConfig.style,
          background: '#6B7280',
          color: '#FFFFFF',
          border: '1px solid #4B5563',
        },
      },
    });
  }, []);

  return {
    // Funciones básicas
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    
    // Funciones específicas para acciones comunes
    showSaveSuccess,
    showDeleteSuccess,
    showUpdateSuccess,
    
    // Utilidades avanzadas
    showPromise,
    updateToast,
    dismissToast,
    dismissAll,
    
    // Acceso directo a toast para casos especiales
    toast,
  };
};

export default useNotification;