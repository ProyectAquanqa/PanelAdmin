import apiClient from '../api/apiClient';
import { API_ROUTES } from '../config/api';

/**
 * Obtiene la lista de doctores
 * @param {Object} params - Parámetros para filtrar la lista
 * @returns {Promise} Promise con la respuesta
 */
export const getDoctors = async (params = {}) => {
  try {
    console.log('🔍 Solicitando doctores con parámetros:', params);
    
    // URLs a probar en orden de prioridad para doctores
    const urlsToTry = [
      '/api/doctors/doctors/',
      '/api/doctors/doctors',
      '/api/v1/doctors/doctors/',
      '/api/v1/doctors/doctors'
    ];
    
    console.log('🎯 URLs que vamos a probar:', urlsToTry);
    
    for (const url of urlsToTry) {
      try {
        console.log(`🚀 Probando URL: ${url}`);
        const response = await apiClient.get(url, { params });
        console.log(`✅ ÉXITO con URL: ${url}`, response.data);
        return response.data;
      } catch (error) {
        console.log(`❌ Falló URL: ${url} - Status: ${error.response?.status}`);
        if (error.response?.status !== 404) {
          // Si no es 404, entonces hay otro problema (500, 403, etc.)
          throw error;
        }
        // Si es 404, continúa con la siguiente URL
      }
    }
    
    // Si llegamos aquí, ninguna URL funcionó
    throw new Error('Ninguna URL de doctores está disponible. Verifica que el backend esté correctamente configurado.');
    
  } catch (error) {
    console.error('💥 Error al obtener doctores:', error.response || error);
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
    const url = `${API_ROUTES.DOCTORS}/${id}/`;
    const response = await apiClient.get(url);
    console.log(`Respuesta del doctor ${id}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el doctor con ID ${id}:`, error.response || error);
    throw error;
  }
};

/**
 * Crea un nuevo doctor
 * @param {Object} doctorData - Datos del doctor a crear
 * @returns {Promise} Promise con la respuesta
 */
export const createDoctor = async (doctorData) => {
  try {
    console.log('Creando doctor con datos:', doctorData);
    const url = API_ROUTES.DOCTORS.endsWith('/') ? API_ROUTES.DOCTORS : API_ROUTES.DOCTORS + '/';
    const response = await apiClient.post(url, doctorData);
    console.log('Doctor creado:', response.data);
    return response.data;
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
    const url = `${API_ROUTES.DOCTORS}/${id}/`;
    const response = await apiClient.put(url, doctorData);
    console.log(`Doctor ${id} actualizado:`, response.data);
    return response.data;
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
    const url = `${API_ROUTES.DOCTORS}/${id}/`;
    const response = await apiClient.delete(url);
    console.log(`Doctor ${id} eliminado:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el doctor con ID ${id}:`, error.response || error);
    throw error;
  }
};
