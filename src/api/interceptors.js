/**
 * Interceptores para manejo de tokens y errores
 * Funciones para interceptar requests y responses
 */

/**
 * Interceptor para agregar token de autorización
 * @param {Object} config - Configuración de la request
 * @returns {Object} Configuración modificada
 */
export const authInterceptor = (config) => {
  const token = localStorage.getItem('access_token');
  
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  
  return config;
};

/**
 * Interceptor para manejar errores de respuesta
 * @param {Response} response - Respuesta de la API
 * @returns {Response} Respuesta procesada
 */
export const errorInterceptor = async (response) => {
  if (response.status === 401) {
    // Token expirado, intentar refresh
    try {
      await refreshToken();
      // Reintentar request original
      return response;
    } catch (error) {
      // Redirect a login
      window.location.href = '/login';
      throw error;
    }
  }
  
  return response;
};

/**
 * Función para refrescar token
 */
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch('/api/token/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  localStorage.setItem('access_token', data.access);
  
  return data;
};

export default {
  authInterceptor,
  errorInterceptor,
  refreshToken
};