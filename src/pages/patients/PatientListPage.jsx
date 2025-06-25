import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useGetPatients, useDeletePatient } from '../../hooks/usePatients';
import PatientFormModal from '../../components/patients/PatientFormModal';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

// Custom debounce function
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function PatientListPage() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset page when search term changes
  useEffect(() => {
    setPage(1);
    setIsSearching(true);
  }, [debouncedSearchTerm]);

  // Obtener la lista de pacientes
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useGetPatients({ 
    search: debouncedSearchTerm,
    page,
    page_size: pageSize 
  });

  // Reset searching state when data is loaded
  useEffect(() => {
    if (!isLoading) {
      setIsSearching(false);
    }
  }, [isLoading]);

  // Mutación para eliminar paciente
  const deletePatient = useDeletePatient();

  // Función para abrir modal de edición
  const handleEdit = (patient) => {
    console.log('🔄 Abriendo modal de edición para paciente:', patient);
    
    if (!patient || !patient.id) {
      console.error('❌ Error: Intentando editar un paciente sin ID');
      toast.error('Error: No se puede editar este paciente');
      return;
    }
    
    // Asegurarse de que el ID es un número
    const patientId = parseInt(patient.id, 10);
    if (isNaN(patientId)) {
      console.error(`❌ Error: ID de paciente inválido: ${patient.id}`);
      toast.error('Error: ID de paciente inválido');
      return;
    }
    
    // Crear una copia del paciente para evitar problemas de referencia
    const patientToEdit = {
      ...patient,
      id: patientId
    };
    
    console.log('✅ Datos del paciente a editar:', patientToEdit);
    setCurrentPatient(patientToEdit);
    setIsModalOpen(true);
  };

  // Función para abrir modal de creación
  const handleCreate = () => {
    setCurrentPatient(null);
    setIsModalOpen(true);
  };

  // Función para eliminar paciente
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
      try {
        await deletePatient.mutateAsync(id);
        toast.success('Paciente eliminado exitosamente');
      } catch (error) {
        toast.error('Error al eliminar el paciente');
      }
    }
  };

  // Función para calcular la edad a partir de la fecha de nacimiento
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Renderizar mensaje de error o carga
  if (isLoading && !isSearching) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-3"
        >
          <div className="w-12 h-12 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Cargando pacientes...</p>
        </motion.div>
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`$${
          theme === 'dark' 
            ? 'bg-red-900/20 border-red-500/20 text-red-400' 
            : 'bg-red-50 border-red-200 text-red-700'
        } border p-6 rounded-xl`}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">Error al cargar los pacientes</h3>
            <div className="mt-2 text-sm">
              <p>{error?.message || 'Ha ocurrido un error inesperado.'}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Obtener datos paginados
  console.log('Estructura completa de la respuesta:', data);
  
  let patients = [];
  let totalPatients = 0;
  
  if (data) {
    // Ahora el servicio siempre devuelve un objeto con results y count
    patients = data.results || [];
    totalPatients = data.count || patients.length;
    
    console.log('Datos procesados:', { 
      totalPatients, 
      patientsLength: patients.length,
      firstPatient: patients.length > 0 ? patients[0] : null 
    });
  }
  
  const totalPages = Math.max(1, Math.ceil(totalPatients / pageSize));

  // Función auxiliar para formatear el género
  const formatGender = (gender) => {
    if (!gender) return 'No especificado';
    
    // Mapeo de valores de género
    const genderMap = {
      'MALE': 'Masculino',
      'FEMALE': 'Femenino',
      'OTHER': 'Otro',
      'M': 'Masculino',
      'F': 'Femenino',
      'O': 'Otro'
    };
    
    return genderMap[gender] || 'No especificado';
  };

  // Función auxiliar para formatear el tipo de sangre
  const formatBloodType = (bloodType) => {
    if (!bloodType) return 'No especificado';
    
    // Mapeo de formatos largos a cortos
    const bloodTypeMap = {
      'A_POSITIVE': 'A+',
      'A_NEGATIVE': 'A-',
      'B_POSITIVE': 'B+',
      'B_NEGATIVE': 'B-',
      'AB_POSITIVE': 'AB+',
      'AB_NEGATIVE': 'AB-',
      'O_POSITIVE': 'O+',
      'O_NEGATIVE': 'O-',
    };
    
    // Si es formato largo, convertir a formato corto
    if (bloodType in bloodTypeMap) {
      return bloodTypeMap[bloodType];
    }
    
    // Si ya está en formato corto, devolverlo directamente
    const validShortFormats = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (validShortFormats.includes(bloodType)) {
      return bloodType;
    }
    
    // Si no es un formato reconocido
    return 'No válido';
  };

  // Renderizar fila de paciente
  const renderPatientRow = (patient) => {
    return (
      <motion.tr 
        key={patient.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`${
          theme === 'dark' ? 'hover:bg-neutral-800' : 'hover:bg-gray-50'
        } transition-colors`}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-neutral-800' : 'bg-gray-100'
            }`}>
              <UserIcon className={`h-6 w-6 ${
                theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
              }`} />
            </div>
            <div className="ml-4">
              <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {patient.full_name || `${patient.first_name} ${patient.last_name}`}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>
                {formatGender(patient.gender)}
              </div>

            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <IdentificationIcon className={`h-5 w-5 mr-2 ${
              theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
            }`} />
            <span className={theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}>
              {patient.document_number}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <EnvelopeIcon className={`h-5 w-5 mr-2 ${
              theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
            }`} />
            <span className={theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}>
              {patient.user_email || patient.user?.email || 'No disponible'}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <PhoneIcon className={`h-5 w-5 mr-2 ${
              theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
            }`} />
            <span className={theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}>
              {patient.phone || 'No disponible'}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <CalendarIcon className={`h-5 w-5 mr-2 ${
              theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
            }`} />
            <div>
              <div className={theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}>
                {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString() : 'No disponible'}
              </div>
              {patient.birth_date && (
                <div className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>
                  {calculateAge(patient.birth_date)} años
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            !patient.blood_type ? 
              theme === 'dark' ? 'bg-neutral-700 text-neutral-300' : 'bg-gray-200 text-gray-800' :
            formatBloodType(patient.blood_type).includes('+') ? 
              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {formatBloodType(patient.blood_type)}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => handleEdit(patient)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleDelete(patient.id)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-red-900/20 text-red-400 hover:text-red-300' 
                  : 'hover:bg-red-50 text-red-500 hover:text-red-700'
              }`}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </td>
      </motion.tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado mejorado */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`$${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700' 
            : 'bg-white border-gray-200'
        } shadow-sm border rounded-xl p-6`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-3xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}> 
              <UserIcon className="h-8 w-8 text-primary-600 mr-3" />
              Pacientes
            </h1>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>Gestiona la información de los pacientes del hospital</p>
            <div className={`mt-3 flex items-center space-x-4 text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}> 
              <span className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-1"></span>
                {totalPatients} pacientes
              </span>
            </div>
          </div>
          <div className="mt-6 sm:mt-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Paciente
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filtros y búsqueda */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`$${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700' 
            : 'bg-white border-gray-200'
        } shadow-sm border rounded-xl p-6`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Búsqueda */}
          <div className="flex-1 max-w-lg">
            <label htmlFor="search" className="sr-only">Buscar pacientes</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors ${theme === 'dark' ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                placeholder="Buscar por nombre, documento o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <AnimatePresence>
              {(isLoading || isSearching) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-2 text-sm flex items-center ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}
                >
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Buscando...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Lista de pacientes */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`$${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700' 
            : 'bg-white border-gray-200'
        } shadow-sm border rounded-xl overflow-hidden`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className={theme === 'dark' ? 'bg-neutral-900' : 'bg-gray-50'}>
              <tr>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Paciente</th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Documento</th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Email</th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Teléfono</th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Fecha Nacimiento</th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Tipo Sangre</th>
                <th scope="col" className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'bg-neutral-800 divide-neutral-700' : 'bg-white divide-gray-200'}`}>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <UserIcon className={`h-12 w-12 mb-4 ${theme === 'dark' ? 'text-neutral-600' : 'text-gray-300'}`} />
                      <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-900'}`}>No hay pacientes</h3>
                      <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>{searchTerm ? 'No se encontraron pacientes con esos criterios de búsqueda.' : 'Aún no hay pacientes registrados en el sistema.'}</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCreate}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Agregar paciente
                      </motion.button>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                patients.map((patient) => renderPatientRow(patient))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {patients.length > 0 && (
          <div className={`px-4 py-3 flex items-center justify-between border-t sm:px-6 ${theme === 'dark' ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}`}>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'}`}>
                  Mostrando <span className="font-medium">{(page - 1) * pageSize + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(page * pageSize, totalPatients)}</span>{' '}
                  de <span className="font-medium">{totalPatients}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage((old) => Math.max(old - 1, 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium transition-colors ${
                      page === 1
                        ? theme === 'dark' ? 'border-neutral-700 bg-neutral-800 text-neutral-600 cursor-not-allowed' : 'border-gray-300 bg-white text-gray-300 cursor-not-allowed'
                        : theme === 'dark' ? 'border-neutral-600 bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {[...Array(totalPages).keys()].map((x) => {
                    const pageNumber = x + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                          page === pageNumber
                            ? 'z-10 bg-primary-600 border-primary-600 text-white'
                            : theme === 'dark' ? 'bg-neutral-800 border-neutral-600 text-neutral-300 hover:bg-neutral-700' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((old) => Math.min(old + 1, totalPages))}
                    disabled={page === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium transition-colors ${
                      page === totalPages
                        ? theme === 'dark' ? 'border-neutral-700 bg-neutral-800 text-neutral-600 cursor-not-allowed' : 'border-gray-300 bg-white text-gray-300 cursor-not-allowed'
                        : theme === 'dark' ? 'border-neutral-600 bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal de formulario */}
      <PatientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={currentPatient}
      />
    </div>
  );
}