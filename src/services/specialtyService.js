import apiClient from '../api/apiClient';
import { API_ROUTES } from '../config/api';

/**
 * Obtiene la URL correcta para especialidades
 * Prueba diferentes endpoints hasta encontrar uno que funcione
 */
const getSpecialtiesBaseUrl = async () => {
  const urlsToTry = [
    '/api/catalogs/specialties',
    '/api/catalogs/specialties/',
    '/api/v1/catalogs/specialties',
    '/api/v1/catalogs/specialties/',
    '/api/catalog/specialties',
    '/api/catalog/specialties/',
  ];
  
  for (const url of urlsToTry) {
    try {
      await apiClient.get(url);
      console.log(`✅ URL de especialidades encontrada: ${url}`);
      return url;
    } catch (error) {
      if (error.response?.status !== 404) {
        // Si no es 404, hay otro problema, usar esta URL
        console.log(`⚠️ URL ${url} tiene problemas pero la usaremos: ${error.response?.status}`);
        return url;
      }
    }
  }
  
  // Si ninguna funciona, usar la URL por defecto
  console.warn('⚠️ Ninguna URL funcionó, usando URL por defecto');
  return '/api/catalogs/specialties/';
};

// Cache para la URL base
let cachedBaseUrl = null;

/**
 * Obtiene la URL base (con cache)
 */
const getBaseUrl = async () => {
  if (!cachedBaseUrl) {
    cachedBaseUrl = await getSpecialtiesBaseUrl();
  }
  return cachedBaseUrl;
};

/**
 * Normaliza la respuesta del backend
 * Maneja diferentes formatos de respuesta
 */
const normalizeSpecialtiesResponse = (data) => {
  console.log('📊 Normalizando respuesta:', data);
  
  // Si es un array directamente
  if (Array.isArray(data)) {
    return {
      results: data,
      count: data.length,
      next: null,
      previous: null
    };
  }
  
  // Si tiene estructura de paginación de Django REST
  if (data && data.results && Array.isArray(data.results)) {
    return data;
  }
  
  // Si tiene una propiedad 'specialties'
  if (data && data.specialties && Array.isArray(data.specialties)) {
    return {
      results: data.specialties,
      count: data.count || data.specialties.length,
      next: data.next || null,
      previous: data.previous || null
    };
  }
  
  // Si tiene una propiedad 'data'
  if (data && data.data && Array.isArray(data.data)) {
    return {
      results: data.data,
      count: data.count || data.data.length,
      next: data.next || null,
      previous: data.previous || null
    };
  }
  
  // Formato por defecto
  console.warn('⚠️ Formato de respuesta desconocido, devolviendo array vacío');
  return {
    results: [],
    count: 0,
    next: null,
    previous: null
  };
};

/**
 * Obtiene la lista de especialidades
 * @param {Object} params - Parámetros para filtrar la lista
 * @returns {Promise} Promise con la respuesta normalizada
 */
export const getSpecialties = async (params = {}) => {
  try {
    console.log('🔍 Solicitando especialidades con parámetros:', params);
    
    const baseUrl = await getBaseUrl();
    const response = await apiClient.get(baseUrl, { params });
    
    console.log('✅ Respuesta cruda del servidor:', response.data);
    
    const normalizedData = normalizeSpecialtiesResponse(response.data);
    console.log('✅ Datos normalizados:', normalizedData);
    
    return normalizedData;
    
  } catch (error) {
    console.error('💥 Error al obtener especialidades:', error);
    
    // Limpiar cache si hay error de conexión
    if (error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
      cachedBaseUrl = null;
    }
    
    throw error;
  }
};

/**
 * Obtiene una especialidad por su ID
 * @param {number} id - ID de la especialidad
 * @returns {Promise} Promise con la respuesta
 */
export const getSpecialtyById = async (id) => {
  try {
    console.log(`🔍 Solicitando especialidad con ID: ${id}`);
    
    const baseUrl = await getBaseUrl();
    const url = baseUrl.endsWith('/') ? `${baseUrl}${id}/` : `${baseUrl}/${id}/`;
    
    const response = await apiClient.get(url);
    console.log(`✅ Especialidad ${id} obtenida:`, response.data);
    
    return response.data;
  } catch (error) {
    console.error(`💥 Error al obtener la especialidad con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva especialidad
 * @param {Object} specialtyData - Datos de la especialidad a crear
 * @returns {Promise} Promise con la respuesta
 */
export const createSpecialty = async (specialtyData) => {
  try {
    console.log('🚀 Creando especialidad con datos:', specialtyData);
    
    // Validar datos antes de enviar
    const validatedData = {
      name: String(specialtyData.name).trim(),
      description: String(specialtyData.description).trim(),
      consultation_price: Number(specialtyData.consultation_price),
      discount_percentage: Number(specialtyData.discount_percentage) || 0,
      average_duration: Number(specialtyData.average_duration) || 30,
    };
    
    console.log('📋 Datos validados:', validatedData);
    
    const baseUrl = await getBaseUrl();
    const url = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    
    const response = await apiClient.post(url, validatedData);
    console.log('✅ Especialidad creada exitosamente:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('💥 Error al crear especialidad:', error);
    
    // Manejo específico de errores de validación
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      console.error('📋 Errores de validación:', errorData);
      
      // Crear un error más descriptivo
      const fieldErrors = [];
      if (errorData.name) fieldErrors.push(`Nombre: ${Array.isArray(errorData.name) ? errorData.name[0] : errorData.name}`);
      if (errorData.description) fieldErrors.push(`Descripción: ${Array.isArray(errorData.description) ? errorData.description[0] : errorData.description}`);
      if (errorData.consultation_price) fieldErrors.push(`Precio: ${Array.isArray(errorData.consultation_price) ? errorData.consultation_price[0] : errorData.consultation_price}`);
      if (errorData.discount_percentage) fieldErrors.push(`Descuento: ${Array.isArray(errorData.discount_percentage) ? errorData.discount_percentage[0] : errorData.discount_percentage}`);
      if (errorData.average_duration) fieldErrors.push(`Duración: ${Array.isArray(errorData.average_duration) ? errorData.average_duration[0] : errorData.average_duration}`);
      
      if (fieldErrors.length > 0) {
        error.message = fieldErrors.join(', ');
      }
    }
    
    throw error;
  }
};

/**
 * Actualiza una especialidad existente
 * @param {number} id - ID de la especialidad
 * @param {Object} specialtyData - Datos actualizados de la especialidad
 * @returns {Promise} Promise con la respuesta
 */
export const updateSpecialty = async (id, specialtyData) => {
  try {
    console.log(`🔄 Actualizando especialidad ${id} con datos:`, specialtyData);
    
    // Validar datos antes de enviar
    const validatedData = {
      name: String(specialtyData.name).trim(),
      description: String(specialtyData.description).trim(),
      consultation_price: Number(specialtyData.consultation_price),
      discount_percentage: Number(specialtyData.discount_percentage) || 0,
      average_duration: Number(specialtyData.average_duration) || 30,
    };
    
    console.log('📋 Datos validados:', validatedData);
    
    const baseUrl = await getBaseUrl();
    const url = baseUrl.endsWith('/') ? `${baseUrl}${id}/` : `${baseUrl}/${id}/`;
    
    const response = await apiClient.put(url, validatedData);
    console.log(`✅ Especialidad ${id} actualizada exitosamente:`, response.data);
    
    return response.data;
  } catch (error) {
    console.error(`💥 Error al actualizar la especialidad con ID ${id}:`, error);
    
    // Manejo específico de errores de validación
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      console.error('📋 Errores de validación:', errorData);
      
      // Crear un error más descriptivo
      const fieldErrors = [];
      if (errorData.name) fieldErrors.push(`Nombre: ${Array.isArray(errorData.name) ? errorData.name[0] : errorData.name}`);
      if (errorData.description) fieldErrors.push(`Descripción: ${Array.isArray(errorData.description) ? errorData.description[0] : errorData.description}`);
      if (errorData.consultation_price) fieldErrors.push(`Precio: ${Array.isArray(errorData.consultation_price) ? errorData.consultation_price[0] : errorData.consultation_price}`);
      if (errorData.discount_percentage) fieldErrors.push(`Descuento: ${Array.isArray(errorData.discount_percentage) ? errorData.discount_percentage[0] : errorData.discount_percentage}`);
      if (errorData.average_duration) fieldErrors.push(`Duración: ${Array.isArray(errorData.average_duration) ? errorData.average_duration[0] : errorData.average_duration}`);
      
      if (fieldErrors.length > 0) {
        error.message = fieldErrors.join(', ');
      }
    }
    
    throw error;
  }
};

/**
 * Elimina una especialidad
 * @param {number} id - ID de la especialidad a eliminar
 * @returns {Promise} Promise con la respuesta
 */
export const deleteSpecialty = async (id) => {
  try {
    console.log(`🗑️ Eliminando especialidad con ID: ${id}`);
    
    const baseUrl = await getBaseUrl();
    const url = baseUrl.endsWith('/') ? `${baseUrl}${id}/` : `${baseUrl}/${id}/`;
    
    const response = await apiClient.delete(url);
    console.log(`✅ Especialidad ${id} eliminada exitosamente`);
    
    return response.data;
  } catch (error) {
    console.error(`💥 Error al eliminar la especialidad con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Función de utilidad para limpiar cache
 */
export const clearSpecialtiesCache = () => {
  cachedBaseUrl = null;
  console.log('🧹 Cache de URL de especialidades limpiado');
};

/**
 * Función de utilidad para obtener estadísticas de especialidades
 */
export const getSpecialtiesStats = async () => {
  try {
    console.log('📊 Obteniendo estadísticas de especialidades...');
    
    const data = await getSpecialties();
    const specialties = data.results || [];
    
    const stats = {
      total: specialties.length,
      averagePrice: specialties.reduce((sum, s) => sum + (s.consultation_price || 0), 0) / (specialties.length || 1),
      withDiscount: specialties.filter(s => s.discount_percentage > 0).length,
      averageDiscount: specialties
        .filter(s => s.discount_percentage > 0)
        .reduce((sum, s) => sum + s.discount_percentage, 0) / (specialties.filter(s => s.discount_percentage > 0).length || 1),
      priceRange: {
        min: Math.min(...specialties.map(s => s.consultation_price || 0)),
        max: Math.max(...specialties.map(s => s.consultation_price || 0))
      }
    };
    
    console.log('📊 Estadísticas calculadas:', stats);
    return stats;
  } catch (error) {
    console.error('💥 Error al calcular estadísticas:', error);
    throw error;
  }
};