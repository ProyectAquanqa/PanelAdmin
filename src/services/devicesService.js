/**
 * Servicio para comunicación con la API de Dispositivos Registrados
 * Siguiendo el mismo patrón que chatbotService.js
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://192.168.18.13:8000/api';
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
    throw error;
  }
};

const devicesService = {
  // Gestión de dispositivos registrados (DeviceToken)
  devices: {
    list: async (page = 1, limit = 10, search = '', deviceType = '', status = '') => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(deviceType && { device_type: deviceType }),
        ...(status && { is_active: status === 'active' ? 'true' : status === 'inactive' ? 'false' : '' }),
      });
      const response = await apiCall(`/web/devices/?${params}`);
      
      // Normalizar la respuesta del backend customizado
      let normalizedResponse;
      
      if (response?.data && Array.isArray(response.data)) {
        // Formato del backend customizado: { status: 'success', data: [...], pagination: {...} }
        normalizedResponse = {
          results: response.data.map(device => ({
            ...device,
            user: device.user_info || null
          })),
          count: response.pagination?.count || response.data.length,
          next: response.pagination?.next || null,
          previous: response.pagination?.previous || null
        };
      } else if (response?.results) {
        // Formato estándar DRF: { count: X, results: [...] }
        normalizedResponse = {
          ...response,
          results: response.results.map(device => ({
            ...device,
            user: device.user_info || null
          }))
        };
      } else {
        // Fallback
        normalizedResponse = response;
      }
      
      return normalizedResponse;
    },
    
    get: async (id) => {
      const device = await apiCall(`/web/devices/${id}/`);
      // Normalizar user_info a user
      if (device?.user_info) {
        device.user = device.user_info;
      }
      return device;
    },
    
    create: async (data) => {
      const device = await apiCall('/web/devices/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      // Normalizar user_info a user
      if (device?.user_info) {
        device.user = device.user_info;
      }
      return device;
    },
    
    update: async (id, data) => {
      const device = await apiCall(`/web/devices/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      // Normalizar user_info a user
      if (device?.user_info) {
        device.user = device.user_info;
      }
      return device;
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

    // Exportar dispositivos
    export: async (format = 'csv', filters = {}) => {
      const params = new URLSearchParams({
        format,
        ...(filters.search && { search: filters.search }),
        ...(filters.type && { device_type: filters.type }),
        ...(filters.status && { is_active: filters.status === 'active' ? 'true' : filters.status === 'inactive' ? 'false' : '' }),
      });
      
      const response = await fetch(`${API_BASE}/web/devices/export/?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Si es CSV o Excel, retornar blob
      if (format === 'csv' || format === 'excel') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dispositivos_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return { success: true, message: 'Archivo descargado exitosamente' };
      }

      // Si es JSON, retornar los datos
      return await response.json();
    },
  },

  // Gestión de tipos de dispositivos
  deviceTypes: {
    list: async () => {
      const res = await apiCall('/web/device-types/');
      // Normalizar para siempre devolver un arreglo
      const arr = Array.isArray(res)
        ? res
        : (Array.isArray(res?.data)
            ? res.data
            : (Array.isArray(res?.results) ? res.results : []));
      return arr;
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

  // Obtener estadísticas generales
  getGeneralStats: async (queryParams = '') => {
    const url = `/web/devices/general-statistics/${queryParams}`;
    return await apiCall(url);
  },
};

export default devicesService;
