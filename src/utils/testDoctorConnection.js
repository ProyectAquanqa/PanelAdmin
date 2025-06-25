/**
 * Script para probar la conexión entre React y la API de Django para el módulo de doctores
 * Ejecutar en la consola del navegador o importar en un componente
 */

import apiClient from '../api/apiClient';
import { API_ROUTES } from '../config/api';

/**
 * Prueba la conexión con la API de doctores
 * Intenta diferentes endpoints para encontrar uno que funcione
 */
export const testDoctorConnection = async () => {
  console.log('🔍 Probando conexión con la API de doctores...');
  
  // Lista de URLs a probar
  const urlsToTry = [
    API_ROUTES.DOCTORS.BASE,
    '/api/doctors/doctors',
    '/api/doctors/',
    '/api/v1/doctors/',
    '/api/v1/doctors/doctors/',
    '/api/medical/doctors/'
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
    console.error('❌ No se encontró ninguna URL exitosa para doctores');
    return {
      success: false,
      results,
      message: 'No se encontró ninguna URL exitosa para doctores'
    };
  }
};

export default testDoctorConnection; 