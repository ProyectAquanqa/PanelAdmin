import apiClient from '../api/apiClient';
import { API_ROUTES } from '../config/api';

/**
 * Inicia sesión con las credenciales proporcionadas
 * @param {Object} credentials - Email y contraseña del usuario
 * @returns {Promise} Datos del usuario y tokens de autenticación
 */
export const login = async (credentials) => {
  try {
    console.log('🔑 Intentando iniciar sesión con:', credentials.email);
    
    // URLs a probar en orden de prioridad para login
    const urlsToTry = [
      '/api/auth/login/',
      '/api/auth/token/',
      '/api/authentication/login/',
      '/api/users/login/'
    ];
    
    console.log('🎯 URLs de login que vamos a probar:', urlsToTry);
    
    for (const url of urlsToTry) {
      try {
        console.log(`🚀 Probando URL de login: ${url}`);
        const response = await apiClient.post(url, credentials);
        console.log(`✅ ÉXITO con URL: ${url}`, response.data);
        return response.data;
      } catch (error) {
        console.log(`❌ Falló URL: ${url} - Status: ${error.response?.status}`);
        if (error.response?.status !== 404) {
          // Si no es 404, entonces hay otro problema (500, 403, etc.)
          throw error;
        }
        // Si es 404, continúa con la siguiente URL
      }
    }
    
    // Si llegamos aquí, ninguna URL funcionó
    throw new Error('No se pudo encontrar el endpoint de login. Verifica que el backend esté correctamente configurado.');
    
  } catch (error) {
    console.error('Error al iniciar sesión:', error.response || error);
    throw error;
  }
};

/**
 * Cierra la sesión del usuario actual
 * @returns {Promise}
 */
export const logout = async () => {
  try {
    // URLs a probar para logout
    const urlsToTry = [
      '/api/auth/logout/',
      '/api/authentication/logout/',
      '/api/users/logout/'
    ];
    
    for (const url of urlsToTry) {
      try {
        const response = await apiClient.post(url);
        return response.data;
      } catch (error) {
        if (error.response?.status !== 404) {
          throw error;
        }
      }
    }
    
    // Si no hay endpoint de logout, simplemente retornamos
    return { success: true };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    // Incluso si hay un error, debemos limpiar el estado local
    throw error;
  }
};

/**
 * Actualiza el token de acceso usando el refresh token
 * @param {string} refreshToken - Token de actualización
 * @returns {Promise} Nuevo token de acceso
 */
export const refreshToken = async (refreshToken) => {
  try {
    // URLs a probar para refresh token
    const urlsToTry = [
      '/api/auth/refresh-token/',
      '/api/auth/token/refresh/',
      '/api/authentication/refresh-token/'
    ];
    
    for (const url of urlsToTry) {
      try {
        const response = await apiClient.post(url, {
          refresh: refreshToken
        });
        return response.data;
      } catch (error) {
        if (error.response?.status !== 404) {
          throw error;
        }
      }
    }
    
    throw new Error('No se pudo encontrar el endpoint de refresh token');
  } catch (error) {
    console.error('Error al actualizar el token:', error);
    throw error;
  }
};

/**
 * Obtiene el perfil del usuario actual
 * @returns {Promise} Datos del perfil del usuario
 */
export const getProfile = async () => {
  try {
    // URLs a probar para obtener el perfil
    const urlsToTry = [
      '/api/auth/profile/',
      '/api/auth/me/',
      '/api/users/me/',
      '/api/authentication/profile/'
    ];
    
    for (const url of urlsToTry) {
      try {
        console.log(`🚀 Probando URL de perfil: ${url}`);
        const response = await apiClient.get(url);
        console.log(`✅ ÉXITO con URL de perfil: ${url}`, response.data);
        return response.data;
      } catch (error) {
        console.log(`❌ Falló URL de perfil: ${url} - Status: ${error.response?.status}`);
        if (error.response?.status !== 404) {
          throw error;
        }
      }
    }
    
    throw new Error('No se pudo encontrar el endpoint de perfil');
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    throw error;
  }
}; 