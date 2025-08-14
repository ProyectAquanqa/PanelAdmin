/**
 * Servicio para comunicación con la API de Eventos
 * Basado en los endpoints de AquanQ EventoViewSet
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
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
 * Obtiene lista de eventos con filtros y paginación
 * @param {Object} params - Parámetros de búsqueda y filtrado
 * @returns {Promise<Object>} Respuesta con eventos y metadatos de paginación
 */
export const getEventos = async (params = {}) => {
  try {
    // Construir query string para filtros
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const url = `${API_BASE}/web/eventos/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiCall(url);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error fetching eventos:', error);
    throw error;
  }
};

/**
 * Obtiene un evento específico por ID
 * @param {number} id - ID del evento
 * @returns {Promise<Object>} Datos del evento
 */
export const getEvento = async (id) => {
  try {
    const response = await apiCall(`${API_BASE}/web/eventos/${id}/`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching evento:', error);
    throw error;
  }
};

/**
 * Crea un nuevo evento
 * @param {Object|FormData} eventoData - Datos del evento
 * @returns {Promise<Object>} Evento creado
 */
export const createEvento = async (eventoData) => {
  try {
    const response = await apiCall(`${API_BASE}/web/eventos/`, {
      method: 'POST',
      body: eventoData instanceof FormData ? eventoData : JSON.stringify(eventoData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating evento:', error);
    throw error;
  }
};

/**
 * Actualiza un evento existente
 * @param {number} id - ID del evento
 * @param {Object|FormData} eventoData - Datos actualizados del evento
 * @returns {Promise<Object>} Evento actualizado
 */
export const updateEvento = async (id, eventoData) => {
  try {
    console.log('🔍 updateEvento - Datos enviados:', eventoData);
    console.log('🔍 updateEvento - Es FormData:', eventoData instanceof FormData);
    
    // Si es FormData, mostrar contenido
    if (eventoData instanceof FormData) {
      console.log('📋 FormData content:');
      for (let [key, value] of eventoData.entries()) {
        console.log(`  ${key}: ${value} (${typeof value})`);
      }
    }
    
    const response = await apiCall(`${API_BASE}/web/eventos/${id}/`, {
      method: 'PUT',
      body: eventoData instanceof FormData ? eventoData : JSON.stringify(eventoData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating evento:', error);
    throw error;
  }
};

/**
 * Actualiza parcialmente un evento
 * @param {number} id - ID del evento
 * @param {Object|FormData} eventoData - Datos parciales del evento
 * @returns {Promise<Object>} Evento actualizado
 */
export const patchEvento = async (id, eventoData) => {
  try {
    const response = await apiCall(`${API_BASE}/web/eventos/${id}/`, {
      method: 'PATCH',
      body: eventoData instanceof FormData ? eventoData : JSON.stringify(eventoData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error patching evento:', error);
    throw error;
  }
};

/**
 * Elimina un evento
 * @param {number} id - ID del evento a eliminar
 * @returns {Promise<void>}
 */
export const deleteEvento = async (id) => {
  try {
    await apiCall(`${API_BASE}/web/eventos/${id}/`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting evento:', error);
    throw error;
  }
};

/**
 * Obtiene lista de categorías de eventos
 * @param {Object} params - Parámetros de búsqueda
 * @returns {Promise<Object>} Lista de categorías
 */
export const getCategorias = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const url = `${API_BASE}/web/categorias/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiCall(url);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error fetching categorías:', error);
    throw error;
  }
};

/**
 * Crea una nueva categoría
 * @param {Object} categoriaData - Datos de la categoría
 * @returns {Promise<Object>} Categoría creada
 */
export const createCategoria = async (categoriaData) => {
  try {
    const response = await apiCall(`${API_BASE}/web/categorias/`, {
      method: 'POST',
      body: JSON.stringify(categoriaData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating categoría:', error);
    throw error;
  }
};

/**
 * Actualiza una categoría
 * @param {number} id - ID de la categoría
 * @param {Object} categoriaData - Datos actualizados de la categoría
 * @returns {Promise<Object>} Categoría actualizada
 */
export const updateCategoria = async (id, categoriaData) => {
  try {
    const response = await apiCall(`${API_BASE}/web/categorias/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(categoriaData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating categoría:', error);
    throw error;
  }
};

/**
 * Elimina una categoría
 * @param {number} id - ID de la categoría a eliminar
 * @returns {Promise<void>}
 */
export const deleteCategoria = async (id) => {
  try {
    await apiCall(`${API_BASE}/web/categorias/${id}/`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting categoría:', error);
    throw error;
  }
};

/**
 * Fija un evento al principio de la lista
 * @param {number} id - ID del evento
 * @returns {Promise<Object>} Respuesta de la API
 */
export const pinEvento = async (id) => {
  try {
    console.log('Fijando evento:', id);
    const response = await apiCall(`${API_BASE}/web/eventos/${id}/pin_evento/`, {
      method: 'POST',
    });
    
    const data = await response.json();
    console.log('Evento fijado exitosamente');
    return data;
  } catch (error) {
    console.error('Error pinning evento:', error);
    throw error;
  }
};

/**
 * Desfija un evento
 * @param {number} id - ID del evento
 * @returns {Promise<Object>} Respuesta de la API
 */
export const unpinEvento = async (id) => {
  try {
    console.log('Desfijando evento:', id);
    const response = await apiCall(`${API_BASE}/web/eventos/${id}/unpin_evento/`, {
      method: 'POST',
    });
    
    const data = await response.json();
    console.log('Evento desfijado exitosamente');
    return data;
  } catch (error) {
    console.error('Error unpinning evento:', error);
    throw error;
  }
};

export default {
  getEventos,
  getEvento,
  createEvento,
  updateEvento,
  patchEvento,
  deleteEvento,
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  pinEvento,
  unpinEvento,
};