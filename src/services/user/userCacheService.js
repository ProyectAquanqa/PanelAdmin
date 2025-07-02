import { adminApiClient } from '../../api';
import { API_ROUTES } from '../../config/api';
import { normalizeUsersResponse } from './userTransformService';

/**
 * Obtiene la lista de usuarios.
 * @param {Object} params - Parámetros para filtrar la lista (ej: page, page_size, search, role)
 * @returns {Promise<Object>} Promise con la respuesta normalizada y paginada.
 */
export const getUsers = async (params = {}) => {
  try {
    const response = await adminApiClient.get(API_ROUTES.USERS.LIST, { params });
    return normalizeUsersResponse(response.data);
  } catch (error) {
    console.error('💥 Error al obtener usuarios:', error);
    // Para errores 500, devolver datos vacíos para evitar bloqueo de la UI
    if (error.response?.status === 500) {
      return {
        results: [],
        count: 0,
        error: 'La API de usuarios no está respondiendo correctamente.'
      };
    }
    throw error;
  }
};

/**
 * Limpia la caché de usuarios (función placeholder, ya no hay caché local)
 */
export const clearUsersCache = () => {
  console.log('Caché de usuarios ya no se maneja localmente en este servicio.');
};

// Las funciones findUserInCache y applyClientSidePagination se eliminan 
// porque la paginación y el filtrado ahora deben ser manejados por el servidor
// o por un servicio de caché más robusto como React Query. 