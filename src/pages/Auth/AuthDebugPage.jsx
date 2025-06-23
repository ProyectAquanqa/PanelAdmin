import { useState } from 'react';
import { runAllAuthTests, checkAuthStatus } from '../../utils/authDebugUtils';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthDebugPage() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleRunTests = async () => {
    setIsLoading(true);
    try {
      const testResults = await runAllAuthTests();
      setResults(testResults);
    } catch (error) {
      console.error('Error al ejecutar pruebas:', error);
      setResults({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCheckStatus = () => {
    const status = checkAuthStatus();
    setResults({
      authStatus: status,
      timestamp: new Date().toISOString()
    });
  };
  
  const handleClearTokens = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    handleCheckStatus();
  };
  
  const handleLogout = async () => {
    await logout();
    handleCheckStatus();
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Depuración de Autenticación</h1>
        <button 
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Ir a Login
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Acciones</h2>
          <div className="space-y-3">
            <button
              onClick={handleRunTests}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
            >
              {isLoading ? 'Ejecutando pruebas...' : 'Ejecutar todas las pruebas'}
            </button>
            
            <button
              onClick={handleCheckStatus}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Verificar estado actual
            </button>
            
            <button
              onClick={handleClearTokens}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Limpiar tokens locales
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cerrar sesión completa
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Estado actual</h2>
          {results?.authStatus ? (
            <div>
              <div className="mb-2">
                <span className="font-medium">Token de acceso: </span>
                <span className={results.authStatus.hasAuthToken ? "text-green-600" : "text-red-600"}>
                  {results.authStatus.hasAuthToken ? "Presente" : "No encontrado"}
                </span>
              </div>
              
              <div className="mb-2">
                <span className="font-medium">Token de refresco: </span>
                <span className={results.authStatus.hasRefreshToken ? "text-green-600" : "text-red-600"}>
                  {results.authStatus.hasRefreshToken ? "Presente" : "No encontrado"}
                </span>
              </div>
              
              {results.authStatus.authTokenAnalysis && !results.authStatus.authTokenAnalysis.error && (
                <div className="mb-2">
                  <span className="font-medium">Estado del token: </span>
                  <span className={results.authStatus.authTokenAnalysis.isValid ? "text-green-600" : "text-red-600"}>
                    {results.authStatus.authTokenAnalysis.isValid ? "Válido" : "Expirado o inválido"}
                  </span>
                  {results.authStatus.authTokenAnalysis.expiration && (
                    <span className="block text-sm text-gray-500">
                      {results.authStatus.authTokenAnalysis.expiration.timeRemaining}
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Ejecuta una prueba para ver el estado</p>
          )}
        </div>
      </div>
      
      {results && (
        <div className="bg-white rounded shadow p-4 mb-8">
          <h2 className="text-lg font-semibold mb-3">Resultados de las pruebas</h2>
          <div className="text-sm text-gray-500 mb-4">
            Ejecutado: {new Date(results.timestamp).toLocaleString()}
          </div>
          
          {results.error ? (
            <div className="p-3 bg-red-100 text-red-700 rounded">
              Error: {results.error}
            </div>
          ) : (
            <div className="space-y-6">
              {results.endpointTests && (
                <div>
                  <h3 className="text-md font-medium mb-2">Pruebas de endpoints</h3>
                  
                  {results.endpointTests.success ? (
                    <div className="p-3 bg-green-100 text-green-700 rounded mb-3">
                      ✅ Se encontraron endpoints de autenticación funcionando
                    </div>
                  ) : (
                    <div className="p-3 bg-red-100 text-red-700 rounded mb-3">
                      ❌ No se encontró ningún endpoint de autenticación funcionando
                    </div>
                  )}
                  
                  {results.endpointTests.recommendedEndpoint && (
                    <div className="p-3 bg-blue-100 text-blue-700 rounded mb-3">
                      Endpoint recomendado: <code>{results.endpointTests.recommendedEndpoint}</code>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.endpointTests.workingEndpoints.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Endpoints funcionando:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {results.endpointTests.workingEndpoints.map((endpoint, index) => (
                            <li key={index} className="text-green-600">
                              {endpoint.endpoint} - Status: {endpoint.status}
                              <div className="text-xs text-gray-500">
                                Respuesta: {endpoint.responseStructure.join(', ')}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {results.endpointTests.failedEndpoints.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Endpoints fallidos:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {results.endpointTests.failedEndpoints.map((endpoint, index) => (
                            <li key={index} className="text-red-600">
                              {endpoint.endpoint} - Status: {endpoint.status || 'Error'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {results.authStatus && results.authStatus.authTokenAnalysis && !results.authStatus.authTokenAnalysis.error && (
                <div>
                  <h3 className="text-md font-medium mb-2">Análisis del token de acceso</h3>
                  <div className="overflow-auto max-h-60 p-3 bg-gray-100 rounded">
                    <pre className="text-xs">
                      {JSON.stringify(results.authStatus.authTokenAnalysis, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="text-sm text-gray-500">
        <p>Esta página es solo para depuración y no debe estar disponible en producción.</p>
      </div>
    </div>
  );
} 