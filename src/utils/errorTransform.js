/**
 * Utilidades para transformar errores de API a mensajes comprensibles para el usuario
 */

import { 
  API_ERROR_MESSAGES, 
  NETWORK_ERROR_MESSAGES, 
  AUTH_ERROR_MESSAGES,
  VALIDATION_MESSAGES,
  formatMessage 
} from '../constants/errorMessages.js';

/**
 * Tipos de errores que puede manejar el sistema
 */
export const ERROR_TYPES = {
  VALIDATION: 'validation',
  API: 'api',
  NETWORK: 'network',
  AUTH: 'auth',
  PERMISSION: 'permission',
  UNKNOWN: 'unknown'
};

/**
 * Determina el tipo de error basado en el error recibido
 * @param {Error|Object} error - Error a clasificar
 * @returns {string} Tipo de error
 */
export const getErrorType = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;
  
  // Error de red
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return ERROR_TYPES.NETWORK;
  }
  
  // Error de timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ERROR_TYPES.NETWORK;
  }
  
  // Error HTTP con status
  if (error.response?.status) {
    const status = error.response.status;
    
    // Errores de autenticación
    if (status === 401) {
      return ERROR_TYPES.AUTH;
    }
    
    // Errores de permisos
    if (status === 403) {
      return ERROR_TYPES.PERMISSION;
    }
    
    // Errores de validación
    if (status === 400 || status === 422) {
      return ERROR_TYPES.VALIDATION;
    }
    
    // Otros errores de API
    return ERROR_TYPES.API;
  }
  
  return ERROR_TYPES.UNKNOWN;
};

/**
 * Transforma un error de red a un mensaje amigable
 * @param {Error} error - Error de red
 * @returns {string} Mensaje amigable
 */
export const transformNetworkError = (error) => {
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return NETWORK_ERROR_MESSAGES.TIMEOUT;
  }
  
  if (error.code === 'ECONNREFUSED') {
    return NETWORK_ERROR_MESSAGES.CONNECTION_REFUSED;
  }
  
  if (error.code === 'ENOTFOUND') {
    return NETWORK_ERROR_MESSAGES.DNS_ERROR;
  }
  
  return NETWORK_ERROR_MESSAGES.NETWORK_ERROR;
};

/**
 * Transforma un error de API HTTP a un mensaje amigable
 * @param {Object} error - Error de axios con response
 * @returns {string} Mensaje amigable
 */
export const transformApiError = (error) => {
  const status = error.response?.status;
  const data = error.response?.data;
  
  // Si el servidor envía un mensaje específico, usarlo
  if (data?.message && typeof data.message === 'string') {
    return data.message;
  }
  
  // Si hay errores de validación específicos del servidor
  if (data?.errors && typeof data.errors === 'object') {
    return transformValidationErrors(data.errors);
  }
  
  // Usar mensaje predefinido basado en el status code
  return API_ERROR_MESSAGES[status] || API_ERROR_MESSAGES[500];
};

/**
 * Transforma errores de validación del servidor a mensajes amigables
 * @param {Object} errors - Objeto con errores de validación por campo
 * @returns {string} Mensaje amigable
 */
export const transformValidationErrors = (errors) => {
  if (typeof errors === 'string') {
    return errors;
  }
  
  if (Array.isArray(errors)) {
    return errors.join(', ');
  }
  
  if (typeof errors === 'object') {
    const errorMessages = Object.values(errors).flat();
    return errorMessages.join(', ');
  }
  
  return API_ERROR_MESSAGES[400];
};

/**
 * Transforma errores de autenticación a mensajes específicos
 * @param {Object} error - Error de autenticación
 * @returns {string} Mensaje amigable
 */
export const transformAuthError = (error) => {
  const data = error.response?.data;
  
  // Verificar mensajes específicos del servidor
  if (data?.code) {
    switch (data.code) {
      case 'INVALID_CREDENTIALS':
        return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS;
      case 'ACCOUNT_LOCKED':
        return AUTH_ERROR_MESSAGES.ACCOUNT_LOCKED;
      case 'ACCOUNT_DISABLED':
        return AUTH_ERROR_MESSAGES.ACCOUNT_DISABLED;
      case 'TOKEN_INVALID':
        return AUTH_ERROR_MESSAGES.TOKEN_INVALID;
      case 'REFRESH_TOKEN_EXPIRED':
        return AUTH_ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED;
      default:
        return AUTH_ERROR_MESSAGES.SESSION_EXPIRED;
    }
  }
  
  // Mensaje por defecto para errores 401
  return AUTH_ERROR_MESSAGES.SESSION_EXPIRED;
};

/**
 * Función principal para transformar cualquier error a un mensaje amigable
 * @param {Error|Object} error - Error a transformar
 * @returns {Object} Objeto con información del error transformado
 */
export const transformError = (error) => {
  if (!error) {
    return {
      type: ERROR_TYPES.UNKNOWN,
      message: 'Ha ocurrido un error inesperado',
      originalError: null
    };
  }
  
  const errorType = getErrorType(error);
  let message = '';
  
  switch (errorType) {
    case ERROR_TYPES.NETWORK:
      message = transformNetworkError(error);
      break;
      
    case ERROR_TYPES.AUTH:
      message = transformAuthError(error);
      break;
      
    case ERROR_TYPES.PERMISSION:
      message = API_ERROR_MESSAGES[403];
      break;
      
    case ERROR_TYPES.VALIDATION:
    case ERROR_TYPES.API:
      message = transformApiError(error);
      break;
      
    default:
      message = error.message || 'Ha ocurrido un error inesperado';
  }
  
  return {
    type: errorType,
    message,
    field: error.field || null,
    code: error.response?.status || error.code || null,
    originalError: error,
    timestamp: new Date()
  };
};

/**
 * Extrae el campo específico de un error de validación
 * @param {Object} error - Error con información de campo
 * @returns {string|null} Nombre del campo o null
 */
export const extractErrorField = (error) => {
  // Si el error ya tiene campo definido
  if (error.field) {
    return error.field;
  }
  
  // Intentar extraer del response data
  const data = error.response?.data;
  if (data?.field) {
    return data.field;
  }
  
  // Intentar extraer del primer error de validación
  if (data?.errors && typeof data.errors === 'object') {
    const firstField = Object.keys(data.errors)[0];
    return firstField || null;
  }
  
  return null;
};

/**
 * Verifica si un error es recuperable (se puede reintentar)
 * @param {Object} error - Error a verificar
 * @returns {boolean} True si es recuperable
 */
export const isRecoverableError = (error) => {
  const status = error.response?.status;
  
  // Errores de red son generalmente recuperables
  if (getErrorType(error) === ERROR_TYPES.NETWORK) {
    return true;
  }
  
  // Algunos errores HTTP son recuperables
  const recoverableStatuses = [408, 429, 500, 502, 503, 504];
  return recoverableStatuses.includes(status);
};

/**
 * Obtiene el tiempo de espera sugerido antes de reintentar
 * @param {Object} error - Error ocurrido
 * @param {number} attempt - Número de intento (empezando en 1)
 * @returns {number} Tiempo en milisegundos
 */
export const getRetryDelay = (error, attempt = 1) => {
  const status = error.response?.status;
  
  // Para rate limiting (429), usar el header Retry-After si está disponible
  if (status === 429) {
    const retryAfter = error.response?.headers['retry-after'];
    if (retryAfter) {
      return parseInt(retryAfter) * 1000; // Convertir a milisegundos
    }
  }
  
  // Backoff exponencial: 1s, 2s, 4s, 8s, máximo 30s
  const baseDelay = 1000;
  const maxDelay = 30000;
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  
  return delay;
};

export default {
  transformError,
  transformApiError,
  transformNetworkError,
  transformAuthError,
  transformValidationErrors,
  getErrorType,
  extractErrorField,
  isRecoverableError,
  getRetryDelay,
  ERROR_TYPES
};