// ============================================================================
// 🏥 TEST DE CONEXIÓN: API de Pacientes
// Script para verificar la comunicación con la API de pacientes
// ============================================================================

import { getPatients, getPatientById } from '../services/patientService';

/**
 * Realiza pruebas de conexión a la API de pacientes
 * @returns {Promise<Object>} Resultados de las pruebas
 */
export async function testPatientApiConnection() {
  console.log('🧪 EJECUTANDO TEST DE CONEXIÓN A API DE PACIENTES');
  console.log('=================================================');
  
  const results = {
    getPatients: { success: false, message: '', data: null },
    getPatientById: { success: false, message: '', data: null },
  };
  
  try {
    console.log('📋 Probando obtención de lista de pacientes...');
    const patientsResponse = await getPatients();
    console.log(`✅ Lista obtenida: ${patientsResponse.count} pacientes encontrados`);
    results.getPatients = { 
      success: true, 
      message: `${patientsResponse.count} pacientes encontrados`,
      data: patientsResponse 
    };
    
    // Si hay pacientes, probar obtención por ID
    if (patientsResponse.results && patientsResponse.results.length > 0) {
      const firstPatient = patientsResponse.results[0];
      console.log(`📋 Probando obtención de paciente por ID (${firstPatient.id})...`);
      
      const patientResponse = await getPatientById(firstPatient.id);
      console.log(`✅ Paciente obtenido: ${patientResponse.first_name} ${patientResponse.last_name}`);
      results.getPatientById = { 
        success: true, 
        message: `Paciente ${patientResponse.first_name} ${patientResponse.last_name} obtenido correctamente`,
        data: patientResponse
      };
    } else {
      results.getPatientById = {
        success: false,
        message: 'No hay pacientes disponibles para probar getPatientById',
        data: null
      };
    }
    
  } catch (error) {
    console.error('❌ Error en test de conexión:', error);
    
    // Registrar el error específico
    if (error.response) {
      // Error de respuesta del servidor
      console.error(`❌ Error de servidor: ${error.response.status}`);
      console.error('Datos del error:', error.response.data);
      
      if (!results.getPatients.success) {
        results.getPatients.message = `Error ${error.response.status}: ${JSON.stringify(error.response.data)}`;
      }
      
      if (!results.getPatientById.success) {
        results.getPatientById.message = `Error ${error.response.status}: ${JSON.stringify(error.response.data)}`;
      }
      
    } else if (error.request) {
      // Error de conexión (no se recibió respuesta)
      console.error('❌ No se recibió respuesta del servidor');
      
      if (!results.getPatients.success) {
        results.getPatients.message = 'No se pudo conectar con el servidor';
      }
      
      if (!results.getPatientById.success) {
        results.getPatientById.message = 'No se pudo conectar con el servidor';
      }
      
    } else {
      // Otro tipo de error
      console.error(`❌ Error: ${error.message}`);
      
      if (!results.getPatients.success) {
        results.getPatients.message = error.message;
      }
      
      if (!results.getPatientById.success) {
        results.getPatientById.message = error.message;
      }
    }
  }
  
  console.log('=================================================');
  console.log('🏁 TEST DE CONEXIÓN COMPLETADO');
  
  return results;
}

/**
 * Formatea los resultados de las pruebas para mostrarlos en la UI
 * @param {Object} results - Resultados de las pruebas
 * @returns {String} HTML formateado con los resultados
 */
export function formatTestResults(results) {
  if (!results) return 'No hay resultados disponibles';
  
  return `
    <div class="space-y-4">
      <div class="p-3 ${results.getPatients.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded">
        <h3 class="font-bold">getPatients</h3>
        <p>${results.getPatients.message}</p>
        ${
          results.getPatients.data 
            ? `<p class="text-xs opacity-75">Se encontraron ${results.getPatients.data.count} pacientes</p>` 
            : ''
        }
      </div>
      
      <div class="p-3 ${results.getPatientById.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded">
        <h3 class="font-bold">getPatientById</h3>
        <p>${results.getPatientById.message}</p>
        ${
          results.getPatientById.data 
            ? `<p class="text-xs opacity-75">ID: ${results.getPatientById.data.id}</p>` 
            : ''
        }
      </div>
    </div>
  `;
}

export default testPatientApiConnection; 