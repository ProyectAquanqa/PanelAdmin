import { useState } from 'react';
import { 
  UserIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon, 
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser, getUserStats } from '../../services/userService';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import PatientModal from './UserModal';
import { toast } from 'react-hot-toast';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function UsersPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const queryClient = useQueryClient();
  
  // Configurar los parámetros de consulta para la API
  const queryParams = {
    page: currentPage,
    search: searchTerm || undefined,
    limit: 10
  };
  
  // Consulta para obtener pacientes
  const { 
    data: usersResponse, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['patients', queryParams],
    queryFn: () => getUsers(queryParams),
    keepPreviousData: true,
    retry: 1,
    onError: (error) => {
      console.error('Error en consulta de pacientes:', error);
      toast.error(`Error al cargar pacientes: ${error.message}`);
    }
  });

  // Consulta para obtener estadísticas
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: ['patientStats'],
    queryFn: getUserStats,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
    onError: (error) => {
      console.error('Error en consulta de estadísticas:', error);
    }
  });
  
  // Mutación para crear paciente
  const createUserMutation = useMutation({
    mutationFn: (userData) => createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      queryClient.invalidateQueries(['patientStats']);
      toast.success('Paciente creado correctamente');
    },
    onError: (error) => {
      console.error('Error al crear paciente:', error);
      toast.error('Error al crear paciente');
    }
  });

  // Mutación para actualizar paciente
  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }) => updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success('Paciente actualizado correctamente');
    },
    onError: (error) => {
      console.error('Error al actualizar paciente:', error);
      toast.error('Error al actualizar paciente');
    }
  });

  // Mutación para eliminar paciente
  const deleteUserMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      queryClient.invalidateQueries(['patientStats']);
      toast.success('Paciente eliminado correctamente');
    },
    onError: (error) => {
      console.error('Error al eliminar paciente:', error);
      toast.error('Error al eliminar paciente');
    }
  });
  
  // Extraer datos de la respuesta
  const users = usersResponse?.results || [];
  const totalPages = usersResponse ? Math.ceil(usersResponse.count / 10) : 0;
  
  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };
  
  // Manejar paginación
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  // Manejar apertura del modal de paciente
  const handleOpenUserModal = (user = null) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Manejar guardado de paciente
  const handleSaveUser = async (userData, userId = null) => {
    if (userId) {
      // Actualizar paciente existente
      return updateUserMutation.mutateAsync({ id: userId, userData });
    } else {
      // Crear nuevo paciente
      return createUserMutation.mutateAsync(userData);
    }
  };

  // Manejar confirmación de eliminación
  const handleDeleteConfirm = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  // Manejar eliminación de paciente
  const handleDeleteUser = async () => {
    if (userToDelete) {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };
  
  // Generar esqueletos para carga
  const renderSkeletons = () => {
    return Array(10).fill(0).map((_, index) => (
      <tr key={`skeleton-${index}`} className="animate-pulse">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-8"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-24"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-32"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-24"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-20"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-20 ml-auto"></div>
        </td>
      </tr>
    ));
  };
  
  return (
    <motion.div 
      className="space-y-6 pb-12"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Encabezado */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center md:justify-between"
        variants={item}
      >
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Pacientes</h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Gestión de pacientes del hospital
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            className="btn-primary"
            onClick={() => handleOpenUserModal()}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nuevo Paciente
          </button>
        </div>
      </motion.div>

      {/* Tarjetas resumen */}
      {!statsLoading && statsData && (
        <motion.div 
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={item}
        >
          <div className="card p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-primary-500/10">
                  <UserIcon className="w-5 h-5 text-primary-500" />
                </div>
              </div>
              <div className="ml-5">
                <p className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Total Pacientes
                </p>
                <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {statsData.total_patients || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <UserIcon className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="ml-5">
                <p className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Pacientes Nuevos (Mes)
                </p>
                <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {statsData.new_patients_month || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <UserIcon className="w-5 h-5 text-purple-500" />
                </div>
              </div>
              <div className="ml-5">
                <p className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Con Alergias
                </p>
                <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {statsData.patients_with_allergies || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <UserIcon className="w-5 h-5 text-orange-500" />
                </div>
              </div>
              <div className="ml-5">
                <p className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Con Cond. Crónicas
                </p>
                <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {statsData.patients_with_chronic || 0}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Filtros y búsqueda */}
      <motion.div 
        className="card p-4"
        variants={item}
      >
        <form onSubmit={handleSearch}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                className="form-input pl-10 w-full"
                placeholder="Buscar por nombre, documento o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-5 w-5 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`} />
              </div>
            </div>
            <button type="submit" className="btn-secondary">
              Buscar
            </button>
          </div>
        </form>
      </motion.div>
      
      {/* Tabla de pacientes */}
      <motion.div 
        className="card overflow-hidden"
        variants={item}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className={isDark ? 'bg-neutral-800' : 'bg-neutral-50'}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Paciente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Documento
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Teléfono
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-neutral-700' : 'divide-neutral-200'}`}>
              {isLoading ? (
                renderSkeletons()
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4">
                    <div className="text-center">
                      <div className={`p-4 mb-4 rounded ${isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-100 border border-red-200'}`}>
                        <h3 className={`text-lg font-medium ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                          Error al cargar pacientes
                        </h3>
                        <p className={`text-sm mt-2 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                          {error.message || 'Ha ocurrido un error al intentar cargar los datos de pacientes'}
                        </p>
                        {error.response?.status === 500 && (
                          <div className="mt-2">
                            <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                              Error interno del servidor (500). Verifica que la API esté configurada correctamente y el servidor esté funcionando.
                            </p>
                            <button 
                              onClick={() => refetch()} 
                              className={`mt-2 px-4 py-2 text-sm font-medium rounded-md ${isDark ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-white text-gray-700 hover:bg-gray-50'} border`}
                            >
                              Intentar nuevamente
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">
                    No se encontraron pacientes.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={`hover:${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.full_name} className="h-10 w-10 rounded-full" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                            {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {user.document_type_name || 'DNI'}: {user.document_number || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                      {user.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                      {user.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          onClick={() => handleOpenUserModal(user)}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => handleDeleteConfirm(user)}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {!isLoading && !error && totalPages > 0 && (
          <div className="flex items-center justify-between border-t dark:border-neutral-700 px-4 py-3 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md
                  ${isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-white border-neutral-300 text-neutral-700'}
                  ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'}`}
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md
                  ${isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-white border-neutral-300 text-neutral-700'}
                  ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'}`}
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-700'}`}>
                  Mostrando{' '}
                  <span className="font-medium">{(currentPage - 1) * 10 + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 10, usersResponse?.count || 0)}
                  </span>
                  {' '}de{' '}
                  <span className="font-medium">{usersResponse?.count || 0}</span>
                  {' '}resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium
                      ${isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-white border-neutral-300 text-neutral-500'}
                      ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'}`}
                  >
                    <span className="sr-only">Anterior</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let pageNumber;
                    
                    if (totalPages <= 5) {
                      pageNumber = index + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + index;
                    } else {
                      pageNumber = currentPage - 2 + index;
                    }
                    
                    const isCurrentPage = pageNumber === currentPage;
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                          ${isCurrentPage
                            ? `${isDark ? 'bg-neutral-700 text-white' : 'bg-primary-50 border-primary-500 text-primary-600'}`
                            : `${isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-white border-neutral-300 text-neutral-500'} hover:bg-neutral-50 dark:hover:bg-neutral-700`
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium
                      ${isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-white border-neutral-300 text-neutral-500'}
                      ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'}`}
                  >
                    <span className="sr-only">Siguiente</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Modal de usuario (para agregar/editar) */}
      {showUserModal && (
        <PatientModal 
          user={selectedUser} 
          onClose={() => setShowUserModal(false)} 
          onSave={handleSaveUser}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex justify-center items-center">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowDeleteConfirm(false)}
          />
          
          <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${isDark ? 'bg-neutral-800' : 'bg-white'}`}>
            <div className="mb-4">
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                Confirmar eliminación
              </h3>
              <p className={`mt-2 text-sm ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                ¿Está seguro de que desea eliminar al paciente <span className="font-semibold">{userToDelete?.full_name || `${userToDelete?.first_name || ''} ${userToDelete?.last_name || ''}`}</span>? 
                Esta acción no se puede deshacer.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteUserMutation.isLoading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDeleteUser}
                disabled={deleteUserMutation.isLoading}
              >
                {deleteUserMutation.isLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
} 