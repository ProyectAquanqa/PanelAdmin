/**
 * Servicio de Permisos Dinámicos - AquanQ
 * Maneja la verificación de permisos basada en el nuevo sistema dinámico
 * Compatible con el sistema de permisos implementado en el backend
 */

/**
 * Obtiene los permisos del usuario actual desde localStorage
 * @returns {Array} Lista de permisos del usuario
 */
function getUserPermissions() {
  try {
    const permissions = localStorage.getItem('user_permissions');
    return permissions ? JSON.parse(permissions) : [];
  } catch (error) {
    console.error('Error parsing user permissions:', error);
    return [];
  }
}

// Obtiene el usuario actual desde localStorage
function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Verifica si el usuario es superusuario (bypass total)
function isSuperuser() {
  const user = getStoredUser();
  return Boolean(user && (user.is_superuser === true || user.isSuperuser === true));
}

// Verifica si el usuario es staff (acceso elevado al panel web)

/**
 * Obtiene los grupos del usuario actual desde localStorage
 * @returns {Array} Lista de grupos del usuario
 */
function getUserGroups() {
  try {
    const groups = localStorage.getItem('user_groups');
    return groups ? JSON.parse(groups) : [];
  } catch (error) {
    console.error('Error parsing user groups:', error);
    return [];
  }
}

/**
 * Verifica si el usuario tiene un permiso específico
 * @param {string} permission - Permiso en formato 'app.codename_model' (ej: 'eventos.add_evento')
 * @returns {boolean} True si tiene el permiso
 */
function hasPermission(permission) {
  if (isSuperuser()) return true;
  const userPermissions = getUserPermissions();
  return userPermissions.includes(permission);
}

/**
 * Verifica si el usuario puede realizar una acción específica en un modelo
 * @param {string} model - Nombre del modelo (ej: 'evento', 'usuario')
 * @param {string} action - Acción (ej: 'add', 'change', 'delete', 'view')
 * @returns {boolean} True si puede realizar la acción
 */
function canPerform(model, action) {
  if (!model || !action) {
    return false;
  }
  // Normalizar nombres
  const normalizedModel = model.toLowerCase();
  const normalizedAction = action.toLowerCase();
  
  // Mapear modelos a sus nombres de app correctos
  const modelAppMap = {
    'evento': 'eventos',
    'categoria': 'eventos', 
    'usuario': 'users',
    'chatbotknowledgebase': 'chatbot',
    'chatconversation': 'chatbot',
    'chatbotcategory': 'chatbot',
    'notificacion': 'notificaciones',
    'almuerzo': 'almuerzos'
  };
  
  const appName = modelAppMap[normalizedModel] || normalizedModel;
  const permission = `${appName}.${normalizedAction}_${normalizedModel}`;
  
  return hasPermission(permission);
}

/**
 * Verifica si el usuario pertenece a un grupo específico
 * @param {string} groupName - Nombre del grupo
 * @returns {boolean} True si pertenece al grupo
 */
function isInGroup(groupName) {
  if (isSuperuser()) return true;
  const userGroups = getUserGroups();
  return userGroups.some(group => 
    group.name === groupName || group === groupName
  );
}

/**
 * Verifica si el usuario tiene permisos de administrador
 * @returns {boolean} True si es administrador
 */
function isAdmin() {
  return isSuperuser() || isInGroup('Administrador de Contenido') || isInGroup('Admin');
}

/**
 * Verifica si el usuario puede gestionar contenido
 * @returns {boolean} True si puede gestionar contenido
 */
function isContentManager() {
  return isInGroup('Editor de Contenido') || 
         isInGroup('Administrador de Contenido') ||
         isAdmin();
}

/**
 * Verifica si el usuario puede gestionar el chatbot
 * @returns {boolean} True si puede gestionar chatbot
 */
function isChatbotManager() {
  return isInGroup('Gestor de Chatbot') || isAdmin();
}

/**
 * Verifica si el usuario es solo trabajador (sin permisos especiales)
 * @returns {boolean} True si es solo trabajador
 */
function isWorkerOnly() {
  const groups = getUserGroups();
  return groups.length === 1 && isInGroup('Trabajador');
}

/**
 * Obtiene las capacidades específicas del usuario para eventos
 * @returns {Object} Objeto con capacidades booleanas
 */
function getEventCapabilities() {
  return {
    canView: canPerform('evento', 'view'),
    canCreate: canPerform('evento', 'add'),
    canEdit: canPerform('evento', 'change'),
    canDelete: canPerform('evento', 'delete'),
    canPublish: hasPermission('eventos.publish_evento'),
    canPin: hasPermission('eventos.pin_evento'),
    canFeature: hasPermission('eventos.feature_evento'),
    canManageCategories: canPerform('categoria', 'change'),
  };
}

/**
 * Obtiene las capacidades específicas del usuario para usuarios
 * @returns {Object} Objeto con capacidades booleanas
 */
function getUserCapabilities() {
  return {
    canView: canPerform('usuario', 'view'),
    canCreate: canPerform('usuario', 'add'),
    canEdit: canPerform('usuario', 'change'),
    canDelete: canPerform('usuario', 'delete'),
    canManage: hasPermission('users.manage_usuario'),
    canViewStats: hasPermission('users.view_usuario_stats'),
    canExport: hasPermission('users.export_usuario'),
  };
}

/**
 * Obtiene las capacidades específicas del usuario para chatbot
 * @returns {Object} Objeto con capacidades booleanas
 */
function getChatbotCapabilities() {
  return {
    canView: canPerform('chatbotknowledgebase', 'view'),
    canCreate: canPerform('chatbotknowledgebase', 'add'),
    canEdit: canPerform('chatbotknowledgebase', 'change'),
    canDelete: canPerform('chatbotknowledgebase', 'delete'),
    canManageEmbeddings: hasPermission('chatbot.manage_embeddings'),
    canBulkImport: hasPermission('chatbot.bulk_import_knowledge'),
    canViewConversations: canPerform('chatconversation', 'view'),
    canManageCategories: canPerform('chatbotcategory', 'change'),
  };
}

/**
 * Guarda los permisos del usuario en localStorage (llamado desde AuthContext)
 * @param {Array} permissions - Lista de permisos
 * @param {Array} groups - Lista de grupos
 */
function setUserPermissions(permissions, groups) {
  try {
    localStorage.setItem('user_permissions', JSON.stringify(permissions || []));
    localStorage.setItem('user_groups', JSON.stringify(groups || []));
  } catch (error) {
    console.error('Error saving user permissions:', error);
  }
}

/**
 * Limpia los permisos del localStorage (llamado en logout)
 */
function clearUserPermissions() {
  localStorage.removeItem('user_permissions');
  localStorage.removeItem('user_groups');
}

/**
 * Obtiene un resumen de las capacidades del usuario
 * @returns {Object} Resumen de capacidades por módulo
 */
function getUserCapabilitiesSummary() {
  return {
    users: getUserCapabilities(),
    events: getEventCapabilities(),
    chatbot: getChatbotCapabilities(),
    groups: {
      isAdmin: isAdmin(),
      isContentManager: isContentManager(),
      isChatbotManager: isChatbotManager(),
      isWorkerOnly: isWorkerOnly(),
    }
  };
}

export default {
  hasPermission,
  canPerform,
  isInGroup,
  isAdmin,
  isContentManager,
  isChatbotManager,
  isWorkerOnly,
  getEventCapabilities,
  getUserCapabilities,
  getChatbotCapabilities,
  setUserPermissions,
  clearUserPermissions,
  getUserCapabilitiesSummary,
};

// Named exports para funciones específicas que se usan en otros archivos
export { 
  getUserPermissions, 
  getUserGroups, 
  hasPermission, 
  canPerform, 
  isInGroup, 
  isAdmin, 
  isContentManager, 
  isChatbotManager, 
  isWorkerOnly, 
  getEventCapabilities, 
  getUserCapabilities, 
  getChatbotCapabilities, 
  setUserPermissions, 
  clearUserPermissions, 
  getUserCapabilitiesSummary, 
  
};
