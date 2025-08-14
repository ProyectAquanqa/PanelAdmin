/**
 * Servicio de Permisos Dinámicos Mejorado - AquanQ
 * Sistema completamente dinámico que se adapta automáticamente a nuevos permisos del backend
 * Sin hardcodear permisos específicos - Todo viene del backend Django
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const API_BASE = RAW_BASE.replace(/\/(web|admin|mobile)\/?$/, '');

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
            return await makeRequest(data.access);
          }
        }
        
        throw new Error('Token refresh failed');
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('isAuthenticated');
        throw new Error('Las credenciales de autenticación no se proveyeron.');
      }
    }
    throw error;
  }
};

/**
 * Cache para permisos obtenidos del backend
 * Se actualiza automáticamente cada vez que se obtienen nuevos permisos
 */
let permissionsCache = {
  structure: null,
  byApp: null,
  mappings: null,
  lastUpdated: null,
  ttl: 5 * 60 * 1000 // 5 minutos
};

/**
 * Obtiene la estructura completa de permisos desde el backend de forma dinámica
 * @returns {Promise} Estructura organizada por apps, modelos y permisos
 */
const getPermissionsStructure = async () => {
  // Verificar cache
  if (permissionsCache.structure && 
      permissionsCache.lastUpdated && 
      (Date.now() - permissionsCache.lastUpdated) < permissionsCache.ttl) {
    return permissionsCache.structure;
  }

  try {
    console.log('🔄 Obteniendo estructura de permisos del backend...');
    
    // Intentar diferentes endpoints que podrían existir
    let response = null;
    const endpoints = [
      '/admin/system/permissions/',
      '/web/admin/permissions/',
      '/admin/permissions/',
      '/api/permissions/'
    ];

    for (const endpoint of endpoints) {
      try {
        response = await apiCall(endpoint);
        if (response && (response.status === 'success' || response.data)) {
          break;
        }
      } catch (error) {
        console.log(`⚠️ Endpoint ${endpoint} no disponible`);
        continue;
      }
    }

    if (!response) {
      throw new Error('No se pudieron obtener permisos de ningún endpoint');
    }

    // Normalizar respuesta según diferentes formatos posibles
    let permissionsData = null;
    if (response.status === 'success' && response.data) {
      permissionsData = response.data;
    } else if (response.data) {
      permissionsData = response.data;
    } else {
      permissionsData = response;
    }

    // Procesar estructura de permisos
    const structure = await processPermissionsStructure(permissionsData);
    
    // Actualizar cache
    permissionsCache.structure = structure;
    permissionsCache.lastUpdated = Date.now();
    
    return structure;

  } catch (error) {
    console.error('❌ Error obteniendo estructura de permisos:', error);
    
    // Si falla, devolver estructura mínima basada en apps conocidas
    return getFallbackPermissionsStructure();
  }
};

/**
 * Procesa la estructura de permisos del backend en un formato uniforme
 * @param {Object} rawData - Datos crudos del backend
 * @returns {Object} Estructura procesada
 */
const processPermissionsStructure = async (rawData) => {
  const structure = {
    apps: {},
    byModel: {},
    allPermissions: []
  };

  // Procesar diferentes formatos posibles de respuesta
  if (rawData.permissions_by_app) {
    // Formato: {permissions_by_app: {app1: {model1: [permissions]}}}
    for (const [appName, appModels] of Object.entries(rawData.permissions_by_app)) {
      structure.apps[appName] = {
        name: appName,
        verbose_name: getAppVerboseName(appName),
        models: {}
      };

      for (const [modelName, permissions] of Object.entries(appModels)) {
        // Filtrar permisos duplicados y limpiar datos
        const cleanPermissions = [];
        const seenCodenames = new Set();
        
        permissions.forEach(p => {
          const cleanCodename = p.codename.replace(/^can_/, '');
          const action = extractActionFromCodename(cleanCodename);
          
          // FILTRAR SOLO ACCIONES CRUD PRINCIPALES
          const allowedActions = ['view', 'add', 'change', 'delete'];
          
          if (allowedActions.includes(action) && !seenCodenames.has(cleanCodename)) {
            seenCodenames.add(cleanCodename);
            cleanPermissions.push({
              id: p.id,
              name: p.name,
              codename: cleanCodename,
              originalCodename: p.codename,
              content_type: p.content_type,
              app_label: appName,
              model: modelName,
              action: action,
              translatedName: translatePermissionDynamically(cleanCodename, modelName, appName)
            });
          }
        });

        structure.apps[appName].models[modelName] = {
          name: modelName,
          verbose_name: getModelVerboseName(modelName),
          permissions: cleanPermissions
        };

        // Agregar al índice por modelo
        structure.byModel[modelName] = structure.apps[appName].models[modelName];
        
        // Agregar al array de todos los permisos
        structure.allPermissions.push(...structure.apps[appName].models[modelName].permissions);
      }
    }
  } else if (rawData.applications) {
    // Formato: {applications: [{app_label, models: []}]}
    for (const app of rawData.applications) {
      structure.apps[app.app_label] = {
        name: app.app_label,
        verbose_name: app.app_name || getAppVerboseName(app.app_label),
        models: {}
      };

      for (const model of (app.models || [])) {
        // Filtrar permisos duplicados para formato applications
        const cleanPermissions = [];
        const seenCodenames = new Set();
        
        (model.permissions || []).forEach(permCode => {
          const [appLabel, codename] = permCode.split('.');
          const cleanCodename = codename.replace(/^can_/, '');
          const action = extractActionFromCodename(cleanCodename);
          
          // FILTRAR SOLO ACCIONES CRUD PRINCIPALES
          const allowedActions = ['view', 'add', 'change', 'delete'];
          
          if (allowedActions.includes(action) && !seenCodenames.has(cleanCodename)) {
            seenCodenames.add(cleanCodename);
            cleanPermissions.push({
              id: permCode,
              name: codename,
              codename: cleanCodename,
              originalCodename: codename,
              content_type: null,
              app_label: appLabel,
              model: model.model,
              action: action,
              translatedName: translatePermissionDynamically(cleanCodename, model.model, appLabel)
            });
          }
        });

        structure.apps[app.app_label].models[model.model] = {
          name: model.model,
          verbose_name: model.verbose_name || getModelVerboseName(model.model),
          permissions: cleanPermissions
        };

        structure.byModel[model.model] = structure.apps[app.app_label].models[model.model];
        structure.allPermissions.push(...structure.apps[app.app_label].models[model.model].permissions);
      }
    }
  }

  return structure;
};

/**
 * Traduce dinámicamente cualquier permiso basado en patrones
 * Evita duplicados y proporciona traducciones limpias
 * @param {string} codename - Codename del permiso (ej: 'add_evento')
 * @param {string} modelName - Nombre del modelo
 * @param {string} appName - Nombre de la app
 * @returns {string} Traducción en español
 */
const translatePermissionDynamically = (codename, modelName, appName) => {
  // Limpiar codename de prefijos problemáticos
  const cleanCodename = codename.replace(/^can_/, '');
  
  // Extraer acción del codename limpio
  const action = extractActionFromCodename(cleanCodename);
  const modelVerbose = getModelVerboseName(modelName);
  
  // Diccionario de traducciones específicas para evitar problemas
  const specificTranslations = {
    // Eventos
    'add_evento': 'Crear eventos',
    'change_evento': 'Editar eventos',
    'delete_evento': 'Eliminar eventos', 
    'view_evento': 'Ver eventos',
    'publish_evento': 'Publicar eventos',
    'pin_evento': 'Destacar eventos',
    'feature_evento': 'Promover eventos',
    
    // Categorías
    'add_categoria': 'Crear categorías',
    'change_categoria': 'Editar categorías',
    'delete_categoria': 'Eliminar categorías',
    'view_categoria': 'Ver categorías',
    
    // Usuarios
    'add_user': 'Crear usuarios',
    'change_user': 'Editar usuarios', 
    'delete_user': 'Eliminar usuarios',
    'view_user': 'Ver usuarios',
    
    // Grupos
    'add_group': 'Crear grupos',
    'change_group': 'Editar grupos',
    'delete_group': 'Eliminar grupos',
    'view_group': 'Ver grupos'
  };
  
  // Usar traducción específica si existe
  if (specificTranslations[cleanCodename]) {
    return specificTranslations[cleanCodename];
  }
  
  // Mapeo dinámico de acciones comunes
  const actionTranslations = {
    'add': 'Crear',
    'change': 'Editar',
    'delete': 'Eliminar',
    'view': 'Ver',
    'publish': 'Publicar',
    'pin': 'Destacar',
    'feature': 'Promover',
    'manage': 'Gestionar',
    'export': 'Exportar',
    'import': 'Importar',
    'approve': 'Aprobar',
    'reject': 'Rechazar',
    'assign': 'Asignar',
    'unassign': 'Desasignar',
    'moderate': 'Moderar',
    'review': 'Revisar',
    'archive': 'Archivar',
    'restore': 'Restaurar'
  };

  const actionSpanish = actionTranslations[action] || action;
  return `${actionSpanish} ${modelVerbose}`;
};

/**
 * Extrae la acción del codename de un permiso
 * @param {string} codename - Codename del permiso
 * @returns {string} Acción extraída
 */
const extractActionFromCodename = (codename) => {
  // Los codenames de Django siguen el patrón: action_model
  const parts = codename.split('_');
  return parts.length > 1 ? parts[0] : codename;
};

/**
 * Obtiene el nombre verbose de una app
 * @param {string} appName - Nombre técnico de la app
 * @returns {string} Nombre amigable
 */
const getAppVerboseName = (appName) => {
  const appTranslations = {
    'events': 'Eventos',
    'eventos': 'Eventos',
    'chatbot': 'Chatbot',
    'users': 'Usuarios',
    'auth': 'Autenticación',
    'contenttypes': 'Tipos de Contenido',
    'sessions': 'Sesiones',
    'admin': 'Administración',
    'notifications': 'Notificaciones',
    'notificaciones': 'Notificaciones',
    'almuerzos': 'Almuerzos',
    'permisos': 'Permisos',
    'grupos': 'Grupos'
  };

  return appTranslations[appName] || appName.charAt(0).toUpperCase() + appName.slice(1);
};

/**
 * Obtiene el nombre verbose de un modelo
 * @param {string} modelName - Nombre técnico del modelo
 * @returns {string} Nombre amigable
 */
const getModelVerboseName = (modelName) => {
  const modelTranslations = {
    'evento': 'eventos',
    'categoria': 'categorías',
    'user': 'usuarios',
    'usuario': 'usuarios',
    'group': 'grupos',
    'grupo': 'grupos',
    'chatbotknowledgebase': 'conocimiento del chatbot',
    'chatbotcategory': 'categorías del chatbot',
    'chatconversation': 'conversaciones',
    'notificacion': 'notificaciones',
    'devicetoken': 'dispositivos',
    'permission': 'permisos',
    'permiso': 'permisos',
    'almuerzo': 'almuerzos'
  };

  return modelTranslations[modelName] || modelName;
};

/**
 * Estructura de permisos de respaldo si falla la carga dinámica
 * @returns {Object} Estructura mínima
 */
const getFallbackPermissionsStructure = () => {
  console.log('⚠️ Usando estructura de permisos de respaldo');
  
  return {
    apps: {
      events: {
        name: 'events',
        verbose_name: 'Eventos',
        models: {
          evento: {
            name: 'evento',
            verbose_name: 'eventos',
            permissions: [
              { id: 'events.add_evento', codename: 'add_evento', action: 'add', translatedName: 'Crear eventos' },
              { id: 'events.change_evento', codename: 'change_evento', action: 'change', translatedName: 'Editar eventos' },
              { id: 'events.delete_evento', codename: 'delete_evento', action: 'delete', translatedName: 'Eliminar eventos' },
              { id: 'events.view_evento', codename: 'view_evento', action: 'view', translatedName: 'Ver eventos' }
            ]
          }
        }
      },
      auth: {
        name: 'auth',
        verbose_name: 'Autenticación',
        models: {
          group: {
            name: 'group',
            verbose_name: 'grupos',
            permissions: [
              { id: 'auth.add_group', codename: 'add_group', action: 'add', translatedName: 'Crear grupos' },
              { id: 'auth.change_group', codename: 'change_group', action: 'change', translatedName: 'Editar grupos' },
              { id: 'auth.delete_group', codename: 'delete_group', action: 'delete', translatedName: 'Eliminar grupos' },
              { id: 'auth.view_group', codename: 'view_group', action: 'view', translatedName: 'Ver grupos' }
            ]
          }
        }
      }
    },
    byModel: {},
    allPermissions: []
  };
};

/**
 * Obtiene la estructura de permisos organizada por módulos del sistema
 * Compatible con el diseño de ProfileFormNew
 * @returns {Promise} Estructura organizada por módulos de la aplicación
 */
const getModulePermissionsStructure = async () => {
  const baseStructure = await getPermissionsStructure();
  
  // Organizar permisos por módulos de la aplicación (no por apps de Django)
  // Estructura actualizada según los módulos del sidebar actual
  const moduleStructure = {
    'Eventos': {
      title: 'Eventos',
      submodules: []
    },
    'Chatbot': {
      title: 'Chatbot',
      submodules: []
    },
    'Usuarios': {
      title: 'Usuarios',
      submodules: []
    },
    'Notificaciones': {
      title: 'Notificaciones',
      submodules: []
    },
    'Almuerzos': {
      title: 'Almuerzos',
      submodules: []
    }
  };

  // Mapear apps de Django a módulos de la aplicación
  for (const [appName, appData] of Object.entries(baseStructure.apps)) {
    for (const [modelName, modelData] of Object.entries(appData.models)) {
      // Determinar a qué módulo pertenece este modelo
      const moduleKey = getModuleForModel(appName, modelName);
      
      if (moduleKey && moduleStructure[moduleKey]) {
        moduleStructure[moduleKey].submodules.push({
          id: `${appName}_${modelName}`,
          name: modelData.verbose_name,
          app: appName,
          model: modelName,
          permissions: modelData.permissions
        });
      }
    }
  }

  return moduleStructure;
};

/**
 * Determina a qué módulo de la aplicación pertenece un modelo específico
 * @param {string} appName - Nombre de la app
 * @param {string} modelName - Nombre del modelo
 * @returns {string} Clave del módulo
 */
const getModuleForModel = (appName, modelName) => {
  // Mapeo dinámico basado en patrones - actualizado según módulos del sidebar actual
  if (appName.includes('event') || modelName.includes('evento') || modelName.includes('categoria')) {
    return 'Eventos';
  }
  
  if (appName.includes('chatbot') || modelName.includes('chatbot') || modelName.includes('conversation')) {
    return 'Chatbot';
  }
  
  if (appName.includes('user') || appName === 'auth' || modelName.includes('user') || modelName.includes('group')) {
    return 'Usuarios';
  }
  
  if (appName.includes('notification') || modelName.includes('notification') || modelName.includes('device')) {
    return 'Notificaciones';
  }
  
  if (appName.includes('almuerzo') || modelName.includes('almuerzo')) {
    return 'Almuerzos';
  }
  
  // Si no coincide con ningún módulo específico, no se incluye
  // Esto elimina la sección de "Configuración" que ya no existe
  return null;
};

/**
 * Obtiene permisos específicos para un submódulo
 * @param {string} submoduleId - ID del submódulo (formato: app_model)
 * @returns {Promise} Array de permisos con traducciones
 */
const getPermissionsForSubmodule = async (submoduleId) => {
  const [appName, modelName] = submoduleId.split('_');
  const structure = await getPermissionsStructure();
  
  if (structure.apps[appName] && structure.apps[appName].models[modelName]) {
    return structure.apps[appName].models[modelName].permissions;
  }
  
  return [];
};

/**
 * Mapea acciones simplificadas a permisos específicos de Django
 * @param {string} action - Acción simplificada ('view', 'create', 'edit', 'delete')
 * @param {string} submoduleId - ID del submódulo
 * @returns {Promise} Array de IDs de permisos
 */
const mapSimplifiedActionToPermissions = async (action, submoduleId) => {
  const permissions = await getPermissionsForSubmodule(submoduleId);
  
  const actionMap = {
    'view': ['view'],
    'create': ['add'],
    'edit': ['change'],
    'delete': ['delete']
  };
  
  const targetActions = actionMap[action] || [action];
  
  return permissions
    .filter(p => targetActions.includes(p.action))
    .map(p => p.id);
};

/**
 * Convierte selecciones simplificadas en lista completa de IDs de permisos
 * @param {Object} simplifiedSelections - Objeto con selecciones por submódulo y acción
 * @returns {Promise} Array de IDs de permisos para enviar al backend
 */
const convertSimplifiedSelectionsToPermissionIds = async (simplifiedSelections) => {
  const permissionIds = [];
  
  for (const [submoduleId, actions] of Object.entries(simplifiedSelections)) {
    for (const [action, isSelected] of Object.entries(actions)) {
      if (isSelected) {
        const actionPermissions = await mapSimplifiedActionToPermissions(action, submoduleId);
        permissionIds.push(...actionPermissions);
      }
    }
  }
  
  // Eliminar duplicados
  return [...new Set(permissionIds)];
};

/**
 * Convierte una lista de IDs de permisos en selecciones simplificadas
 * @param {Array} permissionIds - Array de IDs de permisos
 * @returns {Promise} Objeto con selecciones por submódulo y acción
 */
const convertPermissionIdsToSimplifiedSelections = async (permissionIds) => {
  const structure = await getModulePermissionsStructure();
  const selections = {};
  
  for (const [moduleKey, moduleData] of Object.entries(structure)) {
    for (const submodule of moduleData.submodules) {
      selections[submodule.id] = {
        view: false,
        create: false,
        edit: false,
        delete: false
      };
      
      // Verificar qué acciones están habilitadas
      for (const permission of submodule.permissions) {
        if (permissionIds.includes(permission.id)) {
          const action = permission.action;
          if (action === 'view') selections[submodule.id].view = true;
          if (action === 'add') selections[submodule.id].create = true;
          if (action === 'change') selections[submodule.id].edit = true;
          if (action === 'delete') selections[submodule.id].delete = true;
        }
      }
    }
  }
  
  return selections;
};

export default {
  getPermissionsStructure,
  getModulePermissionsStructure,
  getPermissionsForSubmodule,
  mapSimplifiedActionToPermissions,
  convertSimplifiedSelectionsToPermissionIds,
  convertPermissionIdsToSimplifiedSelections,
  translatePermissionDynamically,
  
  // Funciones de utilidad
  getAppVerboseName,
  getModelVerboseName,
  extractActionFromCodename,
  
  // Cache management
  clearCache: () => {
    permissionsCache = {
      structure: null,
      byApp: null,
      mappings: null,
      lastUpdated: null,
      ttl: 5 * 60 * 1000
    };
  }
};
