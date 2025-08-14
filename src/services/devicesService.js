/**
 * Servicio para comunicación con la API de Dispositivos Registrados
 * Siguiendo el mismo patrón que chatbotService.js
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const API_BASE = RAW_BASE.replace(/\/(web|admin|mobile)\/?$/, '');

// Configuración base para fetch
const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE}${url}`, config);
    
    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch (parseError) {
        // Si no se puede parsear como JSON, crear un error básico
        error = { message: `HTTP ${response.status}` };
      }
      throw new Error(error.detail || error.message || `HTTP ${response.status}`);
    }
    
    // Verificar si la respuesta tiene contenido antes de parsear JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } else {
      // Si no es JSON, devolver respuesta vacía exitosa
      return { success: true };
    }
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

const devicesService = {
  // 📱 Gestión de dispositivos registrados (DeviceToken)
  devices: {
    list: async (page = 1, limit = 10, search = '', deviceType = '', status = '') => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(deviceType && { device_type: deviceType }),
        ...(status && { status: status }),
      });
      return await apiCall(`/web/devices/?${params}`);
    },
    
    get: async (id) => {
      return await apiCall(`/web/devices/${id}/`);
    },
    
    create: async (data) => {
      return await apiCall('/web/devices/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    update: async (id, data) => {
      return await apiCall(`/web/devices/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    
    delete: async (id) => {
      try {
        const response = await apiCall(`/web/devices/${id}/`, {
          method: 'DELETE',
        });
        // Delete típicamente devuelve 204 No Content, lo cual es exitoso
        return { success: true, message: 'Token eliminado exitosamente' };
      } catch (error) {
        console.error(`Error eliminando dispositivo ${id}:`, error);
        
        // Mejorar mensaje de error según el código
        let errorMessage = 'Error al eliminar el token del dispositivo';
        if (error.message.includes('403')) {
          errorMessage = 'No tienes permisos para eliminar este token';
        } else if (error.message.includes('404')) {
          errorMessage = 'El token del dispositivo no existe';
        } else if (error.message.includes('500')) {
          errorMessage = 'Error interno del servidor. Por favor contacta al administrador.';
        }
        
        throw new Error(errorMessage);
      }
    },
    
    // Importar dispositivos masivos
    bulkImport: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE}/web/devices/bulk_import/`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      
      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch (parseError) {
          error = { message: 'Error en importación masiva' };
        }
        throw new Error(error.detail || error.message || 'Error en importación masiva');
      }
      
      return await response.json();
    },

    // Activar/Desactivar dispositivo
    toggleStatus: async (id, isActive) => {
      return await apiCall(`/web/devices/${id}/toggle_status/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive }),
      });
    },

    // Obtener estadísticas de dispositivos
    getStats: async () => {
      return await apiCall('/web/devices/statistics/');
    },
  },

  // 📂 Gestión de tipos de dispositivos
  deviceTypes: {
    list: async () => {
      return await apiCall('/web/device-types/');
    },
    
    create: async (data) => {
      return await apiCall('/web/device-types/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    update: async (id, data) => {
      return await apiCall(`/web/device-types/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    
    delete: async (id) => {
      return await apiCall(`/web/device-types/${id}/`, {
        method: 'DELETE',
      });
    },
  },

  // 📊 Obtener estadísticas generales
  getGeneralStats: async (queryParams = '') => {
    const url = `/web/devices/general-statistics/${queryParams}`;
    return await apiCall(url);
  },
};

export default devicesService;
