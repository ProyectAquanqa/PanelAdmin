/**
 * Configuración de breadcrumbs
 * Mapeo de rutas a breadcrumbs para navegación
 */

/**
 * Mapeo de rutas a configuración de breadcrumbs
 */
export const breadcrumbRoutes = {
  // Dashboard principal
  '/': { section: 'Dashboard', subsection: null },
  
  // CHATBOT - Todas las subcategorías
  '/chatbot': { section: 'Chatbot', subsection: 'Dashboard' },
  '/chatbot/dashboard': { section: 'Chatbot', subsection: 'Dashboard' },
  '/chatbot/knowledge': { section: 'Chatbot', subsection: 'Base de Conocimiento' },
  '/chatbot/categorias': { section: 'Chatbot', subsection: 'Categorías' },
  '/chatbot/historial': { section: 'Chatbot', subsection: 'Historial de Conversaciones' },
  '/chatbot/conversations': { section: 'Chatbot', subsection: 'Historial de Conversaciones' },
  '/chatbot/test': { section: 'Chatbot', subsection: 'Modo de Prueba' },
  
  // EVENTOS - Todas las subcategorías
  '/eventos': { section: 'Eventos', subsection: 'Gestión de Eventos' },
  '/eventos/gestion': { section: 'Eventos', subsection: 'Gestión de Eventos' },
  '/eventos/categorias': { section: 'Eventos', subsection: 'Categorías' },
  '/eventos/comentarios': { section: 'Eventos', subsection: 'Comentarios' },

  // ALMUERZOS - Gestión de almuerzos
  '/almuerzos': { section: 'Almuerzos', subsection: 'Gestión de Almuerzos' },
  
  // USUARIOS - Todas las subcategorías
  '/usuarios': { section: 'Usuarios', subsection: 'Gestión de Usuarios' },
  '/usuarios/gestion': { section: 'Usuarios', subsection: 'Gestión de Usuarios' },
  '/usuarios/perfiles': { section: 'Usuarios', subsection: 'Perfiles' },
  '/usuarios/areas': { section: 'Usuarios', subsection: 'Áreas' },
  '/usuarios/cargos': { section: 'Usuarios', subsection: 'Cargos' },
  
  // NOTIFICACIONES - Todas las subcategorías
  '/notificaciones': { section: 'Notificaciones', subsection: 'Historial de Notificaciones' },
  '/notificaciones/historial': { section: 'Notificaciones', subsection: 'Historial de Notificaciones' },
  '/notificaciones/dispositivos': { section: 'Notificaciones', subsection: 'Dispositivos Registrados' },
  
  // DOCUMENTACIÓN
  '/documentacion': { section: 'Documentación', subsection: null },
  
  // CONFIGURACIÓN - Todas las subcategorías
  '/configuracion': { section: 'Configuración', subsection: 'General' },
  '/configuracion/general': { section: 'Configuración', subsection: 'General' },
  '/configuracion/api': { section: 'Configuración', subsection: 'API' },
  
  // PERMISOS
  '/permisos': { section: 'Permisos', subsection: null },
  
  // PERFIL
  '/perfil': { section: 'Mi Perfil', subsection: null },
};

/**
 * Configuración de secciones principales
 */
export const mainSections = {
  'Dashboard': {
    icon: 'HomeIcon',
    color: '#2D728F',
    description: 'Panel principal de administración'
  },
  'Chatbot': {
    icon: 'ChatBubbleLeftRightIcon',
    color: '#2D728F',
    description: 'Gestión del chatbot inteligente'
  },
  'Eventos': {
    icon: 'CalendarIcon',
    color: '#2D728F',
    description: 'Administración de eventos'
  },
  'Almuerzos': {
    icon: 'CakeIcon',
    color: '#2D728F',
    description: 'Gestión de almuerzos'
  },
  'Usuarios': {
    icon: 'UserGroupIcon',
    color: '#2D728F',
    description: 'Gestión de usuarios del sistema'
  },
  'Notificaciones': {
    icon: 'BellIcon',
    color: '#2D728F',
    description: 'Sistema de notificaciones'
  },

  'Documentación': {
    icon: 'DocumentTextIcon',
    color: '#2D728F',
    description: 'Documentación del sistema'
  },
  'Configuración': {
    icon: 'Cog6ToothIcon',
    color: '#2D728F',
    description: 'Configuración del sistema'
  },
  'Permisos': {
    icon: 'ShieldCheckIcon',
    color: '#2D728F',
    description: 'Gestión de permisos'
  },
  'Mi Perfil': {
    icon: 'UserIcon',
    color: '#2D728F',
    description: 'Configuración del perfil de usuario'
  }
};

/**
 * Obtiene breadcrumbs para una ruta específica
 * @param {string} pathname - Ruta actual
 * @returns {Object} Configuración de breadcrumbs
 */
export const getBreadcrumbsFromPath = (pathname) => {
  // Buscar coincidencia exacta primero
  if (breadcrumbRoutes[pathname]) {
    return breadcrumbRoutes[pathname];
  }
  
  // Buscar coincidencia por prefijo (para rutas dinámicas)
  const matchingRoute = Object.keys(breadcrumbRoutes).find(route => {
    if (route === '/') return false; // Evitar que '/' coincida con todo
    return pathname.startsWith(route);
  });
  
  if (matchingRoute) {
    return breadcrumbRoutes[matchingRoute];
  }
  
  // Fallback al dashboard
  return { section: 'Dashboard', subsection: null };
};

/**
 * Obtiene información completa de una sección
 * @param {string} sectionName - Nombre de la sección
 * @returns {Object} Información de la sección
 */
export const getSectionInfo = (sectionName) => {
  return mainSections[sectionName] || {
    icon: 'QuestionMarkCircleIcon',
    color: '#6B7280',
    description: 'Sección desconocida'
  };
};

/**
 * Verifica si una ruta debe mostrar breadcrumbs
 * @param {string} pathname - Ruta actual
 * @returns {boolean} True si debe mostrar breadcrumbs
 */
export const shouldShowBreadcrumbs = (pathname) => {
  const breadcrumbs = getBreadcrumbsFromPath(pathname);
  return breadcrumbs.subsection !== null;
};

/**
 * Obtiene el título de la página basado en la ruta
 * @param {string} pathname - Ruta actual
 * @returns {string} Título de la página
 */
export const getPageTitle = (pathname) => {
  const breadcrumbs = getBreadcrumbsFromPath(pathname);
  
  if (breadcrumbs.subsection) {
    return `${breadcrumbs.section} - ${breadcrumbs.subsection}`;
  }
  
  return breadcrumbs.section;
};

/**
 * Obtiene rutas relacionadas para navegación rápida
 * @param {string} pathname - Ruta actual
 * @returns {Array} Array de rutas relacionadas
 */
export const getRelatedRoutes = (pathname) => {
  const breadcrumbs = getBreadcrumbsFromPath(pathname);
  const section = breadcrumbs.section.toLowerCase();
  
  return Object.entries(breadcrumbRoutes)
    .filter(([route, config]) => 
      config.section.toLowerCase() === section && route !== pathname
    )
    .map(([route, config]) => ({
      path: route,
      title: config.subsection || config.section,
      ...config
    }));
};

export default {
  breadcrumbRoutes,
  mainSections,
  getBreadcrumbsFromPath,
  getSectionInfo,
  shouldShowBreadcrumbs,
  getPageTitle,
  getRelatedRoutes
};