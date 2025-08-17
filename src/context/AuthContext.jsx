/**
 * Contexto de autenticación para PanelAdmin
 * 
 * Maneja el estado de autenticación, login, logout y permisos de usuario
 * Proporciona funciones y estado global para toda la aplicación
 */

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
        const isAuth = authService.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          let userData = await authService.getCurrentUser(true);

          if (!userData) {
            userData = await authService.getCurrentUser(false);
          }

          if (userData) {
            setUser(userData);
            if (userData.permissions && userData.groups) {
              setUserPermissions(userData.permissions, userData.groups);
            }
          }
        }
      } catch (error) {
        await authService.logout();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  /**
   * Función de autenticación de usuario
   */
  const login = async (credentials) => {
    try {
      setLoading(true);
      
      if (!credentials.username || !credentials.password) {
        throw new Error('Usuario y contraseña son obligatorios');
      }
      const response = await authService.login(credentials);
      
      let userData = response.user;
      if (!userData) {
        try {
          userData = await authService.getCurrentUser(false);
        } catch (profileError) {
          userData = { username: credentials.username };
        }
      }
      
      if (userData) {
        const permissions = userData.permissions || [];
        const groups = userData.groups || [];
        setUserPermissions(permissions, groups);
      }
      
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success('¡Inicio de sesión exitoso!');
      return response;
      
    } catch (error) {
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función de cierre de sesión
   */
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      clearUserPermissions();
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      clearUserPermissions();
      toast.error('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresca el token de autenticación
   */
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

  /**
   * Obtiene el token de autenticación actual
   */
  const getToken = () => {
    return authService.getToken();
  };

  /**
   * Actualiza los datos del usuario en el estado
   */
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Refresca los datos del usuario desde el servidor
   */
  const refreshUser = async () => {
    try {
      if (!isAuthenticated) return null;
      
      const userData = await authService.getCurrentUser(false);
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
    /** Estados */
    user,
    loading,
    isAuthenticated,
    
    /** Funciones de autenticación */
    login,
    logout,
    refreshAuth,
    updateUser,
    refreshUser,
    getToken,
    
    /** Utilidades de validación */
    validateEmail: authService.validateEmail,
    validatePassword: authService.validatePassword,
    
    /** Llamadas API autenticadas */
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