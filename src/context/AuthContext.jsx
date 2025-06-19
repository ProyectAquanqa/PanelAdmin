import { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { jwtDecode } from 'jwt-decode';

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
          
          // Token válido, establecer usuario
          setUser({ 
            email: decoded.email || decoded.sub, 
            name: decoded.name || decoded.username,
            roles: decoded.roles || []
          });
          setIsAuthenticated(true);
          
          // Opcional: Validar el token con el backend
          // await apiClient.get('/auth/validate-token/');
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
      // Corregir la URL para que coincida con la API de Django
      const response = await apiClient.post('/auth/login/', credentials);
      
      // Ajustar según la estructura de respuesta de la API
      const { token, refresh, user } = response.data;
      
      // Guardar tokens
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refresh);
      
      setToken(token);
      
      // Establecer la información del usuario directamente desde la respuesta
      setUser({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshAuthToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiClient.post('/auth/refresh-token/', {
        refresh: refreshToken
      });
      
      const { access } = response.data;
      localStorage.setItem('authToken', access);
      setToken(access);
      
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