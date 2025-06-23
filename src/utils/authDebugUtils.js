/**
 * Utilidades para depurar problemas de autenticación
 */
import axios from 'axios';

/**
 * Prueba diferentes endpoints de autenticación para determinar cuál está disponible
 * @returns {Promise<Object>} Resultados de las pruebas
 */
export const testAuthEndpoints = async () => {
  console.log('🔍 Iniciando pruebas de endpoints de autenticación...');
  
  const results = {
    success: false,
    workingEndpoints: [],
    failedEndpoints: [],
    error: null,
    recommendedEndpoint: null
  };
  
  // Lista de posibles endpoints de autenticación
  const endpoints = [
    '/api/auth/login/',
    '/api/auth/token/',
    '/api/authentication/login/',
    '/api/users/login/',
    '/api/login/',
    '/api/users/api/token/',
    '/api/token/'
  ];
  
  const testCredentials = {
    email: 'admin@hospital.pe',
    password: 'admin123',
    username: 'admin@hospital.pe' // Algunos backends usan username en lugar de email
  };
  
  // Probar cada endpoint
  for (const endpoint of endpoints) {
    try {
      console.log(`🚀 Probando endpoint: ${endpoint}`);
      const response = await axios.post(endpoint, testCredentials);
      
      console.log(`✅ Endpoint ${endpoint} funcionó!`, response.data);
      
      results.workingEndpoints.push({
        endpoint,
        status: response.status,
        responseStructure: Object.keys(response.data),
        data: response.data
      });
      
      results.success = true;
      
      // Si aún no tenemos un endpoint recomendado, usar este
      if (!results.recommendedEndpoint) {
        results.recommendedEndpoint = endpoint;
      }
    } catch (error) {
      console.log(`❌ Endpoint ${endpoint} falló:`, error.response?.status || error.message);
      
      results.failedEndpoints.push({
        endpoint,
        status: error.response?.status,
        message: error.response?.data || error.message
      });
    }
  }
  
  if (!results.success) {
    results.error = 'No se encontró ningún endpoint de autenticación funcionando';
  }
  
  return results;
};

/**
 * Analiza un token JWT para mostrar su contenido
 * @param {string} token - Token JWT a analizar
 * @returns {Object} Contenido decodificado del token
 */
export const analyzeToken = (token) => {
  if (!token) {
    return { error: 'No se proporcionó un token' };
  }
  
  try {
    // Decodificar el token (sin verificar la firma)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { error: 'El token no tiene el formato JWT estándar (header.payload.signature)' };
    }
    
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    // Calcular tiempo de expiración
    let expirationInfo = null;
    if (payload.exp) {
      const expirationDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expirationDate < now;
      
      expirationInfo = {
        expirationTimestamp: payload.exp,
        expirationDate: expirationDate.toLocaleString(),
        isExpired,
        timeRemaining: isExpired ? 'Expirado' : `${Math.floor((expirationDate - now) / 1000 / 60)} minutos`
      };
    }
    
    return {
      header,
      payload,
      expiration: expirationInfo,
      isValid: !!expirationInfo && !expirationInfo.isExpired
    };
  } catch (error) {
    return { error: `Error al decodificar el token: ${error.message}` };
  }
};

/**
 * Verifica el estado actual de la autenticación
 * @returns {Object} Estado de autenticación
 */
export const checkAuthStatus = () => {
  const authToken = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  return {
    hasAuthToken: !!authToken,
    hasRefreshToken: !!refreshToken,
    authTokenAnalysis: authToken ? analyzeToken(authToken) : null,
    refreshTokenAnalysis: refreshToken ? analyzeToken(refreshToken) : null
  };
};

/**
 * Ejecuta todas las pruebas de autenticación
 * @returns {Promise<Object>} Resultados de todas las pruebas
 */
export const runAllAuthTests = async () => {
  console.log('🔬 Iniciando diagnóstico completo de autenticación...');
  
  const endpointTests = await testAuthEndpoints();
  const authStatus = checkAuthStatus();
  
  return {
    endpointTests,
    authStatus,
    timestamp: new Date().toISOString()
  };
}; 