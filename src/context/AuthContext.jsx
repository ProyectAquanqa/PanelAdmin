import { createContext, useState, useContext, useEffect } from 'react';
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
            console.warn("Token expirado, cerrando sesión");
            logout();
            return;
          }
          
          // Token válido, obtener perfil de usuario
          try {
            const profileData = await authService.getProfile();
            setUser(profileData);
            setIsAuthenticated(true);
          } catch (profileError) {
            // Si falla obtener el perfil, usar datos del token
            setUser({ 
              email: decoded.email || decoded.sub, 
              name: decoded.name || decoded.username,
              roles: decoded.roles || []
            });
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Error al procesar el token:", error);
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
      
      // Guardar tokens
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('refreshToken', response.refresh);
      
      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Intentar hacer logout en el servidor, pero continuar incluso si falla
      await authService.logout();
    } catch (error) {
      console.warn("Error al cerrar sesión en el servidor:", error);
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
      
      localStorage.setItem('authToken', response.access);
      setToken(response.access);
      
      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      logout();
      return false;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuthToken
  };

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