import { adminApiClient } from '../../api';
import { API_ROUTES } from '../../config/api';

const RECORDS_API_URL = API_ROUTES.MEDICAL.RECORDS;

/**
 * Obtiene la lista de historiales médicos, con filtros y paginación.
 * @param {Object} params - Parámetros de consulta (ej. patient_id, page, search).
 * @returns {Promise<Object>} La respuesta paginada con la lista de historiales.
 */
export const getMedicalRecords = async (params = {}) => {
  try {
    const response = await adminApiClient.get(RECORDS_API_URL.LIST, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener historiales médicos:', error);
    throw error;
  }
};

/**
 * Obtiene un historial médico por su ID.
 * @param {string|number} id - El ID del historial.
 * @returns {Promise<Object>} Los datos del historial médico.
 */
export const getMedicalRecordById = async (id) => {
  try {
    const response = await adminApiClient.get(RECORDS_API_URL.BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el historial médico ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo historial médico.
 * @param {Object} recordData - Los datos del nuevo historial.
 * @returns {Promise<Object>} El historial médico recién creado.
 */
export const createMedicalRecord = async (recordData) => {
  try {
    const response = await adminApiClient.post(RECORDS_API_URL.CREATE, recordData);
    return response.data;
  } catch (error) {
    console.error('Error al crear el historial médico:', error.response?.data || error);
    throw error;
  }
};

/**
 * Actualiza un historial médico existente (parcialmente).
 * @param {string|number} id - El ID del historial a actualizar.
 * @param {Object} recordData - Los datos a actualizar.
 * @returns {Promise<Object>} El historial médico actualizado.
 */
export const updateMedicalRecord = async (id, recordData) => {
  try {
    const response = await adminApiClient.patch(RECORDS_API_URL.BY_ID(id), recordData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el historial médico ${id}:`, error.response?.data || error);
    throw error;
  }
};

/**
 * Elimina un historial médico por su ID.
 * @param {string|number} id - El ID del historial a eliminar.
 * @returns {Promise<void>}
 */
export const deleteMedicalRecord = async (id) => {
  try {
    await adminApiClient.delete(RECORDS_API_URL.BY_ID(id));
  } catch (error) {
    console.error(`Error al eliminar el historial médico ${id}:`, error.response?.data || error);
    throw error;
  }
};

/**
 * Sube un archivo adjunto a un historial médico específico.
 * @param {string|number} recordId - El ID del historial médico.
 * @param {FormData} formData - El FormData que contiene el archivo y otros datos.
 * @returns {Promise<Object>} Los datos del archivo adjunto creado.
 */
export const addAttachmentToRecord = async (recordId, formData) => {
  try {
    // Asumimos que el endpoint de adjuntos es una ruta anidada.
    const url = `${RECORDS_API_URL.BY_ID(recordId)}attachments/`;
    const response = await adminApiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error al subir el adjunto para el historial ${recordId}:`, error.response?.data || error);
    throw error;
  }
}; 