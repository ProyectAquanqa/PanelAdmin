import { useState, useEffect } from 'react';
import { testDoctorConnection } from '../../utils/testDoctorConnection';
import { useGetDoctors } from '../../hooks/useDoctors';
import apiClient from '../../api/apiClient';
import { API_ROUTES } from '../../config/api';

function DoctorApiTestPage() {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [directResponse, setDirectResponse] = useState(null);
  const [directUrl, setDirectUrl] = useState(API_ROUTES.DOCTORS.BASE);
  const [directLoading, setDirectLoading] = useState(false);
  
  // Usar el hook de doctores para ver si funciona
  const { data, error, isLoading: hookLoading } = useGetDoctors();
  
  const runTests = async () => {
    setIsLoading(true);
    try {
      const results = await testDoctorConnection();
      setTestResults(results);
    } catch (error) {
      console.error('Error al ejecutar pruebas:', error);
      setTestResults({
        success: false,
        error: error.message,
        message: `Error al ejecutar pruebas: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const testDirectUrl = async () => {
    setDirectLoading(true);
    try {
      const response = await apiClient.get(directUrl);
      setDirectResponse({
        success: true,
        status: response.status,
        data: response.data
      });
    } catch (error) {
      console.error('Error al probar URL directa:', error);
      setDirectResponse({
        success: false,
        status: error.response?.status,
        error: error.message,
        data: error.response?.data
      });
    } finally {
      setDirectLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Prueba de API de Doctores</h1>
      
      {/* Sección de prueba automática */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Prueba de Conexión Automática</h2>
        <button
          onClick={runTests}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Ejecutando pruebas...' : 'Ejecutar Pruebas'}
        </button>
        
        {testResults && (
          <div className="mt-4">
            <div className={`p-4 rounded ${testResults.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-medium">{testResults.success ? '✅ Éxito' : '❌ Error'}</p>
              <p>{testResults.message}</p>
            </div>
            
            <h3 className="font-medium mt-4 mb-2">Resultados detallados:</h3>
            <div className="bg-gray-100 p-4 rounded overflow-auto max-h-64">
              <pre className="text-xs">{JSON.stringify(testResults.results, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
      
      {/* Sección de prueba manual */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Prueba de URL Manual</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            placeholder="URL de la API"
          />
          <button
            onClick={testDirectUrl}
            disabled={directLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {directLoading ? 'Probando...' : 'Probar URL'}
          </button>
        </div>
        
        {directResponse && (
          <div className="mt-4">
            <div className={`p-4 rounded ${directResponse.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-medium">
                {directResponse.success ? '✅ Éxito' : '❌ Error'} - 
                Estado: {directResponse.status || 'N/A'}
              </p>
              {directResponse.error && <p className="text-red-600">{directResponse.error}</p>}
            </div>
            
            <h3 className="font-medium mt-4 mb-2">Respuesta:</h3>
            <div className="bg-gray-100 p-4 rounded overflow-auto max-h-64">
              <pre className="text-xs">{JSON.stringify(directResponse.data, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
      
      {/* Sección de resultados del hook */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Resultados del Hook useGetDoctors</h2>
        
        {hookLoading ? (
          <p>Cargando datos desde el hook...</p>
        ) : error ? (
          <div className="p-4 bg-red-100 rounded">
            <p className="font-medium">❌ Error al cargar datos</p>
            <p>{error.message}</p>
          </div>
        ) : (
          <div>
            <div className="p-4 bg-green-100 rounded mb-4">
              <p className="font-medium">✅ Datos cargados correctamente</p>
              <p>
                {data?.results ? `${data.results.length} doctores encontrados` : 'No hay datos disponibles'}
              </p>
            </div>
            
            <h3 className="font-medium mb-2">Datos:</h3>
            <div className="bg-gray-100 p-4 rounded overflow-auto max-h-64">
              <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorApiTestPage; 