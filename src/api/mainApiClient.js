import axios from 'axios';
import { toast } from 'react-hot-toast';

// Configuración para usar la variable de entorno que apunta a Spring Boot
const API_BASE_URL = import.meta.env.VITE_MAIN_API_BASE_URL || '/api_main';

const mainApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 60000,
});

// Request interceptor
mainApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // O el token que corresponda para esta API
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
mainApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Aquí podría ir la lógica de refresco de token para la API de Spring Boot si es diferente
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Por ahora, solo rechazamos para evitar bucles infinitos
      // y mostramos un error genérico.
      toast.error('Sesión inválida o expirada.');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      let message = 'Ocurrió un error inesperado.';

      if (data && data.message) {
        message = data.message;
      } else if (typeof data === 'string') {
        message = data;
      } else if (status === 403) {
        message = 'No tiene permisos para esta acción.';
      } else if (status === 500) {
        message = 'Error interno del servidor.';
      }

      toast.error(message);
    } else if (error.request) {
      toast.error('No se pudo conectar con el servidor. Revise su conexión.');
    }
    
    return Promise.reject(error);
  }
);

export default mainApiClient; 