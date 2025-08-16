/**
 * Configuración de permisos para el sistema de perfiles
 * Define qué permisos mostrar y cómo organizarlos
 */

/**
 * Acciones CRUD principales que se muestran en la UI
 * Solo estos permisos aparecerán en el formulario de perfiles
 */
export const CRUD_ACTIONS = ['view', 'add', 'change', 'delete'];

/**
 * Mapeo de acciones a etiquetas en español
 */
export const ACTION_LABELS = {
  'view': 'Ver',
  'add': 'Crear', 
  'change': 'Editar',
  'delete': 'Eliminar'
};

/**
 * Orden de visualización de las acciones CRUD
 */
export const ACTION_ORDER = ['view', 'add', 'change', 'delete'];

/**
 * Permisos que se excluyen del sistema (no se muestran nunca)
 */
export const EXCLUDED_PERMISSIONS = [
  'publish',
  'pin', 
  'feature',
  'manage',
  'export',
  'import',
  'approve',
  'moderate',
  'archive',
  'restore'
];

/**
 * Configuración de módulos que aparecen en la UI
 * Basada en la estructura real del sidebar - SOLO 5 módulos principales
 */
export const UI_MODULES = {
  'Eventos': {
    title: 'Eventos',
    description: 'Gestión de eventos, categorías y comentarios',
    priority: 1
  },
  'Chatbot': {
    title: 'Chatbot',
    description: 'Base de conocimiento, categorías y conversaciones', 
    priority: 2
  },
  'Usuarios': {
    title: 'Usuarios', 
    description: 'Gestión de usuarios, grupos, perfiles, áreas y cargos',
    priority: 3
  },
  'Notificaciones': {
    title: 'Notificaciones',
    description: 'Historial de notificaciones y dispositivos registrados',
    priority: 4
  },
  'Almuerzos': {
    title: 'Almuerzos',
    description: 'Gestión del sistema de almuerzos',
    priority: 5
  }
};

/**
 * Verifica si una acción debe mostrarse en la UI
 * @param {string} action - Acción a verificar
 * @returns {boolean} true si debe mostrarse
 */
export const shouldShowAction = (action) => {
  return CRUD_ACTIONS.includes(action);
};

/**
 * Obtiene la etiqueta en español para una acción
 * @param {string} action - Acción (view, add, change, delete)
 * @returns {string} Etiqueta en español
 */
export const getActionLabel = (action) => {
  return ACTION_LABELS[action] || action;
};

/**
 * Filtra permisos para mostrar solo los CRUD principales
 * @param {Array} permissions - Array de permisos
 * @returns {Array} Permisos filtrados
 */
export const filterCrudPermissions = (permissions) => {
  const filtered = [];
  const seenActions = new Set();
  
  permissions.forEach(permission => {
    const action = permission.action;
    
    if (shouldShowAction(action) && !seenActions.has(action)) {
      seenActions.add(action);
      filtered.push(permission);
    }
  });
  
  // Ordenar según ACTION_ORDER
  return filtered.sort((a, b) => {
    const aIndex = ACTION_ORDER.indexOf(a.action);
    const bIndex = ACTION_ORDER.indexOf(b.action);
    return aIndex - bIndex;
  });
};

export default {
  CRUD_ACTIONS,
  ACTION_LABELS,
  ACTION_ORDER,
  EXCLUDED_PERMISSIONS,
  UI_MODULES,
  shouldShowAction,
  getActionLabel,
  filterCrudPermissions
};
