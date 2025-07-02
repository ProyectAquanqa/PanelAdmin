// ============================================================================
// 🏥 PÁGINA DE PRUEBAS: API de Pacientes
// Página para probar las llamadas a la API de pacientes
// ============================================================================

import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getPatients, getPatientById } from '../../services/user';
import { useTheme } from '../../context/ThemeContext';

export default function PatientApiTestPage() {
  const { theme } = useTheme();
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Probar obtención de lista de pacientes
  const handleTestGetPatients = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Probando getPatients...');
      const results = await getPatients();
      console.log('✅ Resultados:', results);
      setResults(results);
    } catch (error) {
      console.error('❌ Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Probar obtención de paciente por ID
  const handleTestGetPatientById = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Primero obtener lista para tener un ID válido
      const patientsList = await getPatients();
      
      if (!patientsList.results || patientsList.results.length === 0) {
        throw new Error('No hay pacientes disponibles para probar');
      }
      
      const firstPatient = patientsList.results[0];
      console.log(`🔍 Probando getPatientById con ID ${firstPatient.id}...`);
      
      const results = await getPatientById(firstPatient.id);
      console.log('✅ Resultados:', results);
      setResults(results);
    } catch (error) {
      console.error('❌ Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          🧪 Pruebas de API de Pacientes
        </h1>
        
        <div className="mt-8 space-y-6">
          {/* Botones de prueba */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleTestGetPatients}
              disabled={isLoading}
              className={`px-4 py-2 rounded ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } disabled:opacity-50`}
            >
              Probar getPatients
            </button>
            
            <button
              onClick={handleTestGetPatientById}
              disabled={isLoading}
              className={`px-4 py-2 rounded ${
                theme === 'dark'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } disabled:opacity-50`}
            >
              Probar getPatientById
            </button>
          </div>
          
          {/* Estado de carga */}
          {isLoading && (
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
              <p className={theme === 'dark' ? 'text-neutral-300' : 'text-gray-600'}>
                Ejecutando prueba...
              </p>
            </div>
          )}
          
          {/* Mensaje de error */}
          {error && (
            <div className={`p-4 rounded-lg ${
              theme === 'dark'
                ? 'bg-red-900/20 border border-red-500/20 text-red-400'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <h3 className="font-medium">Error</h3>
              <p className="mt-1">{error}</p>
            </div>
          )}
          
          {/* Resultados */}
          {results && !error && (
            <div className={`p-4 rounded-lg ${
              theme === 'dark'
                ? 'bg-neutral-800 border border-neutral-700'
                : 'bg-white border border-gray-200'
            }`}>
              <h3 className={`font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Resultados
              </h3>
              <pre className={`mt-2 p-4 rounded ${
                theme === 'dark'
                  ? 'bg-neutral-900 text-neutral-300'
                  : 'bg-gray-50 text-gray-800'
              } overflow-auto`}>
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 