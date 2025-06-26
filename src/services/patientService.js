// ============================================================================
// 🏥 SERVICIO: Patient Service - Servicio Mejorado para Pacientes
// Manejo completo de la API de pacientes con validaciones y normalización
// ============================================================================

import apiClient from '../api/apiClient';
import { API_ROUTES } from '../config/api';

/**
 * Normaliza los datos de un paciente para asegurar consistencia
 * @param {Object} patientData - Datos del paciente a normalizar
 * @returns {Object} Datos del paciente normalizados
 */
const normalizePatientData = (patientData) => {
  if (!patientData) return {};
  
  const normalized = { ...patientData };
  
  // Asegurar que gender tiene un valor válido
  if (!normalized.gender) {
    normalized.gender = 'OTHER';
  }
  
  // Mapear géneros si vienen en formato corto
  const shortToLong = {
    'M': 'MALE',
    'F': 'FEMALE', 
    'O': 'OTHER'
  };
  
  if (shortToLong[normalized.gender]) {
    normalized.gender = shortToLong[normalized.gender];
  }
  
  // Asegurar que el email esté disponible en el nivel superior
  if (!normalized.email && normalized.user?.email) {
    normalized.email = normalized.user.email;
  }
  
  if (!normalized.user_email && normalized.user?.email) {
    normalized.user_email = normalized.user.email;
  }
  
  return normalized;
};

/**
 * Prepara los datos del paciente para enviar al servidor
 * @param {Object} patientData - Datos del paciente a preparar
 * @returns {Object} Datos del paciente preparados para enviar
 */
const preparePatientDataForSubmit = (patientData) => {
  const prepared = { ...patientData };
  
  console.log('🔧 Preparando datos del paciente:', prepared);
  
  // Validar campos requeridos
  const requiredFields = [
    'first_name',
    'last_name',
    'document_number',
    'birth_date',
    'gender',
    'phone'
  ];
  
  requiredFields.forEach(field => {
    if (!prepared[field] || prepared[field].trim() === '') {
      throw new Error(`El campo ${field} es requerido`);
    }
  });
  
  // Validar documento
  if (prepared.document_number) {
    prepared.document_number = prepared.document_number.replace(/[^\d]/g, '');
    if (prepared.document_number.length < 8) {
      throw new Error('El número de documento debe tener al menos 8 dígitos');
    }
  }
  
  // Validar teléfono
  if (prepared.phone) {
    const cleanedPhone = prepared.phone.replace(/[^\d]/g, '');
    if (cleanedPhone.length < 9 || cleanedPhone.length > 15) {
      throw new Error('El teléfono debe tener entre 9 y 15 dígitos');
    }
    prepared.phone = cleanedPhone;
  }
  
  // Validar teléfono de emergencia si existe
  if (prepared.emergency_contact_phone) {
    const cleanedPhone = prepared.emergency_contact_phone.replace(/[^\d]/g, '');
    if (cleanedPhone.length < 9 || cleanedPhone.length > 15) {
      throw new Error('El teléfono de emergencia debe tener entre 9 y 15 dígitos');
    }
    prepared.emergency_contact_phone = cleanedPhone;
  }
  
  // Validar género
  if (!['MALE', 'FEMALE', 'OTHER'].includes(prepared.gender)) {
    throw new Error('El género debe ser MALE, FEMALE u OTHER');
  }
  
  // Validar tipo de sangre si existe
  if (prepared.blood_type) {
    const validBloodTypes = [
      'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE',
      'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'
    ];
    if (!validBloodTypes.includes(prepared.blood_type)) {
      throw new Error('Tipo de sangre inválido');
    }
  }
  
  // Validar fecha de nacimiento
  if (prepared.birth_date) {
    const date = new Date(prepared.birth_date);
    if (isNaN(date.getTime())) {
      throw new Error('Fecha de nacimiento inválida');
    }
    prepared.birth_date = date.toISOString().split('T')[0];
  }
  
  // Limpiar campos vacíos
  Object.keys(prepared).forEach(key => {
    if (prepared[key] === '' || prepared[key] === null || prepared[key] === undefined) {
      delete prepared[key];
    }
  });
  
  // Verificar si es un paciente presencial
  prepared.is_presential = Boolean(prepared.is_presential);
  
  console.log('✅ Datos preparados:', prepared);
  return prepared;
};

/**
 * Obtiene la lista de pacientes
 * @param {Object} params - Parámetros para filtrar la lista
 * @returns {Promise} Promise con la respuesta normalizada
 */
export const getPatients = async (params = {}) => {
  try {
    console.log('🔍 Solicitando pacientes con parámetros:', params);
    
    const response = await apiClient.get(API_ROUTES.PATIENTS.BASE, { params });
    console.log('📥 Respuesta cruda del servidor:', response.data);
    
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
      console.warn('⚠️ Formato de respuesta desconocido:', response.data);
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
    console.log(`🔍 Solicitando paciente con ID: ${id}`);
    
    const response = await apiClient.get(API_ROUTES.PATIENTS.BY_ID(id));
    console.log('📥 Datos del paciente obtenidos:', response.data);
    
    const normalizedPatient = normalizePatientData(response.data);
    console.log('✅ Paciente normalizado:', normalizedPatient);
    
    return normalizedPatient;
    
  } catch (error) {
    console.error(`💥 Error al obtener el paciente con ID ${id}:`, error.response || error);
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
    console.log('🚀 Creando paciente con datos:', patientData);
    
    // Preparar datos
    const preparedData = preparePatientDataForSubmit(patientData);
    console.log('✅ Datos preparados:', preparedData);
    
    // Enviar datos al servidor
    console.log('📤 Enviando datos al servidor:', preparedData);
    console.log('📤 Usando endpoint:', API_ROUTES.PATIENTS.BASE);
    
    const response = await apiClient.post(API_ROUTES.PATIENTS.BASE, preparedData);
    
    if (!response.data) {
      throw new Error('No se recibió respuesta del servidor');
    }
    
    console.log('✅ Paciente creado:', response.data);
    return normalizePatientData(response.data);
    
  } catch (error) {
    console.log('💥 Error al crear paciente:', error);
    console.log('📋 Detalles del error:', error.response?.data || error.message);
    
    // Mejorar mensaje de error
    let errorMessage = 'Error al crear paciente';
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
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
    console.log(`🔄 Actualizando paciente ${id} con datos:`, patientData);
    
    if (!id) {
      throw new Error('ID de paciente no proporcionado');
    }
    
    // Preparar datos para enviar
    const preparedData = preparePatientDataForSubmit(patientData);
    console.log('✅ Datos preparados:', preparedData);
    
    // Para actualización, no enviar campos vacíos
    Object.keys(preparedData).forEach(key => {
      if (preparedData[key] === '' || preparedData[key] === null || preparedData[key] === undefined) {
        delete preparedData[key];
      }
    });
    
    // Si es presencial, asegurar que no se envían credenciales
    if (preparedData.is_presential) {
      delete preparedData.email;
      delete preparedData.password;
    }
    
    // Asegurarse de que el ID es un número
    const patientId = parseInt(id, 10);
    if (isNaN(patientId)) {
      throw new Error(`ID de paciente inválido: ${id}`);
    }
    
    // Construir URL completa
    const url = API_ROUTES.PATIENTS.BY_ID(patientId);
    console.log(`📤 Enviando datos actualizados a URL: ${url}`);
    console.log('📤 Datos enviados:', preparedData);
    
    const response = await apiClient.put(url, preparedData);
    
    if (!response.data) {
      throw new Error('No se recibió respuesta del servidor');
    }
    
    console.log('✅ Paciente actualizado:', response.data);
    return normalizePatientData(response.data);
    
  } catch (error) {
    console.error(`💥 Error al actualizar el paciente con ID ${id}:`, error);
    console.log('📋 Detalles del error:', error.response?.data || error.message);
    
    // Mejorar mensaje de error
    let errorMessage = 'Error al actualizar paciente';
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Elimina un paciente
 * @param {number} id - ID del paciente a eliminar
 * @returns {Promise} Promise con la respuesta
 */
export const deletePatient = async (id) => {
  try {
    console.log(`🗑️ Eliminando paciente con ID: ${id}`);
    
    const response = await apiClient.delete(API_ROUTES.PATIENTS.BY_ID(id));
    console.log('📥 Paciente eliminado:', response.data);
    
    return response.data;
    
  } catch (error) {
    console.error(`💥 Error al eliminar el paciente con ID ${id}:`, error.response || error);
    throw error;
  }
};