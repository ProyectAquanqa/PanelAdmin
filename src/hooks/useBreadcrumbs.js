/**
 * Hook para manejar breadcrumbs de navegación
 * Proporciona información de breadcrumbs basada en la ruta actual
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  getBreadcrumbsFromPath, 
  shouldShowBreadcrumbs,
  getPageTitle,
  generateBreadcrumbItems,
  getRelatedRoutes,
  generateSEOMetadata
} from '../utils/breadcrumbUtils';

/**
 * Hook para manejar breadcrumbs de navegación
 * @returns {Object} Información de breadcrumbs y funciones relacionadas
 */
export const useBreadcrumbs = () => {
  const location = useLocation();

  // Información básica de breadcrumbs (memoizada)
  const breadcrumbs = useMemo(() => {
    return getBreadcrumbsFromPath(location.pathname);
  }, [location.pathname]);

  // Verificar si debe mostrar breadcrumbs (memoizado)
  const shouldShow = useMemo(() => {
    return shouldShowBreadcrumbs(location.pathname);
  }, [location.pathname]);

  // Título de la página (memoizado)
  const pageTitle = useMemo(() => {
    return getPageTitle(location.pathname);
  }, [location.pathname]);

  // Items de breadcrumb para navegación (memoizados)
  const breadcrumbItems = useMemo(() => {
    return generateBreadcrumbItems(location.pathname);
  }, [location.pathname]);

  // Rutas relacionadas para navegación rápida (memoizadas)
  const relatedRoutes = useMemo(() => {
    return getRelatedRoutes(location.pathname);
  }, [location.pathname]);

  // Metadatos para SEO (memoizados)
  const seoMetadata = useMemo(() => {
    return generateSEOMetadata(location.pathname);
  }, [location.pathname]);

  // Información de navegación jerárquica
  const navigationInfo = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    return {
      currentPath: location.pathname,
      segments: pathSegments,
      depth: pathSegments.length,
      isRoot: location.pathname === '/',
      parentPath: pathSegments.length > 1 
        ? '/' + pathSegments.slice(0, -1).join('/')
        : '/',
      section: breadcrumbs.section,
      subsection: breadcrumbs.subsection
    };
  }, [location.pathname, breadcrumbs]);

  return {
    // Información básica
    breadcrumbs,
    shouldShow,
    pageTitle,
    
    // Items para renderizado
    breadcrumbItems,
    relatedRoutes,
    
    // Información de navegación
    navigationInfo,
    
    // Metadatos
    seoMetadata,
    
    // Estado actual
    currentPath: location.pathname,
    section: breadcrumbs.section,
    subsection: breadcrumbs.subsection,
    
    // Utilidades
    isRoot: location.pathname === '/',
    hasSubsection: breadcrumbs.subsection !== null
  };
};

export default useBreadcrumbs;