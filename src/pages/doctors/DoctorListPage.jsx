import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useGetDoctors, useDeleteDoctor } from '../../hooks/useDoctors';
import { useGetSpecialties } from '../../hooks/useSpecialties';
import DoctorFormModal from '../../components/doctors/DoctorFormModal';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function DoctorListPage() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isSearching, setIsSearching] = useState(false);
  const [filterType, setFilterType] = useState('ALL'); // ALL, PRIMARY, SPECIALIST

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Obtener especialidades para mostrar nombres en lugar de IDs
  const { data: specialtiesData } = useGetSpecialties();
  const specialties = specialtiesData?.results || [];

  useEffect(() => {
    setPage(1);
    setIsSearching(true);
  }, [debouncedSearchTerm, filterType]);

  // Determinar qué hook usar según el filtro
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useGetDoctors({ 
    search: debouncedSearchTerm,
    doctor_type: filterType !== 'ALL' ? filterType : undefined,
    page,
    page_size: pageSize 
  });

  useEffect(() => {
    if (!isLoading) {
      setIsSearching(false);
    }
  }, [isLoading]);

  const deleteDoctor = useDeleteDoctor();

  const handleEdit = (doctor) => {
    setCurrentDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentDoctor(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este doctor?')) {
      try {
        await deleteDoctor.mutateAsync(id);
        toast.success('Doctor eliminado exitosamente');
      } catch (error) {
        toast.error('Error al eliminar el doctor');
      }
    }
  };

  // Renderizar las especialidades de un doctor
  const renderSpecialties = (doctor) => {
    if (!doctor.specialties || doctor.specialties.length === 0) {
      return <span className="text-gray-400 text-xs">Sin especialidades</span>;
    }

    // Determinar las especialidades según el formato de datos
    const doctorSpecialties = doctor.specialties.map(spec => {
      // Si es un objeto con specialty anidado
      if (typeof spec === 'object' && spec.specialty) {
        return {
          id: spec.specialty.id,
          name: spec.specialty.name
        };
      }
      // Si es un objeto con id directo
      if (typeof spec === 'object' && spec.id) {
        return {
          id: spec.id,
          name: spec.name
        };
      }
      // Si es un número, buscar en la lista de especialidades
      if (typeof spec === 'number') {
        const foundSpecialty = specialties.find(s => s.id === spec);
        return {
          id: spec,
          name: foundSpecialty ? foundSpecialty.name : `ID: ${spec}`
        };
      }
      return null;
    }).filter(Boolean);

    // Mostrar hasta 2 especialidades y un contador para el resto
    return (
      <div className="flex flex-wrap gap-1">
        {doctorSpecialties.slice(0, 2).map((spec, index) => (
          <span
            key={`${doctor.id}-spec-${index}`}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {spec.name}
          </span>
        ))}
        {doctorSpecialties.length > 2 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            +{doctorSpecialties.length - 2}
          </span>
        )}
      </div>
    );
  };

  const renderStatus = (status) => {
    const isDark = theme === 'dark';
    return (
      <span 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          status 
            ? isDark 
              ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/20' 
              : 'bg-emerald-100 text-emerald-800'
            : isDark 
              ? 'bg-red-900/20 text-red-400 border border-red-500/20' 
              : 'bg-red-100 text-red-800'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status 
            ? isDark ? 'bg-emerald-400' : 'bg-emerald-500'
            : isDark ? 'bg-red-400' : 'bg-red-500'
        }`}></span>
        {status ? 'Activo' : 'Inactivo'}
      </span>
    );
  };

  if (isLoading && !isSearching) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-3"
        >
          <div className="w-12 h-12 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>
            Cargando doctores...
          </p>
        </motion.div>
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${
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
            <h3 className="text-sm font-medium">Error al cargar los doctores</h3>
            <div className="mt-2 text-sm">
              <p>{error?.message || 'Ha ocurrido un error inesperado.'}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  let doctors = [];
  let totalDoctors = 0;
  
  if (data) {
    // Ahora el servicio siempre devuelve un objeto con results y count
    doctors = data.results || [];
    totalDoctors = data.count || doctors.length;
    
    console.log('Datos procesados:', { 
      totalDoctors, 
      doctorsLength: doctors.length,
      firstDoctor: doctors.length > 0 ? doctors[0] : null 
    });
  }
  
  const totalPages = Math.max(1, Math.ceil(totalDoctors / pageSize));

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700' 
            : 'bg-white border-gray-200'
        } shadow-sm border rounded-xl p-6`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            } flex items-center`}>
              <ShieldCheckIcon className="h-8 w-8 text-primary-600 mr-3" />
              Doctores
            </h1>
            <p className={`mt-2 text-sm ${
              theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
            }`}>
              Gestiona la información de los doctores del hospital
            </p>
            <div className={`mt-3 flex items-center space-x-4 text-sm ${
              theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
            }`}>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-1"></span>
                {totalDoctors} doctores
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-1"></span>
                {doctors.filter(d => d.is_active).length} activos
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
              Nuevo Doctor
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Búsqueda */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700' 
            : 'bg-white border-gray-200'
        } shadow-sm border rounded-xl p-6`}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 max-w-lg">
            <label htmlFor="search" className="sr-only">Buscar doctores</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-400'
                }`} />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  theme === 'dark' 
                    ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Buscar por nombre, email o CMP..."
              />
            </div>
          </div>
          
          {/* Filtro por tipo de doctor */}
          <div className="flex-shrink-0">
            <label htmlFor="doctor-type" className="sr-only">Tipo de doctor</label>
            <select
              id="doctor-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`block w-full py-2.5 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                theme === 'dark' 
                  ? 'bg-neutral-700 border-neutral-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="ALL">Todos los doctores</option>
              <option value="PRIMARY">Médicos principales</option>
              <option value="SPECIALIST">Especialistas</option>
            </select>
          </div>
        </div>
        
        {isSearching && (
          <div className={`mt-4 text-sm ${
            theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
          } flex items-center`}>
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Buscando doctores...
          </div>
        )}
      </motion.div>

      {/* Tabla */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700' 
            : 'bg-white border-gray-200'
        } shadow-sm border rounded-xl overflow-hidden`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className={theme === 'dark' ? 'bg-neutral-900' : 'bg-gray-50'}>
              <tr>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>Doctor</th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>Especialidades</th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>Contacto</th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>CMP</th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>Tipo</th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>Estado</th>
                <th scope="col" className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              theme === 'dark' 
                ? 'bg-neutral-800 divide-neutral-700' 
                : 'bg-white divide-gray-200'
            }`}>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <ShieldCheckIcon className={`h-12 w-12 mb-4 ${
                        theme === 'dark' ? 'text-neutral-600' : 'text-gray-300'
                      }`} />
                      <h3 className={`text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-900'
                      }`}>
                        {isSearching ? 'Buscando doctores...' : 'No se encontraron doctores'}
                      </h3>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                      }`}>
                        {!isSearching && !searchTerm && 'Comienza agregando un nuevo doctor'}
                      </p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                doctors.map((doctor, index) => (
                  <motion.tr 
                    key={doctor.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`transition-colors ${
                      theme === 'dark' ? 'hover:bg-neutral-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-11 w-11">
                          <img
                            className="h-11 w-11 rounded-full object-cover border-2 border-primary-600/20 shadow-sm"
                            src={doctor.profile_image || `https://ui-avatars.com/api/?name=${doctor.first_name}+${doctor.last_name}&background=4f46e5&color=fff&size=44`}
                            alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${doctor.first_name}+${doctor.last_name}&background=4f46e5&color=fff&size=44`;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            Dr. {doctor.first_name} {doctor.last_name}
                          </div>
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                          }`}>
                            {doctor.user?.email || doctor.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderSpecialties(doctor)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-1.5" />
                          <span className={`${theme === 'dark' ? 'text-neutral-300' : 'text-gray-600'} text-sm`}>
                            {doctor.email || doctor.user?.email || '-'}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <PhoneIcon className="h-4 w-4 text-gray-400 mr-1.5" />
                          <span className={`${theme === 'dark' ? 'text-neutral-300' : 'text-gray-600'} text-sm`}>
                            {doctor.phone || '-'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-mono ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {doctor.cmp_number || 'No registrado'}
                      </div>
                      {doctor.consultation_room && (
                        <div className={`text-xs ${
                          theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                        }`}>
                          Consultorio: {doctor.consultation_room}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doctor.doctor_type === 'PRIMARY' 
                          ? theme === 'dark' 
                            ? 'bg-green-900/20 text-green-400 border border-green-500/20' 
                            : 'bg-green-100 text-green-800'
                          : theme === 'dark' 
                            ? 'bg-blue-900/20 text-blue-400 border border-blue-500/20' 
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {doctor.doctor_type === 'PRIMARY' ? 'Médico Principal' : 'Especialista'}
                      </span>
                      {doctor.can_refer && (
                        <div className="mt-1 flex items-center">
                          <UserGroupIcon className="h-3.5 w-3.5 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">Puede derivar</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatus(doctor.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(doctor)}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' 
                              ? 'text-primary-400 hover:text-primary-300 hover:bg-primary-900/20' 
                              : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50'
                          }`}
                          title="Editar doctor"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(doctor.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' 
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                              : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                          }`}
                          title="Eliminar doctor"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <DoctorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        doctor={currentDoctor}
      />
    </div>
  );
}
