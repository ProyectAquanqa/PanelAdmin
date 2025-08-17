/**
 * Servicio para comunicación con la API de Grupos
 * Basado en Django Groups nativos con SimpleGroupViewSet
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://192.168.18.13:8000/api';
const API_BASE = RAW_BASE.replace(/\/(web|admin|mobile)\/?$/, '');

/**
 * Intenta obtener permisos detallados desde un grupo específico
 * @param {Object} groupsResponse - Respuesta del endpoint de grupos
 * @returns {Promise} Estructura de permisos o null
 */
const tryGetDetailedGroupPermissions = async (groupsResponse) => {
  try {

    
    // Extraer lista de grupos
    let groups = [];
    if (groupsResponse.status === 'success' && Array.isArray(groupsResponse.data)) {
      groups = groupsResponse.data;
    } else if (Array.isArray(groupsResponse)) {
      groups = groupsResponse;
    }
    
    if (groups.length === 0) {
      return null;
    }
    
    // Tomar el primer grupo e intentar obtener sus detalles con permisos
    const firstGroup = groups[0];
    if (!firstGroup.id) {
      return null;
    }
    

    
    try {
      const detailedGroup = await apiCall(`/web/groups/${firstGroup.id}/`);
      
      if (detailedGroup && detailedGroup.status === 'success' && detailedGroup.data && detailedGroup.data.permissions) {

        
        // Transformar los permisos del grupo en una estructura similar a la esperada
        const permissions_by_app = {};
        
        detailedGroup.data.permissions.forEach(permission => {
          if (permission.full_codename) {
            const parts = permission.full_codename.split('.');
            if (parts.length === 2) {
              const [appLabel, codename] = parts;
              
              if (!permissions_by_app[appLabel]) {
                permissions_by_app[appLabel] = {};
              }
              
              // Extraer el modelo del codename (formato: action_model)
              const modelMatch = codename.match(/^(add|change|delete|view)_(.+)$/);
              if (modelMatch) {
                const [, action, modelName] = modelMatch;
                
                if (!permissions_by_app[appLabel][modelName]) {
                  permissions_by_app[appLabel][modelName] = [];
                }
                
                permissions_by_app[appLabel][modelName].push({
                  id: permission.id,
                  name: permission.name,
                  codename: permission.codename,
                  content_type: null,
                  app_label: appLabel,
                  model: modelName
                });
              }
            }
          }
        });
        
        return {
          status: 'success',
          data: {
            permissions_by_app: permissions_by_app,
            source: 'group_permissions'
          }
        };
      }
    } catch (groupDetailError) {
      // No se pudieron obtener detalles del grupo
    }
    
    return null;
    
  } catch (error) {

    return null;
  }
};

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
    const convertedData = { ...data };
    // Intentar convertir strings 'app.codename' a IDs si el endpoint admin está disponible
    if (Array.isArray(convertedData.permissions)) {
      try {
        const resp = await apiCall('/admin/system/permissions/');
        const data = resp?.data || resp;
        const dynamicMap = {};
        if (data && data.permissions_by_app) {
          Object.entries(data.permissions_by_app).forEach(([appLabel, appObj]) => {
            Object.values(appObj).forEach(modelPerms => {
              if (Array.isArray(modelPerms)) {
                modelPerms.forEach(perm => {
                  if (perm.full_codename && perm.id != null) {
                    dynamicMap[perm.full_codename] = perm.id;
                    // Soportar sinónimos de app_label
                    const [, code] = perm.full_codename.split('.');
                    if (appLabel === 'eventos') dynamicMap[`events.${code}`] = perm.id;
                    if (appLabel === 'events') dynamicMap[`eventos.${code}`] = perm.id;
                    if (appLabel === 'notificaciones') dynamicMap[`notifications.${code}`] = perm.id;
                    if (appLabel === 'notifications') dynamicMap[`notificaciones.${code}`] = perm.id;
                    if (appLabel === 'auth') dynamicMap[`users.${code}`] = perm.id;
                    if (appLabel === 'users') dynamicMap[`auth.${code}`] = perm.id;
                  }
                });
              }
            });
          });
        }
        if (Object.keys(dynamicMap).length > 0) {
          const normalized = convertedData.permissions.map(p => {
            if (typeof p === 'number') return p;
            if (typeof p === 'string' && p.includes('.')) return dynamicMap[p] ?? p;
            if (p && typeof p === 'object') {
              if (p.id != null) return p.id;
              if (p.full_codename && dynamicMap[p.full_codename]) return dynamicMap[p.full_codename];
            }
            return p;
          });
          convertedData.permissions = Array.from(new Set(normalized));
        }
      } catch (e) {
        // Sin acceso al endpoint admin: enviar tal cual (ids y/o app.codename)
      }
    }
    // Backend acepta ids numéricos o strings 'app.codename'
    return await apiCall('/web/groups/', {
      method: 'POST',
      body: JSON.stringify(convertedData),
    });
  },

  /**
   * Actualiza un grupo existente
   * @param {number} id - ID del grupo
   * @param {Object} data - Datos a actualizar
   * @returns {Promise} Grupo actualizado
   */
  update: async (id, data) => {
    const convertedData = { ...data };
    if (Array.isArray(convertedData.permissions)) {
      try {
        const resp = await apiCall('/admin/system/permissions/');
        const data = resp?.data || resp;
        const dynamicMap = {};
        if (data && data.permissions_by_app) {
          Object.entries(data.permissions_by_app).forEach(([appLabel, appObj]) => {
            Object.values(appObj).forEach(modelPerms => {
              if (Array.isArray(modelPerms)) {
                modelPerms.forEach(perm => {
                  if (perm.full_codename && perm.id != null) {
                    dynamicMap[perm.full_codename] = perm.id;
                    const [, code] = perm.full_codename.split('.');
                    if (appLabel === 'eventos') dynamicMap[`events.${code}`] = perm.id;
                    if (appLabel === 'events') dynamicMap[`eventos.${code}`] = perm.id;
                    if (appLabel === 'notificaciones') dynamicMap[`notifications.${code}`] = perm.id;
                    if (appLabel === 'notifications') dynamicMap[`notificaciones.${code}`] = perm.id;
                    if (appLabel === 'auth') dynamicMap[`users.${code}`] = perm.id;
                    if (appLabel === 'users') dynamicMap[`auth.${code}`] = perm.id;
                  }
                });
              }
            });
          });
        }
        if (Object.keys(dynamicMap).length > 0) {
          const normalized = convertedData.permissions.map(p => {
            if (typeof p === 'number') return p;
            if (typeof p === 'string' && p.includes('.')) return dynamicMap[p] ?? p;
            if (p && typeof p === 'object') {
              if (p.id != null) return p.id;
              if (p.full_codename && dynamicMap[p.full_codename]) return dynamicMap[p.full_codename];
            }
            return p;
          });
          convertedData.permissions = Array.from(new Set(normalized));
        }
      } catch (e) {
        // Sin acceso: enviar tal cual
      }
    }
    // Backend acepta ids numéricos o strings 'app.codename'
    return await apiCall(`/web/groups/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(convertedData),
    });
  },

  /**
   * Obtiene permisos disponibles para asignar a grupos
   * @returns {Promise} Permisos organizados por app
   */
  getAvailablePermissions: async () => {
    const endpoints = ['/admin/system/permissions/', '/web/groups/'];

    for (const endpoint of endpoints) {
      try {
        const response = await apiCall(endpoint);

        if (endpoint === '/admin/system/permissions/') {
          // Normalizar ambas posibles formas de respuesta
          if (response && (response.status === 'success' || response.permissions_by_app || response.data)) {
            const data = response.data || response;
            if (data.permissions_by_app) {
              return { status: 'success', data };
            }
            if (Array.isArray(data.applications)) {
              return { status: 'success', data };
            }
          }
        }

        if (endpoint === '/web/groups/') {
          if (response && (response.status === 'success' || Array.isArray(response.data) || Array.isArray(response))) {
            const detailedResponse = await tryGetDetailedGroupPermissions(response);
            if (detailedResponse) {
              return detailedResponse;
            }
          }
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error('No se pudieron obtener permisos');
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