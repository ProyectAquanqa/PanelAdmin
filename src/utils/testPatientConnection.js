import apiClient from '../api/apiClient';
import { API_ROUTES } from '../config/api';

/**
 * Prueba la conexión con la API de pacientes
 * Intenta diferentes endpoints para encontrar uno que funcione
 */
export const testPatientConnection = async () => {
  console.log('🔍 Probando conexión con la API de pacientes...');
  
  // Lista de URLs a probar
  const urlsToTry = [
    API_ROUTES.PATIENTS.BASE,
    '/api/users/patients',
    '/api/users/patients/',
    '/api/v1/users/patients/',
    '/api/v1/users/patients',
    '/api/medical/patients/'
  ];
  
  const results = [];
  
  // Probar cada URL
  for (const url of urlsToTry) {
    try {
      console.log(`🔄 Probando URL: ${url}`);
      const response = await apiClient.get(url);
      
      results.push({
        url,
        status: response.status,
        success: true,
        data: response.data,
        message: `✅ Conexión exitosa con ${url}`
      });
      
      console.log(`✅ Conexión exitosa con ${url}`, response.data);
    } catch (error) {
      results.push({
        url,
        status: error.response?.status,
        success: false,
        error: error.message,
        message: `❌ Error con ${url}: ${error.message}`
      });
      
      console.error(`❌ Error con ${url}:`, error.message);
    }
  }
  
  // Encontrar la primera URL exitosa
  const successfulUrl = results.find(result => result.success);
  
  if (successfulUrl) {
    console.log(`✅ URL exitosa encontrada: ${successfulUrl.url}`);
    return {
      success: true,
      url: successfulUrl.url,
      results,
      message: `URL exitosa encontrada: ${successfulUrl.url}`
    };
  } else {
    console.error('❌ No se encontró ninguna URL exitosa para pacientes');
    return {
      success: false,
      results,
      message: 'No se encontró ninguna URL exitosa para pacientes'
    };
  }
};

export default testPatientConnection; 