/**
 * Servicio para comunicación con la API de Almuerzos
 * Basado en los endpoints de AquanQ AlmuerzoViewSet
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://172.16.11.29:http://127.0.0.1:8000/api';
const API_BASE = RAW_BASE.replace(/\/(web|admin|mobile)\/?$/, '');

// Función auxiliar para refrescar token
const refreshTokenIfNeeded = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE}/web/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        return data.access;
      }
    }
    
    throw new Error('Token refresh failed');
  } catch (error) {
    // Si falla el refresh, limpiar tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isAuthenticated');
    throw error;
  }
};

// Configuración base para fetch con manejo automático de token refresh
const apiCall = async (url, options = {}) => {
  let token = localStorage.getItem('access_token');
  
  const makeRequest = async (authToken) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers,
      },
      ...options,
    };

    // Si hay FormData, remover Content-Type para que el navegador lo maneje
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    const response = await fetch(url, config);
    
    if (response.status === 401) {
      // Token expirado, intentar refresh
      const newToken = await refreshTokenIfNeeded();
      config.headers['Authorization'] = `Bearer ${newToken}`;
      return fetch(url, config);
    }
    
    return response;
  };

  try {
    const response = await makeRequest(token);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error?.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    
    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

/**
 * Obtiene lista de almuerzos con filtros y paginación
 * @param {Object} params - Parámetros de búsqueda y filtrado
 * @returns {Promise<Object>} Respuesta con almuerzos y metadatos de paginación
 */
export const getAlmuerzos = async (params = {}) => {
  try {
    // Construir query string para filtros
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const url = `${API_BASE}/web/almuerzos/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiCall(url);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching almuerzos:', error);
    throw error;
  }
};

/**
 * Obtiene un almuerzo específico por ID
 * @param {number} id - ID del almuerzo
 * @returns {Promise<Object>} Datos del almuerzo
 */
export const getAlmuerzo = async (id) => {
  try {
    const response = await apiCall(`${API_BASE}/web/almuerzos/${id}/`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching almuerzo:', error);
    throw error;
  }
};

/**
 * Crea un nuevo almuerzo
 * @param {Object} almuerzoData - Datos del almuerzo
 * @returns {Promise<Object>} Almuerzo creado
 */
export const createAlmuerzo = async (almuerzoData) => {
  try {
    const response = await apiCall(`${API_BASE}/web/almuerzos/`, {
      method: 'POST',
      body: JSON.stringify(almuerzoData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating almuerzo:', error);
    throw error;
  }
};

/**
 * Actualiza un almuerzo existente
 * @param {number} id - ID del almuerzo
 * @param {Object} almuerzoData - Datos actualizados del almuerzo
 * @returns {Promise<Object>} Almuerzo actualizado
 */
export const updateAlmuerzo = async (id, almuerzoData) => {
  try {
    console.log('🔍 updateAlmuerzo - Datos enviados:', almuerzoData);
    
    const response = await apiCall(`${API_BASE}/web/almuerzos/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(almuerzoData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating almuerzo:', error);
    throw error;
  }
};

/**
 * Actualiza parcialmente un almuerzo
 * @param {number} id - ID del almuerzo
 * @param {Object} almuerzoData - Datos parciales del almuerzo
 * @returns {Promise<Object>} Almuerzo actualizado
 */
export const patchAlmuerzo = async (id, almuerzoData) => {
  try {
    const response = await apiCall(`${API_BASE}/web/almuerzos/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(almuerzoData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error patching almuerzo:', error);
    throw error;
  }
};

/**
 * Elimina un almuerzo
 * @param {number} id - ID del almuerzo a eliminar
 * @returns {Promise<void>}
 */
export const deleteAlmuerzo = async (id) => {
  try {
    await apiCall(`${API_BASE}/web/almuerzos/${id}/`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting almuerzo:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de almuerzos
 * @returns {Promise<Object>} Estadísticas
 */
export const getAlmuerzosStatistics = async () => {
  try {
    const response = await apiCall(`${API_BASE}/web/almuerzos/statistics/`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching almuerzo statistics:', error);
    throw error;
  }
};

/**
 * Crear almuerzos para una semana completa
 * @param {Object} weekData - Datos de la semana
 * @returns {Promise<Object>} Resultado de la operación
 */
export const bulkCreateWeekAlmuerzos = async (weekData) => {
  try {
    const response = await apiCall(`${API_BASE}/web/almuerzos/bulk_create_week/`, {
      method: 'POST',
      body: JSON.stringify(weekData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating week almuerzos:', error);
    throw error;
  }
};

export default {
  getAlmuerzos,
  getAlmuerzo,
  createAlmuerzo,
  updateAlmuerzo,
  patchAlmuerzo,
  deleteAlmuerzo,
  getAlmuerzosStatistics,
  bulkCreateWeekAlmuerzos,
};
