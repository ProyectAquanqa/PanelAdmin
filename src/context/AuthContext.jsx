import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { setUserPermissions, clearUserPermissions } from '../services/permissionService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Verificar si el usuario está autenticado
        const isAuth = authService.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          // Obtener datos del usuario desde localStorage primero
          let userData = await authService.getCurrentUser(true);

          // Si no existe en storage, obtener del servidor
          if (!userData) {
            userData = await authService.getCurrentUser(false);
          }

          if (userData) {
            setUser(userData);
            // Asegurar que los permisos estén sincronizados
            if (userData.permissions && userData.groups) {
              setUserPermissions(userData.permissions, userData.groups);
            }
          }
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        // Limpiar datos si hay error
        await authService.logout();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // 🔐 Función de login actualizada para AquanQ
  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Validar campos
      if (!credentials.username || !credentials.password) {
        throw new Error('Usuario y contraseña son obligatorios');
      }

      // Intentar autenticación
      const response = await authService.login(credentials);
      
      // Obtener datos completos del usuario desde el perfil
      let userData = response.user;
      if (!userData) {
        try {
          userData = await authService.getCurrentUser(false); // Obtener del servidor
        } catch (profileError) {
          console.warn('No se pudieron obtener datos del perfil:', profileError);
          // Usar datos básicos del usuario
          userData = { username: credentials.username };
        }
      }
      
      // Guardar permisos y grupos en localStorage para el sistema dinámico
      if (userData) {
        const permissions = userData.permissions || [];
        const groups = userData.groups || [];
        setUserPermissions(permissions, groups);
        
        console.log('👤 Usuario autenticado:', userData.username);
        console.log('🔑 Permisos:', permissions);
        console.log('👥 Grupos:', groups);
      }
      
      // Actualizar estado
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success('¡Inicio de sesión exitoso!');
      return response;
      
    } catch (error) {
      console.error('Error de login:', error);
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Función de logout actualizada para sistema de permisos dinámicos
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      clearUserPermissions(); // Limpiar permisos del sistema dinámico
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Asegurar limpieza local aunque falle el servidor
      setUser(null);
      setIsAuthenticated(false);
      clearUserPermissions();
      toast.error('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Verificar y refrescar token si es necesario
  const refreshAuth = async () => {
    try {
      if (!isAuthenticated) return false;
      
      await authService.refreshToken();
      return true;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      await logout();
      return false;
    }
  };

  // 🔑 Obtener token actual
  const getToken = () => {
    return authService.getToken();
  };

  // 👤 Actualizar datos del usuario
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 🔄 Refrescar datos del usuario desde el servidor
  const refreshUser = async () => {
    try {
      if (!isAuthenticated) return null;
      
      const userData = await authService.getCurrentUser(false); // Forzar obtención del servidor
      if (userData) {
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.error('Error al refrescar datos del usuario:', error);
    }
    return null;
  };

  const value = {
    // Estados
    user,
    loading,
    isAuthenticated,
    
    // Funciones
    login,
    logout,
    refreshAuth,
    updateUser,
    refreshUser,
    getToken,
    
    // Utilidades
    validateEmail: authService.validateEmail,
    validatePassword: authService.validatePassword,
    
    // API autenticada
    authenticatedApiCall: authService.authenticatedApiCall,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}; 