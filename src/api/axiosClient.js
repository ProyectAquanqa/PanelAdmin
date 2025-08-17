/**
 * Cliente Axios configurado con interceptores automáticos
 * Alternativa al cliente fetch con manejo avanzado de errores y reintentos
 */

import { createApiClient } from '../utils/apiInterceptors.js';

/**
 * Cliente Axios configurado para la aplicación
 * Incluye manejo automático de errores, reintentos y refresh de tokens
 */
export const axiosClient = createApiClient();

/**
 * Métodos de conveniencia que mantienen la misma interfaz que el cliente fetch
 */
export const axiosApiClient = {
  get: (url, options = {}) => axiosClient.get(url, options),
  post: (url, data, options = {}) => axiosClient.post(url, data, options),
  put: (url, data, options = {}) => axiosClient.put(url, data, options),
  patch: (url, data, options = {}) => axiosClient.patch(url, data, options),
  delete: (url, options = {}) => axiosClient.delete(url, options),
};

export default axiosApiClient;