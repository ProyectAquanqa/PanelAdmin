import apiClient from '../api/apiClient';

/**
 * Inicia sesión con las credenciales proporcionadas
 * @param {Object} credentials - Email y contraseña del usuario
 * @returns {Promise} Datos del usuario y tokens de autenticación
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login/', credentials);
    return response.data;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
};

/**
 * Cierra la sesión del usuario actual
 * @returns {Promise}
 */
export const logout = async () => {
  try {
    return await apiClient.post('/auth/logout/');
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
    const response = await apiClient.post('/auth/refresh-token/', {
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
    const response = await apiClient.get('/auth/profile/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    throw error;
  }
}; 