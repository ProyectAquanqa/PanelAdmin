/**
 * Servicio de Permisos Dinámicos Optimizado - AquanQ
 * Sistema completamente dinámico que se adapta automáticamente a nuevos permisos del backend
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

// Cache para permisos obtenidos del backend
let permissionsCache = {
  structure: null,
  byApp: null,
  mappings: null,
  lastUpdated: null,
  ttl: 5 * 60 * 1000 // 5 minutos
};

// Configuración de apps y modelos del sistema
const SYSTEM_CONFIG = {
  apps: {
    eventos: {
      verbose_name: 'Eventos',
      models: ['evento', 'categoria', 'comentario', 'like']
    },
    chatbot: {
      verbose_name: 'Chatbot', 
      models: ['chatbotknowledgebase', 'chatbotcategory', 'chatconversation']
    },
    auth: {
      verbose_name: 'Autenticación',
      models: ['user', 'group', 'permission']
    },
    areas: {
      verbose_name: 'Áreas',
      models: ['area', 'cargo']
    },
    notificaciones: {
      verbose_name: 'Notificaciones',
      models: ['notificacion', 'devicetoken']
    },
    almuerzos: {
      verbose_name: 'Almuerzos',
      models: ['almuerzo']
    }
  },
  actions: ['view', 'add', 'change', 'delete'],
  translations: {
    // Traducciones de acciones
    actions: {
      'add': 'Crear', 'change': 'Editar', 'delete': 'Eliminar', 'view': 'Ver',
      'publish': 'Publicar', 'pin': 'Destacar', 'feature': 'Promover', 'manage': 'Gestionar'
    },
    // Traducciones de modelos
    models: {
      'evento': 'eventos', 'categoria': 'categorías', 'comentario': 'comentarios', 'like': 'likes',
      'user': 'usuarios', 'usuario': 'usuarios', 'group': 'grupos', 'grupo': 'grupos',
      'chatbotknowledgebase': 'conocimiento del chatbot', 'chatbotcategory': 'categorías del chatbot',
      'chatconversation': 'conversaciones', 'notificacion': 'notificaciones', 'devicetoken': 'dispositivos',
      'permission': 'permission', 'almuerzo': 'almuerzos', 'area': 'áreas', 'cargo': 'cargos'
    }
  }
};

const transformGroupsResponseToPermissions = async (groupsResponse) => {
  try {
    let groups = [];
    if (groupsResponse.status === 'success' && Array.isArray(groupsResponse.data)) {
      groups = groupsResponse.data;
    } else if (Array.isArray(groupsResponse)) {
      groups = groupsResponse;
    } else {
      console.log('⚠️ Respuesta de grupos no es válida para transformar');
      return null;
    }
    
    if (groups.length === 0) {
      console.log('⚠️ No hay grupos disponibles, no se puede extraer estructura de permisos');
      return null;
    }
    
    return {
      status: 'fallback_required',
      reason: 'user_has_limited_permissions',
      message: 'Usuario tiene permisos de grupos pero no permisos completos del sistema'
    };
    
  } catch (error) {
    return null;
  }
};

/**
 * Obtiene la estructura completa de permisos desde el backend de forma dinámica
 */
const getPermissionsStructure = async () => {
  // Verificar cache
  if (permissionsCache.structure && 
      permissionsCache.lastUpdated && 
      (Date.now() - permissionsCache.lastUpdated) < permissionsCache.ttl) {
    console.log('📦 Usando permisos desde cache');
    return permissionsCache.structure;
  }

  try {
    let response = null;
    const endpoints = [
      '/admin/system/permissions/',
      '/web/groups/'
    ];

    for (const endpoint of endpoints) {
      try {
        response = await apiCall(endpoint);
        
        if (endpoint === '/web/groups/') {
          if (response && (response.status === 'success' || Array.isArray(response.data) || Array.isArray(response))) {
            console.log(`✅ Endpoint ${endpoint} (grupos) respondió correctamente`);
            response = await transformGroupsResponseToPermissions(response);
            if (response) {
              break;
            }
          }
        } else {
          if (response && (response.status === 'success' || response.data || Array.isArray(response))) {
            console.log(`✅ Endpoint ${endpoint} respondió correctamente`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Endpoint ${endpoint} falló: ${error.message}`);
        continue;
      }
    }

    if (!response) {
      console.log('⚠️ Todos los endpoints fallaron, usando estructura de respaldo');
      throw new Error('No se pudieron obtener permisos de ningún endpoint');
    }
    
    if (response.status === 'fallback_required') {
      console.log(`✅ ${response.message}`);
      console.log('🔄 Usando estructura de respaldo para usuario con permisos válidos pero limitados');
      throw new Error('fallback_required_for_limited_user');
    }

    if (response && Array.isArray(response) && response.length > 0) {
      console.log('⚠️ Endpoint devolvió grupos, no estructura de permisos');
      throw new Error('Endpoint devolvió grupos, no estructura de permisos');
    }

    // Normalizar respuesta
    let permissionsData = null;
    if (response.status === 'success' && response.data) {
      permissionsData = response.data;
    } else if (response.data) {
      permissionsData = response.data;
    } else {
      permissionsData = response;
    }

    if (!permissionsData || (!permissionsData.permissions_by_app && !permissionsData.applications)) {
      console.log('⚠️ Respuesta no contiene estructura de permisos válida');
      throw new Error('Respuesta no contiene estructura de permisos válida');
    }

    const structure = await processPermissionsStructure(permissionsData);
    
    permissionsCache.structure = structure;
    permissionsCache.lastUpdated = Date.now();
    
    return structure;

  } catch (error) {
    if (error.message === 'fallback_required_for_limited_user') {
      console.log('✅ Usuario autenticado con permisos limitados - usando estructura de respaldo');
    } else {
      console.error('❌ Error obteniendo estructura de permisos:', error);
    }
    
    const fallbackStructure = getFallbackPermissionsStructure();
    permissionsCache.structure = fallbackStructure;
    permissionsCache.lastUpdated = Date.now();
    
    return fallbackStructure;
  }
};

/**
 * Procesa la estructura de permisos del backend en un formato uniforme (optimizada)
 */
const processPermissionsStructure = async (rawData) => {
  const structure = { apps: {}, byModel: {}, allPermissions: [] };

  const processPermissions = (permissions, appName, modelName) => {
    const cleanPermissions = [];
    const seenCodenames = new Set();
    
    permissions.forEach(p => {
      const cleanCodename = p.codename?.replace(/^can_/, '') || p.split('.')[1]?.replace(/^can_/, '');
      const action = extractActionFromCodename(cleanCodename);
      
      if (SYSTEM_CONFIG.actions.includes(action) && !seenCodenames.has(cleanCodename)) {
        seenCodenames.add(cleanCodename);
        cleanPermissions.push({
          id: p.id || p,
          name: p.name || cleanCodename,
          codename: cleanCodename,
          originalCodename: p.codename || p.split('.')[1],
          content_type: p.content_type || null,
          app_label: appName,
          model: modelName,
          action: action,
          translatedName: translatePermissionDynamically(cleanCodename, modelName, appName)
        });
      }
    });

    return cleanPermissions;
  };

  // Procesar formato permissions_by_app o applications
  const dataSource = rawData.permissions_by_app || 
    (rawData.applications && rawData.applications.reduce((acc, app) => {
      acc[app.app_label] = {};
      app.models?.forEach(model => {
        acc[app.app_label][model.model] = model.permissions || [];
      });
      return acc;
    }, {}));

  if (dataSource) {
    for (const [appName, appModels] of Object.entries(dataSource)) {
      structure.apps[appName] = {
        name: appName,
        verbose_name: SYSTEM_CONFIG.apps[appName]?.verbose_name || appName.charAt(0).toUpperCase() + appName.slice(1),
        models: {}
      };

      for (const [modelName, permissions] of Object.entries(appModels)) {
        const cleanPermissions = processPermissions(permissions, appName, modelName);

        structure.apps[appName].models[modelName] = {
          name: modelName,
          verbose_name: SYSTEM_CONFIG.translations.models[modelName] || modelName,
          permissions: cleanPermissions
        };

        structure.byModel[modelName] = structure.apps[appName].models[modelName];
        structure.allPermissions.push(...cleanPermissions);
      }
    }
  }

  return structure;
};

/**
 * Traduce dinámicamente cualquier permiso (optimizada)
 */
const translatePermissionDynamically = (codename, modelName, appName) => {
  const cleanCodename = codename.replace(/^can_/, '');
  const action = extractActionFromCodename(cleanCodename);
  const modelVerbose = SYSTEM_CONFIG.translations.models[modelName] || modelName;
  
  // Traducciones específicas para casos especiales
  const specificKey = `${action}_${modelName}`;
  const specificTranslations = {
    'add_evento': 'Crear eventos', 'change_evento': 'Editar eventos', 'delete_evento': 'Eliminar eventos', 'view_evento': 'Ver eventos',
    'add_categoria': 'Crear categorías', 'change_categoria': 'Editar categorías', 'delete_categoria': 'Eliminar categorías', 'view_categoria': 'Ver categorías',
    'add_user': 'Crear usuarios', 'change_user': 'Editar usuarios', 'delete_user': 'Eliminar usuarios', 'view_user': 'Ver usuarios',
    'add_group': 'Crear grupos', 'change_group': 'Editar grupos', 'delete_group': 'Eliminar grupos', 'view_group': 'Ver grupos'
  };
  
  if (specificTranslations[specificKey]) {
    return specificTranslations[specificKey];
  }
  
  const actionSpanish = SYSTEM_CONFIG.translations.actions[action] || action;
  return `${actionSpanish} ${modelVerbose}`;
};

// Funciones de utilidad optimizadas
const extractActionFromCodename = (codename) => codename.split('_')[0];

/**
 * Estructura de permisos de respaldo OPTIMIZADA (genera programáticamente)
 */
const getFallbackPermissionsStructure = () => {
  console.log('⚠️ Usando estructura de permisos de respaldo COMPLETA');
  
  const structure = { apps: {}, byModel: {}, allPermissions: [] };
  
  // Generar estructura programáticamente desde configuración
  Object.entries(SYSTEM_CONFIG.apps).forEach(([appName, appConfig]) => {
    structure.apps[appName] = {
      name: appName,
      verbose_name: appConfig.verbose_name,
      models: {}
    };

    appConfig.models.forEach(modelName => {
      const permissions = SYSTEM_CONFIG.actions.map(action => ({
        id: `${appName}.${action}_${modelName}`,
        codename: `${action}_${modelName}`,
        action: action,
        translatedName: translatePermissionDynamically(`${action}_${modelName}`, modelName, appName)
      }));

      structure.apps[appName].models[modelName] = {
        name: modelName,
        verbose_name: SYSTEM_CONFIG.translations.models[modelName] || modelName,
        permissions: permissions
      };

      structure.byModel[modelName] = structure.apps[appName].models[modelName];
      structure.allPermissions.push(...permissions);
    });
  });
  
  return structure;
};

/**
 * Obtiene la estructura de permisos organizada por módulos del sistema
 */
const getModulePermissionsStructure = async (forProfileManagement = false) => {
  const baseStructure = await getPermissionsStructure();
  
  const moduleStructure = {
    'Eventos': { title: 'Eventos', submodules: [], description: 'Gestión de eventos, categorías, comentarios y likes' },
    'Chatbot': { title: 'Chatbot', submodules: [], description: 'Base de conocimiento, categorías y conversaciones' },
    'Usuarios': { title: 'Usuarios', submodules: [], description: 'Gestión de usuarios, grupos, permisos, áreas y cargos' },
    'Notificaciones': { title: 'Notificaciones', submodules: [], description: 'Historial de notificaciones y dispositivos registrados' },
    'Almuerzos': { title: 'Almuerzos', submodules: [], description: 'Gestión del sistema de almuerzos' }
  };
  
  if (forProfileManagement) {
    console.log('🎯 Cargando TODOS los módulos para gestión de perfiles:', Object.keys(moduleStructure));
  }

  // Mapear apps de Django a módulos
  for (const [appName, appData] of Object.entries(baseStructure.apps)) {
    for (const [modelName, modelData] of Object.entries(appData.models)) {
      const moduleKey = getModuleForModel(appName, modelName);
      
      if (moduleKey && moduleStructure[moduleKey]) {
        const submódulo = {
          id: `${appName}_${modelName}`,
          name: modelData.verbose_name,
          app: appName,
          model: modelName,
          permissions: modelData.permissions
        };
        
        moduleStructure[moduleKey].submodules.push(submódulo);
      }
    }
  }
  
  // Ordenar submódulos alfabéticamente
  Object.values(moduleStructure).forEach(module => {
    if (Array.isArray(module.submodules)) {
      module.submodules.sort((a, b) => String(a.name).localeCompare(String(b.name), 'es', { sensitivity: 'base' }));
    }
  });

  return moduleStructure;
};

/**
 * Determina a qué módulo pertenece un modelo (optimizada)
 */
const getModuleForModel = (appName, modelName) => {
  const moduleMap = {
    'Eventos': ['event', 'eventos', 'evento', 'categoria', 'comentario', 'like'],
    'Chatbot': ['chatbot', 'conversation', 'knowledge', 'chatbotcategory', 'chatbotknowledgebase'],
    'Usuarios': ['user', 'auth', 'area', 'cargo', 'group', 'perfil', 'permission', 'permiso'],
    'Notificaciones': ['notification', 'notificaciones', 'notificacion', 'device', 'dispositivo', 'devicetoken'],
    'Almuerzos': ['almuerzo']
  };

  for (const [moduleKey, keywords] of Object.entries(moduleMap)) {
    if (keywords.some(keyword => appName.includes(keyword) || modelName.includes(keyword))) {
      return moduleKey;
    }
  }

  // Excluir modelos no relevantes
  const excludedKeywords = ['contenttypes', 'sessions', 'admin', 'core', 'contenttype', 'session', 'logentry', 'config', 'setting'];
  if (excludedKeywords.some(excluded => appName.includes(excluded) || modelName.includes(excluded))) {
    return null;
  }

  return null;
};

// Funciones auxiliares simplificadas
const getPermissionsForSubmodule = async (submoduleId) => {
  const [appName, modelName] = submoduleId.split('_');
  const structure = await getPermissionsStructure();
  return structure.apps[appName]?.models[modelName]?.permissions || [];
};

const mapSimplifiedActionToPermissions = async (action, submoduleId) => {
  const permissions = await getPermissionsForSubmodule(submoduleId);
  const actionMap = { 'view': ['view'], 'create': ['add'], 'edit': ['change'], 'delete': ['delete'] };
  const targetActions = actionMap[action] || [action];
  return permissions.filter(p => targetActions.includes(p.action)).map(p => p.id);
};

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
  return [...new Set(permissionIds)];
};

const convertPermissionIdsToSimplifiedSelections = async (permissionIds) => {
  const structure = await getModulePermissionsStructure();
  const selections = {};
  
  for (const [moduleKey, moduleData] of Object.entries(structure)) {
    for (const submodule of moduleData.submodules) {
      selections[submodule.id] = { view: false, create: false, edit: false, delete: false };
      
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
  
  // Funciones específicas para gestión de perfiles
  getCompleteModuleStructureForProfiles: async () => {
    return await getModulePermissionsStructure(true);
  },
  
  // Funciones de procesamiento
  processPermissionsStructure,
  
  // Funciones de utilidad
  getAppVerboseName: (appName) => SYSTEM_CONFIG.apps[appName]?.verbose_name || appName.charAt(0).toUpperCase() + appName.slice(1),
  getModelVerboseName: (modelName) => SYSTEM_CONFIG.translations.models[modelName] || modelName,
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