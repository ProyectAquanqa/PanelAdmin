/**
 * Utilidades para limpiar y normalizar permisos
 * Evita duplicados y mejora las traducciones
 */

/**
 * Limpia un codename de prefijos problemáticos
 * @param {string} codename - Codename original
 * @returns {string} Codename limpio
 */
export const cleanCodename = (codename) => {
  if (!codename) return '';
  
  // Remover prefijos comunes problemáticos
  return codename
    .replace(/^can_/, '')        // Remover prefijo "can_"
    .replace(/^has_/, '')        // Remover prefijo "has_"
    .replace(/^is_/, '')         // Remover prefijo "is_"
    .trim();
};

/**
 * Filtra permisos duplicados basado en codename
 * @param {Array} permissions - Array de permisos
 * @returns {Array} Array de permisos sin duplicados
 */
export const removeDuplicatePermissions = (permissions) => {
  const seen = new Set();
  const unique = [];
  
  permissions.forEach(permission => {
    const cleanedCodename = cleanCodename(permission.codename || permission.name);
    
    if (!seen.has(cleanedCodename)) {
      seen.add(cleanedCodename);
      unique.push({
        ...permission,
        codename: cleanedCodename,
        originalCodename: permission.codename
      });
    }
  });
  
  return unique;
};

/**
 * Normaliza estructura de permisos del backend
 * @param {Object} rawPermissions - Permisos crudos del backend
 * @returns {Object} Permisos normalizados
 */
export const normalizePermissionsStructure = (rawPermissions) => {
  const normalized = {};
  
  Object.entries(rawPermissions).forEach(([appKey, appData]) => {
    normalized[appKey] = {
      ...appData,
      models: {}
    };
    
    if (appData.models) {
      Object.entries(appData.models).forEach(([modelKey, modelData]) => {
        const cleanPermissions = removeDuplicatePermissions(modelData.permissions || []);
        
        normalized[appKey].models[modelKey] = {
          ...modelData,
          permissions: cleanPermissions
        };
      });
    }
  });
  
  return normalized;
};

/**
 * Traduce un permiso a español de forma inteligente
 * @param {Object} permission - Objeto de permiso
 * @param {string} contextName - Nombre del contexto/modelo
 * @returns {string} Traducción en español
 */
export const translatePermissionSmart = (permission, contextName = '') => {
  const codename = cleanCodename(permission.codename || permission.name || '');
  
  // Extraer acción del codename
  const parts = codename.split('_');
  const action = parts[0] || '';
  const modelPart = parts.slice(1).join('_') || '';
  
  // Traducciones específicas prioritarias
  const specificTranslations = {
    'add_evento': 'Crear eventos',
    'change_evento': 'Editar eventos',
    'delete_evento': 'Eliminar eventos',
    'view_evento': 'Ver eventos',
    'publish_evento': 'Publicar eventos',
    'pin_evento': 'Destacar eventos',
    'feature_evento': 'Promover eventos',
    
    'add_categoria': 'Crear categorías',
    'change_categoria': 'Editar categorías',
    'delete_categoria': 'Eliminar categorías',
    'view_categoria': 'Ver categorías',
    
    'add_user': 'Crear usuarios',
    'change_user': 'Editar usuarios',
    'delete_user': 'Eliminar usuarios',
    'view_user': 'Ver usuarios',
    
    'add_group': 'Crear grupos',
    'change_group': 'Editar grupos',
    'delete_group': 'Eliminar grupos',
    'view_group': 'Ver grupos'
  };
  
  // Usar traducción específica si existe
  if (specificTranslations[codename]) {
    return specificTranslations[codename];
  }
  
  // Mapeo de acciones
  const actionMap = {
    'add': 'Crear',
    'change': 'Editar',
    'delete': 'Eliminar',
    'view': 'Ver',
    'publish': 'Publicar',
    'pin': 'Destacar',
    'feature': 'Promover',
    'manage': 'Gestionar',
    'export': 'Exportar',
    'import': 'Importar'
  };
  
  // Mapeo de modelos
  const modelMap = {
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
    'almuerzo': 'almuerzos'
  };
  
  const actionSpanish = actionMap[action] || action;
  const modelSpanish = modelMap[modelPart] || contextName || modelPart;
  
  return `${actionSpanish} ${modelSpanish}`;
};

export default {
  cleanCodename,
  removeDuplicatePermissions,
  normalizePermissionsStructure,
  translatePermissionSmart
};
