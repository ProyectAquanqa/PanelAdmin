// Test de conexión para especialidades
// Archivo: src/utils/testSpecialtyConnection.js

import apiClient from '../api/apiClient';

/**
 * Función para probar la conexión con el backend de especialidades
 * Úsala en la consola del navegador para diagnosticar problemas
 */
export const testSpecialtyConnection = async () => {
  console.log('🔍 INICIANDO PRUEBA DE CONEXIÓN DE ESPECIALIDADES');
  console.log('=====================================');
  
  // URLs a probar
  const urlsToTest = [
    '/api/catalogs/specialties/',
    '/api/catalogs/specialties',
    '/api/v1/catalogs/specialties/',
    '/api/v1/catalogs/specialties',
    '/api/catalog/specialties/',
    '/api/catalog/specialties',
  ];
  
  for (const url of urlsToTest) {
    try {
      console.log(`\n🚀 Probando: ${url}`);
      const response = await apiClient.get(url);
      console.log(`✅ ÉXITO - Status: ${response.status}`);
      console.log(`📊 Datos recibidos:`, response.data);
      console.log(`📋 Tipo de datos:`, typeof response.data);
      
      if (Array.isArray(response.data)) {
        console.log(`📊 Es un array con ${response.data.length} elementos`);
      } else if (response.data && typeof response.data === 'object') {
        console.log(`📊 Es un objeto con las siguientes propiedades:`, Object.keys(response.data));
      }
      
      return { success: true, url, data: response.data };
    } catch (error) {
      console.log(`❌ ERROR en ${url}:`);
      console.log(`   Status: ${error.response?.status || 'Sin respuesta'}`);
      console.log(`   Error: ${error.response?.data?.detail || error.message}`);
    }
  }
  
  console.log('\n❌ Ninguna URL funcionó');
  return { success: false };
};

/**
 * Función para probar CRUD completo de especialidades
 */
export const testSpecialtyCRUD = async () => {
  console.log('🧪 INICIANDO PRUEBA CRUD DE ESPECIALIDADES');
  console.log('==========================================');
  
  try {
    // 1. Obtener lista de especialidades
    console.log('\n1️⃣ Obteniendo lista de especialidades...');
    const listResponse = await apiClient.get('/api/catalogs/specialties/');
    console.log('✅ Lista obtenida:', listResponse.data);
    
    // 2. Crear una especialidad de prueba
    console.log('\n2️⃣ Creando especialidad de prueba...');
    const testSpecialty = {
      name: 'Especialidad de Prueba',
      description: 'Esta es una especialidad creada para pruebas',
      consultation_price: 150.00,
      discount_percentage: 10.0
    };
    
    const createResponse = await apiClient.post('/api/catalogs/specialties/', testSpecialty);
    console.log('✅ Especialidad creada:', createResponse.data);
    const createdId = createResponse.data.id;
    
    // 3. Obtener especialidad por ID
    console.log(`\n3️⃣ Obteniendo especialidad con ID ${createdId}...`);
    const getResponse = await apiClient.get(`/api/catalogs/specialties/${createdId}/`);
    console.log('✅ Especialidad obtenida:', getResponse.data);
    
    // 4. Actualizar especialidad
    console.log(`\n4️⃣ Actualizando especialidad con ID ${createdId}...`);
    const updateData = {
      ...testSpecialty,
      name: 'Especialidad de Prueba EDITADA',
      consultation_price: 200.00
    };
    
    const updateResponse = await apiClient.put(`/api/catalogs/specialties/${createdId}/`, updateData);
    console.log('✅ Especialidad actualizada:', updateResponse.data);
    
    // 5. Eliminar especialidad
    console.log(`\n5️⃣ Eliminando especialidad con ID ${createdId}...`);
    await apiClient.delete(`/api/catalogs/specialties/${createdId}/`);
    console.log('✅ Especialidad eliminada correctamente');
    
    console.log('\n🎉 TODAS LAS PRUEBAS CRUD PASARON EXITOSAMENTE');
    return { success: true };
    
  } catch (error) {
    console.error('\n❌ ERROR EN PRUEBA CRUD:', error);
    console.error('   Status:', error.response?.status);
    console.error('   Data:', error.response?.data);
    return { success: false, error };
  }
};

/**
 * Función para diagnosticar problemas comunes
 */
export const diagnoseSpecialtyIssues = async () => {
  console.log('🔧 DIAGNÓSTICO DE PROBLEMAS DE ESPECIALIDADES');
  console.log('=============================================');
  
  // Verificar variables de entorno
  console.log('\n📋 Variables de entorno:');
  console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  
  // Verificar tokens de autenticación
  console.log('\n🔐 Tokens de autenticación:');
  const authToken = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');
  console.log('Auth Token:', authToken ? '✅ Presente' : '❌ Ausente');
  console.log('Refresh Token:', refreshToken ? '✅ Presente' : '❌ Ausente');
  
  // Verificar conectividad básica
  console.log('\n🌐 Verificando conectividad básica...');
  try {
    const response = await fetch('http://localhost:8000/api/');
    console.log('✅ Backend responde - Status:', response.status);
  } catch (error) {
    console.log('❌ Backend no responde:', error.message);
    console.log('💡 Solución: Asegúrate de que el backend esté corriendo en http://localhost:8000');
  }
  
  // Verificar endpoints específicos
  console.log('\n🎯 Verificando endpoints específicos...');
  const endpoints = [
    '/api/auth/profile/',
    '/api/catalogs/',
    '/api/catalogs/specialties/',
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await apiClient.get(endpoint);
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.response?.status || error.message}`);
    }
  }
};

// Exportar función para usar en la consola del navegador
window.testSpecialtyConnection = testSpecialtyConnection;
window.testSpecialtyCRUD = testSpecialtyCRUD;
window.diagnoseSpecialtyIssues = diagnoseSpecialtyIssues;

export default {
  testSpecialtyConnection,
  testSpecialtyCRUD,
  diagnoseSpecialtyIssues
};