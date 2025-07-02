import { mainApiClient, adminApiClient } from '../../api';
import { API_ROUTES } from '../../config/api';

/**
 * Obtiene los horarios disponibles para una cita
 * @param {Object} params - Parámetros para buscar horarios disponibles (doctor_id, date)
 * @returns {Promise} Promise con la respuesta
 */
export const getAvailableSlots = async (params) => {
  if (!params.doctor_id || !params.date) {
    throw new Error('Se requiere doctor_id y date para buscar horarios disponibles');
  }
  try {
    const response = await mainApiClient.get(API_ROUTES.APPOINTMENTS.AVAILABLE_TIME_BLOCKS, { params });
    return response.data || { available_blocks: [], busy_blocks: [] };
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    throw error;
  }
};

/**
 * Obtiene doctores por especialidad
 * @param {number} specialtyId - ID de la especialidad
 * @returns {Promise} Promise con la respuesta
 */
export const getDoctorsBySpecialty = async (specialtyId) => {
  if (!specialtyId) {
    return [];
  }
  try {
    const response = await adminApiClient.get(API_ROUTES.DOCTORS.BY_SPECIALTY, {
      params: { specialty_id: specialtyId }
    });
    return response.data.results || response.data || [];
  } catch (error) {
    console.error('Error al obtener doctores por especialidad:', error);
    throw error;
  }
};

/**
 * Convierte un ID de bloque horario a un nombre legible
 * @param {string} blockId - ID del bloque horario
 * @returns {string} Nombre legible del bloque horario
 */
export const getTimeBlockDisplayName = (blockId) => {
  const blockMap = {
    'MORNING': 'Mañana (8:00 - 12:00)',
    'AFTERNOON': 'Tarde (14:00 - 18:00)',
    'EVENING': 'Noche (18:00 - 21:00)',
    'BLOCK_8_9': '8:00 - 9:00',
    'BLOCK_9_10': '9:00 - 10:00',
    'BLOCK_10_11': '10:00 - 11:00',
    'BLOCK_11_12': '11:00 - 12:00',
    'BLOCK_14_15': '14:00 - 15:00',
    'BLOCK_15_16': '15:00 - 16:00',
    'BLOCK_16_17': '16:00 - 17:00',
    'BLOCK_17_18': '17:00 - 18:00',
    'BLOCK_18_19': '18:00 - 19:00',
    'BLOCK_19_20': '19:00 - 20:00',
    'BLOCK_20_21': '20:00 - 21:00'
  };
  
  return blockMap[blockId] || blockId;
}; 