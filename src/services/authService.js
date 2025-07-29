/**
 * Servicio de autenticación para conectar con el backend AquanQ
 * Implementa el Módulo 1: Login Funcional según el prompt
 * Endpoints basados en el backend real de AquanQ
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Configuración base para fetch
const apiCall = async (url, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
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
    console.error('Auth API Error:', error);
    throw error;
  }
};

const authService = {
  // 🔐 Iniciar sesión usando el endpoint real de AquanQ (/token/)
  login: async (credentials) => {
    try {
      const response = await apiCall('/token/', {
        method: 'POST',
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      // Guardar tokens (AquanQ usa JWT con access y refresh)
      if (response.access && response.refresh) {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('isAuthenticated', 'true');
        
        // Guardar datos del usuario si están en la respuesta
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error) {
      // Manejar errores específicos de autenticación
      if (error.message.includes('Unable to log in') || 
          error.message.includes('credentials') ||
          error.message.includes('invalid') ||
          error.message.includes('incorrect')) {
        throw new Error('Credenciales inválidas. Verifica tu usuario y contraseña.');
      }
      
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      }
      
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  },

  // 🚪 Cerrar sesión (AquanQ no tiene endpoint logout específico, solo limpiamos localmente)
  logout: async () => {
    try {
      // AquanQ usa JWT que no requiere invalidación en el servidor
      // Solo limpiamos los datos locales
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
    } catch (error) {
      console.warn('Error al cerrar sesión:', error);
    }
  },

  // ✅ Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const accessToken = localStorage.getItem('access_token');
    const isAuth = localStorage.getItem('isAuthenticated');
    
    if (!accessToken || isAuth !== 'true') {
      return false;
    }
    
    // Verificar si el token no ha expirado (opcional)
    try {
      const tokenData = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (tokenData.exp < currentTime) {
        // Token expirado, limpiar datos
        authService.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      // Si hay error al decodificar, considerar no autenticado
      authService.logout();
      return false;
    }
  },

  // 👤 Obtener datos del usuario actual desde /profile/
  getCurrentUser: async (fromStorage = true) => {
    // Si fromStorage es true, intentar obtener de localStorage primero
    if (fromStorage) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          return JSON.parse(userStr);
        }
      } catch (error) {
        console.error('Error parsing user data from storage:', error);
      }
    }
    
    // Si no hay datos en storage o se solicita fresco, obtener del servidor
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No token available');
      }
      
      const response = await apiCall('/profile/', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Guardar en localStorage para próximas consultas
      localStorage.setItem('user', JSON.stringify(response));
      return response;
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // 🔑 Obtener token de acceso
  getToken: () => {
    return localStorage.getItem('access_token');
  },

  // 🔄 Refresh token usando /token/refresh/
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiCall('/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (response.access) {
        localStorage.setItem('access_token', response.access);
        return response;
      } else {
        throw new Error('No access token in refresh response');
      }
      
    } catch (error) {
      // Si falla el refresh, cerrar sesión
      await authService.logout();
      throw error;
    }
  },

  // 📧 Validar formato de email (si se usa email en lugar de username)
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 🔒 Validar fortaleza de contraseña
  validatePassword: (password) => {
    return {
      isValid: password.length >= 6,
      minLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  },

  // 🔧 Función auxiliar para hacer llamadas autenticadas a la API
  authenticatedApiCall: async (url, options = {}) => {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const config = {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    };
    
    try {
      return await apiCall(url, config);
    } catch (error) {
      // Si es error 401, intentar refresh token
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        try {
          await authService.refreshToken();
          // Reintentar con el nuevo token
          const newToken = authService.getToken();
          config.headers.Authorization = `Bearer ${newToken}`;
          return await apiCall(url, config);
        } catch (refreshError) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
      }
      throw error;
    }
  },
};

export default authService; 