/**
 * Servicio para comunicación con la API de Comentarios
 * Basado en los endpoints de AquanQ WebComentarioViewSet
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
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
 * Obtiene lista de comentarios con filtros y paginación
 * @param {Object} params - Parámetros de búsqueda y filtrado
 * @returns {Promise<Object>} Respuesta con comentarios y metadatos de paginación
 */
export const getComentarios = async (params = {}) => {
  try {
    // Construir query string para filtros
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const url = `${API_BASE}/web/comentarios/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiCall(url);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error fetching comentarios:', error);
    throw error;
  }
};

/**
 * Obtiene un comentario específico por ID
 * @param {number} id - ID del comentario
 * @returns {Promise<Object>} Datos del comentario
 */
export const getComentario = async (id) => {
  try {
    const response = await apiCall(`${API_BASE}/web/comentarios/${id}/`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching comentario:', error);
    throw error;
  }
};

/**
 * Elimina un comentario
 * @param {number} id - ID del comentario a eliminar
 * @returns {Promise<void>}
 */
export const deleteComentario = async (id) => {
  try {
    await apiCall(`${API_BASE}/web/comentarios/${id}/`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting comentario:', error);
    throw error;
  }
};

/**
 * Modera un comentario (activar/desactivar)
 * @param {number} id - ID del comentario
 * @param {boolean} isActive - Nuevo estado del comentario
 * @returns {Promise<Object>} Respuesta de la moderación
 */
export const moderateComentario = async (id, isActive) => {
  try {
    const response = await apiCall(`${API_BASE}/web/comentarios/${id}/moderar/`, {
      method: 'POST',
      body: JSON.stringify({
        is_active: isActive
      }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error moderating comentario:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de comentarios (solo admin)
 * @returns {Promise<Object>} Estadísticas de comentarios
 */
export const getComentariosStatistics = async () => {
  try {
    const response = await apiCall(`${API_BASE}/admin/comentarios/statistics/`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching comentarios statistics:', error);
    throw error;
  }
};

export default {
  getComentarios,
  getComentario,
  deleteComentario,
  moderateComentario,
  getComentariosStatistics,
};
