/**
 * Interceptores de Axios para manejo automático de errores
 * Proporciona transformación automática de errores, reintentos y manejo de tokens
 */

import axios from 'axios';
import { transformError, isRecoverableError, getRetryDelay } from './errorTransform.js';

/** Configuración base de la API */
const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://192.168.18.13:8000/api';
const API_BASE = RAW_BASE.replace(/\/(web|admin|mobile)\/?$/, '');

/**
 * Configuración de reintentos
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  retryCondition: (error) => isRecoverableError(error),
  retryDelay: (error, attempt) => getRetryDelay(error, attempt)
};

/**
 * Crea una instancia de axios configurada con interceptores
 * @param {Object} config - Configuración adicional para axios
 * @returns {Object} Instancia de axios configurada
 */
export const createApiClient = (config = {}) => {
  const client = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    ...config
  });

  /** Interceptor de request para agregar token de autorización */
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      if (!config.metadata) {
        config.metadata = { retryCount: 0 };
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor de response para manejo de errores y reintentos
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      // Manejar errores 401 (token expirado)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          await refreshToken();
          
          // Actualizar el token en el request original
          const newToken = localStorage.getItem('access_token');
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          // Reintentar el request original
          return client(originalRequest);
        } catch (refreshError) {
          // Si el refresh falla, redirigir al login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      // Manejar reintentos automáticos para errores recuperables
      if (shouldRetry(error, originalRequest)) {
        originalRequest.metadata.retryCount += 1;
        
        const delay = RETRY_CONFIG.retryDelay(error, originalRequest.metadata.retryCount);
        
        // Esperar antes de reintentar
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return client(originalRequest);
      }
      
      // Transformar el error a un formato amigable
      const transformedError = transformError(error);
      
      // Crear un error enriquecido con información adicional
      const enhancedError = new Error(transformedError.message);
      enhancedError.type = transformedError.type;
      enhancedError.field = transformedError.field;
      enhancedError.code = transformedError.code;
      enhancedError.originalError = error;
      enhancedError.timestamp = transformedError.timestamp;
      enhancedError.isTransformed = true;
      
      return Promise.reject(enhancedError);
    }
  );

  return client;
};

/**
 * Determina si se debe reintentar un request
 * @param {Object} error - Error ocurrido
 * @param {Object} request - Configuración del request original
 * @returns {boolean} True si se debe reintentar
 */
const shouldRetry = (error, request) => {
  // No reintentar si ya se alcanzó el máximo de reintentos
  if (request.metadata.retryCount >= RETRY_CONFIG.maxRetries) {
    return false;
  }
  
  // No reintentar requests que ya fueron marcados como retry
  if (request._retry) {
    return false;
  }
  
  // No reintentar métodos que no son idempotentes por defecto
  const idempotentMethods = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'];
  if (!idempotentMethods.includes(request.method?.toUpperCase())) {
    // Solo reintentar POST si está explícitamente marcado como seguro
    if (!request.retryOnPost) {
      return false;
    }
  }
  
  // Usar la condición de reintento configurada
  return RETRY_CONFIG.retryCondition(error);
};

/**
 * Función para refrescar el token de acceso
 * @returns {Promise} Promise que resuelve cuando el token es refrescado
 */
const refreshToken = async () => {
  const refreshTokenValue = localStorage.getItem('refresh_token');
  
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(`${API_BASE}/web/auth/refresh/`, {
      refresh: refreshTokenValue,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      // No usar interceptores para evitar loops infinitos
      transformRequest: [(data) => JSON.stringify(data)],
      transformResponse: [(data) => JSON.parse(data)]
    });

    const { access } = response.data;
    localStorage.setItem('access_token', access);
    
    return access;
  } catch (error) {
    // Si el refresh token también expiró, limpiar storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    throw new Error('Failed to refresh token');
  }
};

/**
 * Instancia por defecto de axios configurada
 */
export const apiClient = createApiClient();

/**
 * Configurar interceptores en una instancia existente de axios
 * @param {Object} axiosInstance - Instancia de axios a configurar
 * @returns {Object} Instancia configurada
 */
export const setupInterceptors = (axiosInstance) => {
  // Limpiar interceptores existentes
  axiosInstance.interceptors.request.clear();
  axiosInstance.interceptors.response.clear();
  
  // Aplicar los mismos interceptores que usa createApiClient
  const tempClient = createApiClient();
  
  // Copiar interceptores de request
  tempClient.interceptors.request.handlers.forEach(handler => {
    axiosInstance.interceptors.request.use(handler.fulfilled, handler.rejected);
  });
  
  // Copiar interceptores de response
  tempClient.interceptors.response.handlers.forEach(handler => {
    axiosInstance.interceptors.response.use(handler.fulfilled, handler.rejected);
  });
  
  return axiosInstance;
};

/**
 * Wrapper para requests con configuración de reintentos personalizada
 * @param {Function} requestFn - Función que ejecuta el request
 * @param {Object} retryConfig - Configuración de reintentos personalizada
 * @returns {Promise} Promise del request con reintentos
 */
export const withRetry = async (requestFn, retryConfig = {}) => {
  const config = { ...RETRY_CONFIG, ...retryConfig };
  let lastError;
  
  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Si es el último intento o el error no es recuperable, lanzar error
      if (attempt > config.maxRetries || !config.retryCondition(error)) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      const delay = config.retryDelay(error, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Utilidad para crear requests con configuración específica de reintentos
 * @param {Object} axiosConfig - Configuración del request de axios
 * @param {Object} retryConfig - Configuración de reintentos
 * @returns {Promise} Promise del request
 */
export const createRetryableRequest = (axiosConfig, retryConfig = {}) => {
  return withRetry(() => apiClient(axiosConfig), retryConfig);
};

export default {
  createApiClient,
  apiClient,
  setupInterceptors,
  withRetry,
  createRetryableRequest,
  refreshToken
};