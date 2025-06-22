import axios from 'axios';
import { toast } from 'react-hot-toast';

// Obtener la URL base de la API desde las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

console.log('API Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout para las peticiones
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Error en la solicitud:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (Unauthorized) y no hemos intentado ya refreshear el token
    if (error.response?.status === 401 && !originalRequest._retry && localStorage.getItem('refreshToken')) {
      originalRequest._retry = true;
      
      try {
        // Intentar refreshear el token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // Si no hay refresh token, forzar logout
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Realizar solicitud para refrescar el token sin usar el interceptor (para evitar loop)
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token/`, {
          refresh: refreshToken
        });
        
        const { access } = response.data;
        
        // Guardar el nuevo token
        localStorage.setItem('authToken', access);
        
        // Actualizar el header de la petición original y reintentarla
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, limpiar tokens y redirigir al login
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        
        // Solo mostrar toast si estamos en una página que no es login
        if (!window.location.pathname.includes('login')) {
          toast.error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
        }
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        
        return Promise.reject(refreshError);
      }
    }
    
    // Manejo de errores comunes
    if (error.response) {
      // La solicitud fue hecha y el servidor respondió con un código de estado fuera del rango 2xx
      const status = error.response.status;
      
      if (status === 403) {
        toast.error('No tiene permisos para realizar esta acción');
      } else if (status === 404) {
        // No mostrar notificación para 404, generalmente es manejado por la UI
        console.warn('Recurso no encontrado:', originalRequest.url);
      } else if (status === 500) {
        toast.error('Error del servidor. Por favor, inténtelo más tarde');
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
      if (!navigator.onLine) {
        toast.error('Sin conexión a Internet. Verifique su conexión e inténtelo de nuevo.');
      } else {
        toast.error('No se pudo conectar con el servidor. Inténtelo más tarde.');
      }
    } else {
      // Algo sucedió al configurar la solicitud
      console.error('Error al configurar la solicitud:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 