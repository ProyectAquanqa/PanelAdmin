import { adminApiClient } from '../../api';
import { API_ROUTES } from '../../config/api';

/**
 * Obtiene todos los usuarios con paginación y filtros
 * @param {Object} params - Parámetros de filtrado y paginación
 * @returns {Promise} Promise con la respuesta
 */
export const getUsers = async (params = {}) => {
  try {
    const response = await adminApiClient.get(API_ROUTES.USERS.LIST, { params });
    return response.data;
  } catch (error) {
    console.error('💥 Error al obtener usuarios:', error);
    throw error;
  }
};

/**
 * Obtiene un usuario por su ID
 * @param {number} id - ID del usuario
 * @returns {Promise} Promise con la respuesta
 */
export const getUserById = async (id) => {
  try {
    const url = API_ROUTES.USERS.BY_ID(id);
    const response = await adminApiClient.get(url);
    
    // El resto de la lógica para obtener datos de paciente/doctor puede permanecer
    const userData = response.data;
    if (userData.role === 'PATIENT' && userData.patient) {
      const patientResponse = await adminApiClient.get(API_ROUTES.PATIENTS.BY_ID(userData.patient));
      userData.patient_data = patientResponse.data;
    }
    if (userData.role === 'DOCTOR' && userData.doctor) {
      const doctorResponse = await adminApiClient.get(API_ROUTES.DOCTORS.BY_ID(userData.doctor));
      userData.doctor_data = doctorResponse.data;
    }
    
    return userData;
  } catch (error) {
    console.error(`💥 Error al obtener el usuario con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise} Promise con la respuesta
 */
export const createUser = async (userData) => {
  try {
    const response = await adminApiClient.post(API_ROUTES.USERS.CREATE, userData);
    return response.data;
  } catch (error) {
    console.error('💥 Error al crear usuario:', error);
    if (error.response && error.response.data) {
      console.error('📋 Detalles del error:', error.response.data);
    }
    throw error;
  }
};

/**
 * Actualiza un usuario existente
 * @param {number} id - ID del usuario
 * @param {Object} userData - Datos actualizados del usuario
 * @returns {Promise} Promise con la respuesta
 */
export const updateUser = async (id, userData) => {
  try {
    const url = API_ROUTES.USERS.BY_ID(id);
    const response = await adminApiClient.patch(url, userData);
    return response.data;
  } catch (error) {
    console.error(`💥 Error al actualizar usuario ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un usuario
 * @param {number} id - ID del usuario
 * @returns {Promise} Promise con la respuesta
 */
export const deleteUser = async (id) => {
  try {
    const url = API_ROUTES.USERS.BY_ID(id);
    const response = await adminApiClient.delete(url);
    return response.data;
  } catch (error) {
    console.error(`💥 Error al eliminar usuario ${id}:`, error);
    throw error;
  }
};

/**
 * Activa o desactiva un usuario
 * @param {number} id - ID del usuario
 * @returns {Promise} Promise con la respuesta
 */
export const toggleUserActive = async (id) => {
  try {
    const url = API_ROUTES.USERS.TOGGLE_ACTIVE(id);
    const response = await adminApiClient.post(url);
    return response.data;
  } catch (error) {
    console.error(`💥 Error al cambiar estado del usuario ${id}:`, error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de usuarios
 * @returns {Promise} Promise con la respuesta
 */
export const getUsersStats = async () => {
  try {
    const response = await adminApiClient.get(API_ROUTES.USERS.STATS);
    return response.data;
  } catch (error) {
    console.error('💥 Error al obtener estadísticas de usuarios:', error);
    return { total: 0, active: 0, inactive: 0, by_role: {} };
  }
};

// --- Funciones de Pacientes ---

/**
 * Obtiene la lista de pacientes
 * @param {Object} params - Parámetros de filtrado
 * @returns {Promise} Promise con la respuesta
 */
export const getPatients = async (params = {}) => {
  try {
    const response = await adminApiClient.get(API_ROUTES.PATIENTS.LIST, { params });
    return response.data;
  } catch (error) {
    console.error('💥 Error al obtener pacientes:', error);
    throw error;
  }
};

/**
 * Obtiene un paciente por su ID
 * @param {number} id - ID del paciente
 * @returns {Promise} Promise con la respuesta
 */
export const getPatientById = async (id) => {
  try {
    const url = API_ROUTES.PATIENTS.BY_ID(id);
    const response = await adminApiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(`💥 Error al obtener paciente ${id}:`, error);
    throw error;
  }
}; 