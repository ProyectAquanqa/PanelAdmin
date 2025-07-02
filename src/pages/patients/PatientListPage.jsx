import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  UserIcon,
  CalendarIcon,
  CakeIcon,
  BeakerIcon,
  EyeIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { useGetPatients } from '../../hooks/usePatients';
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
  const navigate = useNavigate();
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

  // Función para ver detalles del paciente
  const handleViewDetails = (patient) => {
    console.log('👁️ Abriendo detalles del paciente:', patient);
    
    if (!patient || !patient.id) {
      console.error('❌ Error: Intentando ver un paciente sin ID');
      toast.error('Error: No se puede ver este paciente');
      return;
    }
    
    // Asegurarse de que el ID es un número
    const patientId = parseInt(patient.id, 10);
    if (isNaN(patientId)) {
      console.error(`❌ Error: ID de paciente inválido: ${patient.id}`);
      toast.error('Error: ID de paciente inválido');
      return;
    }
    
    const patientToView = {
      ...patient,
      id: patientId
    };
    
    console.log('✅ Datos del paciente a ver:', patientToView);
    setCurrentPatient(patientToView);
    setIsModalOpen(true);
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

  const tableHeaders = [
    { key: 'paciente', label: 'Paciente', icon: UserIcon },
    { key: 'contacto', label: 'Información de Contacto', icon: MagnifyingGlassIcon },
    { key: 'edad', label: 'Edad', icon: CakeIcon },
    { key: 'sangre', label: 'Tipo Sangre', icon: BeakerIcon },
    { key: 'genero', label: 'Género', icon: UserIcon },
    { key: 'acciones', label: 'Acciones', icon: EyeIcon },
  ];

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
  const patients = data?.results || [];
  const totalPatients = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalPatients / pageSize));

  // Renderizar fila de paciente
  const renderPatientRow = (patient) => {
    const age = calculateAge(patient.birth_date);
    const fullName = patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim();

    return (
      <motion.tr
        key={patient.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`transition-colors ${
          theme === 'dark' 
            ? 'hover:bg-neutral-800/50' 
            : 'hover:bg-gray-50'
        }`}
      >
        {/* Paciente */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-neutral-700' : 'bg-gray-100'}`}>
              <UserIcon className={`h-6 w-6 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-400'}`} />
            </div>
            <div className="ml-4">
              <div className={`text-sm font-medium ${theme === 'dark' ? 'text-neutral-200' : 'text-gray-900'}`}>
                {fullName}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'}`}>
                DNI: {patient.document_number || 'No disponible'}
              </div>
            </div>
          </div>
        </td>
        
        {/* Contacto */}
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <div className={`font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>{patient.user_email || patient.email}</div>
          <div className={`${theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'}`}>{patient.phone || 'No disponible'}</div>
        </td>
        {/* Edad */}
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <div className={`font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>{age !== null ? `${age} años` : 'N/A'}</div>
          <div className={`${theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'}`}>
            {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString() : 'Fecha no disp.'}
          </div>
        </td>
        {/* Tipo de sangre */}
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            theme === 'dark'
              ? 'bg-sky-900 text-sky-300'
              : 'bg-sky-100 text-sky-800'
            }`}
          >
            {formatBloodType(patient.blood_type)}
          </span>
        </td>
        {/* Género */}
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <div className={`font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>
            {formatGender(patient.gender)}
          </div>
        </td>
        {/* Acciones */}
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                handleViewDetails(patient);
              }}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark' 
                  ? 'text-neutral-400 hover:bg-neutral-700 hover:text-white' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-primary-600'
              }`}
              aria-label="Ver detalles del paciente"
            >
              <EyeIcon className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/patients/${patient.id}/appointments`);
              }}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark' 
                  ? 'text-neutral-400 hover:bg-neutral-700 hover:text-white' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-primary-600'
              }`}
              aria-label="Ver historial de citas"
            >
              <CalendarDaysIcon className="h-5 w-5" />
            </button>
          </div>
        </td>
      </motion.tr>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-6 md:p-8 rounded-3xl ${
        theme === 'dark' 
          ? 'bg-neutral-900/50' 
          : 'bg-white'
      }`}
    >
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Gestión de Pacientes</h1>
        <p className={`${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'} mt-2`}>
          Visualiza y gestiona la información de los pacientes registrados en el sistema.
        </p>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className={`pointer-events-none absolute top-3.5 left-4 h-5 w-5 ${theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`block w-full rounded-full border-0 py-3 pl-11 pr-4 sm:text-sm ${
              theme === 'dark' 
                ? 'bg-neutral-800 text-white placeholder:text-neutral-500 ring-1 ring-inset ring-neutral-700 focus:ring-2 focus:ring-inset focus:ring-primary-500' 
                : 'bg-gray-50 text-gray-900 placeholder:text-gray-400 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-primary-500'
            }`}
          />
        </div>
      </div>

      {/* Tabla de pacientes */}
      <div className="overflow-x-auto">
        <div className={`border rounded-lg ${theme === 'dark' ? 'border-neutral-800' : 'border-gray-200'}`}>
          <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-neutral-800' : 'divide-gray-200'}`}>
            <thead className={`${theme === 'dark' ? 'bg-neutral-800/50' : 'bg-gray-50'}`}>
              <tr>
                {tableHeaders.map((header) => (
                  <th
                    key={header.key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider"
                  >
                    <div className={`flex items-center ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>
                      <header.icon className="h-4 w-4 mr-2" />
                      {header.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-neutral-800 bg-neutral-900' : 'divide-gray-200 bg-white'}`}>
              <AnimatePresence>
                {patients.length > 0 ? (
                  patients.map(renderPatientRow)
                ) : (
                  <tr>
                    <td colSpan={tableHeaders.length} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <MagnifyingGlassIcon className={`h-12 w-12 ${theme === 'dark' ? 'text-neutral-600' : 'text-gray-400'}`} />
                        <h3 className={`mt-2 text-sm font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-900'}`}>
                          No se encontraron pacientes
                        </h3>
                        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'}`}>
                          Intenta ajustar los términos de búsqueda.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'}`}>
            Página <span className="font-medium">{page}</span> de <span className="font-medium">{totalPages}</span>
          </p>
          <div className="flex-1 flex justify-end space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                theme === 'dark'
                  ? 'border-neutral-700 bg-neutral-800 text-neutral-300 disabled:opacity-50 hover:bg-neutral-700'
                  : 'border-gray-300 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50'
              }`}
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || patients.length === 0}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                theme === 'dark'
                  ? 'border-neutral-700 bg-neutral-800 text-neutral-300 disabled:opacity-50 hover:bg-neutral-700'
                  : 'border-gray-300 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50'
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal para detalles del paciente */}
      {isModalOpen && currentPatient && (
        <PatientFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          patient={currentPatient}
        />
      )}
    </motion.div>
  );
}