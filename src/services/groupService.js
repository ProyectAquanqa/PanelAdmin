/**
 * Servicio para comunicación con la API de Grupos
 * Basado en Django Groups nativos con SimpleGroupViewSet
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const API_BASE = RAW_BASE.replace(/\/(web|admin|mobile)\/?$/, '');

// Función auxiliar para refrescar token (reutilizada del userService)
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
    try {
      // Primero obtener lista básica de grupos
      const basicGroups = await apiCall('/web/groups/');
      
      // Extraer el array de datos según el formato de respuesta
      let groups = [];
      if (Array.isArray(basicGroups)) {
        groups = basicGroups;
      } else if (basicGroups && Array.isArray(basicGroups.data)) {
        groups = basicGroups.data;
      } else {
        console.warn('⚠️ Formato inesperado de grupos:', basicGroups);
        return [];
      }

      // Para cada grupo, obtener sus permisos completos
      const groupsWithPermissions = await Promise.all(
        groups.map(async (group) => {
          try {
            const fullGroup = await apiCall(`/web/groups/${group.id}/`);
            
            // Extraer datos según formato de respuesta
            let groupData = fullGroup;
            if (fullGroup && fullGroup.data) {
              groupData = fullGroup.data;
            }
            
            return {
              id: group.id,
              name: group.name,
              users_count: group.users_count || 0,
              permissions: groupData.permissions || []
            };
          } catch (error) {
            console.error(`❌ Error obteniendo permisos para grupo ${group.id}:`, error);
            // Retornar grupo sin permisos si falla
            return {
              id: group.id,
              name: group.name,
              users_count: group.users_count || 0,
              permissions: []
            };
          }
        })
      );

      return groupsWithPermissions;
      
    } catch (error) {
      console.error('❌ Error en groupService.list:', error);
      throw error;
    }
  },

  /**
   * Obtiene un grupo específico
   * @param {number} id - ID del grupo
   * @returns {Promise} Datos del grupo
   */
  get: async (id) => {
    return await apiCall(`/web/groups/${id}/`);
  },

  /**
   * Crea un nuevo grupo
   * @param {Object} data - Datos del grupo
   * @returns {Promise} Grupo creado
   */
  create: async (data) => {
    return await apiCall('/web/groups/', {
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
    return await apiCall(`/web/groups/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Obtiene permisos disponibles para asignar a grupos
   * @returns {Promise} Permisos organizados por app
   */
  getAvailablePermissions: async () => {
    // Intentar diferentes endpoints para máxima compatibilidad
    const endpoints = [
      '/admin/system/permissions/',
      '/web/admin/permissions/', 
      '/admin/permissions/',
      '/api/permissions/'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await apiCall(endpoint);
        if (response && (response.status === 'success' || response.data)) {
          console.log(`✅ Permisos obtenidos desde: ${endpoint}`);
          return response;
        }
      } catch (error) {
        console.log(`⚠️ Endpoint ${endpoint} no disponible:`, error.message);
        continue;
      }
    }

    throw new Error('No se pudieron obtener permisos de ningún endpoint disponible');
  },

  /**
   * Actualización parcial de grupo
   * @param {number} id - ID del grupo
   * @param {Object} data - Datos a actualizar
   * @returns {Promise} Grupo actualizado
   */
  patch: async (id, data) => {
    return await apiCall(`/web/groups/${id}/`, {
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
    return await apiCall(`/web/groups/${id}/`, {
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
    return await apiCall('/web/groups/');
  },

  /**
   * Obtiene todos los permisos disponibles organizados jerárquicamente
   * para el selector de permisos del ProfileModal
   * @returns {Promise} Estructura jerárquica de permisos
   */
  getPermissionsStructure: async () => {
    // Devuelve estructura jerárquica de permisos para el selector
    const resp = await apiCall('/admin/system/permissions/');
    // Normalizar a array de apps con modelos y permisos
    if (resp && resp.status === 'success') {
      const apps = resp.data?.applications || [];
      // Transformar PermissionManagementView (applications) a formato esperado por el formulario
      return apps.map(a => ({
        app_label: a.app_label,
        name: a.app_name || a.app_label,
        models: (a.models || []).map(m => ({
          model: m.name || m.verbose_name || m.model,
          permissions: (m.permissions || []).map(code => {
            const [app_label, codename] = (code || '').split('.');
            return { id: code, name: codename, codename, app_label };
          })
        }))
      }));
    }
    return [];
  },

  /**
   * Alias para compatibilidad con código existente
   * @returns {Promise} Estructura jerárquica de permisos
   */
  getPermissionsForCompatibility: async () => {
    // Usar el método principal actualizado
    return await groupService.getAvailablePermissions();
  }
};

export default groupService;