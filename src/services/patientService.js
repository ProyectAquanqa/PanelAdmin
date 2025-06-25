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
  
  // Validar género
  if (!prepared.gender) {
    prepared.gender = 'OTHER';  // Usamos formato de base de datos por defecto
  }
  
  // Mapeo para convertir formatos cortos a largos si es necesario
  const shortToLong = {
    'M': 'MALE',
    'F': 'FEMALE',
    'O': 'OTHER'
  };
  
  // Convertir si viene en formato corto
  if (shortToLong[prepared.gender]) {
    prepared.gender = shortToLong[prepared.gender];
  }
  
  // Validar que el género esté en los valores permitidos
  if (!['MALE', 'FEMALE', 'OTHER'].includes(prepared.gender)) {
    console.warn(`Género inválido: ${prepared.gender}. Usando 'OTHER' por defecto.`);
    prepared.gender = 'OTHER';
  }
  
  // Validar tipo de sangre
  if (prepared.blood_type) {
    // Lista de tipos de sangre válidos según el modelo de Django
    const validBloodTypes = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 
                            'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'];
    
    // Mapeo para convertir formatos cortos a largos si es necesario
    const displayToDb = {
      'A+': 'A_POSITIVE',
      'A-': 'A_NEGATIVE',
      'B+': 'B_POSITIVE',
      'B-': 'B_NEGATIVE',
      'AB+': 'AB_POSITIVE',
      'AB-': 'AB_NEGATIVE',
      'O+': 'O_POSITIVE',
      'O-': 'O_NEGATIVE',
    };
    
    // Convertir si viene en formato corto
    if (displayToDb[prepared.blood_type]) {
      prepared.blood_type = displayToDb[prepared.blood_type];
    }
    
    // Validar que sea un valor válido
    if (!validBloodTypes.includes(prepared.blood_type)) {
      console.warn(`Tipo de sangre inválido: ${prepared.blood_type}. Se eliminará.`);
      delete prepared.blood_type;
    }
  }
  
  // Validar formato de fecha de nacimiento
  if (prepared.birth_date) {
    // Si viene en formato DD/MM/YYYY, convertir a YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(prepared.birth_date)) {
      const [day, month, year] = prepared.birth_date.split('/');
      prepared.birth_date = `${year}-${month}-${day}`;
    }
    
    // Validar que sea una fecha válida
    const date = new Date(prepared.birth_date);
    if (isNaN(date.getTime())) {
      console.warn(`Fecha de nacimiento inválida: ${prepared.birth_date}. Se eliminará.`);
      delete prepared.birth_date;
    } else {
      // Asegurar formato YYYY-MM-DD
      prepared.birth_date = date.toISOString().split('T')[0];
    }
  }
  
  // Validar número de documento
  if (prepared.document_number) {
    // Solo permitir números
    prepared.document_number = prepared.document_number.replace(/[^\d]/g, '');
    
    if (prepared.document_number.length < 8) {
      console.warn(`Documento muy corto: ${prepared.document_number}. Debe tener al menos 8 dígitos.`);
    }
  }
  
  // Validar email
  if (prepared.email) {
    prepared.email = prepared.email.toLowerCase().trim();
  }
  
  // Validar teléfonos
  if (prepared.phone) {
    // Formatear el teléfono para cumplir con el requisito del backend (RegexValidator)
    // Eliminar espacios y caracteres no permitidos
    const cleanedPhone = prepared.phone.replace(/\s+/g, '');
    
    // Asegurar que cumple con el formato requerido
    if (/^\+?1?\d{9,15}$/.test(cleanedPhone)) {
      prepared.phone = cleanedPhone;
    } else {
      console.warn(`Teléfono inválido: ${prepared.phone}. Se ajustará al formato.`);
      // Intentar arreglar el formato
      const digitsOnly = cleanedPhone.replace(/\D/g, '');
      if (digitsOnly.length >= 9 && digitsOnly.length <= 15) {
        prepared.phone = digitsOnly;
      } else {
        console.warn(`No se pudo formatear el teléfono. Se eliminará para evitar errores.`);
        delete prepared.phone;
      }
    }
  }
  
  if (prepared.emergency_contact_phone) {
    // Formatear el teléfono de emergencia
    const cleanedPhone = prepared.emergency_contact_phone.replace(/\s+/g, '');
    
    // Asegurar que cumple con el formato requerido
    if (/^\+?1?\d{9,15}$/.test(cleanedPhone)) {
      prepared.emergency_contact_phone = cleanedPhone;
    } else {
      console.warn(`Teléfono de emergencia inválido: ${prepared.emergency_contact_phone}. Se ajustará al formato.`);
      // Intentar arreglar el formato
      const digitsOnly = cleanedPhone.replace(/\D/g, '');
      if (digitsOnly.length >= 9 && digitsOnly.length <= 15) {
        prepared.emergency_contact_phone = digitsOnly;
      } else {
        console.warn(`No se pudo formatear el teléfono de emergencia. Se eliminará para evitar errores.`);
        delete prepared.emergency_contact_phone;
      }
    }
  }
  
  // Limpiar campos vacíos
  Object.keys(prepared).forEach(key => {
    if (prepared[key] === '' || prepared[key] === null || prepared[key] === undefined) {
      delete prepared[key];
    }
  });
  
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
    
    // Preparar datos para enviar
    const preparedData = preparePatientDataForSubmit(patientData);
    
    // Validaciones específicas para creación
    if (!preparedData.email) {
      throw new Error('El email es obligatorio');
    }
    
    if (!preparedData.first_name) {
      throw new Error('El nombre es obligatorio');
    }
    
    if (!preparedData.last_name) {
      throw new Error('El apellido es obligatorio');
    }
    
    if (!preparedData.document_number) {
      throw new Error('El número de documento es obligatorio');
    }
    
    // Asegurar contraseña para nuevos usuarios
    if (!preparedData.password || preparedData.password.length < 8) {
      preparedData.password = 'temporal123';
      console.log('⚠️ Usando contraseña temporal para nuevo paciente');
    }

    // Validación adicional para blood_type
    if (preparedData.blood_type) {
      const validBloodTypes = [
        'A_POSITIVE', 'A_NEGATIVE', 
        'B_POSITIVE', 'B_NEGATIVE', 
        'AB_POSITIVE', 'AB_NEGATIVE', 
        'O_POSITIVE', 'O_NEGATIVE'
      ];
      
      if (!validBloodTypes.includes(preparedData.blood_type)) {
        console.warn(`Tipo de sangre no válido: ${preparedData.blood_type}. Intentando convertir.`);
        
        // Intentar convertir formato corto a largo
        const shortToLong = {
          'A+': 'A_POSITIVE',
          'A-': 'A_NEGATIVE',
          'B+': 'B_POSITIVE',
          'B-': 'B_NEGATIVE',
          'AB+': 'AB_POSITIVE',
          'AB-': 'AB_NEGATIVE',
          'O+': 'O_POSITIVE',
          'O-': 'O_NEGATIVE',
        };
        
        if (shortToLong[preparedData.blood_type]) {
          preparedData.blood_type = shortToLong[preparedData.blood_type];
          console.log(`✅ Tipo de sangre convertido a: ${preparedData.blood_type}`);
        } else {
          console.warn(`Tipo de sangre no válido: ${preparedData.blood_type}. Se eliminará del envío.`);
          delete preparedData.blood_type;
        }
      }
    }
    
    console.log('📤 Enviando datos al servidor:', preparedData);
    
    const response = await apiClient.post(API_ROUTES.PATIENTS.BASE, preparedData);
    console.log('📥 Respuesta del servidor:', response.data);
    
    const normalizedPatient = normalizePatientData(response.data);
    console.log('✅ Paciente creado y normalizado:', normalizedPatient);
    
    return normalizedPatient;
    
  } catch (error) {
    console.error('💥 Error al crear paciente:', error.response || error);
    
    // Mejorar el mensaje de error
    if (error.response?.data) {
      const errorData = error.response.data;
      console.log('📋 Detalles del error:', errorData);
      
      // Manejar errores específicos
      if (errorData.blood_type) {
        const bloodTypeError = Array.isArray(errorData.blood_type) ? errorData.blood_type[0] : errorData.blood_type;
        throw new Error(`Error en tipo de sangre: ${bloodTypeError}`);
      }
      
      if (errorData.detail) {
        // Extraer el error real de la respuesta
        const detailError = errorData.detail;
        throw new Error(`Error al crear paciente: ${detailError}`);
      }
      
      // Crear un error más específico
      const enhancedError = new Error('Error al crear paciente');
      enhancedError.response = error.response;
      throw enhancedError;
    }
    
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
    console.log(`🔄 Actualizando paciente ${id} con datos:`, patientData);
    
    if (!id) {
      console.error('❌ Error: No se proporcionó ID para actualizar paciente');
      throw new Error('ID de paciente no proporcionado');
    }
    
    // Preparar datos para enviar
    const preparedData = preparePatientDataForSubmit(patientData);
    
    // Para actualización, no requerir todos los campos
    if (preparedData.password === '') {
      delete preparedData.password;
    }
    
    // Validación adicional para blood_type
    if (preparedData.blood_type) {
      const validBloodTypes = [
        'A_POSITIVE', 'A_NEGATIVE', 
        'B_POSITIVE', 'B_NEGATIVE', 
        'AB_POSITIVE', 'AB_NEGATIVE', 
        'O_POSITIVE', 'O_NEGATIVE'
      ];
      
      if (!validBloodTypes.includes(preparedData.blood_type)) {
        console.warn(`Tipo de sangre no válido en actualización: ${preparedData.blood_type}. Intentando convertir.`);
        
        // Intentar convertir formato corto a largo
        const shortToLong = {
          'A+': 'A_POSITIVE',
          'A-': 'A_NEGATIVE',
          'B+': 'B_POSITIVE',
          'B-': 'B_NEGATIVE',
          'AB+': 'AB_POSITIVE',
          'AB-': 'AB_NEGATIVE',
          'O+': 'O_POSITIVE',
          'O-': 'O_NEGATIVE',
        };
        
        if (shortToLong[preparedData.blood_type]) {
          preparedData.blood_type = shortToLong[preparedData.blood_type];
          console.log(`✅ Tipo de sangre convertido a: ${preparedData.blood_type}`);
        } else {
          console.warn(`Tipo de sangre no válido: ${preparedData.blood_type}. Se eliminará del envío.`);
          delete preparedData.blood_type;
        }
      }
    }
    
    // Asegurarse de que el ID es un número
    const patientId = parseInt(id, 10);
    if (isNaN(patientId)) {
      throw new Error(`ID de paciente inválido: ${id}`);
    }
    
    // Construir URL completa
    const url = API_ROUTES.PATIENTS.BY_ID(patientId);
    console.log(`📤 Enviando datos actualizados a URL: ${url}`);
    console.log('📤 Datos enviados:', JSON.stringify(preparedData, null, 2));
    
    // Usar axios directamente para evitar problemas con el cliente API
    const response = await apiClient.put(url, preparedData);
    
    console.log('📥 Respuesta del servidor:', response.data);
    
    const normalizedPatient = normalizePatientData(response.data);
    console.log('✅ Paciente actualizado y normalizado:', normalizedPatient);
    
    return normalizedPatient;
    
  } catch (error) {
    console.error(`💥 Error al actualizar el paciente con ID ${id}:`, error.response || error);
    
    // Mejorar el mensaje de error
    if (error.response?.data) {
      const errorData = error.response.data;
      console.log('📋 Detalles del error:', errorData);
      
      // Manejar errores específicos
      if (errorData.blood_type) {
        const bloodTypeError = Array.isArray(errorData.blood_type) ? errorData.blood_type[0] : errorData.blood_type;
        throw new Error(`Error en tipo de sangre: ${bloodTypeError}`);
      }
      
      if (errorData.detail) {
        // Extraer el error real de la respuesta
        const detailError = errorData.detail;
        throw new Error(`Error al actualizar paciente: ${detailError}`);
      }
      
      // Crear un error más específico
      const enhancedError = new Error('Error al actualizar paciente');
      enhancedError.response = error.response;
      throw enhancedError;
    }
    
    throw new Error(`Error al actualizar paciente: ${error.message || 'Error desconocido'}`);
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