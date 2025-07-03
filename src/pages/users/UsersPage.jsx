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
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Construir objeto de filtros para la API
  const filters = useMemo(() => {
    const activeFilters = {};
    if (debouncedSearchTerm) {
      activeFilters.search = debouncedSearchTerm;
    }
    if (roleFilter !== 'ALL') {
      activeFilters.role = roleFilter;
    }
    if (statusFilter !== 'ALL') {
      activeFilters.is_active = statusFilter === 'ACTIVE';
    }
    return activeFilters;
  }, [debouncedSearchTerm, roleFilter, statusFilter]);

  // OBTENER USUARIOS CON FILTRADO DESDE EL BACKEND
  const { 
    data: usersData, 
    isLoading, 
    isError, 
    error,
    refetch,
    isFetching,
  } = useGetUsers(filters);

  // MUTACIONES
  const deleteUserMutation = useDeleteUser();
  const toggleUserActiveMutation = useToggleUserActive();

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
  
  const usersToDisplay = usersData?.results || [];
  const totalUsers = usersData?.count || 0;

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
                {usersToDisplay.filter(u => u.is_active).length} activos en esta vista
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-1.5"></span>
                {totalUsers} total de usuarios ({statusFilter.toLowerCase()})
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
        } shadow-sm border rounded-xl p-4`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <div className="relative">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Buscar por nombre, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`w-full border rounded-lg py-2 px-3 ${
                theme === 'dark' 
                  ? 'bg-neutral-700 border-neutral-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            >
              <option value="ALL">Todos los Roles</option>
              <option value="ADMIN">Administrador</option>
              <option value="DOCTOR">Doctor</option>
              <option value="PATIENT">Paciente</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full border rounded-lg py-2 px-3 ${
                theme === 'dark' 
                  ? 'bg-neutral-700 border-neutral-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            >
              <option value="ACTIVE">Activos</option>
              <option value="INACTIVE">Inactivos</option>
              <option value="ALL">Todos</option>
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
      <AnimatePresence>
        {isModalOpen && (
          <UserFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            userId={currentUser?.id}
            onSuccess={() => {
              setIsModalOpen(false);
              refetch();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}