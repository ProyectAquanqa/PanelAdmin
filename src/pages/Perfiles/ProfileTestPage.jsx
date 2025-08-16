/**
 * Página de prueba para el sistema de perfiles dinámicos
 * Permite probar todas las funcionalidades implementadas
 */

import React, { useState } from 'react';
import useDynamicPermissions from '../../hooks/useDynamicPermissions';
import useProfiles from '../../hooks/useProfiles';
import { toast } from 'react-hot-toast';

const ProfileTestPage = () => {
  const {
    moduleStructure,
    permissionsStructure,
    loading: permissionsLoading,
    isReady,
    getPermissionsStats,
    createProfileWithPermissions,
    getProfileSummary
  } = useDynamicPermissions();

  const {
    profiles,
    loading: profilesLoading,
    fetchProfiles
  } = useProfiles();

  const [testResults, setTestResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Función para agregar resultado de test
  const addTestResult = (testName, success, message, data = null) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      testName,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Test 1: Cargar estructura de permisos
  const testLoadPermissions = async () => {
    addTestResult('Carga de permisos', isReady, 
      isReady ? '✅ Estructura cargada correctamente' : '❌ Error cargando estructura',
      { moduleStructure, permissionsStructure }
    );
  };

  // Test 2: Crear perfil de prueba
  const testCreateProfile = async () => {
    try {
      const testProfile = {
        name: `Perfil Test ${Date.now()}`,
        permissions: [1, 2, 3] // IDs de ejemplo
      };

      const result = await createProfileWithPermissions(testProfile);
      addTestResult('Creación de perfil', true, 
        `✅ Perfil "${testProfile.name}" creado exitosamente`, result);
      
      // Recargar perfiles después de crear
      await fetchProfiles();
      
    } catch (error) {
      addTestResult('Creación de perfil', false, 
        `❌ Error: ${error.message}`);
    }
  };

  // Test 3: Analizar perfiles existentes
  const testAnalyzeProfiles = async () => {
    if (!profiles || profiles.length === 0) {
      addTestResult('Análisis de perfiles', false, 
        '❌ No hay perfiles para analizar');
      return;
    }

    const analysis = profiles.map(profile => getProfileSummary(profile));
    addTestResult('Análisis de perfiles', true, 
      `✅ ${profiles.length} perfiles analizados`, analysis);
  };

  // Test 4: Verificar estadísticas de permisos
  const testPermissionsStats = () => {
    const stats = getPermissionsStats;
    if (stats) {
      addTestResult('Estadísticas de permisos', true, 
        `✅ Apps: ${stats.totalApps}, Modelos: ${stats.totalModels}, Permisos: ${stats.totalPermissions}`, 
        stats);
    } else {
      addTestResult('Estadísticas de permisos', false, 
        '❌ No se pudieron obtener estadísticas');
    }
  };

  // Ejecutar todos los tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      await testLoadPermissions();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      testPermissionsStats();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testAnalyzeProfiles();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testCreateProfile();
      
      // Nuevo: reconciliación de estado de permisos en UI
      try {
        // Importación dinámica para no crear dependencias fuertes
        const { default: dynamicPermissionsService } = await import('../../services/dynamicPermissionsService');
        const moduleStructure = await dynamicPermissionsService.getModulePermissionsStructure(true);
        addTestResult('Estructura para reconciliar', true, '✅ Estructura obtenida', Object.keys(moduleStructure));
      } catch (e) {
        addTestResult('Estructura para reconciliar', false, `❌ Error: ${e.message}`);
      }

      toast.success('Todas las pruebas completadas');
    } catch (error) {
      toast.error('Error ejecutando pruebas');
    } finally {
      setIsRunningTests(false);
    }
  };

  // Limpiar resultados
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Panel de Pruebas - Sistema de Perfiles Dinámicos
          </h1>
          <p className="text-gray-600">
            Prueba todas las funcionalidades del nuevo sistema de permisos dinámicos
          </p>
        </div>

        {/* Estado del sistema */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Estado de Permisos</h3>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isReady ? '✅ Listo' : '⏳ Cargando'}
            </div>
            {permissionsLoading.permissions && (
              <div className="mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Perfiles Cargados</h3>
            <div className="text-2xl font-bold text-blue-600">
              {profiles?.length || 0}
            </div>
            <div className="text-sm text-gray-500">perfiles disponibles</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Módulos Detectados</h3>
            <div className="text-2xl font-bold text-green-600">
              {Object.keys(moduleStructure || {}).length}
            </div>
            <div className="text-sm text-gray-500">módulos del sistema</div>
          </div>
        </div>

        {/* Controles de prueba */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Controles de Prueba</h2>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={runAllTests}
              disabled={isRunningTests || !isReady}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunningTests ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ejecutando...
                </>
              ) : (
                '▶️ Ejecutar Todas las Pruebas'
              )}
            </button>

            <button
              onClick={testLoadPermissions}
              disabled={isRunningTests}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              🔄 Test Carga Permisos
            </button>

            <button
              onClick={testCreateProfile}
              disabled={isRunningTests || !isReady}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              ➕ Test Crear Perfil
            </button>

            <button
              onClick={testAnalyzeProfiles}
              disabled={isRunningTests || !isReady}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              📊 Test Análisis
            </button>

            <button
              onClick={clearResults}
              disabled={isRunningTests}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              🗑️ Limpiar
            </button>
          </div>
        </div>

        {/* Resultados de las pruebas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Resultados de Pruebas
            {testResults.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({testResults.length} pruebas ejecutadas)
              </span>
            )}
          </h2>

          {testResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🧪</div>
              <p>No se han ejecutado pruebas aún</p>
              <p className="text-sm">Haz clic en "Ejecutar Todas las Pruebas" para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`border rounded-lg p-4 ${
                    result.success
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {result.testName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {result.timestamp}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        result.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.message}
                      </p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                            Ver detalles técnicos
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información del sistema */}
        {isReady && getPermissionsStats && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {getPermissionsStats.totalApps}
                </div>
                <div className="text-sm text-blue-700">Apps Django</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {getPermissionsStats.totalModels}
                </div>
                <div className="text-sm text-green-700">Modelos</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {getPermissionsStats.totalPermissions}
                </div>
                <div className="text-sm text-purple-700">Permisos Total</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(getPermissionsStats.modules).length}
                </div>
                <div className="text-sm text-orange-700">Módulos UI</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTestPage;
