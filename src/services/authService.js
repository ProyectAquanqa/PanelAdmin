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
    
    // Usar la ruta específica de Django para login
    const loginUrl = API_ROUTES.AUTH.LOGIN;
    console.log(`🚀 Usando URL de login de Django: ${loginUrl}`);
    
    const response = await apiClient.post(loginUrl, credentials);
    console.log(`✅ Login exitoso:`, response.data);
    return response.data;
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
    // Usar la ruta específica de Django para logout
    const logoutUrl = API_ROUTES.AUTH.LOGOUT;
    console.log(`🚀 Usando URL de logout de Django: ${logoutUrl}`);
    
    const response = await apiClient.post(logoutUrl);
    return response.data;
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
    // Usar la ruta específica de Django para refresh token
    const refreshUrl = API_ROUTES.AUTH.REFRESH;
    console.log(`🚀 Usando URL de refresh token de Django: ${refreshUrl}`);
    
    const response = await apiClient.post(refreshUrl, {
      refresh: refreshToken
    });
    return response.data;
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
    // Usar la ruta específica de Django para perfil
    const profileUrl = API_ROUTES.AUTH.PROFILE;
    console.log(`🚀 Usando URL de perfil de Django: ${profileUrl}`);
    
    const response = await apiClient.get(profileUrl);
    console.log(`✅ Perfil obtenido:`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    throw error;
  }
}; 