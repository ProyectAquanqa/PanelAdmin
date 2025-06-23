import { useState, useEffect } from 'react';
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
import { useGetUsers, useDeleteUser } from '../../hooks/useUsers';
import UserFormModal from '../../components/users/UserFormModal';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset page when search term changes
  useEffect(() => {
    setPage(1);
    setIsSearching(true);
  }, [debouncedSearchTerm, roleFilter]);

  // Obtener la lista de usuarios
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useGetUsers({ 
    search: debouncedSearchTerm,
    role: roleFilter,
    page,
    page_size: pageSize 
  });

  // Reset searching state when data is loaded
  useEffect(() => {
    if (!isLoading) {
      setIsSearching(false);
    }
  }, [isLoading]);

  // Mutación para eliminar usuario
  const deleteUser = useDeleteUser();

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
        await deleteUser.mutateAsync(id);
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
  if (isLoading && !isSearching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#033662] rounded-full border-t-transparent animate-spin"></div>
          <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`${
        theme === 'dark' 
          ? 'bg-red-900/20 border-red-500/20 text-red-400' 
          : 'bg-red-50 border border-red-200 text-red-700'
      } p-6 rounded-xl`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">
              Error al cargar los usuarios
            </h3>
            <div className="mt-2 text-sm">
              <p>{error?.message || 'Ha ocurrido un error inesperado.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Obtener datos paginados (normalizados como especialidades)
  console.log('Estructura completa de la respuesta:', data);
  
  const users = data?.results || [];
  const totalUsers = data?.count || 0;
  
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  return (
    <div className="space-y-6">
      {/* Encabezado mejorado */}
      <div className={`${
        theme === 'dark' 
          ? 'bg-neutral-800 border-neutral-700' 
          : 'bg-white border-gray-200'
      } shadow-sm border rounded-xl p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-3xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <UserGroupIcon className="h-8 w-8 text-[#033662] mr-3" />
              Gestión de Usuarios
            </h1>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>
              Administra usuarios del sistema hospitalario
            </p>
            <div className={`mt-3 flex items-center space-x-4 text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                {users.filter(u => u.is_active).length} activos
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                {totalUsers} total
              </span>
            </div>
          </div>
          <div className="mt-6 sm:mt-0">
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#033662] to-[#044b88] hover:from-[#022a52] hover:to-[#033d73] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#033662] transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda mejorados */}
      <div className={`${
        theme === 'dark' 
          ? 'bg-neutral-800 border-neutral-700' 
          : 'bg-white border-gray-200'
      } shadow-sm border rounded-xl p-6`}>
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
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg ${
                  theme === 'dark'
                    ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400 focus:ring-blue-500 focus:border-blue-500'
                    : 'border-gray-300 focus:ring-[#033662] focus:border-[#033662]'
                } sm:text-sm transition-colors`}
                placeholder="Buscar por nombre, email o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {(isLoading || isSearching) && (
              <div className="mt-2 flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-[#033662] rounded-full border-t-transparent mr-2"></div>
                <span className={`text-xs ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Buscando...</span>
              </div>
            )}
          </div>

          {/* Filtro por rol */}
          <div className="flex items-center space-x-3">
            <FunnelIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-400'}`} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`block w-40 px-3 py-2.5 border rounded-lg ${
                theme === 'dark'
                  ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400 focus:ring-blue-500 focus:border-blue-500'
                  : 'border-gray-300 focus:ring-[#033662] focus:border-[#033662]'
              } sm:text-sm transition-colors`}
            >
              <option value="">Todos los roles</option>
              <option value="PATIENT">Pacientes</option>
              <option value="DOCTOR">Doctores</option>
              <option value="ADMIN">Administradores</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de usuarios mejorada */}
      <div className={`${
        theme === 'dark' 
          ? 'bg-neutral-800 border-neutral-700' 
          : 'bg-white border-gray-200'
      } shadow-sm border rounded-xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${
            theme === 'dark' ? 'divide-neutral-700' : 'divide-gray-200'
          }`}>
            <thead className={theme === 'dark' ? 'bg-neutral-900' : 'bg-gray-50'}>
              <tr>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>
                  Usuario
                </th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>
                  Rol
                </th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>
                  Contacto
                </th>
                <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>
                  Estado
                </th>
                <th scope="col" className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                }`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`${
              theme === 'dark' ? 'divide-y divide-neutral-700' : 'divide-y divide-gray-200'
            }`}>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <UserIcon className={`h-12 w-12 mb-4 ${
                        theme === 'dark' ? 'text-neutral-600' : 'text-gray-300'
                      }`} />
                      <h3 className={`text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-900'
                      }`}>
                        {isSearching ? 'Buscando usuarios...' : 'No se encontraron usuarios'}
                      </h3>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'
                      }`}>
                        {!isSearching && !searchTerm && !roleFilter && 'Comienza creando un nuevo usuario'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className={`transition-colors ${
                    theme === 'dark' ? 'hover:bg-neutral-700' : 'hover:bg-gray-50'
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-11 w-11">
                          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#033662] to-[#044b88] flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.first_name ? 
                                `${user.first_name.charAt(0)}${user.last_name?.charAt(0) || ''}`.toUpperCase() :
                                user.email.charAt(0).toUpperCase()
                              }
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {user.first_name ? `${user.first_name} ${user.last_name}` : 'Sin nombre'}
                          </div>
                          <div className={`text-sm flex items-center ${
                            theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                          }`}>
                            <EnvelopeIcon className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                          {user.document_number && (
                            <div className={`text-xs ${
                              theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
                            }`}>
                              Doc: {user.document_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderRole(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.phone && (
                        <div className={`text-sm flex items-center ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          <PhoneIcon className={`h-4 w-4 mr-1 ${
                            theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
                          }`} />
                          {user.phone}
                        </div>
                      )}
                      {!user.phone && (
                        <span className={`text-sm italic ${
                          theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
                        }`}>Sin teléfono</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatus(user.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' 
                              ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                              : 'text-[#033662] hover:text-[#022a52] hover:bg-[#033662]/10'
                          }`}
                          title="Editar usuario"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark'
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                              : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                          }`}
                          title="Eliminar usuario"
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

      {/* Paginación mejorada */}
      {totalPages > 1 && (
        <div className={`${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700' 
            : 'bg-white border-gray-200'
        } border rounded-xl px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  page === 1 
                    ? theme === 'dark' ? 'text-neutral-600 bg-neutral-800 border-neutral-700 cursor-not-allowed' : 'text-gray-300 bg-gray-50 border-gray-200 cursor-not-allowed' 
                    : theme === 'dark' ? 'text-neutral-300 bg-neutral-800 border-neutral-600 hover:bg-neutral-700' : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  page === totalPages 
                    ? theme === 'dark' ? 'text-neutral-600 bg-neutral-800 border-neutral-700 cursor-not-allowed' : 'text-gray-300 bg-gray-50 border-gray-200 cursor-not-allowed' 
                    : theme === 'dark' ? 'text-neutral-300 bg-neutral-800 border-neutral-600 hover:bg-neutral-700' : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'}`}>
                  Mostrando <span className="font-medium">{Math.min(1 + (page - 1) * pageSize, totalUsers)}</span> a{' '}
                  <span className="font-medium">{Math.min(page * pageSize, totalUsers)}</span> de{' '}
                  <span className="font-medium">{totalUsers}</span> resultados
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center rounded-l-lg px-3 py-2 text-sm font-medium border transition-colors ${
                      page === 1
                        ? theme === 'dark' ? 'text-neutral-600 bg-neutral-800 border-neutral-700 cursor-not-allowed' : 'text-gray-300 bg-gray-50 border-gray-200 cursor-not-allowed'
                        : theme === 'dark' ? 'text-neutral-300 bg-neutral-800 border-neutral-600 hover:bg-neutral-700' : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50 focus:z-20'
                    }`}
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
                            : theme === 'dark' ? 'text-neutral-300 bg-neutral-800 border-neutral-600 hover:bg-neutral-700' : 'text-gray-900 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className={`relative inline-flex items-center rounded-r-lg px-3 py-2 text-sm font-medium border transition-colors ${
                      page === totalPages
                        ? theme === 'dark' ? 'text-neutral-600 bg-neutral-800 border-neutral-700 cursor-not-allowed' : 'text-gray-300 bg-gray-50 border-gray-200 cursor-not-allowed'
                        : theme === 'dark' ? 'text-neutral-300 bg-neutral-800 border-neutral-600 hover:bg-neutral-700' : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50 focus:z-20'
                    }`}
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

      {/* Modal de formulario */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={currentUser}
      />
    </div>
  );
}