/**
 * Utilidades para el procesamiento de perfiles y permisos
 * Funciones auxiliares para formatear y calcular estadísticas
 */

import { filterCrudPermissions } from '../config/permissionsConfig';

/**
 * Calcula estadísticas detalladas de permisos para un perfil
 * @param {Object} profile - Objeto perfil con permisos
 * @returns {Object} Estadísticas calculadas
 */
export const calculatePermissionStats = (profile) => {
  if (!profile || !profile.permissions || !Array.isArray(profile.permissions)) {
    return {
      total: 0,
      crud: 0,
      displayNames: [],
      shouldTruncate: false,
      hasAdvanced: false
    };
  }

  // Filtrar permisos CRUD principales
  const crudPermissions = filterCrudPermissions(profile.permissions);
  
  // Generar nombres para mostrar (priorizar traducciones)
  const displayNames = profile.permissions.map(permission => {
    return permission.translatedName || 
           permission.name || 
           permission.codename || 
           'Permiso sin nombre';
  });

  // Determinar si hay permisos avanzados (no CRUD)
  const hasAdvanced = profile.permissions.length > crudPermissions.length;

  return {
    total: profile.permissions.length,
    crud: crudPermissions.length,
    displayNames: displayNames,
    shouldTruncate: displayNames.length > 3,
    hasAdvanced: hasAdvanced,
    advanced: profile.permissions.length - crudPermissions.length
  };
};

/**
 * Formatea el texto de conteo de permisos para mostrar en la UI
 * @param {Object} stats - Estadísticas de permisos
 * @returns {string} Texto formateado
 */
export const formatPermissionCount = (stats) => {
  if (stats.total === 0) return 'Sin permisos';
  
  const baseText = `${stats.total} ${stats.total === 1 ? 'permiso' : 'permisos'}`;
  
  if (stats.hasAdvanced) {
    return `${baseText} (${stats.crud} CRUD + ${stats.advanced} avanzados)`;
  }
  
  return baseText;
};

/**
 * Genera un resumen textual de los tipos de permisos
 * @param {Object} profile - Perfil con permisos
 * @returns {string} Resumen de tipos de permisos
 */
export const getPermissionSummary = (profile) => {
  const stats = calculatePermissionStats(profile);
  
  if (stats.total === 0) return 'Sin permisos asignados';
  
  if (stats.crud === stats.total) {
    return `Solo permisos CRUD básicos (${stats.crud})`;
  }
  
  if (stats.crud === 0) {
    return `Solo permisos avanzados (${stats.advanced})`;
  }
  
  return `Permisos mixtos: ${stats.crud} CRUD + ${stats.advanced} avanzados`;
};

/**
 * Determina el color de badge según el tipo de permisos
 * @param {Object} stats - Estadísticas de permisos  
 * @returns {string} Clases CSS para el color
 */
export const getPermissionBadgeColor = (stats) => {
  if (stats.total === 0) {
    return 'bg-gray-100 text-gray-600 border-gray-200';
  }
  
  if (stats.crud === stats.total) {
    // Solo CRUD - verde
    return 'bg-green-100 text-green-700 border-green-200';
  }
  
  if (stats.crud === 0) {
    // Solo avanzados - azul
    return 'bg-blue-100 text-blue-700 border-blue-200';
  }
  
  // Mixto - amarillo/naranja
  return 'bg-orange-100 text-orange-700 border-orange-200';
};

/**
 * Valida si un perfil tiene la estructura mínima requerida
 * @param {Object} profile - Perfil a validar
 * @returns {boolean} true si es válido
 */
export const isValidProfile = (profile) => {
  return !!(
    profile &&
    typeof profile === 'object' &&
    (profile.id || profile.id === 0) &&
    (profile.name || profile.nombre)
  );
};

/**
 * Normaliza un perfil para asegurar estructura consistente
 * @param {Object} profile - Perfil a normalizar
 * @returns {Object} Perfil normalizado
 */
export const normalizeProfile = (profile) => {
  if (!isValidProfile(profile)) {
    return null;
  }

  return {
    id: profile.id,
    name: profile.name || profile.nombre || 'Sin nombre',
    permissions: Array.isArray(profile.permissions) ? profile.permissions : [],
    users_count: typeof profile.users_count === 'number' ? profile.users_count : 0,
    is_active: profile.is_active !== false, // default true
    created_at: profile.created_at || null,
    updated_at: profile.updated_at || null
  };
};

export default {
  calculatePermissionStats,
  formatPermissionCount,
  getPermissionSummary,
  getPermissionBadgeColor,
  isValidProfile,
  normalizeProfile
};
