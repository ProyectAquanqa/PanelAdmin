import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useGetDoctors, useDeleteDoctor } from '../../hooks/useDoctors';
import DoctorFormModal from '../../components/doctors/DoctorFormModal';
import { toast } from 'react-hot-toast';

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

export default function DoctorListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
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

  // Obtener la lista de doctores
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useGetDoctors({ 
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

  // Mutación para eliminar doctor
  const deleteDoctor = useDeleteDoctor();

  // Función para abrir modal de edición
  const handleEdit = (doctor) => {
    setCurrentDoctor(doctor);
    setIsModalOpen(true);
  };

  // Función para abrir modal de creación
  const handleCreate = () => {
    setCurrentDoctor(null);
    setIsModalOpen(true);
  };

  // Función para eliminar doctor
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

  // Renderizar mensaje de error o carga
  if (isLoading && !isSearching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#033662] rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-500 text-sm">Cargando doctores...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error al cargar los doctores
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error?.message || 'Ha ocurrido un error inesperado.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Obtener datos paginados
  console.log('Estructura completa de la respuesta:', data);
  
  let doctors = [];
  let totalDoctors = 0;
  
  if (data) {
    if (Array.isArray(data)) {
      doctors = data;
      totalDoctors = data.length;
    } else if (data.results && Array.isArray(data.results)) {
      doctors = data.results;
      totalDoctors = data.count || doctors.length;
    } else if (data.doctors && Array.isArray(data.doctors)) {
      doctors = data.doctors;
      totalDoctors = data.count || doctors.length;
    } else {
      console.error('Estructura de datos inesperada:', data);
      doctors = [];
      totalDoctors = 0;
    }
  }
  
  const totalPages = Math.max(1, Math.ceil(totalDoctors / pageSize));

  return (
    <div className="space-y-6">
      {/* Encabezado mejorado */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserIcon className="h-8 w-8 text-[#033662] mr-3" />
              Doctores
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona la información de los doctores del hospital
            </p>
            <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-[#033662] rounded-full mr-1"></span>
                {totalDoctors} doctores
              </span>
            </div>
          </div>
          <div className="mt-6 sm:mt-0">
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#033662] to-[#044b88] hover:from-[#022a52] hover:to-[#033d73] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#033662] transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Doctor
            </button>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Búsqueda */}
          <div className="flex-1 max-w-lg">
            <label htmlFor="search" className="sr-only">Buscar doctores</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-[#033662] focus:border-[#033662] sm:text-sm transition-colors"
                placeholder="Buscar por nombre, especialidad o CMP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {(isLoading || isSearching) && (
              <div className="mt-2 text-sm text-gray-500 flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#033662]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Buscando...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de doctores */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidades
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CMP
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <UserIcon className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {isSearching ? 'Buscando doctores...' : 'No se encontraron doctores'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {!isSearching && !searchTerm && 'Comienza agregando un nuevo doctor'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover border-2 border-[#033662]/20"
                            src={doctor.profile_image || `https://ui-avatars.com/api/?name=${doctor.first_name}+${doctor.last_name}&background=033662&color=fff`}
                            alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${doctor.first_name}+${doctor.last_name}&background=033662&color=fff`;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            Dr. {doctor.first_name} {doctor.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doctor.user?.email || doctor.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {doctor.specialties && doctor.specialties.length > 0 ? (
                          doctor.specialties.slice(0, 2).map((specialty, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#033662]/10 text-[#033662]"
                            >
                              <AcademicCapIcon className="h-3 w-3 mr-1" />
                              {specialty.specialty?.name || specialty.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">Sin especialidades</span>
                        )}
                        {doctor.specialties && doctor.specialties.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{doctor.specialties.length - 2} más
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900 flex items-center">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {doctor.user?.email || doctor.email}
                        </div>
                        {doctor.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                            {doctor.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {doctor.cmp_number || 'No registrado'}
                      </div>
                      {doctor.consultation_room && (
                        <div className="text-xs text-gray-500">
                          Consultorio: {doctor.consultation_room}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        doctor.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {doctor.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(doctor)}
                          className="p-2 text-[#033662] hover:text-[#022a52] hover:bg-[#033662]/10 rounded-lg transition-colors"
                          title="Editar doctor"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doctor.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar doctor"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border ${
                  page === 1 
                    ? 'text-gray-300 bg-gray-50 border-gray-200 cursor-not-allowed' 
                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border ${
                  page === totalPages 
                    ? 'text-gray-300 bg-gray-50 border-gray-200 cursor-not-allowed' 
                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{Math.min(1 + (page - 1) * pageSize, totalDoctors)}</span> a{' '}
                  <span className="font-medium">{Math.min(page * pageSize, totalDoctors)}</span> de{' '}
                  <span className="font-medium">{totalDoctors}</span> resultados
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center rounded-l-lg px-3 py-2 text-sm font-medium ${
                      page === 1
                        ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'text-gray-500 bg-white hover:bg-gray-50 focus:z-20'
                    } border border-gray-300`}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Números de página */}
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                          page === pageNum
                            ? 'z-10 bg-[#033662] text-white border-[#033662]'
                            : 'text-gray-900 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className={`relative inline-flex items-center rounded-r-lg px-3 py-2 text-sm font-medium ${
                      page === totalPages
                        ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'text-gray-500 bg-white hover:bg-gray-50 focus:z-20'
                    } border border-gray-300`}
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear/editar doctor */}
      <DoctorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        doctor={currentDoctor}
      />
    </div>
  );
}
