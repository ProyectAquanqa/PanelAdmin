/**
 * Servicio para comunicación con la API de Usuarios
 * Actualizado para el sistema de permisos dinámicos de AquanQ
 * Compatible con grupos: Trabajador, Editor de Contenido, Administrador de Contenido, Gestor de Chatbot
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://192.168.18.13:8000/api';
const API_BASE = RAW_BASE.replace(/\/(web|admin|mobile)\/?$/, '');

/**
 * Función auxiliar para refrescar token de autenticación
 */
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
    // Si se pasan headers vacías (para FormData), no establecer Content-Type por defecto
    const isFormData = options.body instanceof FormData;
    const hasEmptyHeaders = !options.headers || Object.keys(options.headers).length === 0;
    
    
    // CORREGIR: Siempre incluir Authorization, independientemente del tipo de body
    const defaultHeaders = isFormData && hasEmptyHeaders
      ? {
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        }
      : {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
          ...options.headers,
        };

    // CORREGIR: No permitir que options.headers sobrescriba defaultHeaders
    const { headers: optionsHeaders, ...restOptions } = options;
    const config = {
      ...restOptions,
      headers: defaultHeaders,
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
      
      // Para errores 400, incluir más detalles de validación
      if (response.status === 400) {
        const detailedMessage = [];
        
        // Si hay errores de campo
        if (error && typeof error === 'object') {
          Object.entries(error).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              detailedMessage.push(`${field}: ${messages.join(', ')}`);
            } else if (typeof messages === 'string') {
              detailedMessage.push(`${field}: ${messages}`);
            }
          });
        }
        
        const fullMessage = detailedMessage.length > 0 
          ? detailedMessage.join('; ')
          : error.detail || error.message || 'Error de validación';
          
        throw new Error(fullMessage);
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
        
        // CORREGIR: Actualizar variable local del token
        token = newToken;
        
        // Reintentar con el nuevo token
        return await makeRequest(newToken);
      } catch (refreshError) {
        // Limpiar tokens caducados
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        
        // Mostrar mensaje claro al usuario
        console.error('Tokens expirados, es necesario reloguear');
        throw new Error('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');
      }
    }
    throw error;
  }
};

const userService = {
  // Gestión de usuarios CRUD - Basado en UsuarioViewSet del backend
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

      // Agregar filtros del nuevo sistema de permisos dinámicos
      if (filters.search) params.append('search', filters.search); // Busca en username, first_name, last_name, email
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
      if (filters.groups) params.append('groups', filters.groups); // ID o nombre del grupo
      if (filters.group_name) params.append('group_name', filters.group_name); // Filtrar por nombre específico del grupo
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.ordering) params.append('ordering', filters.ordering);
      if (filters.has_permissions) params.append('has_permissions', filters.has_permissions);

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
      // Crear una copia de los datos para procesamiento
      const processedData = { ...data };
      
      // Eliminar confirmPassword que no es un campo del backend
      delete processedData.confirmPassword;
      
      // Verificar si hay archivos en los datos
      const hasFiles = processedData.foto_perfil instanceof File || processedData.firma instanceof File;
      
      if (hasFiles) {
        // Usar FormData para archivos
        const formData = new FormData();
        
        // Solo agregar campos que tienen valor y no son cadenas vacías
        Object.keys(processedData).forEach(key => {
          const value = processedData[key];
          if (value !== null && value !== undefined && value !== '') {
            formData.append(key, value);
          }
        });
        
        return await apiCall('/web/users/', {
          method: 'POST',
          body: formData,
          headers: {}, // Dejar que el navegador establezca Content-Type para FormData
        });
      } else {
        // Usar JSON para datos sin archivos
        // Filtrar campos vacíos o nulos
        const cleanData = {};
        Object.keys(processedData).forEach(key => {
          const value = processedData[key];
          if (value !== null && value !== undefined && value !== '') {
            cleanData[key] = value;
          }
        });
        
        return await apiCall('/web/users/', {
          method: 'POST',
          body: JSON.stringify(cleanData),
        });
      }
    },
    
    /**
     * Actualiza un usuario existente
     * @param {number} id - ID del usuario
     * @param {Object} data - Datos a actualizar
     * @returns {Promise} Usuario actualizado
     */
    update: async (id, data) => {
      // Crear una copia de los datos para procesamiento
      const processedData = { ...data };
      
      // Para edición: si password está vacío, no enviarlo
      if (!processedData.password || processedData.password.trim() === '') {
        delete processedData.password;
      }
      
      // Eliminar confirmPassword que no es un campo del backend
      delete processedData.confirmPassword;
      
      // Verificar si hay archivos nuevos en los datos
      const hasNewFiles = processedData.foto_perfil instanceof File || processedData.firma instanceof File;
      
      if (hasNewFiles) {
        // Usar FormData para archivos
        const formData = new FormData();
        
        // Solo agregar campos que tienen valor y no son cadenas vacías
        Object.keys(processedData).forEach(key => {
          const value = processedData[key];
          if (value !== null && value !== undefined && value !== '') {
            // Para archivos: solo agregar si es un File nuevo
            if (key === 'foto_perfil' || key === 'firma') {
              if (value instanceof File) {
                formData.append(key, value);
              }
              // Si no es File, no agregarlo (mantener archivo existente)
            } else {
              formData.append(key, value);
            }
          }
        });
        
        return await apiCall(`/web/users/${id}/`, {
          method: 'PATCH', // Usar PATCH para actualización parcial
          body: formData,
          headers: {}, // Dejar que el navegador establezca Content-Type para FormData
        });
      } else {
        // Usar JSON para datos sin archivos nuevos
        // Filtrar campos de archivo si no son File instances
        const cleanData = { ...processedData };
        
        // No enviar campos de archivo si no son archivos nuevos
        if (cleanData.foto_perfil && typeof cleanData.foto_perfil === 'string') {
          delete cleanData.foto_perfil;
        }
        if (cleanData.firma && typeof cleanData.firma === 'string') {
          delete cleanData.firma;
        }
        
        return await apiCall(`/web/users/${id}/`, {
          method: 'PATCH', // Usar PATCH para actualización parcial
          body: JSON.stringify(cleanData),
        });
      }
    },

    /**
     * Actualización parcial de usuario
     * @param {number} id - ID del usuario
     * @param {Object} data - Datos a actualizar
     * @returns {Promise} Usuario actualizado
     */
    patch: async (id, data) => {
      // Crear una copia de los datos para procesamiento
      const processedData = { ...data };
      
      // Para edición: si password está vacío, no enviarlo
      if (!processedData.password || processedData.password.trim() === '') {
        delete processedData.password;
      }
      
      // Eliminar confirmPassword que no es un campo del backend
      delete processedData.confirmPassword;
      
      // No enviar campos de archivo como strings (URLs) - solo Files nuevos
      if (processedData.foto_perfil && typeof processedData.foto_perfil === 'string') {
        delete processedData.foto_perfil;
      }
      if (processedData.firma && typeof processedData.firma === 'string') {
        delete processedData.firma;
      }
      
      return await apiCall(`/web/users/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(processedData),
      });
    },
    
    /**
     * Elimina (desactiva) un usuario
     * @param {number} id - ID del usuario
     * @returns {Promise} Respuesta de la operación
     */
    delete: async (id) => {
      return await apiCall(`/web/users/${id}/`, {
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
     * Obtiene estadísticas de usuarios para el dashboard
     * @returns {Promise} Estadísticas de usuarios por grupo
     */
    getStatistics: async () => {
      return await apiCall('/web/users/statistics/');
    },

    /**
     * Exporta usuarios con permisos avanzados
     * @param {Object} filters - Filtros para la exportación
     * @returns {Promise<Blob>} Archivo CSV con datos completos
     */
    exportWithPermissions: async (filters = {}) => {
      const params = new URLSearchParams({
        format: 'csv',
        include_permissions: 'true',
        include_groups: 'true',
        ...filters
      });
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/web/users/?${params}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al exportar datos de usuarios');
      }
      
      return await response.blob();
    }
  },

  // Gestión de grupos y permisos dinámicos
  groups: {
    /**
     * Lista todos los grupos disponibles del sistema dinámico
     * @returns {Promise} Lista de grupos con permisos
     */
    list: async () => {
      return await apiCall('/web/groups/');
    },

    /**
     * Obtiene información detallada de un grupo específico
     * @param {number} id - ID del grupo
     * @returns {Promise} Detalles del grupo con permisos
     */
    get: async (id) => {
      return await apiCall(`/web/groups/${id}/`);
    },

    /**
     * Asigna un usuario a un grupo específico
     * @param {number} userId - ID del usuario
     * @param {number} groupId - ID del grupo
     * @returns {Promise} Usuario actualizado
     */
    assignUserToGroup: async (userId, groupId) => {
      return await apiCall(`/web/users/${userId}/assign_group/`, {
        method: 'PATCH',
        body: JSON.stringify({ group_id: groupId }),
      });
    },

    /**
     * Remueve un usuario de un grupo específico
     * @param {number} userId - ID del usuario
     * @param {number} groupId - ID del grupo
     * @returns {Promise} Usuario actualizado
     */
    removeUserFromGroup: async (userId, groupId) => {
      return await apiCall(`/web/users/${userId}/remove_group/`, {
        method: 'PATCH',
        body: JSON.stringify({ group_id: groupId }),
      });
    },

    /**
     * Obtiene grupos disponibles según el contexto
     * Los trabajadores van a "Trabajador", administradores pueden ir a cualquier grupo
     * @returns {Promise} Lista de grupos disponibles con descripciones
     */
    getAvailable: async () => {
      return await apiCall('/web/groups/available/');
    }
  },

  // Permisos específicos
  permissions: {
    /**
     * Lista todos los permisos disponibles en el sistema
     * @returns {Promise} Lista de permisos organizados por módulo
     */
    list: async () => {
      return await apiCall('/web/permissions/');
    },

    /**
     * Obtiene permisos específicos de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise} Lista de permisos del usuario
     */
    getUserPermissions: async (userId) => {
      return await apiCall(`/web/users/${userId}/permissions/`);
    },

    /**
     * Verifica si un usuario tiene un permiso específico
     * @param {number} userId - ID del usuario
     * @param {string} permission - Permiso a verificar (ej: 'eventos.add_evento')
     * @returns {Promise<boolean>} True si tiene el permiso
     */
    checkUserPermission: async (userId, permission) => {
      try {
        const response = await apiCall(`/web/users/${userId}/check_permission/`, {
          method: 'POST',
          body: JSON.stringify({ permission }),
        });
        return response.has_permission || false;
      } catch (error) {
        return false;
      }
    }
  },

  // Autenticación y perfil
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

  // Utilidades
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
    },

    /**
     * Obtiene cargos con información de área
     * @returns {Promise} Lista de cargos con área
     */
    getCargosWithArea: async () => {
      try {
        // Intentar obtener desde el endpoint de áreas
        const response = await apiCall('/web/areas/cargos/');
        
        if (response.status === 'success') {
          return response;
        } else if (Array.isArray(response)) {
          return { status: 'success', data: response };
        }
        
        // Fallback: datos mock para desarrollo
        return {
          status: 'success',
          data: [
            { id: 1, nombre: 'Analista de Sistemas', area_nombre: 'Tecnología' },
            { id: 2, nombre: 'Gerente de Operaciones', area_nombre: 'Operaciones' },
            { id: 3, nombre: 'Contador', area_nombre: 'Finanzas' },
            { id: 4, nombre: 'Asistente Administrativo', area_nombre: 'Administración' },
            { id: 5, nombre: 'Técnico de Campo', area_nombre: 'Operaciones' }
          ]
        };
      } catch (error) {
        // Devolver datos mock en caso de error
        return {
          status: 'success',
          data: [
            { id: 1, nombre: 'Analista de Sistemas', area_nombre: 'Tecnología' },
            { id: 2, nombre: 'Gerente de Operaciones', area_nombre: 'Operaciones' },
            { id: 3, nombre: 'Contador', area_nombre: 'Finanzas' },
            { id: 4, nombre: 'Asistente Administrativo', area_nombre: 'Administración' },
            { id: 5, nombre: 'Técnico de Campo', area_nombre: 'Operaciones' }
          ]
        };
      }
    }
  }
};

export default userService;