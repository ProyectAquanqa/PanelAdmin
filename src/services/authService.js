/**
 * Servicio de autenticación para conectar con el backend AquanQ
 * Implementa el Módulo 1: Login Funcional según el prompt
 * Endpoints basados en el backend real de AquanQ
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://172.16.11.29:8000/api';
const API_BASE = RAW_BASE.replace(/\/(web|admin|mobile)\/?$/, '');

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
    const response = await fetch(`${API_BASE}${url}`, config);
    
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        if (isJson) {
          const error = await response.json();
          message = error.detail || error.message || message;
        } else {
          const text = await response.text();
          if (text && text.startsWith('<!DOCTYPE')) {
            message = 'El servidor devolvió HTML. Revisa que la URL de la API sea correcta y que el endpoint exista.';
          } else if (text) {
            message = text;
          }
        }
      } catch (_) {}
      throw new Error(message);
    }
    
    return isJson ? await response.json() : await response.text();
  } catch (error) {
    console.error('Auth API Error:', error);
    throw error;
  }
};

const authService = {
  // 🔐 Iniciar sesión usando el sistema de permisos dinámicos (/api/web/auth/login/)
  login: async (credentials) => {
    try {
      const response = await apiCall('/web/auth/login/', {
        method: 'POST',
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      console.log('🔑 Respuesta de login:', response);

      // Verificar estructura de respuesta del nuevo sistema dinámico
      if (response.status === 'success' && response.data) {
        const { access, refresh, user } = response.data;
        
        // Guardar tokens JWT
        if (access && refresh) {
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
          localStorage.setItem('isAuthenticated', 'true');
          
          console.log('💾 Tokens guardados');
        }
        
        // Guardar datos del usuario con permisos y grupos
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          
          // Log de debug para el sistema de permisos
          console.log('👤 Usuario:', user.username);
          console.log('👥 Grupos:', user.groups || []);
          console.log('🔑 Permisos:', user.permissions || []);
        }
        
        return response;
      }
      
      // Formato legacy (compatibilidad temporal)
      else if (response.access && response.refresh) {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('isAuthenticated', 'true');
        
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        console.warn('⚠️ Usando formato legacy de login - actualizar backend');
        return response;
      }
      
      // Error: respuesta inesperada
      else {
        throw new Error('Respuesta de login inválida del servidor');
      }
      
    } catch (error) {
      console.error('❌ Error de login:', error);
      
      // Manejar errores específicos del nuevo sistema
      if (error.message.includes('permission_denied')) {
        throw new Error('Acceso denegado. No tienes permisos para acceder al panel.');
      }
      
      if (error.message.includes('credentials') || 
          error.message.includes('invalid') ||
          error.message.includes('incorrect') ||
          error.message.includes('Unable to log in')) {
        throw new Error('Credenciales inválidas. Verifica tu usuario y contraseña.');
      }
      
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      }
      
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  },

  // 🚪 Cerrar sesión y limpiar datos del sistema de permisos dinámicos
  logout: async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      
      // Limpiar tokens JWT
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      
      // Limpiar datos del sistema de permisos dinámicos
      localStorage.removeItem('user_permissions');
      localStorage.removeItem('user_groups');
      
      console.log('✅ Sesión cerrada y datos limpiados');
    } catch (error) {
      console.warn('⚠️ Error al cerrar sesión:', error);
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

  // 👤 Obtener datos del usuario actual con permisos y grupos actualizados
  getCurrentUser: async (fromStorage = true) => {
    // Si fromStorage es true, intentar obtener de localStorage primero
    if (fromStorage) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          console.log('👤 Usuario desde storage:', userData.username);
          return userData;
        }
      } catch (error) {
        console.error('❌ Error parsing user data from storage:', error);
      }
    }
    
    // Si no hay datos en storage o se solicita fresco, obtener del servidor
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('No token available');
      }
      
      console.log('🔄 Obteniendo datos del usuario desde servidor...');
      
      const response = await apiCall('/web/auth/profile/', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Manejar respuesta del nuevo sistema dinámico
      let userData;
      if (response.status === 'success' && response.data) {
        userData = response.data;
      } else {
        // Formato legacy
        userData = response;
      }
      
      // Asegurar que los permisos y grupos estén presentes
      userData.permissions = userData.permissions || [];
      userData.groups = userData.groups || [];
      
      console.log('✅ Datos del usuario actualizados:');
      console.log('👤 Usuario:', userData.username);
      console.log('👥 Grupos:', userData.groups);
      console.log('🔑 Permisos:', userData.permissions?.length || 0, 'permisos');
      
      // Guardar en localStorage para próximas consultas
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
      
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      
      // Si es error 401, limpiar sesión
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.log('🔄 Token expirado, cerrando sesión...');
        await authService.logout();
      }
      
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

      const response = await apiCall('/web/auth/refresh/', {
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