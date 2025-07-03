import React, { useState, useEffect, useMemo } from 'react';
import { useGetDoctors, useDeleteDoctor } from '../../hooks/useDoctors';
import { useNavigate } from 'react-router-dom';
import DoctorFormModal from '../../components/doctors/DoctorFormModal';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useGetAllSpecialties } from '../../hooks/useDoctorSpecialties';
import { useCheckDoctorAvailability } from '../../hooks/useAvailability';

// Hook para debounce de búsqueda
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Componente para el indicador de disponibilidad
const AvailabilityIndicator = ({ doctorId }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { hasAvailability, isLoading } = useCheckDoctorAvailability(doctorId);
  
  if (isLoading) {
    return (
      <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin"></div>
    );
  }
  
  if (!hasAvailability) {
    return (
      <div className="inline-flex items-center">
        <ExclamationCircleIcon 
          className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} 
          title="Sin horarios configurados"
        />
        <span className={`ml-1 text-xs ${isDark ? 'text-amber-400' : 'text-amber-500'}`}>
          Sin horarios
        </span>
      </div>
    );
  }
  
  return null;
};

const DoctorListPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  
  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms es suficiente
  const [filterType, setFilterType] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  // Estados para los modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  // 1. OBTENER TODOS LOS DOCTORES UNA SOLA VEZ
  const { 
    data: allDoctorsData, 
    isLoading: isLoadingDoctors, 
    error,
    refetch 
  } = useGetDoctors(); // Sin parámetros para traerlos todos

  // Forzar la recarga de datos cuando la página vuelve a tener foco
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Limpieza al desmontar el componente
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetch]);

  // Mutación para eliminar (desactivar)
  const deleteDoctorMutation = useDeleteDoctor();

  // 2. LÓGICA DE FILTRADO EN EL FRONTEND
  const doctorsToDisplay = useMemo(() => {
    if (!allDoctorsData?.results) {
      return [];
    }

    let filtered = allDoctorsData.results;

    // Filtrar por estado (is_active)
    if (statusFilter !== 'ALL') {
      const isActive = statusFilter === 'ACTIVE';
      filtered = filtered.filter(doctor => doctor.is_active === isActive);
    }
    
    // Filtrar por tipo
    if (filterType !== 'ALL') {
      filtered = filtered.filter(doctor => doctor.doctor_type === filterType);
    }
    
    // Filtrar por término de búsqueda
    if (debouncedSearchTerm) {
      const lowercasedFilter = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(doctor => 
        doctor.first_name.toLowerCase().includes(lowercasedFilter) ||
        doctor.last_name.toLowerCase().includes(lowercasedFilter) ||
        doctor.cmp_number?.toLowerCase().includes(lowercasedFilter) ||
        doctor.user?.email.toLowerCase().includes(lowercasedFilter)
      );
    }
    
    return filtered;
  }, [allDoctorsData, statusFilter, filterType, debouncedSearchTerm]);

  // Obtener todas las especialidades para el mapeo
  const { data: specialtiesData } = useGetAllSpecialties();
  const specialtiesMap = React.useMemo(() => {
    const map = new Map();
    if (specialtiesData && specialtiesData.results) {
      specialtiesData.results.forEach(specialty => {
        map.set(specialty.id, specialty);
      });
    }
    return map;
  }, [specialtiesData]);
  
  // Renderizar especialidades con mejor manejo de errores
  const renderSpecialties = (doctor) => {
    // Si no hay especialidades o no es un array
    if (!doctor.specialties || !Array.isArray(doctor.specialties) || doctor.specialties.length === 0) {
      return <span className="text-gray-400 text-xs italic">Sin especialidades</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {doctor.specialties.map(specialty => {
          // El backend ahora envía el objeto de especialidad completo
          if (!specialty || !specialty.id || !specialty.name) {
            return null;
          }
          
          return (
            <span
              key={specialty.id}
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                ${isDark ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-800'}`}
            >
              {specialty.name}
            </span>
          );
        }).filter(Boolean)}
      </div>
    );
  };

  // Renderizar acciones para cada doctor
  const renderActions = (doctor) => {
    return (
      <div className="flex items-center justify-end space-x-2">
        <AvailabilityIndicator doctorId={doctor.id} />
        <button
          onClick={() => navigate(`/doctors/availability/${doctor.id}`)}
          className={`p-1.5 rounded-md ${
            isDark 
              ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-800/50' 
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
          title="Ver disponibilidad"
        >
          <CalendarDaysIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleEditDoctor(doctor)}
          className={`p-1.5 rounded-md ${
            isDark 
              ? 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-800/50' 
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          }`}
          title="Editar doctor"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDeleteClick(doctor)}
          className={`p-1.5 rounded-md ${
            isDark 
              ? 'bg-red-900/30 text-red-300 hover:bg-red-800/50' 
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
          title={doctor.is_active ? "Desactivar doctor" : "Activar doctor"}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Handlers
  const openCreateModal = () => {
    setSelectedDoctor(null);
    setIsModalOpen(true);
  };
  
  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (doctor) => {
    setDoctorToDelete(doctor);
    setShowDeleteConfirm(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!doctorToDelete) return;
    try {
      await deleteDoctorMutation.mutateAsync(doctorToDelete.id);
      toast.success('Doctor desactivado correctamente');
      setShowDeleteConfirm(false);
      setDoctorToDelete(null);
      refetch();
    } catch (error) {
      toast.error('Error al desactivar el doctor');
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };
  
  const handleSuccess = () => {
    closeModal();
    refetch();
  };

  // Renderizar mensaje de error o carga
  if (isLoadingDoctors) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-3"
        >
          <div className="w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Cargando doctores...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${
          isDark 
            ? 'bg-red-900/20 border-red-500/20 text-red-400' 
            : 'bg-red-50 border-red-200 text-red-700'
        } border p-6 rounded-xl`}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
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

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Gestión de Doctores
            </h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
            Administre los doctores del sistema y sus especialidades
            </p>
            </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={openCreateModal}
            className={`inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
              isDark 
                ? 'bg-primary-600 hover:bg-primary-700 text-white border-primary-700' 
                : 'bg-primary-600 hover:bg-primary-700 text-white border-primary-600'
            }`}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nuevo Doctor
            </button>
          <button
            onClick={() => navigate('/doctors/availability')}
            className={`inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700' 
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
            }`}
          >
            <CalendarDaysIcon className="h-4 w-4 mr-2" />
            Gestionar Horarios
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } shadow-sm border rounded-xl p-6`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Búsqueda */}
          <div className="flex-1 max-w-lg">
            <label htmlFor="search" className="sr-only">Buscar doctores</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Buscar por nombre, email o CMP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`rounded-lg border py-2.5 px-3 focus:ring-indigo-600 focus:border-indigo-600 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="ALL">Todos los tipos</option>
              <option value="PRIMARY">Médico general</option>
              <option value="SPECIALIST">Especialista</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`rounded-lg border py-2.5 px-3 focus:ring-indigo-600 focus:border-indigo-600 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="ALL">Todos los estados</option>
              <option value="ACTIVE">Activos</option>
              <option value="INACTIVE">Inactivos</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Tabla de Doctores con indicador de carga sutil */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} rounded-xl overflow-hidden`}>
          <div className="overflow-x-auto">
            {doctorsToDisplay.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={isDark ? 'bg-gray-900' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Doctor
                    </th>
                    <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Especialidades
                    </th>
                    <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Contacto
                    </th>
                    <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Estado
                    </th>
                    <th scope="col" className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'bg-neutral-800 divide-neutral-700' : 'bg-white divide-gray-200'}`}>
                  {doctorsToDisplay.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center"
                        >
                          <AcademicCapIcon className={`h-12 w-12 mb-4 ${isDark ? 'text-neutral-600' : 'text-gray-300'}`} />
                          <h3 className={`text-sm font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-gray-900'}`}>
                            {debouncedSearchTerm || filterType !== 'ALL' || statusFilter !== 'ALL' 
                              ? 'No se encontraron doctores' 
                              : 'No hay doctores registrados'}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                            {debouncedSearchTerm || filterType !== 'ALL' || statusFilter !== 'ALL' 
                              ? 'Intenta con otros criterios de búsqueda.' 
                              : 'Comienza creando un nuevo doctor.'}
                          </p>
                        </motion.div>
                      </td>
                    </tr>
                  ) : (
                    doctorsToDisplay.map((doctor) => (
                      <motion.tr
                        key={doctor.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                              isDark ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              <UserIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {doctor.first_name} {doctor.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                CMP: {doctor.cmp_number}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {renderSpecialties(doctor)}
                        </td>
                        <td className={`px-5 py-4 text-sm whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center">
                              <PhoneIcon className={`w-4 h-4 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span>{doctor.phone || 'No disponible'}</span>
                            </div>
                            {doctor.user?.email && (
                              <div className="flex items-center">
                                <EnvelopeIcon className={`w-4 h-4 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                <span>{doctor.user.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className={`px-5 py-4 text-sm whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            doctor.is_active
                              ? isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
                              : isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'
                          }`}>
                            {doctor.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          {renderActions(doctor)}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <UserIcon className={`h-12 w-12 mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                    <h3 className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>No hay doctores</h3>
                    <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {searchTerm || filterType !== 'ALL' || statusFilter !== 'ALL' 
                        ? 'No se encontraron doctores con esos criterios de búsqueda.' 
                        : 'Aún no hay doctores registrados en el sistema.'}
                    </p>
                  </motion.div>
                </td>
              </tr>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modal de formulario */}
      <DoctorFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
        doctor={selectedDoctor}
      />

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white rounded-lg p-6 max-w-sm w-full mx-4 ${isDark ? 'bg-gray-800' : ''}`}
          >
            <div className="p-4 sm:p-6 text-center overflow-y-auto">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ¿Desactivar Doctor?
                </h3>
                <div className="mt-2">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Esta acción marcará al doctor como inactivo y no podrá ser asignado a nuevas citas. El registro no se eliminará y podrá ser reactivado más tarde desde los filtros.
                  </p>
                </div>
              </div>
            </div>
            <div className={`px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm
                  ${isDark ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'}`}
              >
                Sí, desactivar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DoctorListPage;
