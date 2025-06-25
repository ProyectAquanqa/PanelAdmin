import apiClient from '../api/apiClient';
import { API_ROUTES } from '../config/api';

/**
 * Normaliza los datos de un paciente para asegurar consistencia
 * @param {Object} patientData - Datos del paciente a normalizar
 * @returns {Object} Datos del paciente normalizados
 */
const normalizePatientData = (patientData) => {
  // Si no hay datos, devolver objeto vacío
  if (!patientData) return {};
  
  // Copia para no modificar el original
  const normalizedPatient = { ...patientData };
  
  // Asegurar que gender tiene un valor válido
  if (!normalizedPatient.gender) {
    normalizedPatient.gender = 'O';
  }
  
  return normalizedPatient;
};

/**
 * Obtiene la lista de pacientes
 * @param {Object} params - Parámetros para filtrar la lista
 * @returns {Promise} Promise con la respuesta
 */
export const getPatients = async (params = {}) => {
  try {
    console.log('🔍 Solicitando pacientes con parámetros:', params);
    const response = await apiClient.get(API_ROUTES.PATIENTS.BASE, { params });
    
    console.log('Respuesta cruda del servidor:', response.data);
    
    // Normalizar respuesta según el formato recibido
    let normalizedResponse;
    
    if (Array.isArray(response.data)) {
      // Si es un array directo
      normalizedResponse = {
        results: response.data.map(normalizePatientData),
        count: response.data.length
      };
    } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
      // Si tiene estructura de paginación de Django REST
      normalizedResponse = {
        results: response.data.results.map(normalizePatientData),
        count: response.data.count || response.data.results.length,
        next: response.data.next,
        previous: response.data.previous
      };
    } else if (response.data && response.data.patients && Array.isArray(response.data.patients)) {
      // Si tiene una propiedad 'patients'
      normalizedResponse = {
        results: response.data.patients.map(normalizePatientData),
        count: response.data.count || response.data.patients.length
      };
    } else if (response.data && typeof response.data === 'object') {
      // Si es un objeto pero no tiene una estructura reconocida
      normalizedResponse = {
        results: [normalizePatientData(response.data)],
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
    const response = await apiClient.get(API_ROUTES.PATIENTS.BY_ID(id));
    
    // Normalizar datos del paciente
    const normalizedPatient = normalizePatientData(response.data);
    
    return normalizedPatient;
  } catch (error) {
    console.error(`Error al obtener el paciente con ID ${id}:`, error.response || error);
    throw error;
  }
};

/**
 * Prepara los datos del paciente para enviar al servidor
 * @param {Object} patientData - Datos del paciente a preparar
 * @returns {Object} Datos del paciente preparados para enviar
 */
const preparePatientDataForSubmit = (patientData) => {
  // Copia para no modificar el original
  const preparedData = { ...patientData };
  
  // Asegurar que gender tiene un valor válido
  if (!preparedData.gender) {
    preparedData.gender = 'O';
  }
  
  // Mapeo de valores de género si vienen en formato largo
  if (preparedData.gender === 'MALE') preparedData.gender = 'M';
  if (preparedData.gender === 'FEMALE') preparedData.gender = 'F';
  if (preparedData.gender === 'OTHER') preparedData.gender = 'O';
  
  // Validar y corregir el tipo de sangre
  if (preparedData.blood_type) {
    // Mapeo de valores de tipo de sangre
    const bloodTypeMap = {
      'A_POSITIVE': 'A+',
      'A_NEGATIVE': 'A-',
      'B_POSITIVE': 'B+',
      'B_NEGATIVE': 'B-',
      'AB_POSITIVE': 'AB+',
      'AB_NEGATIVE': 'AB-',
      'O_POSITIVE': 'O+',
      'O_NEGATIVE': 'O-'
    };
    
    // Verificar si el valor ya es válido
    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    if (!validBloodTypes.includes(preparedData.blood_type)) {
      // Si no es válido, intentar mapearlo
      if (bloodTypeMap[preparedData.blood_type]) {
        preparedData.blood_type = bloodTypeMap[preparedData.blood_type];
      } else {
        // Si no se puede mapear, eliminarlo para evitar errores
        console.warn(`Tipo de sangre inválido: ${preparedData.blood_type}. Se eliminará este campo.`);
        delete preparedData.blood_type;
      }
    }
    
    console.log(`Tipo de sangre final: ${preparedData.blood_type}`);
  }
  
  // Asegurar formato de fecha correcto para birth_date (YYYY-MM-DD)
  if (preparedData.birth_date) {
    const date = new Date(preparedData.birth_date);
    if (!isNaN(date.getTime())) {
      preparedData.birth_date = date.toISOString().split('T')[0];
    }
  }
  
  return preparedData;
};

/**
 * Crea un nuevo paciente
 * @param {Object} patientData - Datos del paciente a crear
 * @returns {Promise} Promise con la respuesta
 */
export const createPatient = async (patientData) => {
  try {
    console.log('Creando paciente con datos:', patientData);
    console.log('Tipo de sangre antes de preparar:', patientData.blood_type);
    
    // Preparar datos para enviar
    const preparedData = preparePatientDataForSubmit(patientData);
    console.log('Datos preparados para enviar:', preparedData);
    console.log('Tipo de sangre después de preparar:', preparedData.blood_type);
    
    const response = await apiClient.post(API_ROUTES.PATIENTS.BASE, preparedData);
    
    // Normalizar datos del paciente creado
    const normalizedPatient = normalizePatientData(response.data);
    
    return normalizedPatient;
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
    
    // Preparar datos para enviar
    const preparedData = preparePatientDataForSubmit(patientData);
    console.log('Datos preparados para enviar:', preparedData);
    
    const response = await apiClient.put(API_ROUTES.PATIENTS.BY_ID(id), preparedData);
    
    // Normalizar datos del paciente actualizado
    const normalizedPatient = normalizePatientData(response.data);
    
    return normalizedPatient;
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
    const response = await apiClient.delete(API_ROUTES.PATIENTS.BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el paciente con ID ${id}:`, error.response || error);
    throw error;
  }
}; 