import { adminApiClient } from '../../api';
import { API_ROUTES } from '../../config/api';

/**
 * Obtiene doctores por especialidad.
 * @param {number} specialtyId - ID de la especialidad.
 * @returns {Promise<Array>} Promise con la lista de doctores.
 */
export const getDoctorsBySpecialty = async (specialtyId) => {
  if (!specialtyId) {
    return [];
  }
  try {
    const response = await adminApiClient.get(API_ROUTES.DOCTORS.BY_SPECIALTY, {
      params: { specialty_id: specialtyId },
    });
    // Normaliza la respuesta, ya que a veces puede venir en 'results'
    return response.data.results || response.data || [];
  } catch (error) {
    console.error('Error al obtener doctores por especialidad:', error);
    // Devuelve un array vacío en caso de error para no romper la UI
    return [];
  }
};

// Mapa que traduce los bloques horarios de la BD a texto legible.
// Debe coincidir con el CHECK constraint de la tabla doctor_availability.
const TIME_BLOCK_MAP = {
  MORNING: 'Mañana (8am-12pm)',
  AFTERNOON: 'Tarde (2pm-6pm)',
};

/**
 * Formatea un ID de bloque horario a un string legible.
 * @param {string} blockId - El ID del bloque ('MORNING', 'AFTERNOON').
 * @returns {string} El texto formateado.
 */
const formatTimeBlock = (blockId) => {
  return TIME_BLOCK_MAP[blockId] || blockId;
};

/**
 * Obtiene los bloques horarios (Mañana/Tarde) disponibles para un doctor en una fecha específica.
 * @param {string|number} doctorId - El ID del doctor.
 * @param {string} date - La fecha en formato YYYY-MM-DD.
 * @returns {Promise<Array>} Una lista de objetos { value, label } para un select.
 */
export const getAvailableTimeBlocks = async (doctorId, date) => {
  try {
    const params = { doctor_id: doctorId, date };
    const response = await adminApiClient.get(API_ROUTES.APPOINTMENTS.AVAILABLE_TIME_BLOCKS, { params });

    // Maneja respuesta que es un array de objetos { value, label }
    if (response.data && Array.isArray(response.data)) {
      return response.data.map((block) => ({
        value: block.value,
        label: formatTimeBlock(block.label),
      }));
    }

    // Maneja respuesta que es un objeto con una propiedad 'available_blocks'
    if (response.data && response.data.available_blocks) {
      return response.data.available_blocks.map((block) => ({
        value: block,
        label: formatTimeBlock(block),
      }));
    }

    // Si la respuesta no coincide con ninguno de los formatos esperados, devuelve vacío.
    return [];
  } catch (error) {
    console.error('Error fetching available time blocks:', error);
    // No relanzar el error para no romper la UI, devolver un array vacío.
    return [];
  }
}; 