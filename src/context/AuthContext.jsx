import { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { jwtDecode } from 'jwt-decode'; // Necesitaremos instalar jwt-decode

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
          // Opcional: Podrías añadir una llamada para validar el token con el backend
          // const response = await apiClient.get('/auth/validate-token');
          // setUser(response.data.user);
          const decoded = jwtDecode(token);
          setUser({ email: decoded.email, name: decoded.name }); // Asume que el payload tiene estos campos
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Session expired or token is invalid", error);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    bootstrapAuth();
  }, [token]);

  const login = async (credentials) => {
    const response = await apiClient.post('/v1/auth/token/', credentials);
    const { access: accessToken } = response.data;
    
    localStorage.setItem('authToken', accessToken);
    setToken(accessToken);
    const decoded = jwtDecode(accessToken);
    setUser({ email: decoded.email, name: decoded.name });
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    // La redirección se manejará en el componente que llame a logout
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
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