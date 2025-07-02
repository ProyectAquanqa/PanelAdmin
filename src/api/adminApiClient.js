import axios from 'axios';
import { toast } from 'react-hot-toast';

// Configuración para usar el proxy de Vite que apunta a Django en el puerto 8000
const API_BASE_URL = '';  // Removemos /api de aquí ya que las rutas ya lo incluyen

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 60000, // 60 segundos de timeout para las peticiones
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Django REST con Simple JWT espera: Bearer <token>
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Para compatibilidad con Django, asegúrese de que URLs terminan con "/"
    if (!config.url.endsWith('/') && !config.url.includes('?')) {
      config.url = `${config.url}/`;
    }
    
    // Para solicitudes PUT y PATCH, asegurarse de que el Content-Type sea application/json
    if (config.method === 'put' || config.method === 'patch') {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
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
    
    // Manejo de token expirado
    if (error.response?.status === 401 && !originalRequest._retry && localStorage.getItem('refreshToken')) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        const refreshUrl = '/api/auth/refresh-token/';
        const response = await axios.post(refreshUrl, {
          refresh: refreshToken
        });
        
        const newAccessToken = response.data.access;
        
        if (!newAccessToken) {
          throw new Error('No se pudo obtener un nuevo token de acceso');
        }
        
        localStorage.setItem('authToken', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        return axios(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        
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
      const status = error.response.status;
      
      if (status === 403) {
        toast.error('No tiene permisos para realizar esta acción');
      } else if (status === 500) {
        toast.error('Error del servidor. Por favor, inténtelo más tarde');
      } else if (status === 400) {
        const data = error.response.data;
        if (data) {
          if (typeof data === 'string') {
            toast.error(data);
          } else if (data.detail) {
            toast.error(data.detail);
          } else if (data.error) {
            toast.error(data.error);
          } else if (data.message) {
            toast.error(data.message);
          } else if (typeof data === 'object') {
            let errorMessage = '';
            
            for (const key in data) {
              if (Object.hasOwnProperty.call(data, key)) {
                const errorValue = data[key];
                if (Array.isArray(errorValue)) {
                  errorMessage += `${key}: ${errorValue[0]}\n`;
                } else if (typeof errorValue === 'string') {
                  errorMessage += `${key}: ${errorValue}\n`;
                }
              }
            }
            
            if (!errorMessage) {
              errorMessage = 'Error de validación en los datos enviados';
            }
            
            toast.error(errorMessage.trim());
          }
        } else {
          toast.error('Error de validación en los datos enviados');
        }
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      if (!navigator.onLine) {
        toast.error('Sin conexión a Internet. Verifique su conexión e inténtelo de nuevo.');
      } else {
        toast.error('No se pudo conectar con el servidor. Inténtelo más tarde.');
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
