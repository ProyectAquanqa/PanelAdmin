import axios from 'axios';
import { toast } from 'react-hot-toast';

// Configuración para usar el proxy de Vite que apunta a Django en el puerto 8000
const API_BASE_URL = '';  // Vacío para usar el proxy de Vite

console.log('API Base URL configurado:', API_BASE_URL || 'Usando proxy de Vite (Django Admin API en puerto 8000)');

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
      // Django REST con Simple JWT espera: Bearer <token>
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Asegurarse de que la URL comience con /api si no es así
    if (!config.url.startsWith('/api') && !config.url.startsWith('http')) {
      config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }
    
    // Imprimir la URL completa para depuración
    const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
    console.log(`🚀 Request: ${config.method.toUpperCase()} ${fullUrl}`, config.params || {});
    
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
    // Log para depuración de respuestas exitosas
    console.log(`✅ Response from ${response.config.url}:`, response.status);
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
        
        // Usar la ruta específica de Django para refresh token
        const refreshUrl = '/api/auth/refresh-token/';
        console.log(`🔄 Intentando refrescar token con: ${refreshUrl}`);
        
        // Realizar solicitud para refrescar el token sin usar el interceptor (para evitar loop)
        const response = await axios.post(refreshUrl, {
          refresh: refreshToken
        });
        
        // Obtener el nuevo token de acceso
        const newAccessToken = response.data.access;
        
        if (!newAccessToken) {
          throw new Error('No se pudo obtener un nuevo token de acceso');
        }
        
        // Guardar el nuevo token
        localStorage.setItem('authToken', newAccessToken);
        
        // Actualizar el header de la petición original
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
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
      console.error(`❌ Error ${status} from ${originalRequest.url}:`, error.response.data);
      
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
