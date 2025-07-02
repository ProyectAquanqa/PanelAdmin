import { adminApiClient } from '../../api';
import { API_ROUTES } from '../../config/api';
import { normalizeDoctorData, prepareDoctorDataForSubmit } from './doctorTransformService';

/**
 * Detecta el endpoint base para doctores
 * @returns {string} URL base para doctores
 */
export const detectDoctorBaseEndpoint = () => {
  return '/api/doctors/doctors/';
};

/**
 * Obtiene la lista de doctores.
 * El backend se encarga de anidar las especialidades de cada doctor.
 * @param {Object} params - Parámetros de consulta (ej: page, search).
 * @returns {Promise<Object>} La respuesta paginada con la lista de doctores.
 */
export const getAllDoctors = async (params = {}) => {
  try {
    const response = await adminApiClient.get(API_ROUTES.DOCTORS.LIST, { params });
    // El backend ya debería devolver los doctores con sus especialidades anidadas
    // y el transform service se encarga de normalizarlo si es necesario.
    return {
      ...response.data,
      results: response.data.results.map(normalizeDoctorData),
    };
  } catch (error) {
    console.error('❌ Error al obtener doctores:', error);
    throw error;
  }
};

/**
 * Obtiene un doctor por su ID.
 * @param {string} id - El ID del doctor.
 * @returns {Promise<Object>} El doctor normalizado.
 */
export const getDoctorById = async (id) => {
  try {
    const response = await adminApiClient.get(API_ROUTES.DOCTORS.BY_ID(id));
    return normalizeDoctorData(response.data);
  } catch (error) {
    console.error(`❌ Error al obtener doctor ${id}:`, error);
    throw error;
  }
};

/**
 * Detecta el formato correcto de las especialidades
 */
export const detectSpecialtiesFormat = async (specialties) => {
  if (!Array.isArray(specialties)) {
    return [];
  }
  
  // Si son objetos completos, extraer solo los IDs
  if (specialties.length > 0 && typeof specialties[0] === 'object') {
    return specialties.map(s => s.id || s.specialty_id || (s.specialty && typeof s.specialty === 'object' ? s.specialty.id : s.specialty));
  }
  
  return specialties;
};

/**
 * Crea un nuevo doctor.
 * @param {Object} doctorData - Los datos del doctor a crear.
 * @returns {Promise<Object>} El doctor recién creado y normalizado.
 */
export const createDoctor = async (doctorData) => {
  try {
    const preparedData = prepareDoctorDataForSubmit(doctorData);
    const response = await adminApiClient.post(API_ROUTES.DOCTORS.CREATE, preparedData);
    return normalizeDoctorData(response.data);
  } catch (error) {
    console.error('❌ Error al crear doctor:', error);
    throw error;
  }
};

/**
 * Actualiza un doctor existente.
 * Usamos PATCH para actualizaciones parciales.
 * @param {Object} doctorData - Los datos del doctor a actualizar, debe incluir el ID.
 * @returns {Promise<Object>} El doctor actualizado y normalizado.
 */
export const updateDoctor = async (doctorData) => {
  const { id, ...data } = doctorData;
  try {
    const preparedData = prepareDoctorDataForSubmit(data);
    const response = await adminApiClient.patch(API_ROUTES.DOCTORS.BY_ID(id), preparedData);
    return normalizeDoctorData(response.data);
  } catch (error) {
    console.error(`❌ Error al actualizar el doctor ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Elimina un doctor por su ID.
 * @param {string} id - El ID del doctor a eliminar.
 * @returns {Promise<boolean>} True si la eliminación fue exitosa.
 */
export const deleteDoctor = async (id) => {
  try {
    await adminApiClient.delete(API_ROUTES.DOCTORS.BY_ID(id));
    return true;
  } catch (error) {
    console.error(`❌ Error al eliminar doctor ${id}:`, error);
    throw error;
  }
};

/**
 * Asocia una especialidad a un doctor
 */
export const addSpecialtyToDoctor = async (doctorId, specialtyId) => {
  try {
    console.log(`🔍 Asociando especialidad ${specialtyId} al doctor ${doctorId}`);
    
    // Determinar el formato de especialidades a usar
    const format = localStorage.getItem('specialtiesFormat') || 'array';
    let payload;
    
    if (format === 'objects') {
      payload = { specialty_id: specialtyId };
    } else if (format === 'specialty_objects') {
      payload = { specialty: specialtyId };
    } else {
      payload = { specialty_id: specialtyId }; // Formato más común
    }
    
    const response = await adminApiClient.post(`/api/doctors/doctor_specialties/`, {
      doctor: doctorId,
      ...payload
    });
    
    console.log(`✅ Especialidad ${specialtyId} asociada al doctor ${doctorId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al asociar especialidad ${specialtyId} al doctor ${doctorId}:`, error);
    throw error;
  }
};

/**
 * Elimina una especialidad de un doctor
 */
export const removeSpecialtyFromDoctor = async (doctorId, specialtyId) => {
  try {
    console.log(`🔍 Eliminando especialidad ${specialtyId} del doctor ${doctorId}`);
    
    // Primero, intentar obtener el ID de la relación doctor-especialidad
    const specialtiesResponse = await adminApiClient.get(`/api/doctors/specialties/by_doctor/?doctor_id=${doctorId}`);
    
    let doctorSpecialties = [];
    if (Array.isArray(specialtiesResponse.data)) {
      doctorSpecialties = specialtiesResponse.data;
    } else if (specialtiesResponse.data && specialtiesResponse.data.results) {
      doctorSpecialties = specialtiesResponse.data.results;
    }
    
    // Buscar la relación que corresponde a la especialidad a eliminar
    const relationToDelete = doctorSpecialties.find(spec => {
      const specId = typeof spec === 'object' ? 
        spec.id || spec.specialty_id || (spec.specialty && typeof spec.specialty === 'object' ? spec.specialty.id : spec.specialty) : 
        spec;
      
      return specId === specialtyId;
    });
    
    if (!relationToDelete || !relationToDelete.id) {
      throw new Error(`No se encontró la relación entre doctor ${doctorId} y especialidad ${specialtyId}`);
    }
    
    // Eliminar la relación
    await adminApiClient.delete(`/api/doctors/doctor_specialties/${relationToDelete.id}/`);
    console.log(`✅ Especialidad ${specialtyId} eliminada del doctor ${doctorId}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error al eliminar especialidad ${specialtyId} del doctor ${doctorId}:`, error);
    throw error;
  }
};

// Exportar todas las funciones
export default {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  detectDoctorBaseEndpoint,
  detectSpecialtiesFormat,
  addSpecialtyToDoctor,
  removeSpecialtyFromDoctor
}; 