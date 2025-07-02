import { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (token) {
        try {
          // Verificar si el token ha expirado
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp && decoded.exp < currentTime) {
            // Token expirado
            logout();
            return;
          }
          
          // Token válido, obtener perfil de usuario desde Django
          try {
            const profileData = await authService.getProfile();
            setUser(profileData);
            setIsAuthenticated(true);
          } catch (profileError) {
            // Si falla obtener el perfil, usar datos del token
            setUser({ 
              id: decoded.user_id,
              email: decoded.email || decoded.sub, 
              role: decoded.role || 'admin',
              name: decoded.name || decoded.username || decoded.email,
            });
            setIsAuthenticated(true);
          }
        } catch (error) {
          logout();
        }
      }
      setIsLoading(false);
    };

    bootstrapAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      // Extraer los tokens de la respuesta de Django
      const accessToken = response.token;
      const refreshToken = response.refresh;
      
      if (!accessToken) {
        throw new Error('No se pudo obtener el token de acceso de la respuesta');
      }
      
      // Extraer datos de usuario de la respuesta de Django
      const userData = response.user;
      
      // Guardar tokens
      localStorage.setItem('authToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      setToken(accessToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Intentar hacer logout en el servidor Django
      await authService.logout();
    } catch (error) {
      // Ignorar error de logout en servidor
    } finally {
      // Siempre limpiar estado local
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshAuthToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await authService.refreshToken(refreshToken);
      
      // Obtener el nuevo token de acceso de la respuesta de Django
      const newAccessToken = response.access;
      
      if (!newAccessToken) {
        throw new Error('No se pudo obtener el nuevo token de acceso');
      }
      
      localStorage.setItem('authToken', newAccessToken);
      setToken(newAccessToken);
      
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuthToken
  }), [user, token, isAuthenticated, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 