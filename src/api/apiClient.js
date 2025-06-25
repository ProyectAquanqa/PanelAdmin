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
  timeout: 60000, // 60 segundos de timeout para las peticiones (para esperar APIs más lentas)
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Django REST con Simple JWT espera: Bearer <token>
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Asegurarse de que la URL comience con /api si no es así y no es una URL completa
    if (!config.url.startsWith('/api') && !config.url.startsWith('http')) {
      config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }
    
    // Para compatibilidad con Django, asegúrese de que URLs terminan con "/"
    if (!config.url.endsWith('/') && !config.url.includes('?')) {
      config.url = `${config.url}/`;
    }
    
    // Imprimir la URL completa para depuración
    const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
    console.log(`🚀 Request: ${config.method.toUpperCase()} ${fullUrl}`, {
      params: config.params || {},
      data: config.data || {},
      headers: config.headers
    });
    
    // Para solicitudes PUT y PATCH, asegurarse de que el Content-Type sea application/json
    if (config.method === 'put' || config.method === 'patch') {
      config.headers['Content-Type'] = 'application/json';
      console.log('🔧 Configurando Content-Type para solicitud PUT/PATCH:', config.headers['Content-Type']);
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
    // Log para depuración de respuestas exitosas
    console.log(`✅ Response from ${response.config.url}:`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Mostrar información detallada del error
    if (error.response) {
      console.error(`❌ Error ${error.response.status} from ${originalRequest.url}:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error(`❌ No response received from ${originalRequest.url}:`, error.request);
    } else {
      console.error(`❌ Error setting up request to ${originalRequest?.url}:`, error.message);
    }
    
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
    
    // Intento de recuperación para endpoints específicos (como doctores por especialidad)
    if (error.response?.status === 404) {
      const url = originalRequest.url.toLowerCase();
      
      // Si es una búsqueda de doctores por especialidad o bloques horarios, intentar URLs alternativas
      if (url.includes('doctor') && url.includes('specialty')) {
        console.log('⚠️ Ruta de doctores por especialidad no encontrada, podría requerir ajustes en la URL');
      } else if (url.includes('time') && url.includes('block')) {
        console.log('⚠️ Ruta de bloques horarios no encontrada, podría requerir ajustes en la URL');
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
      } else if (status === 400) {
        // Errores de validación
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
            // Si es un objeto con múltiples errores
            let errorMessage = '';
            
            // Iterar a través de todos los errores y concatenarlos
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
            
            // Si no se encontró ningún mensaje, usar un mensaje genérico
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
    } else {
      // Algo sucedió al configurar la solicitud
      console.error('Error al configurar la solicitud:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
