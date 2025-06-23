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
              name: decoded.name || decoded.username || decoded.email,
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
      
      console.log('Respuesta de login:', response);
      
      // Determinar dónde están los tokens en la respuesta (diferentes backends pueden tener diferentes estructuras)
      let accessToken = null;
      let refreshToken = null;
      let userData = null;
      
      // Caso 1: Formato estándar JWT con access y refresh
      if (response.access && response.refresh) {
        accessToken = response.access;
        refreshToken = response.refresh;
      }
      // Caso 2: Formato con token y refresh
      else if (response.token && response.refresh) {
        accessToken = response.token;
        refreshToken = response.refresh;
      }
      // Caso 3: Formato con accessToken y refreshToken
      else if (response.accessToken && response.refreshToken) {
        accessToken = response.accessToken;
        refreshToken = response.refreshToken;
      }
      // Caso 4: Formato con token y refreshToken
      else if (response.token && response.refreshToken) {
        accessToken = response.token;
        refreshToken = response.refreshToken;
      }
      // Caso 5: Formato con solo token
      else if (response.token) {
        accessToken = response.token;
        // Puede que no haya refresh token
      }
      // Caso 6: Formato con solo access
      else if (response.access) {
        accessToken = response.access;
        // Puede que no haya refresh token
      }
      
      // Verificar que tenemos al menos un token de acceso
      if (!accessToken) {
        throw new Error('No se pudo obtener el token de acceso de la respuesta');
      }
      
      // Buscar datos de usuario
      if (response.user) {
        userData = response.user;
      } else if (response.userData) {
        userData = response.userData;
      } else if (response.profile) {
        userData = response.profile;
      } else {
        // Intentar decodificar el token para obtener datos básicos
        try {
          const decoded = jwtDecode(accessToken);
          userData = {
            email: decoded.email || decoded.sub,
            name: decoded.name || decoded.username || decoded.email,
            roles: decoded.roles || []
          };
        } catch (decodeError) {
          console.warn('No se pudo decodificar el token para obtener datos de usuario', decodeError);
          userData = { email: credentials.email };
        }
      }
      
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
      
      // Determinar dónde está el nuevo token de acceso
      let newAccessToken = null;
      
      if (response.access) {
        newAccessToken = response.access;
      } else if (response.token) {
        newAccessToken = response.token;
      } else if (response.accessToken) {
        newAccessToken = response.accessToken;
      }
      
      if (!newAccessToken) {
        throw new Error('No se pudo obtener el nuevo token de acceso');
      }
      
      localStorage.setItem('authToken', newAccessToken);
      setToken(newAccessToken);
      
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