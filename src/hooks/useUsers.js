import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, getUserById, createUser, updateUser, deleteUser, activateUser, deactivateUser } from '../services/user';
import { toast } from 'react-hot-toast';

// Clave para la cache de usuarios
const USERS_QUERY_KEY = 'users';

/**
 * Hook para obtener la lista de usuarios con filtros
 */
export const useGetUsers = (filters) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, filters], // La clave de la query incluye los filtros
    queryFn: () => getUsers(filters), // Pasar filtros a la función del servicio
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    keepPreviousData: true, // Para una experiencia de usuario más fluida al cambiar filtros
    onError: (error) => {
      console.error('Error al obtener usuarios:', error);
      toast.error('Error al cargar la lista de usuarios');
    }
  });
};

/**
 * Hook para obtener un usuario por su ID
 */
export const useGetUserById = (id) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, id],
    queryFn: () => getUserById(id),
    enabled: !!id, // Solo ejecutar si hay un ID
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error(`Error al obtener el usuario con ID ${id}:`, error);
      toast.error('Error al cargar los datos del usuario');
    }
  });
};

/**
 * Hook para crear un nuevo usuario
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => {
      console.log('Datos enviados para crear usuario:', data);
      return createUser(data);
    },
    onSuccess: (data) => {
      console.log('Usuario creado exitosamente:', data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success('Usuario creado exitosamente');
    },
    onError: (error) => {
      console.error('Error al crear usuario:', error);
      // Manejar errores específicos
      if (error.response?.data) {
        // El error viene del backend
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          toast.error(errorData);
        } else if (errorData.detail) {
          toast.error(errorData.detail);
        } else {
          toast.error('Error al crear usuario');
        }
      } else {
        toast.error('Error de conexión al crear usuario');
      }
    },
  });
};

/**
 * Hook para actualizar un usuario
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log(`Actualizando usuario ${id} con datos:`, data);
      return updateUser(id, data);
    },
    onSuccess: (data, variables) => {
      console.log('Usuario actualizado exitosamente:', data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      // Actualizar usuario específico en la cache
      queryClient.setQueryData([USERS_QUERY_KEY, variables.id], data);
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Error al actualizar usuario:', error);
      // Manejar errores específicos
      if (error.response?.data) {
        // El error viene del backend
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          toast.error(errorData);
        } else if (errorData.detail) {
          toast.error(errorData.detail);
        } else {
          toast.error('Error al actualizar usuario');
        }
      } else {
        toast.error('Error de conexión al actualizar usuario');
      }
    },
  });
};

/**
 * Hook para eliminar un usuario
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      console.log(`Eliminando usuario con ID: ${id}`);
      return deleteUser(id);
    },
    onSuccess: (_, id) => {
      console.log(`Usuario con ID ${id} eliminado exitosamente`);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error al eliminar usuario:', error);
      // Manejar errores específicos
      if (error.response?.data) {
        // El error viene del backend
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          toast.error(errorData);
        } else if (errorData.detail) {
          toast.error(errorData.detail);
        } else {
          toast.error('Error al eliminar usuario');
        }
      } else {
        toast.error('Error de conexión al eliminar usuario');
      }
    },
  });
};

/**
 * Hook para activar/desactivar un usuario
 */
export const useToggleUserActive = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }) => {
      console.log(`${isActive ? 'Activando' : 'Desactivando'} usuario con ID: ${id}`);
      // Asumiendo que el servicio `toggleUserActive` existe y hace la llamada correcta
      // a /api/users/users/{id}/toggle_active/
      // Si no existe, tendríamos que crearlo en el servicio.
      // Por ahora, usamos las funciones existentes como placeholder.
      return isActive ? activateUser(id) : deactivateUser(id);
    },
    onSuccess: (_, { id, isActive }) => {
      console.log(`Usuario con ID ${id} ${isActive ? 'activado' : 'desactivado'} exitosamente`);
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success(`Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`);
    },
    onError: (error, { isActive }) => {
      console.error(`Error al ${isActive ? 'activar' : 'desactivar'} usuario:`, error);
      toast.error(`Error al ${isActive ? 'activar' : 'desactivar'} el usuario`);
    },
  });
};