// ============================================================================
// 🏥 PÁGINA DE DEBUG: Patient Debug Page
// Página para probar las funcionalidades de pacientes
// ============================================================================

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useTheme } from '../../context/ThemeContext';
import { testPatientApiConnection, formatTestResults } from '../../utils/testPatientConnection';
import { useGetPatients, useCreatePatient } from '../../hooks/usePatients';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import PatientFormModal from '../../components/patients/PatientFormModal';

// Esquema de validación para formulario rápido
const quickPatientSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  first_name: z.string().min(2, 'Mínimo 2 caracteres'),
  last_name: z.string().min(2, 'Mínimo 2 caracteres'),
  document_number: z.string().min(8, 'Mínimo 8 caracteres'),
  phone: z.string().min(9, 'Mínimo 9 caracteres'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
});

export default function PatientDebugPage() {
  const { theme } = useTheme();
  const [testResults, setTestResults] = useState(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Obtener pacientes para mostrar en la página
  const { data: patientsData, isLoading } = useGetPatients();
  const createPatient = useCreatePatient();
  
  // Form con react-hook-form para creación rápida
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(quickPatientSchema),
    defaultValues: {
      email: '',
      password: 'password123',
      first_name: 'Test',
      last_name: 'Patient',
      document_number: `${new Date().getTime()}`.substring(0, 8),
      phone: '987654321',
      gender: 'OTHER'
    }
  });
  
  // Probar conexión con API
  const handleRunConnectionTest = async () => {
    setIsRunningTest(true);
    
    try {
      const results = await testPatientApiConnection();
      setTestResults(results);
    } catch (error) {
      console.error('Error ejecutando test de conexión:', error);
      setTestResults({
        getPatients: { success: false, message: error.message },
        getPatientById: { success: false, message: error.message }
      });
    } finally {
      setIsRunningTest(false);
    }
  };
  
  useEffect(() => {
    // Ejecutar test de conexión al cargar la página
    handleRunConnectionTest();
  }, []);
  
  // Crear paciente de prueba rápido
  const onSubmitQuickForm = async (data) => {
    try {
      toast.loading('Creando paciente de prueba...');
      const result = await createPatient.mutateAsync(data);
      toast.dismiss();
      toast.success('Paciente creado correctamente');
      reset();
      return result;
    } catch (error) {
      toast.dismiss();
      toast.error(`Error al crear paciente: ${error.message}`);
      throw error;
    }
  };
  
  // Abrir el modal completo
  const handleOpenCompleteForm = () => {
    setSelectedPatient(null);
    setIsFormModalOpen(true);
  };
  
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          🧪 Pruebas de API de Pacientes
        </h1>
        
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          {/* Columna Izquierda: Test de Conexión */}
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Test de Conexión a la API
            </h2>
            
            <button
              onClick={handleRunConnectionTest}
              disabled={isRunningTest}
              className={`px-4 py-2 rounded ${
                theme === 'dark'
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
              } mb-4 disabled:opacity-50`}
            >
              {isRunningTest ? 'Ejecutando...' : 'Ejecutar Test de Conexión'}
            </button>
            
            <div className={`border rounded-lg p-4 ${
              theme === 'dark' ? 'border-neutral-700 bg-neutral-800' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-medium mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Resultados
              </h3>
              
              {isRunningTest ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                  <p className={theme === 'dark' ? 'text-neutral-300' : 'text-gray-600'}>
                    Ejecutando pruebas...
                  </p>
                </div>
              ) : testResults ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatTestResults(testResults) }}
                />
              ) : (
                <p className={theme === 'dark' ? 'text-neutral-300' : 'text-gray-600'}>
                  No hay resultados disponibles
                </p>
              )}
            </div>
          </div>
          
          {/* Columna Derecha: Creación Rápida */}
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Crear Paciente de Prueba
            </h2>
            
            <div className={`p-4 ${
              theme === 'dark'
                ? 'bg-neutral-800 border border-neutral-700'
                : 'bg-white border border-gray-200'
              } rounded-lg shadow-sm`}
            >
              <form onSubmit={handleSubmit(onSubmitQuickForm)} className="space-y-4">
                <div>
                  <label 
                    className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                    } mb-1`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full px-3 py-2 ${
                      theme === 'dark'
                        ? 'bg-neutral-700 border-neutral-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                    placeholder="paciente@ejemplo.com"
                  />
                  {errors.email && (
                    <span className="text-sm text-red-500">{errors.email.message}</span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label 
                      className={`block text-sm font-medium ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                      } mb-1`}
                    >
                      Nombre
                    </label>
                    <input
                      type="text"
                      {...register('first_name')}
                      className={`w-full px-3 py-2 ${
                        theme === 'dark'
                          ? 'bg-neutral-700 border-neutral-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                    />
                    {errors.first_name && (
                      <span className="text-sm text-red-500">{errors.first_name.message}</span>
                    )}
                  </div>
                  
                  <div>
                    <label 
                      className={`block text-sm font-medium ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                      } mb-1`}
                    >
                      Apellido
                    </label>
                    <input
                      type="text"
                      {...register('last_name')}
                      className={`w-full px-3 py-2 ${
                        theme === 'dark'
                          ? 'bg-neutral-700 border-neutral-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                    />
                    {errors.last_name && (
                      <span className="text-sm text-red-500">{errors.last_name.message}</span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label 
                      className={`block text-sm font-medium ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                      } mb-1`}
                    >
                      Documento
                    </label>
                    <input
                      type="text"
                      {...register('document_number')}
                      className={`w-full px-3 py-2 ${
                        theme === 'dark'
                          ? 'bg-neutral-700 border-neutral-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                    />
                    {errors.document_number && (
                      <span className="text-sm text-red-500">{errors.document_number.message}</span>
                    )}
                  </div>
                  
                  <div>
                    <label 
                      className={`block text-sm font-medium ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                      } mb-1`}
                    >
                      Teléfono
                    </label>
                    <input
                      type="text"
                      {...register('phone')}
                      className={`w-full px-3 py-2 ${
                        theme === 'dark'
                          ? 'bg-neutral-700 border-neutral-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                    />
                    {errors.phone && (
                      <span className="text-sm text-red-500">{errors.phone.message}</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label 
                    className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                    } mb-1`}
                  >
                    Género
                  </label>
                  <select
                    {...register('gender')}
                    className={`w-full px-3 py-2 ${
                      theme === 'dark'
                        ? 'bg-neutral-700 border-neutral-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                    <option value="OTHER">Otro</option>
                  </select>
                  {errors.gender && (
                    <span className="text-sm text-red-500">{errors.gender.message}</span>
                  )}
      </div>
      
                <div className="flex space-x-4 pt-3">
                  <button
                    type="submit"
                    disabled={createPatient.isPending}
                    className={`flex-1 px-4 py-2 rounded ${
                      theme === 'dark'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    } disabled:opacity-50`}
                  >
                    Crear Rápido
                  </button>
                  
        <button
                    type="button"
                    onClick={handleOpenCompleteForm}
                    className={`flex-1 px-4 py-2 rounded ${
                      theme === 'dark'
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-primary-500 hover:bg-primary-600 text-white'
                    }`}
                  >
                    Formulario Completo
        </button>
                </div>
              </form>
            </div>
          </div>
      </div>
      
      {/* Lista de pacientes */}
        <div className="mt-8">
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Pacientes Existentes
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className={`overflow-x-auto border ${
              theme === 'dark' ? 'border-neutral-700' : 'border-gray-200'
            } rounded-lg`}>
              <table className={`min-w-full divide-y ${
                theme === 'dark' ? 'divide-neutral-700' : 'divide-gray-200'
              }`}>
                <thead className={theme === 'dark' ? 'bg-neutral-800' : 'bg-gray-100'}>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={theme === 'dark' ? 'text-neutral-300' : 'text-gray-500'}>
                        Nombre
                      </span>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={theme === 'dark' ? 'text-neutral-300' : 'text-gray-500'}>
                        Email
                      </span>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={theme === 'dark' ? 'text-neutral-300' : 'text-gray-500'}>
                        Documento
                      </span>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <span className={theme === 'dark' ? 'text-neutral-300' : 'text-gray-500'}>
                        Teléfono
                      </span>
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                      <span className={theme === 'dark' ? 'text-neutral-300' : 'text-gray-500'}>
                        Acciones
                      </span>
                    </th>
                </tr>
              </thead>
                <tbody className={`divide-y ${
                  theme === 'dark' ? 'divide-neutral-700' : 'divide-gray-200'
                } bg-opacity-50`}>
                  {patientsData?.results && patientsData.results.length > 0 ? (
                    patientsData.results.map((patient) => (
                      <motion.tr 
                        key={patient.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={theme === 'dark' ? 'bg-neutral-900' : 'bg-white'}
                      >
                    <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {patient.full_name || `${patient.first_name} ${patient.last_name}`}
                          </div>
                          <div className={`text-xs ${
                            theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                          }`}>
                            {patient.gender === 'MALE' ? 'Masculino' :
                             patient.gender === 'FEMALE' ? 'Femenino' : 'Otro'}
                          </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-neutral-300' : 'text-gray-800'
                          }`}>
                            {patient.user_email || patient.user?.email || '-'}
                          </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-neutral-300' : 'text-gray-800'
                          }`}>
                            {patient.document_number || '-'}
                          </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-neutral-300' : 'text-gray-800'
                          }`}>
                            {patient.phone || '-'}
                          </div>
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setIsFormModalOpen(true);
                            }}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${
                              theme === 'dark'
                                ? 'bg-primary-800 hover:bg-primary-700 text-primary-100'
                                : 'bg-primary-100 hover:bg-primary-200 text-primary-700'
                            }`}
                      >
                        Editar
                      </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td 
                        colSpan="5" 
                        className={`px-6 py-8 text-center text-sm ${
                          theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                        }`}
                      >
                        No hay pacientes disponibles
                    </td>
                  </tr>
                  )}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>
      
      {/* Modal de formulario completo */}
      <PatientFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        patient={selectedPatient}
      />
    </DashboardLayout>
  );
}