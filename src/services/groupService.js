/**
 * Servicio para comunicación con la API de Grupos
 * Basado en Django Groups nativos con SimpleGroupViewSet
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Función auxiliar para refrescar token (reutilizada del userService)
const refreshTokenIfNeeded = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        return data.access;
      }
    }
    
    throw new Error('Token refresh failed');
  } catch (error) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isAuthenticated');
    throw error;
  }
};

// Configuración base para fetch con manejo automático de token refresh
const apiCall = async (url, options = {}) => {
  let token = localStorage.getItem('access_token');
  
  const makeRequest = async (authToken) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${BASE_URL}${url}`, config);
    
    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch (parseError) {
        error = { message: `HTTP ${response.status}` };
      }
      
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      
      throw new Error(error.detail || error.message || `HTTP ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } else {
      return { success: true };
    }
  };

  try {
    return await makeRequest(token);
  } catch (error) {
    if (error.message === 'UNAUTHORIZED' && token) {
      try {
        const newToken = await refreshTokenIfNeeded();
        return await makeRequest(newToken);
      } catch (refreshError) {
        throw new Error('Las credenciales de autenticación no se proveyeron.');
      }
    }
    throw error;
  }
};

const groupService = {
  /**
   * Lista grupos con filtros y paginación
   * @param {number} page - Página actual
   * @param {number} limit - Elementos por página
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise} Lista de grupos
   */
  list: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: limit.toString(),
    });

    // Filtros básicos para Django Groups nativos
    if (filters.search) params.append('search', filters.search);
    if (filters.ordering) params.append('ordering', filters.ordering);

    return await apiCall(`/groups/?${params}`);
  },

  /**
   * Obtiene un grupo específico
   * @param {number} id - ID del grupo
   * @returns {Promise} Datos del grupo
   */
  get: async (id) => {
    return await apiCall(`/groups/${id}/`);
  },

  /**
   * Crea un nuevo grupo
   * @param {Object} data - Datos del grupo
   * @returns {Promise} Grupo creado
   */
  create: async (data) => {
    return await apiCall('/groups/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Actualiza un grupo existente
   * @param {number} id - ID del grupo
   * @param {Object} data - Datos a actualizar
   * @returns {Promise} Grupo actualizado
   */
  update: async (id, data) => {
    return await apiCall(`/groups/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Actualización parcial de grupo
   * @param {number} id - ID del grupo
   * @param {Object} data - Datos a actualizar
   * @returns {Promise} Grupo actualizado
   */
  patch: async (id, data) => {
    return await apiCall(`/groups/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Elimina un grupo
   * @param {number} id - ID del grupo
   * @returns {Promise} Respuesta de la operación
   */
  delete: async (id) => {
    return await apiCall(`/groups/${id}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Asigna permisos específicos a un grupo
   * @param {number} id - ID del grupo
   * @param {Array} permissions - Array de IDs de permisos
   * @returns {Promise} Grupo actualizado
   */
  assignPermissions: async (id, permissions) => {
    return await apiCall(`/groups/${id}/assign_permissions/`, {
      method: 'POST',
      body: JSON.stringify({ permissions }),
    });
  },

  /**
   * Obtiene grupos disponibles filtrados por tipo
   * @param {string} tipoUsuario - 'ADMIN' o 'TRABAJADOR' (opcional)
   * @returns {Promise} Lista de grupos disponibles
   */
  getGroupsDisponibles: async (tipoUsuario = null) => {
    // Con Django Groups nativos, obtenemos todos los grupos
    // El filtrado se hace en el frontend basado en convención de nombres
    return await apiCall('/groups/');
  },

  /**
   * Obtiene todos los permisos disponibles organizados jerárquicamente
   * para el selector de permisos del ProfileModal
   * @returns {Promise} Estructura jerárquica de permisos
   */
  getPermissionsStructure: async () => {
    return await apiCall('/groups/permissions_structure/');
  },

  /**
   * Alias para compatibilidad con código existente
   * @returns {Promise} Estructura jerárquica de permisos
   */
  getAvailablePermissions: async () => {
    return await apiCall('/groups/permissions_structure/');
  }
};

export default groupService;