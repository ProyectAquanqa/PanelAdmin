/**
 * Utilidades para manejo de breadcrumbs
 * Funciones para generar y manejar navegación breadcrumb
 */

import { breadcrumbRoutes, getSectionInfo } from '../config/breadcrumbConfig';

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
 * Verifica si una ruta debe mostrar breadcrumbs
 * @param {string} pathname - Ruta actual
 * @returns {boolean} True si debe mostrar breadcrumbs
 */
export const shouldShowBreadcrumbs = (pathname) => {
  const breadcrumbs = getBreadcrumbsFromPath(pathname);
  return breadcrumbs.subsection !== null;
};

/**
 * Obtiene el título completo de la página
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
 * Genera estructura de breadcrumbs para navegación
 * @param {string} pathname - Ruta actual
 * @returns {Array} Array de elementos de breadcrumb
 */
export const generateBreadcrumbItems = (pathname) => {
  const breadcrumbs = getBreadcrumbsFromPath(pathname);
  const items = [];
  
  // Agregar sección principal
  items.push({
    label: breadcrumbs.section,
    path: getSectionBasePath(breadcrumbs.section),
    isActive: !breadcrumbs.subsection,
    info: getSectionInfo(breadcrumbs.section)
  });
  
  // Agregar subsección si existe
  if (breadcrumbs.subsection) {
    items.push({
      label: breadcrumbs.subsection,
      path: pathname,
      isActive: true,
      info: null
    });
  }
  
  return items;
};

/**
 * Obtiene la ruta base de una sección
 * @param {string} sectionName - Nombre de la sección
 * @returns {string} Ruta base
 */
export const getSectionBasePath = (sectionName) => {
  const sectionRoutes = {
    'Dashboard': '/',
    'Chatbot': '/chatbot',
    'Eventos': '/eventos',
    'Usuarios': '/usuarios',
    'Notificaciones': '/notificaciones',
    'Documentación': '/documentacion',
    'Configuración': '/configuracion',
    'Permisos': '/permisos',
    'Mi Perfil': '/perfil'
  };
  
  return sectionRoutes[sectionName] || '/';
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

/**
 * Genera metadatos para SEO basado en breadcrumbs
 * @param {string} pathname - Ruta actual
 * @returns {Object} Metadatos para SEO
 */
export const generateSEOMetadata = (pathname) => {
  const breadcrumbs = getBreadcrumbsFromPath(pathname);
  const title = getPageTitle(pathname);
  const sectionInfo = getSectionInfo(breadcrumbs.section);
  
  return {
    title: `${title} | AquanQ Admin`,
    description: sectionInfo.description,
    keywords: [
      'AquanQ',
      'Admin',
      breadcrumbs.section.toLowerCase(),
      breadcrumbs.subsection?.toLowerCase()
    ].filter(Boolean).join(', ')
  };
};