import apiClient from '../api/apiClient';
import { API_ROUTES } from '../config/api';

/**
 * Normaliza los datos de un doctor para asegurar consistencia
 * @param {Object} doctorData - Datos del doctor a normalizar
 * @returns {Object} Datos del doctor normalizados
 */
const normalizeDoctorData = (doctorData) => {
  // Si no hay datos, devolver objeto vacío
  if (!doctorData) return {};
  
  // Copia para no modificar el original
  const normalizedDoctor = { ...doctorData };
  
  // Normalizar especialidades si existen
  if (normalizedDoctor.specialties) {
    // Asegurar que sea un array
    if (!Array.isArray(normalizedDoctor.specialties)) {
      normalizedDoctor.specialties = [];
    }
    
    // Normalizar cada especialidad
    normalizedDoctor.specialties = normalizedDoctor.specialties.map(spec => {
      // Si es un número, convertirlo a objeto
      if (typeof spec === 'number') {
        return { id: spec };
      }
      // Si es un objeto con specialty anidado, extraer el id
      if (typeof spec === 'object' && spec.specialty && spec.specialty.id) {
        return {
          id: spec.specialty.id,
          name: spec.specialty.name,
          is_primary: spec.is_primary
        };
      }
      // Si es un objeto con id directo
      if (typeof spec === 'object' && spec.id) {
        return spec;
      }
      return null;
    }).filter(Boolean);
  }
  
  return normalizedDoctor;
};

/**
 * Obtiene la lista de doctores
 * @param {Object} params - Parámetros para filtrar la lista
 * @returns {Promise} Promise con la respuesta
 */
export const getDoctors = async (params = {}) => {
  try {
    console.log('🔍 Solicitando doctores con parámetros:', params);
    const response = await apiClient.get(API_ROUTES.DOCTORS.BASE, { params });
    
    console.log('Respuesta cruda del servidor:', response.data);
    
    // Normalizar respuesta según el formato recibido
    let normalizedResponse;
    
    if (Array.isArray(response.data)) {
      // Si es un array directo
      normalizedResponse = {
        results: response.data.map(normalizeDoctorData),
        count: response.data.length
      };
    } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
      // Si tiene estructura de paginación de Django REST
      normalizedResponse = {
        results: response.data.results.map(normalizeDoctorData),
        count: response.data.count || response.data.results.length,
        next: response.data.next,
        previous: response.data.previous
      };
    } else if (response.data && response.data.doctors && Array.isArray(response.data.doctors)) {
      // Si tiene una propiedad 'doctors'
      normalizedResponse = {
        results: response.data.doctors.map(normalizeDoctorData),
        count: response.data.count || response.data.doctors.length
      };
    } else if (response.data && typeof response.data === 'object') {
      // Si es un objeto pero no tiene una estructura reconocida
      normalizedResponse = {
        results: [normalizeDoctorData(response.data)],
        count: 1
      };
    } else {
      // Formato desconocido, devolver array vacío
      console.warn('Formato de respuesta desconocido:', response.data);
      normalizedResponse = {
        results: [],
        count: 0
      };
    }
    
    console.log('✅ Respuesta normalizada:', normalizedResponse);
    return normalizedResponse;
  } catch (error) {
    console.error('💥 Error al obtener doctores:', error.response || error);
    throw error;
  }
};

/**
 * Obtiene doctores por tipo (PRIMARY, SPECIALIST)
 * @param {string} doctorType - Tipo de doctor (PRIMARY, SPECIALIST)
 * @returns {Promise} Promise con la respuesta
 */
export const getDoctorsByType = async (doctorType) => {
  try {
    console.log(`🔍 Solicitando doctores de tipo: ${doctorType}`);
    const response = await apiClient.get(API_ROUTES.DOCTORS.BY_TYPE(doctorType));
    
    console.log('Respuesta cruda del servidor:', response.data);
    
    // Normalizar respuesta según el formato recibido
    let normalizedResponse;
    
    if (Array.isArray(response.data)) {
      // Si es un array directo
      normalizedResponse = {
        results: response.data.map(normalizeDoctorData),
        count: response.data.length
      };
    } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
      // Si tiene estructura de paginación de Django REST
      normalizedResponse = {
        results: response.data.results.map(normalizeDoctorData),
        count: response.data.count || response.data.results.length,
        next: response.data.next,
        previous: response.data.previous
      };
    } else if (response.data && response.data.doctors && Array.isArray(response.data.doctors)) {
      // Si tiene una propiedad 'doctors'
      normalizedResponse = {
        results: response.data.doctors.map(normalizeDoctorData),
        count: response.data.count || response.data.doctors.length
      };
    } else {
      // Formato desconocido, devolver array vacío
      console.warn('Formato de respuesta desconocido:', response.data);
      normalizedResponse = {
        results: [],
        count: 0
      };
    }
    
    console.log(`✅ Doctores de tipo ${doctorType} normalizados:`, normalizedResponse);
    return normalizedResponse;
  } catch (error) {
    console.error(`💥 Error al obtener doctores de tipo ${doctorType}:`, error.response || error);
    throw error;
  }
};

/**
 * Obtiene doctores que pueden derivar pacientes
 * @returns {Promise} Promise con la respuesta
 */
export const getDoctorsThatCanRefer = async () => {
  try {
    console.log('🔍 Solicitando doctores que pueden derivar');
    const response = await apiClient.get(API_ROUTES.DOCTORS.CAN_REFER);
    
    console.log('Respuesta cruda del servidor:', response.data);
    
    // Normalizar respuesta según el formato recibido
    let normalizedResponse;
    
    if (Array.isArray(response.data)) {
      // Si es un array directo
      normalizedResponse = {
        results: response.data.map(normalizeDoctorData),
        count: response.data.length
      };
    } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
      // Si tiene estructura de paginación de Django REST
      normalizedResponse = {
        results: response.data.results.map(normalizeDoctorData),
        count: response.data.count || response.data.results.length,
        next: response.data.next,
        previous: response.data.previous
      };
    } else if (response.data && response.data.doctors && Array.isArray(response.data.doctors)) {
      // Si tiene una propiedad 'doctors'
      normalizedResponse = {
        results: response.data.doctors.map(normalizeDoctorData),
        count: response.data.count || response.data.doctors.length
      };
    } else {
      // Formato desconocido, devolver array vacío
      console.warn('Formato de respuesta desconocido:', response.data);
      normalizedResponse = {
        results: [],
        count: 0
      };
    }
    
    console.log('✅ Doctores que pueden derivar normalizados:', normalizedResponse);
    return normalizedResponse;
  } catch (error) {
    console.error('💥 Error al obtener doctores que pueden derivar:', error.response || error);
    throw error;
  }
};

/**
 * Obtiene un doctor por su ID
 * @param {number} id - ID del doctor
 * @returns {Promise} Promise con la respuesta
 */
export const getDoctorById = async (id) => {
  try {
    console.log(`Solicitando doctor con ID: ${id}`);
    const response = await apiClient.get(API_ROUTES.DOCTORS.BY_ID(id));
    
    // Normalizar datos del doctor
    const normalizedDoctor = normalizeDoctorData(response.data);
    
    return normalizedDoctor;
  } catch (error) {
    console.error(`Error al obtener el doctor con ID ${id}:`, error.response || error);
    throw error;
  }
};

/**
 * Prepara los datos del doctor para enviar al servidor
 * @param {Object} doctorData - Datos del doctor a preparar
 * @returns {Object} Datos del doctor preparados para enviar
 */
const prepareDoctorDataForSubmit = (doctorData) => {
  // Copia para no modificar el original
  const preparedData = { ...doctorData };
  
  // Asegurar que las especialidades sean un array de IDs
  if (preparedData.specialties) {
    preparedData.specialties = preparedData.specialties.map(spec => {
      // Si es un objeto, extraer el ID
      if (typeof spec === 'object' && spec.id) {
        return spec.id;
      }
      // Si ya es un número, dejarlo como está
      if (typeof spec === 'number') {
        return spec;
      }
      return null;
    }).filter(Boolean);
  }
  
  return preparedData;
};

/**
 * Crea un nuevo doctor
 * @param {Object} doctorData - Datos del doctor a crear
 * @returns {Promise} Promise con la respuesta
 */
export const createDoctor = async (doctorData) => {
  try {
    console.log('Creando doctor con datos:', doctorData);
    
    // Preparar datos para enviar
    const preparedData = prepareDoctorDataForSubmit(doctorData);
    console.log('Datos preparados para enviar:', preparedData);
    
    const response = await apiClient.post(API_ROUTES.DOCTORS.BASE, preparedData);
    
    // Normalizar datos del doctor creado
    const normalizedDoctor = normalizeDoctorData(response.data);
    
    return normalizedDoctor;
  } catch (error) {
    console.error('Error al crear doctor:', error.response || error);
    throw error;
  }
};

/**
 * Actualiza un doctor existente
 * @param {number} id - ID del doctor
 * @param {Object} doctorData - Datos actualizados del doctor
 * @returns {Promise} Promise con la respuesta
 */
export const updateDoctor = async (id, doctorData) => {
  try {
    console.log(`Actualizando doctor ${id} con datos:`, doctorData);
    
    // Preparar datos para enviar
    const preparedData = prepareDoctorDataForSubmit(doctorData);
    console.log('Datos preparados para enviar:', preparedData);
    
    const response = await apiClient.put(API_ROUTES.DOCTORS.BY_ID(id), preparedData);
    
    // Normalizar datos del doctor actualizado
    const normalizedDoctor = normalizeDoctorData(response.data);
    
    return normalizedDoctor;
  } catch (error) {
    console.error(`Error al actualizar el doctor con ID ${id}:`, error.response || error);
    throw error;
  }
};

/**
 * Elimina un doctor
 * @param {number} id - ID del doctor a eliminar
 * @returns {Promise} Promise con la respuesta
 */
export const deleteDoctor = async (id) => {
  try {
    console.log(`Eliminando doctor con ID: ${id}`);
    const response = await apiClient.delete(API_ROUTES.DOCTORS.BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el doctor con ID ${id}:`, error.response || error);
    throw error;
  }
};
