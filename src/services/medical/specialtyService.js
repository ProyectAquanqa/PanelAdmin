import adminApiClient from '../../api/adminApiClient';
import { toast } from 'react-hot-toast';

/**
 * Normaliza una especialidad individual
 * @param {Object} specialty - Especialidad a normalizar
 * @returns {Object} Especialidad normalizada
 */
const normalizeSpecialty = (specialty) => {
  if (!specialty) return { id: null, name: 'Desconocida' };
  
  const normalized = {
    id: specialty.id,
    name: specialty.name || specialty.specialty_name || 'Sin nombre',
    description: specialty.description || specialty.specialty_description || '',
    is_active: specialty.is_active !== undefined ? specialty.is_active : true,
    status: specialty.status || 'active',
    price: specialty.price || 0,
    discount: specialty.discount || 0,
    created_at: specialty.created_at || null,
    updated_at: specialty.updated_at || null,
  };
  
  if (typeof normalized.id === 'string' && /^\d+$/.test(normalized.id)) {
    normalized.id = parseInt(normalized.id, 10);
  }
  
  return normalized;
};

/**
 * Normaliza la respuesta de la API
 * @param {Object|Array} data - Datos a normalizar
 * @returns {Object} Datos normalizados
 */
const normalizeResponse = (data) => {
  console.log('🔄 Normalizando datos de especialidades:', data);
  
  if (!data) {
    console.warn('⚠️ No hay datos de especialidades para normalizar');
    return { results: [], count: 0 };
  }
  
  if (Array.isArray(data)) {
    const normalizedResults = data.map(normalizeSpecialty);
    return {
      results: normalizedResults,
      count: normalizedResults.length
    };
  }
  
  if (data.results && Array.isArray(data.results)) {
    const normalizedResults = data.results.map(normalizeSpecialty);
    return {
      results: normalizedResults,
      count: data.count || normalizedResults.length,
      next: data.next,
      previous: data.previous
    };
  }
  
  if (data.id) {
    return {
      results: [normalizeSpecialty(data)],
      count: 1
    };
  }
  
  console.warn('⚠️ Formato de datos de especialidades desconocido:', data);
  return { results: [], count: 0 };
};

/**
 * Obtiene todas las especialidades
 * @param {Object} params - Parámetros para la solicitud
 * @returns {Promise} Promesa con los datos normalizados
 */
export const getAllSpecialties = async (params = {}) => {
  try {
    console.log('🔍 Solicitando especialidades');
    
    // Intentar primero con el endpoint de catálogos
    try {
      const response = await adminApiClient.get('/api/catalogs/specialties/', { params });
      const normalizedData = normalizeResponse(response.data);
      console.log('✅ Especialidades obtenidas (catálogos):', normalizedData);
      return normalizedData;
    } catch (catalogError) {
      console.warn('⚠️ Error al obtener especialidades de catálogos, intentando endpoint alternativo:', catalogError);
      
      // Si falla, intentar con el endpoint de doctores
      const response = await adminApiClient.get('/api/doctors/specialties/', { params });
      const normalizedData = normalizeResponse(response.data);
      console.log('✅ Especialidades obtenidas (doctores):', normalizedData);
      return normalizedData;
    }
  } catch (error) {
    console.error('❌ Error al obtener especialidades:', error);
    toast.error('No se pudieron cargar las especialidades. Por favor, intente nuevamente.');
    throw error;
  }
};

/**
 * Obtiene una especialidad por su ID
 * @param {number} id - ID de la especialidad
 * @returns {Promise} Promesa con los datos normalizados
 */
export const getSpecialtyById = async (id) => {
  try {
    console.log(`🔍 Solicitando especialidad ${id}`);
    
    const response = await adminApiClient.get(`/api/doctors/specialties/${id}/`);
    return normalizeSpecialty(response.data);
  } catch (error) {
    console.error(`❌ Error al obtener especialidad ${id}:`, error);
    toast.error(`No se pudo cargar la especialidad #${id}`);
    throw error;
  }
};

/**
 * Obtiene las especialidades de un doctor específico
 * @param {number} doctorId - ID del doctor
 * @returns {Promise} Promesa con los datos normalizados
 */
export const getSpecialtiesByDoctor = async (doctorId) => {
  try {
    console.log(`🔍 Solicitando especialidades del doctor ${doctorId}`);
    
    // Usar el endpoint exacto mencionado por el usuario
    const response = await adminApiClient.get(`/api/doctors/specialties/by_doctor/?doctor_id=${doctorId}`);
    const normalizedData = normalizeResponse(response.data);
    console.log(`✅ Especialidades del doctor ${doctorId} obtenidas:`, normalizedData);
    
    return normalizedData;
  } catch (error) {
    console.error(`❌ Error al obtener especialidades del doctor ${doctorId}:`, error);
    toast.error('No se pudieron cargar las especialidades del doctor');
    throw error;
  }
};

/**
 * Obtiene las especialidades con descuento
 * @returns {Promise} Promesa con los datos normalizados
 */
export const getSpecialtiesWithDiscount = async () => {
  try {
    console.log('🔍 Solicitando especialidades con descuento');
    const response = await adminApiClient.get('/api/catalogs/specialties/with_discount/');
    return normalizeResponse(response.data);
  } catch (error) {
    console.error('❌ Error al obtener especialidades con descuento:', error);
    toast.error('No se pudieron cargar las especialidades con descuento');
    throw error;
  }
};

/**
 * Obtiene estadísticas de precios de especialidades
 * @returns {Promise} Promesa con los datos de estadísticas
 */
export const getSpecialtyPriceStats = async () => {
  try {
    console.log('🔍 Solicitando estadísticas de precios de especialidades');
    const response = await adminApiClient.get('/api/catalogs/specialties/price_stats/');
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener estadísticas de precios:', error);
    toast.error('No se pudieron cargar las estadísticas de precios');
    throw error;
  }
};

/**
 * Depura información de especialidades
 * @param {Array|Object} specialties - Especialidades a depurar
 */
export const debugSpecialties = (specialties) => {
  console.log('🔍 Depurando especialidades:', {
    specialties,
    hasResults: specialties ? 'sí' : 'no',
    isArray: Array.isArray(specialties),
    length: Array.isArray(specialties) ? specialties.length : 0
  });
}; 