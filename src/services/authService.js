import { adminApiClient } from '../api';
import { API_ROUTES } from '../config/api';

/**
 * Inicia sesión con las credenciales proporcionadas
 * @param {Object} credentials - Email y contraseña del usuario
 * @returns {Promise} Datos del usuario y tokens de autenticación
 */
export const login = async (credentials) => {
  try {
    const loginUrl = API_ROUTES.AUTH.LOGIN;
    const response = await adminApiClient.post(loginUrl, credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cierra la sesión del usuario actual
 * @returns {Promise}
 */
export const logout = async () => {
  try {
    const logoutUrl = API_ROUTES.AUTH.LOGOUT;
    const response = await adminApiClient.post(logoutUrl);
    return response.data;
  } catch (error) {
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
    const refreshUrl = API_ROUTES.AUTH.REFRESH;
    const response = await adminApiClient.post(refreshUrl, {
      refresh: refreshToken
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene el perfil del usuario actual
 * @returns {Promise} Datos del perfil del usuario
 */
export const getProfile = async () => {
  try {
    const profileUrl = API_ROUTES.AUTH.PROFILE;
    const response = await adminApiClient.get(profileUrl);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 