// ============================================================================
// 🏥 PÁGINA DE PRUEBA: Patient API Test Page
// Página para probar la comunicación con la API de pacientes
// ============================================================================

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useTheme } from '../../context/ThemeContext';
import { getPatients, getPatientById, createPatient, updatePatient } from '../../services/patientService';
import testPatientApiConnection from '../../utils/testPatientConnection';

export default function PatientApiTestPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Estados para las diferentes pruebas
  const [connectionTest, setConnectionTest] = useState({ status: 'idle', data: null });
  const [getListTest, setGetListTest] = useState({ status: 'idle', data: null });
  const [getByIdTest, setGetByIdTest] = useState({ status: 'idle', data: null });
  const [createTest, setCreateTest] = useState({ status: 'idle', data: null });
  const [updateTest, setUpdateTest] = useState({ status: 'idle', data: null });
  
  // Estado para el ID de paciente a probar
  const [patientId, setPatientId] = useState('');
  
  // Ejecutar test de conexión al cargar la página
  useEffect(() => {
    runConnectionTest();
  }, []);

  // Probar conexión con API
  const runConnectionTest = async () => {
    try {
      setConnectionTest({ status: 'loading', data: null });
      const results = await testPatientApiConnection();
      setConnectionTest({ status: 'success', data: results });
    } catch (error) {
      setConnectionTest({ status: 'error', error });
    }
  };

  // Probar obtención de lista
  const runGetListTest = async () => {
    try {
      setGetListTest({ status: 'loading', data: null });
      const results = await getPatients();
      setGetListTest({ status: 'success', data: results });
      
      // Si hay pacientes, usar el primer ID para la siguiente prueba
      if (results.results?.length > 0) {
        setPatientId(results.results[0].id.toString());
      }
    } catch (error) {
      setGetListTest({ status: 'error', error });
    }
  };

  // Probar obtención por ID
  const runGetByIdTest = async () => {
    if (!patientId) {
      alert('Ingresa un ID de paciente válido');
      return;
    }
    
    try {
      setGetByIdTest({ status: 'loading', data: null });
      const results = await getPatientById(patientId);
      setGetByIdTest({ status: 'success', data: results });
    } catch (error) {
      setGetByIdTest({ status: 'error', error });
    }
  };

  // Probar creación
  const runCreateTest = async () => {
    // Datos para el nuevo paciente
    const timestamp = Date.now();
    const newPatient = {
      email: `test${timestamp}@example.com`,
      password: "password123",
      document_number: timestamp.toString().substring(0, 8),
      first_name: "Test",
      last_name: "Patient",
      birth_date: new Date().toISOString().split('T')[0],
      gender: "OTHER", // Al backend llega como 'O'
      phone: "987654321"
    };
    
    try {
      setCreateTest({ status: 'loading', data: null });
      const results = await createPatient(newPatient);
      setCreateTest({ status: 'success', data: results });
      
      // Usar ID para la próxima prueba
      if (results && results.id) {
        setPatientId(results.id.toString());
      }
    } catch (error) {
      setCreateTest({ status: 'error', error });
    }
  };

  // Probar actualización
  const runUpdateTest = async () => {
    if (!patientId) {
      alert('Ingresa un ID de paciente válido o crea un nuevo paciente');
      return;
    }
    
    // Datos para actualizar
    const updatedData = {
      first_name: "Updated",
      last_name: "Patient",
      blood_type: "A_POSITIVE" // Al backend llega como 'A+'
    };
    
    try {
      setUpdateTest({ status: 'loading', data: null });
      const results = await updatePatient(patientId, updatedData);
      setUpdateTest({ status: 'success', data: results });
    } catch (error) {
      setUpdateTest({ status: 'error', error });
    }
  };

  // Estilos según el tema
  const cardClass = `rounded-lg p-4 shadow ${isDark ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-gray-200'}`;
  const headingClass = `text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`;
  const buttonClass = `px-4 py-2 font-medium rounded-lg ${isDark ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-primary-500 hover:bg-primary-600 text-white'}`;
  const inputClass = `w-full p-2 rounded-lg border ${isDark ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`;
  const preClass = `mt-3 p-2 rounded-lg text-sm font-mono overflow-auto max-h-56 ${isDark ? 'bg-neutral-900 text-neutral-300' : 'bg-gray-100 text-gray-800'}`;
  
  // Función para renderizar estado de prueba
  const renderTestStatus = (test) => {
    if (test.status === 'loading') {
      return (
        <div className="flex items-center mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
          <span className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>Ejecutando prueba...</span>
        </div>
      );
    }
    
    if (test.status === 'error') {
      return (
        <div className="mt-2">
          <p className="text-red-500">Error: {test.error?.message || 'Error desconocido'}</p>
          {test.error?.response && (
            <pre className={preClass}>
              {JSON.stringify(test.error.response.data || {}, null, 2)}
            </pre>
          )}
        </div>
      );
    }
    
    if (test.status === 'success') {
      return (
        <div className="mt-2">
          <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'} mb-1`}>✅ Prueba exitosa</p>
          <pre className={preClass}>
            {JSON.stringify(test.data || {}, null, 2)}
          </pre>
        </div>
      );
    }
    
    return null;
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          🧪 Pruebas API de Pacientes
        </h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Test de conexión */}
          <div className={cardClass}>
            <h2 className={headingClass}>Test de Conexión</h2>
            <button onClick={runConnectionTest} className={buttonClass} disabled={connectionTest.status === 'loading'}>
              Probar Conexión
            </button>
            {renderTestStatus(connectionTest)}
          </div>
          
          {/* Get Lista de Pacientes */}
          <div className={cardClass}>
            <h2 className={headingClass}>Obtener Lista de Pacientes</h2>
            <button onClick={runGetListTest} className={buttonClass} disabled={getListTest.status === 'loading'}>
              Obtener Lista
            </button>
            {renderTestStatus(getListTest)}
          </div>
          
          {/* Get Paciente por ID */}
          <div className={cardClass}>
            <h2 className={headingClass}>Obtener Paciente por ID</h2>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="ID del paciente"
                className={inputClass}
              />
              <button
                onClick={runGetByIdTest}
                className={buttonClass}
                disabled={getByIdTest.status === 'loading'}
              >
                Obtener
              </button>
            </div>
            {renderTestStatus(getByIdTest)}
          </div>
          
          {/* Crear Paciente */}
          <div className={cardClass}>
            <h2 className={headingClass}>Crear Paciente</h2>
            <button
              onClick={runCreateTest}
              className={buttonClass}
              disabled={createTest.status === 'loading'}
            >
              Crear Paciente de Prueba
            </button>
            <p className="text-xs mt-2 text-neutral-400">
              Se crearán datos aleatorios para el paciente
            </p>
            {renderTestStatus(createTest)}
          </div>
          
          {/* Actualizar Paciente */}
          <div className={cardClass}>
            <h2 className={headingClass}>Actualizar Paciente</h2>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="ID del paciente"
                className={inputClass}
              />
              <button
                onClick={runUpdateTest}
                className={buttonClass}
                disabled={updateTest.status === 'loading'}
              >
                Actualizar
              </button>
            </div>
            <p className="text-xs mt-1 text-neutral-400">
              Actualiza nombre y tipo de sangre
            </p>
            {renderTestStatus(updateTest)}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 