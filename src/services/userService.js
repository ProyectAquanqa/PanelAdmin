import apiClient from '../api/apiClient';

// Datos de fallback para cuando la API falla
const fallbackData = {
  results: [],
  count: 0,
  next: null,
  previous: null
};

// Datos de fallback para estadísticas
const fallbackStats = {
  total_patients: 0,
  new_patients_month: 0,
  patients_with_allergies: 0,
  patients_with_chronic: 0
};

/**
 * Obtiene una lista de pacientes
 * @param {Object} params - Parámetros de búsqueda y paginación
 * @returns {Promise} Lista de pacientes
 */
export const getUsers = async (params = {}) => {
  try {
    // Transformar parámetros para que coincidan con lo que espera Django
    const apiParams = {
      page: params.page,
      search: params.search,
      // Django REST Framework normalmente usa 'page_size' en lugar de 'limit'
      page_size: params.limit
    };

    console.log('Realizando petición GET a /api/patients/ con params:', apiParams);
    const response = await apiClient.get('/api/patients/', { params: apiParams });
    console.log('Respuesta recibida de /api/patients/:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    console.error('Detalles del error:', {
      message: error.message,
      statusCode: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      requestUrl: error.config?.url,
      requestMethod: error.config?.method
    });
    
    // Si es un error 500, usamos datos de fallback
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.log('Usando datos de fallback debido a error del servidor');
      return fallbackData;
    }
    
    throw error;
  }
};

/**
 * Obtiene un paciente por su ID
 * @param {number} id - ID del paciente
 * @returns {Promise} Datos del paciente
 */
export const getUserById = async (id) => {
  try {
    const response = await apiClient.get(`/api/patients/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener paciente con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo paciente
 * @param {Object} userData - Datos del paciente a crear
 * @returns {Promise} Paciente creado
 */
export const createUser = async (userData) => {
  try {
    const response = await apiClient.post('/api/patients/', userData);
    return response.data;
  } catch (error) {
    console.error('Error al crear paciente:', error);
    throw error;
  }
};

/**
 * Actualiza un paciente existente
 * @param {number} id - ID del paciente a actualizar
 * @param {Object} userData - Datos actualizados del paciente
 * @returns {Promise} Paciente actualizado
 */
export const updateUser = async (id, userData) => {
  try {
    const response = await apiClient.put(`/api/patients/${id}/`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar paciente con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un paciente
 * @param {number} id - ID del paciente a eliminar
 * @returns {Promise} Resultado de la eliminación
 */
export const deleteUser = async (id) => {
  try {
    const response = await apiClient.delete(`/api/patients/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar paciente con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de pacientes
 * @returns {Promise} Estadísticas de pacientes
 */
export const getUserStats = async () => {
  try {
    console.log('Realizando petición GET a /api/patients/stats/');
    const response = await apiClient.get('/api/patients/stats/');
    console.log('Respuesta recibida de /api/patients/stats/:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de pacientes:', error);
    console.error('Detalles del error:', {
      message: error.message,
      statusCode: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      requestUrl: error.config?.url,
      requestMethod: error.config?.method
    });
    
    // Si es un error 500 o 404, usamos datos de fallback
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.log('Usando datos de fallback para estadísticas debido a error del servidor');
      return fallbackStats;
    }
    
    throw error;
  }
};

/**
 * Cambia la contraseña de un usuario
 * @param {number} id - ID del usuario
 * @param {Object} passwordData - Datos de la contraseña (actual y nueva)
 * @returns {Promise} Resultado del cambio de contraseña
 */
export const changePassword = async (id, passwordData) => {
  try {
    const response = await apiClient.post(`/users/${id}/change-password/`, passwordData);
    return response.data;
  } catch (error) {
    console.error(`Error al cambiar contraseña del usuario ${id}:`, error);
    throw error;
  }
}; 