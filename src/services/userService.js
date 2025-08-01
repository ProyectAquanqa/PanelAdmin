/**
 * Servicio para comunicación con la API de Usuarios
 * Basado en los endpoints de AquanQ UsuarioViewSet
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Función auxiliar para refrescar token
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

    const response = await fetch(`${BASE_URL}${url}`, config);
    
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
        console.log('🔄 Token expirado, intentando refrescar...');
        const newToken = await refreshTokenIfNeeded();
        console.log('✅ Token refrescado exitosamente');
        
        // Reintentar con el nuevo token
        return await makeRequest(newToken);
      } catch (refreshError) {
        console.error('❌ Error al refrescar token:', refreshError);
        throw new Error('Las credenciales de autenticación no se proveyeron.');
      }
    }
    
    console.error('User API Error:', error);
    throw error;
  }
};

const userService = {
  // 👥 Gestión de usuarios CRUD
  users: {
    /**
     * Lista usuarios con filtros y paginación
     * @param {number} page - Página actual
     * @param {number} limit - Elementos por página
     * @param {Object} filters - Filtros opcionales
     * @returns {Promise} Lista de usuarios
     */
    list: async (page = 1, limit = 10, filters = {}) => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: limit.toString(),
      });

      // Agregar filtros si existen
      if (filters.search) params.append('search', filters.search);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
      if (filters.is_staff !== undefined) params.append('is_staff', filters.is_staff);
      if (filters.groups) params.append('groups__name', filters.groups);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.ordering) params.append('ordering', filters.ordering);

      return await apiCall(`/users/?${params}`);
    },
    
    /**
     * Obtiene un usuario específico
     * @param {number} id - ID del usuario
     * @returns {Promise} Datos del usuario
     */
    get: async (id) => {
      return await apiCall(`/users/${id}/`);
    },
    
    /**
     * Crea un nuevo usuario
     * @param {Object} data - Datos del usuario
     * @returns {Promise} Usuario creado
     */
    create: async (data) => {
      return await apiCall('/users/', {
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
      return await apiCall(`/users/${id}/`, {
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
      return await apiCall(`/users/${id}/`, {
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
     * Cambia el estado activo/inactivo del usuario
     * @param {number} id - ID del usuario
     * @returns {Promise} Nuevo estado del usuario
     */
    toggleActiveStatus: async (id) => {
      return await apiCall(`/users/${id}/toggle_active_status/`, {
        method: 'POST',
      });
    },

    /**
     * Obtiene los permisos de un usuario
     * @param {number} id - ID del usuario
     * @returns {Promise} Permisos del usuario
     */
    getPermissions: async (id) => {
      return await apiCall(`/users/${id}/permissions/`);
    },

    /**
     * Obtiene estadísticas generales de usuarios
     * @returns {Promise} Estadísticas de usuarios
     */
    getStatistics: async () => {
      return await apiCall('/users/statistics/');
    },

    /**
     * Importación masiva de usuarios desde datos parseados
     * @param {Array} usersData - Array de datos de usuarios a importar
     * @returns {Promise} Resultado de la importación
     */
    bulkImport: async (usersData) => {
      // Preparar datos para el backend
      const payload = {
        users: usersData.map(user => ({
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email || '',
          is_active: user.is_active !== undefined ? user.is_active : true,
          is_staff: user.is_staff !== undefined ? user.is_staff : false,
          groups: Array.isArray(user.groups) ? user.groups : []
        }))
      };

      return await apiCall('/users/bulk_import/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
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
      return await apiCall('/register/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Obtiene el perfil del usuario autenticado
     * @returns {Promise} Datos del perfil
     */
    getProfile: async () => {
      return await apiCall('/profile/');
    },

    /**
     * Actualiza el perfil del usuario autenticado
     * @param {Object} data - Datos a actualizar
     * @returns {Promise} Perfil actualizado
     */
    updateProfile: async (data) => {
      return await apiCall('/profile/', {
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
      
      const response = await fetch(`${BASE_URL}/users/?${params}`, {
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
      
      const response = await fetch(`${BASE_URL}/users/${userId}/`, {
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
     * Consulta datos de un DNI usando el servicio externo
     * @param {string} dni - DNI de 8 dígitos a consultar
     * @returns {Promise} Datos del DNI o error
     */
    consultarDni: async (dni) => {
      // Debug: verificar token y usuario antes de hacer la llamada
      const token = localStorage.getItem('access_token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      console.log('🔐 Token disponible para DNI:', token ? 'Sí' : 'No');
      console.log('👤 Usuario actual:', user.username || 'No disponible');
      console.log('🏷️ Grupos del usuario:', user.groups || 'No disponible');
      console.log('🔍 Consultando DNI:', dni);
      
      try {
        return await apiCall('/users/consultar_dni/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dni }),
        });
      } catch (error) {
        console.error('❌ Error completo:', error);
        
        // Manejar errores específicos
        if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('credenciales')) {
          throw new Error('No tienes permisos para consultar DNI. Contacta al administrador.');
        }
        
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          throw new Error('Acceso denegado. Necesitas permisos de Admin o QA.');
        }
        
        if (error.message.includes('503') || error.message.includes('Service Unavailable')) {
          throw new Error('Servicio de consulta DNI no disponible temporalmente.');
        }
        
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          throw new Error('DNI no encontrado en la base de datos.');
        }
        
        // Error genérico
        throw error;
      }
    }
  }
};

export default userService;