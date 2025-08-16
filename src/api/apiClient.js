/**
 * Cliente API configurado para la aplicación
 * Centraliza configuración de fetch y manejo de errores
 */

import { api } from '../config/appConfig';

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const API_BASE = RAW_BASE.replace(/\/(web|admin|mobile)\/?$/, '');

/**
 * Configuración base para llamadas a la API con autenticación
 * @param {string} url - URL del endpoint
 * @param {Object} options - Opciones de configuración
 * @returns {Promise} Respuesta de la API
 */
export const apiCall = async (url, options = {}) => {
  // Obtener token de autenticación
  const token = localStorage.getItem('access_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    timeout: api.timeout,
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE}${url}`, config);
    
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