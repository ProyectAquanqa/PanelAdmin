/**
 * Cliente API configurado para la aplicación
 * Centraliza configuración de fetch y manejo de errores
 */

import { api } from '../config/appConfig';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Configuración base para llamadas a la API
 * @param {string} url - URL del endpoint
 * @param {Object} options - Opciones de configuración
 * @returns {Promise} Respuesta de la API
 */
export const apiCall = async (url, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    timeout: api.timeout,
    ...options,
  };

  try {
    const response = await fetch(`${BASE_URL}${url}`, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Cliente API con métodos HTTP comunes
 */
export const apiClient = {
  get: (url, options = {}) => apiCall(url, { method: 'GET', ...options }),
  post: (url, data, options = {}) => apiCall(url, { 
    method: 'POST', 
    body: JSON.stringify(data), 
    ...options 
  }),
  put: (url, data, options = {}) => apiCall(url, { 
    method: 'PUT', 
    body: JSON.stringify(data), 
    ...options 
  }),
  patch: (url, data, options = {}) => apiCall(url, { 
    method: 'PATCH', 
    body: JSON.stringify(data), 
    ...options 
  }),
  delete: (url, options = {}) => apiCall(url, { method: 'DELETE', ...options }),
};

export default apiClient;