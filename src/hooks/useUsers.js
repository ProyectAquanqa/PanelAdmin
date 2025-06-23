import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../services/userService';
import { toast } from 'react-hot-toast';

// Clave para la cache de usuarios
const USERS_QUERY_KEY = 'users';

/**
 * Hook para obtener la lista de usuarios
 */
export const useGetUsers = (params = {}) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, params],
    queryFn: () => getUsers(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2, // Intentar 2 veces más si falla
    refetchOnWindowFocus: false, // No recargar al cambiar de pestaña
    select: (data) => {
      // Asegurar que siempre devolvemos el formato esperado (como especialidades)
      if (data && data.results) {
        return data;
      }
      // Si es un array directo, normalizarlo
      if (Array.isArray(data)) {
        return {
          results: data,
          count: data.length,
          next: null,
          previous: null
        };
      }
      // Formato por defecto
      return {
        results: [],
        count: 0,
        next: null,
        previous: null
      };
    },
    onError: (error) => {
      console.error('Error al obtener usuarios:', error);
      // Solo mostrar toast si es un error no relacionado con conectividad inicial
      if (error.response && error.response.status !== 404) {
        toast.error('Error al cargar la lista de usuarios');
      }
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
    },
    onError: (error) => {
      console.error('Error al crear usuario:', error);
      // No mostrar toast aquí, se maneja en el componente
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
    },
    onError: (error) => {
      console.error('Error al actualizar usuario:', error);
      // No mostrar toast aquí, se maneja en el componente
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
    },
    onError: (error) => {
      console.error('Error al eliminar usuario:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
};