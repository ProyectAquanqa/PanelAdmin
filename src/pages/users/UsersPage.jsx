import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  FunnelIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useGetUsers, useDeleteUser, useToggleUserActive } from '../../hooks/useUsers';
import UserFormModal from '../../components/users/UserFormModal';
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

export default function UsersPage() {
  const { theme } = useTheme();
  
  // Estados para los filtros y modales
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // OBTENER TODOS LOS USUARIOS UNA VEZ
  const { 
    data: allUsersData, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useGetUsers();

  // MUTACIONES
  const deleteUserMutation = useDeleteUser();
  const toggleUserActiveMutation = useToggleUserActive();

  // FILTRADO EN FRONTEND
  const usersToDisplay = useMemo(() => {
    if (!allUsersData?.results) return [];

    let filteredUsers = allUsersData.results;

    // Filtrar por estado
    if (statusFilter !== 'ALL') {
      const isActive = statusFilter === 'ACTIVE';
      filteredUsers = filteredUsers.filter(user => user.is_active === isActive);
    }
    
    // Filtrar por rol
    if (roleFilter !== 'ALL') {
      filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
    }
    
    // Filtrar por término de búsqueda
    if (debouncedSearchTerm) {
      const lowercasedFilter = debouncedSearchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        (user.first_name?.toLowerCase() || '').includes(lowercasedFilter) ||
        (user.last_name?.toLowerCase() || '').includes(lowercasedFilter) ||
        user.email.toLowerCase().includes(lowercasedFilter)
      );
    }
    
    return filteredUsers;
  }, [allUsersData, statusFilter, roleFilter, debouncedSearchTerm]);

  // Función para abrir modal de edición
  const handleEdit = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  // Función para abrir modal de creación
  const handleCreate = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  // Función para eliminar usuario
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await deleteUserMutation.mutateAsync(id);
        toast.success('Usuario eliminado exitosamente');
      } catch (error) {
        toast.error('Error al eliminar el usuario');
      }
    }
  };

  // Función para renderizar estado
  const renderStatus = (status) => {
    return (
      <span 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          status
            ? theme === 'dark' ? 'bg-green-900/20 text-green-400 border border-green-500/20' : 'bg-green-100 text-green-800'
            : theme === 'dark' ? 'bg-red-900/20 text-red-400 border border-red-500/20' : 'bg-red-100 text-red-800'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status ? 'bg-green-400' : 'bg-red-400'
        }`}></span>
        {status ? 'Activo' : 'Inactivo'}
      </span>
    );
  };

  // Función para renderizar rol con íconos
  const renderRole = (role) => {
    const roleConfig = {
      PATIENT: {
        label: 'Paciente',
        icon: UserIcon,
        className: theme === 'dark'
          ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/20'
          : 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      },
      DOCTOR: {
        label: 'Doctor',
        icon: ShieldCheckIcon,
        className: theme === 'dark'
          ? 'bg-blue-900/20 text-blue-400 border border-blue-500/20'
          : 'bg-blue-100 text-blue-800 border border-blue-200',
      },
      ADMIN: {
        label: 'Administrador',
        icon: UserGroupIcon,
        className: theme === 'dark'
          ? 'bg-purple-900/20 text-purple-400 border border-purple-500/20'
          : 'bg-purple-100 text-purple-800 border border-purple-200',
      },
    };

    const config = roleConfig[role] || {
      label: role,
      icon: UserIcon,
      className: theme === 'dark'
        ? 'bg-neutral-900/20 text-neutral-400 border border-neutral-500/20'
        : 'bg-gray-100 text-gray-800 border border-gray-200',
    };

    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${config.className}`}>
        <IconComponent className="w-3 h-3 mr-1.5" />
        {config.label}
      </span>
    );
  };

  // Renderizar mensaje de error o carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-3"
        >
          <div className="w-12 h-12 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Cargando usuarios...</p>
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
            <h3 className="text-sm font-medium">Error al cargar los usuarios</h3>
            <div className="mt-2 text-sm">
              <p>{error?.message || 'Ha ocurrido un error inesperado.'}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  const totalUsers = allUsersData?.count || 0;

  return (
    <div className="space-y-6">
      {/* Encabezado mejorado */}
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
            <h1 className={`text-3xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}> 
              <UserGroupIcon className="h-8 w-8 text-primary-600 mr-3" />
              Gestión de Usuarios
            </h1>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>Administra usuarios del sistema hospitalario</p>
            <div className={`mt-3 flex items-center space-x-4 text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}> 
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
                {usersToDisplay.filter(u => u.is_active).length} activos
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-1.5"></span>
                {totalUsers} total
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
              Nuevo Usuario
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filtros y búsqueda mejorados */}
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Búsqueda */}
          <div className="flex-1 max-w-lg">
            <label htmlFor="search" className="sr-only">Buscar usuarios</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors ${theme === 'dark' ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                placeholder="Buscar por nombre, email o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-3">
            <FunnelIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-400'}`} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`block w-full px-3 py-2.5 border rounded-lg focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors ${theme === 'dark' ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="ALL">Todos los roles</option>
              <option value="PATIENT">Pacientes</option>
              <option value="DOCTOR">Doctores</option>
              <option value="ADMIN">Administradores</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`block w-full px-3 py-2.5 border rounded-lg focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors ${theme === 'dark' ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="ALL">Todos los estados</option>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Lista de usuarios mejorada */}
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
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Usuario</th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Rol</th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Contacto</th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Estado</th>
                <th scope="col" className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'bg-neutral-800 divide-neutral-700' : 'bg-white divide-gray-200'}`}>
              {usersToDisplay.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <UserIcon className={`h-12 w-12 mb-4 ${theme === 'dark' ? 'text-neutral-600' : 'text-gray-300'}`} />
                      <h3 className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-900'}`}>
                        {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                          ? 'No se encontraron usuarios'
                          : 'No hay usuarios registrados'}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>
                        {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                          ? 'Intenta con otros filtros o términos de búsqueda.'
                          : 'Comienza creando un nuevo usuario.'}
                      </p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                usersToDisplay.map((user) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`transition-colors ${theme === 'dark' ? 'hover:bg-neutral-700' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-11 w-11">
                          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.first_name ? 
                                `${user.first_name.charAt(0)}${user.last_name?.charAt(0) || ''}`.toUpperCase() :
                                user.email.charAt(0).toUpperCase()
                              }
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.first_name ? `${user.first_name} ${user.last_name}` : 'Sin nombre'}</div>
                          <div className={`text-sm flex items-center ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>
                            <EnvelopeIcon className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                          {user.document_number && (
                            <div className={`text-xs ${theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'}`}>Doc: {user.document_number}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderRole(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.phone && (
                        <div className={`text-sm flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <PhoneIcon className={`h-4 w-4 mr-1 ${theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'}`} />
                          {user.phone}
                        </div>
                      )}
                      {!user.phone && (
                        <span className={`text-sm italic ${theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'}`}>Sin teléfono</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatus(user.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(user)}
                          className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-primary-400 hover:text-primary-300 hover:bg-primary-900/20' : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50'}`}
                          title="Editar usuario"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(user.id)}
                          className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
                          title="Eliminar usuario"
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

      {/* Modal de formulario */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={currentUser}
      />
    </div>
  );
}