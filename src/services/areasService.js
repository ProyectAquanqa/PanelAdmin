/**
 * Servicio para comunicación con la API de Areas
 * Siguiendo el patrón del userService para consistencia
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://192.168.18.13:8000/api';
const API_BASE = RAW_BASE.replace(/\/(web|admin|mobile)\/?$/, '');

// Función auxiliar para refrescar token
const refreshTokenIfNeeded = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE}/web/auth/refresh/`, {
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
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expirado, intentar refresh
      try {
        const newToken = await refreshTokenIfNeeded();
        return makeRequest(newToken);
      } catch (refreshError) {
        window.location.href = '/login';
        throw refreshError;
      }
    }

    return response;
  };

  return makeRequest(token);
};

const areasService = {
  // 🏢 Gestión de areas CRUD
  areas: {
    /**
     * Lista areas con filtros y paginación
     * @param {number} page - Página actual
     * @param {number} limit - Elementos por página
     * @param {Object} filters - Filtros opcionales
     * @returns {Promise} Lista de areas
     */
    list: async (page = 1, limit = 10, filters = {}) => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: limit.toString(),
      });

      // Agregar filtros
      if (filters.search) params.append('search', filters.search);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
      if (filters.ordering) params.append('ordering', filters.ordering);

      const response = await apiCall(`${API_BASE}/web/areas/?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener areas');
      }

      return data;
    },

    /**
     * Obtiene un area específica
     * @param {number} id - ID del area
     * @returns {Promise} Datos del area
     */
    get: async (id) => {
      const response = await apiCall(`${API_BASE}/web/areas/${id}/`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener area');
      }

      return data;
    },

    /**
     * Crea un nuevo area
     * @param {Object} areaData - Datos del area
     * @returns {Promise} Area creada
     */
    create: async (areaData) => {
      const response = await apiCall(`${API_BASE}/web/areas/`, {
        method: 'POST',
        body: JSON.stringify(areaData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al crear area');
      }

      return data;
    },

    /**
     * Actualiza un area existente
     * @param {number} id - ID del area
     * @param {Object} areaData - Datos actualizados
     * @returns {Promise} Area actualizada
     */
    update: async (id, areaData) => {
      const response = await apiCall(`${API_BASE}/web/areas/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(areaData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar area');
      }

      return data;
    },

    /**
     * Actualiza parcialmente un area
     * @param {number} id - ID del area
     * @param {Object} areaData - Datos parciales
     * @returns {Promise} Area actualizada
     */
    patch: async (id, areaData) => {
      const response = await apiCall(`${API_BASE}/web/areas/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(areaData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar area');
      }

      return data;
    },

    /**
     * Cambia el estado activo/inactivo de un área
     * @param {number} id - ID del área
     * @returns {Promise} Respuesta del servidor
     */
    toggleActiveStatus: async (id) => {
      const response = await apiCall(`${API_BASE}/web/areas/${id}/toggle_status/`, {
        method: 'PATCH',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar estado del área');
      }

      return data;
    },

    /**
     * Elimina un area
     * @param {number} id - ID del area
     * @returns {Promise} Respuesta de eliminación
     */
    delete: async (id) => {
      const response = await apiCall(`${API_BASE}/web/areas/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar area');
      }

      return { success: true };
    },

    /**
     * Obtiene areas con sus cargos
     * @returns {Promise} Areas con cargos
     */
    withCargos: async () => {
      const response = await apiCall(`${API_BASE}/web/areas/with_cargos/`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener areas con cargos');
      }

      return data;
    },

    /**
     * Obtiene cargos de un area específica
     * @param {number} id - ID del area
     * @returns {Promise} Cargos del area
     */
    getCargos: async (id) => {
      const response = await apiCall(`${API_BASE}/web/areas/${id}/cargos/`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener cargos del area');
      }

      return data;
    },

    /**
     * Obtiene usuarios de un area específica
     * @param {number} id - ID del area
     * @returns {Promise} Usuarios del area
     */
    getUsuarios: async (id) => {
      const response = await apiCall(`${API_BASE}/web/areas/${id}/usuarios/`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener usuarios del area');
      }

      return data;
    },

    /**
     * Lista areas simples para uso en dropdowns
     * @returns {Promise} Areas simplificadas
     */
    simple: async () => {
      const params = new URLSearchParams({
        simple: 'true',
        page_size: '100',
        is_active: 'true'
      });

      const response = await apiCall(`${API_BASE}/web/areas/?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener areas');
      }

      return data;
    }
  },

  // 👔 Gestión de cargos CRUD
  cargos: {
    /**
     * Lista cargos con filtros y paginación
     * @param {number} page - Página actual
     * @param {number} limit - Elementos por página
     * @param {Object} filters - Filtros opcionales
     * @returns {Promise} Lista de cargos
     */
    list: async (page = 1, limit = 10, filters = {}) => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: limit.toString(),
      });

      // Agregar filtros
      if (filters.search) params.append('search', filters.search);
      if (filters.area) params.append('area', filters.area);
      if (filters.only_active_areas) params.append('only_active_areas', filters.only_active_areas);
      if (filters.ordering) params.append('ordering', filters.ordering);

      const response = await apiCall(`${API_BASE}/web/cargos/?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener cargos');
      }

      return data;
    },

    /**
     * Obtiene un cargo específico
     * @param {number} id - ID del cargo
     * @returns {Promise} Datos del cargo
     */
    get: async (id) => {
      const response = await apiCall(`${API_BASE}/web/cargos/${id}/`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener cargo');
      }

      return data;
    },

    /**
     * Crea un nuevo cargo
     * @param {Object} cargoData - Datos del cargo
     * @returns {Promise} Cargo creado
     */
    create: async (cargoData) => {
      const response = await apiCall(`${API_BASE}/web/cargos/`, {
        method: 'POST',
        body: JSON.stringify(cargoData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al crear cargo');
      }

      return data;
    },

    /**
     * Actualiza un cargo existente
     * @param {number} id - ID del cargo
     * @param {Object} cargoData - Datos actualizados
     * @returns {Promise} Cargo actualizado
     */
    update: async (id, cargoData) => {
      const response = await apiCall(`${API_BASE}/web/cargos/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(cargoData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar cargo');
      }

      return data;
    },

    /**
     * Elimina un cargo
     * @param {number} id - ID del cargo
     * @returns {Promise} Respuesta de eliminación
     */
    delete: async (id) => {
      const response = await apiCall(`${API_BASE}/web/cargos/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar cargo');
      }

      return { success: true };
    },

    /**
     * Obtiene usuarios de un cargo específico
     * @param {number} id - ID del cargo
     * @returns {Promise} Usuarios del cargo
     */
    getUsuarios: async (id) => {
      const response = await apiCall(`${API_BASE}/web/cargos/${id}/usuarios/`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener usuarios del cargo');
      }

      return data;
    },

    /**
     * Lista cargos simples para uso en dropdowns
     * @returns {Promise} Cargos simplificados
     */
    simple: async () => {
      const params = new URLSearchParams({
        simple: 'true',
        page_size: '100',
        only_active_areas: 'true'
      });

      const response = await apiCall(`${API_BASE}/web/cargos/?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener cargos');
      }

      return data;
    }
  },

  // 📊 Funciones de utilidad
  utils: {
    /**
     * Valida si existe un area con el mismo nombre
     * @param {string} nombre - Nombre del area
     * @param {number} excludeId - ID a excluir de la validación
     * @returns {Promise} Resultado de validación
     */
    validateAreaName: async (nombre, excludeId = null) => {
      const params = new URLSearchParams({
        search: nombre.trim(),
        page_size: '1'
      });

      const response = await apiCall(`${API_BASE}/web/areas/?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error('Error al validar nombre del area');
      }

      // Verificar si existe un area con el mismo nombre (excluyendo el actual si está editando)
      const areas = data.status === 'success' ? data.data : data.results || [];
      const exists = areas.some(area => 
        area.nombre.toLowerCase() === nombre.toLowerCase() && 
        area.id !== excludeId
      );

      return { exists, areas };
    }
  }
};

export default areasService;
