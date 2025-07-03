import adminApiClient from '../api/adminApiClient';
import { API_ROUTES } from '../config/api';

/**
 * Obtiene todas las configuraciones del hospital
 * @param {Object} params - Parámetros para filtrar las configuraciones
 * @returns {Promise} Promise con la respuesta
 */
export const getSettings = async (params = {}) => {
  try {
    console.log('🔍 Solicitando configuraciones con parámetros:', params);
    const response = await adminApiClient.get(API_ROUTES.SETTINGS.LIST, { params });
    
    // Asegurarse de que siempre devolvemos un formato consistente
    const normalizedData = {
      results: response.data?.results || response.data || [],
      count: response.data?.count || (Array.isArray(response.data) ? response.data.length : 0),
      next: response.data?.next || null,
      previous: response.data?.previous || null
    };
    
    console.log('✅ Configuraciones obtenidas:', normalizedData);
    return normalizedData;
  } catch (error) {
    console.error('💥 Error al obtener configuraciones:', error);
    throw error;
  }
};

/**
 * Obtiene una configuración específica por su clave
 * @param {string} key - Clave de la configuración
 * @returns {Promise} Promise con la respuesta
 */
export const getSettingByKey = async (key) => {
  try {
    console.log(`🔍 Solicitando configuración con clave: ${key}`);
    const response = await adminApiClient.get(`${API_ROUTES.SETTINGS.LIST}?search=${key}`);
    
    const settings = response.data?.results || [];
    if (settings.length === 0) {
      throw new Error(`Configuración con clave ${key} no encontrada`);
    }
    
    const setting = settings.find(s => s.setting_key === key) || settings[0];
    console.log(`✅ Configuración obtenida:`, setting);
    return setting;
  } catch (error) {
    console.error(`💥 Error al obtener configuración ${key}:`, error);
    throw error;
  }
};

/**
 * Obtiene configuraciones agrupadas por categoría
 * @returns {Promise} Promise con la respuesta
 */
export const getSettingsByCategory = async () => {
  try {
    console.log('🔍 Solicitando configuraciones por categoría');
    const response = await adminApiClient.get(API_ROUTES.SETTINGS.BY_CATEGORY);
    console.log('✅ Configuraciones por categoría obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('💥 Error al obtener configuraciones por categoría:', error);
    throw error;
  }
};

/**
 * Obtiene configuraciones públicas
 * @returns {Promise} Promise con la respuesta
 */
export const getPublicSettings = async () => {
  try {
    console.log('🔍 Solicitando configuraciones públicas');
    const response = await adminApiClient.get(API_ROUTES.SETTINGS.PUBLIC);
    console.log('✅ Configuraciones públicas obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('💥 Error al obtener configuraciones públicas:', error);
    throw error;
  }
};

/**
 * Actualiza una configuración existente
 * @param {number} id - ID de la configuración
 * @param {Object} data - Datos actualizados
 * @returns {Promise} Promise con la respuesta
 */
export const updateSetting = async (id, data) => {
  try {
    console.log(`🔄 Actualizando configuración ${id}:`, data);
    const response = await adminApiClient.patch(API_ROUTES.SETTINGS.BY_ID(id), data);
    console.log('✅ Configuración actualizada:', response.data);
    return response.data;
  } catch (error) {
    console.error(`💥 Error al actualizar configuración ${id}:`, error);
    throw error;
  }
};

/**
 * Actualiza múltiples configuraciones a la vez
 * @param {Object} data - Objeto con pares clave-valor de configuraciones
 * @returns {Promise} Promise con la respuesta
 */
export const bulkUpdateSettings = async (data) => {
  try {
    console.log('🔄 Actualizando múltiples configuraciones:', data);
    const response = await adminApiClient.post(API_ROUTES.SETTINGS.BULK_UPDATE, data);
    console.log('✅ Configuraciones actualizadas:', response.data);
    return response.data;
  } catch (error) {
    console.error('💥 Error al actualizar configuraciones:', error);
    throw error;
  }
};

/**
 * Inicializa las configuraciones por defecto
 * @returns {Promise} Promise con la respuesta
 */
export const initializeDefaultSettings = async () => {
  try {
    console.log('🔄 Inicializando configuraciones por defecto');
    const response = await adminApiClient.post(API_ROUTES.SETTINGS.INITIALIZE_DEFAULTS);
    console.log('✅ Configuraciones inicializadas:', response.data);
    return response.data;
  } catch (error) {
    console.error('💥 Error al inicializar configuraciones:', error);
    throw error;
  }
}; 