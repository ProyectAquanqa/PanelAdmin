/**
 * Servicio para comunicación con la API de Usuarios
 * Basado en los endpoints de AquanQ UsuarioViewSet
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
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
    // Si falla el refresh, limpiar tokens
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

    const response = await fetch(`${API_BASE}${url}`, config);
    
    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch (parseError) {
        // Si no se puede parsear como JSON, crear un error básico
        error = { message: `HTTP ${response.status}` };
      }
      
      // Si es error 401, podría ser token expirado
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
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
  };

  try {
    // Intentar la petición inicial
    return await makeRequest(token);
  } catch (error) {
    // Si es error de autorización, intentar refrescar token
    if (error.message === 'UNAUTHORIZED' && token) {
      try {
        const newToken = await refreshTokenIfNeeded();
        
        // Reintentar con el nuevo token
        return await makeRequest(newToken);
      } catch (refreshError) {
        throw new Error('Las credenciales de autenticación no se proveyeron.');
      }
    }
    throw error;
  }
};

const userService = {
  // 👥 Gestión de usuarios CRUD - Basado en UsuarioViewSet del backend
  users: {
    /**
     * Lista usuarios con filtros y paginación
     * @param {number} page - Página actual
     * @param {number} limit - Elementos por página
     * @param {Object} filters - Filtros opcionales basados en el backend
     * @returns {Promise} Lista de usuarios
     */
    list: async (page = 1, limit = 10, filters = {}) => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: limit.toString(),
      });

      // Agregar filtros basados exactamente en el backend (users/views.py)
      if (filters.search) params.append('search', filters.search); // Busca en username, first_name, last_name, email
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
      if (filters.tipo_usuario) params.append('tipo_usuario', filters.tipo_usuario); // ADMIN o TRABAJADOR
      if (filters.groups) params.append('groups', filters.groups); // ID del grupo
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.ordering) params.append('ordering', filters.ordering);

      return await apiCall(`/web/users/?${params}`);
    },
    
    /**
     * Obtiene un usuario específico
     * @param {number} id - ID del usuario
     * @returns {Promise} Datos del usuario
     */
    get: async (id) => {
      return await apiCall(`/web/users/${id}/`);
    },
    
    /**
     * Crea un nuevo usuario
     * @param {Object} data - Datos del usuario
     * @returns {Promise} Usuario creado
     */
    create: async (data) => {
      return await apiCall('/web/users/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    /**
     * Actualiza un usuario existente
     * @param {number} id - ID del usuario
     * @param {Object} data - Datos a actualizar
     * @returns {Promise} Usuario actualizado
     */
    update: async (id, data) => {
      return await apiCall(`/web/users/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    /**
     * Actualización parcial de usuario
     * @param {number} id - ID del usuario
     * @param {Object} data - Datos a actualizar
     * @returns {Promise} Usuario actualizado
     */
    patch: async (id, data) => {
      return await apiCall(`/web/users/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    
    /**
     * Elimina (desactiva) un usuario
     * @param {number} id - ID del usuario
     * @returns {Promise} Respuesta de la operación
     */
    delete: async (id) => {
      return await apiCall(`/users/${id}/`, {
        method: 'DELETE',
      });
    },

    /**
     * Cambia el estado activo/inactivo del usuario (endpoint correcto del backend)
     * @param {number} id - ID del usuario
     * @returns {Promise} Nuevo estado del usuario
     */
    toggleActiveStatus: async (id) => {
      return await apiCall(`/admin/users/${id}/toggle_active/`, {
        method: 'PATCH',
      });
    },

    /**
     * Obtiene grupos disponibles filtrados por tipo de usuario
     * @param {string} tipoUsuario - 'ADMIN' o 'TRABAJADOR'
     * @returns {Promise} Lista de grupos disponibles
     */
    getGroupsDisponibles: async (tipoUsuario = null) => {
      const params = new URLSearchParams();
      if (tipoUsuario === 'ADMIN') {
        params.append('is_admin_group', 'true');
      } else if (tipoUsuario === 'TRABAJADOR') {
        params.append('is_worker_group', 'true');
      }
      params.append('is_active', 'true');
      
      return await apiCall(`/admin/users/?${params}`);
    }
  },

  // 🔐 Autenticación y perfil
  auth: {
    /**
     * Registro de nuevo usuario (usando endpoint existente)
     * @param {Object} data - Datos de registro (dni, password)
     * @returns {Promise} Usuario registrado
     */
    register: async (data) => {
      return await apiCall('/web/auth/register/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Obtiene el perfil del usuario autenticado
     * @returns {Promise} Datos del perfil
     */
    getProfile: async () => {
      return await apiCall('/web/auth/profile/');
    },

    /**
     * Actualiza el perfil del usuario autenticado
     * @param {Object} data - Datos a actualizar
     * @returns {Promise} Perfil actualizado
     */
    updateProfile: async (data) => {
      return await apiCall('/web/auth/profile/', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    }
  },

  // 📊 Utilidades
  utils: {
    /**
     * Exporta lista de usuarios a CSV
     * @param {Object} filters - Filtros para la exportación
     * @returns {Promise<Blob>} Archivo CSV
     */
    exportToCsv: async (filters = {}) => {
      // Filtrar parámetros vacíos y agregar format=csv
      const cleanFilters = {};
      
      // Solo agregar parámetros que tengan valor
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== null && value !== undefined) {
          cleanFilters[key] = value;
        }
      });
      
      // Agregar format=csv
      cleanFilters.format = 'csv';
      
      const params = new URLSearchParams(cleanFilters);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE}/web/users/?${params}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al exportar datos');
      }
      
      return await response.blob();
    },

    /**
     * Subida de imagen de perfil
     * @param {number} userId - ID del usuario
     * @param {File} file - Archivo de imagen
     * @param {string} type - Tipo de imagen ('foto_perfil' o 'firma')
     * @returns {Promise} Usuario actualizado
     */
    uploadImage: async (userId, file, type = 'foto_perfil') => {
      const formData = new FormData();
      formData.append(type, file);
      
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE}/web/users/${userId}/`, {
        method: 'PATCH',
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
          error = { message: 'Error al subir imagen' };
        }
        throw new Error(error.detail || error.message || 'Error al subir imagen');
      }
      
      return await response.json();
    },

    /**
     * Valida disponibilidad de username (DNI)
     * @param {string} username - Username/DNI a validar
     * @returns {Promise<boolean>} True si está disponible
     */
    validateUsername: async (username) => {
      try {
        const response = await apiCall(`/users/?search=${username}`);
        const existingUser = response.results?.find(user => user.username === username);
        return !existingUser;
      } catch (error) {
        console.error('Error validating username:', error);
        return false;
      }
    },

    /**
     * Consulta datos de un DNI usando el cliente especializado
     * @param {string} dni - DNI de 8 dígitos a consultar
     * @returns {Promise} Datos del DNI o error
     */
    consultarDni: async (dni) => {
      // Importación dinámica para evitar dependencias circulares
      const { dniClient } = await import('../api/dniClient');
      return await dniClient.consultarDni(dni);
    }
  }
};

export default userService;