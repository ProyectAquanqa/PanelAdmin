import apiClient from '../api/apiClient';
import { API_ROUTES } from '../config/api';

/**
 * Obtiene la lista de pacientes
 * @param {Object} params - Parámetros para filtrar la lista
 * @returns {Promise} Promise con la respuesta
 */
export const getPatients = async (params = {}) => {
  try {
    console.log('🔍 Solicitando pacientes con parámetros:', params);
    
    // URLs a probar en orden de prioridad para pacientes
    const urlsToTry = [
      '/api/users/patients/',
      '/api/users/patients',
      '/api/v1/users/patients/',
      '/api/v1/users/patients'
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
    throw new Error('Ninguna URL de pacientes está disponible. Verifica que el backend esté correctamente configurado.');
    
  } catch (error) {
    console.error('💥 Error al obtener pacientes:', error.response || error);
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
    console.log(`Solicitando paciente con ID: ${id}`);
    const url = `${API_ROUTES.PATIENTS}/${id}/`;
    const response = await apiClient.get(url);
    console.log(`Respuesta del paciente ${id}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el paciente con ID ${id}:`, error.response || error);
    throw error;
  }
};

/**
 * Crea un nuevo paciente
 * @param {Object} patientData - Datos del paciente a crear
 * @returns {Promise} Promise con la respuesta
 */
export const createPatient = async (patientData) => {
  try {
    console.log('Creando paciente con datos:', patientData);
    
    // Asegurar que tenemos los campos obligatorios según el modelo de Django
    const requiredFields = ['email', 'password', 'first_name', 'last_name'];
    requiredFields.forEach(field => {
      if (!patientData[field]) {
        throw new Error(`El campo ${field} es obligatorio`);
      }
    });
    
    // Asegurar que document_type es un ID (número)
    if (patientData.document_type && typeof patientData.document_type !== 'number') {
      // Si no es número, intentamos usar el ID por defecto (1 para DNI)
      patientData.document_type = 1;
      console.log('⚠️ Usando document_type por defecto (1)');
    }
    
    // Asegurar formato de fecha correcto para birth_date (YYYY-MM-DD)
    if (patientData.birth_date) {
      const date = new Date(patientData.birth_date);
      if (!isNaN(date.getTime())) {
        patientData.birth_date = date.toISOString().split('T')[0];
      }
    }
    
    // Asegurar que gender tiene un valor válido
    if (!patientData.gender) {
      patientData.gender = 'OTHER';
    }
    
    // Preparar datos para el formato que espera Django
    const url = API_ROUTES.PATIENTS.endsWith('/') ? API_ROUTES.PATIENTS : API_ROUTES.PATIENTS + '/';
    const response = await apiClient.post(url, patientData);
    console.log('Paciente creado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al crear paciente:', error.response || error);
    throw error;
  }
};

/**
 * Actualiza un paciente existente
 * @param {number} id - ID del paciente
 * @param {Object} patientData - Datos actualizados del paciente
 * @returns {Promise} Promise con la respuesta
 */
export const updatePatient = async (id, patientData) => {
  try {
    console.log(`Actualizando paciente ${id} con datos:`, patientData);
    const url = `${API_ROUTES.PATIENTS}/${id}/`;
    const response = await apiClient.put(url, patientData);
    console.log(`Paciente ${id} actualizado:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el paciente con ID ${id}:`, error.response || error);
    throw error;
  }
};

/**
 * Elimina un paciente
 * @param {number} id - ID del paciente a eliminar
 * @returns {Promise} Promise con la respuesta
 */
export const deletePatient = async (id) => {
  try {
    console.log(`Eliminando paciente con ID: ${id}`);
    const url = `${API_ROUTES.PATIENTS}/${id}/`;
    const response = await apiClient.delete(url);
    console.log(`Paciente ${id} eliminado:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el paciente con ID ${id}:`, error.response || error);
    throw error;
  }
}; 