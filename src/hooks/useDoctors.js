import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor } from '../services/doctorService';
import { toast } from 'react-hot-toast';

// Clave para la cache de doctores
const DOCTORS_QUERY_KEY = 'doctors';

/**
 * Hook para obtener la lista de doctores
 */
export const useGetDoctors = (params = {}) => {
  return useQuery({
    queryKey: [DOCTORS_QUERY_KEY, params],
    queryFn: () => getDoctors(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1, // Solo intentar una vez más si falla
    refetchOnWindowFocus: false, // No recargar al cambiar de pestaña
    onError: (error) => {
      console.error('Error al obtener doctores:', error);
      toast.error('Error al cargar la lista de doctores');
    }
  });
};

/**
 * Hook para obtener un doctor por su ID
 */
export const useGetDoctorById = (id) => {
  return useQuery({
    queryKey: [DOCTORS_QUERY_KEY, id],
    queryFn: () => getDoctorById(id),
    enabled: !!id, // Solo ejecutar si hay un ID
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error(`Error al obtener el doctor con ID ${id}:`, error);
      toast.error('Error al cargar los datos del doctor');
    }
  });
};

/**
 * Hook para crear un nuevo doctor
 */
export const useCreateDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => {
      console.log('Datos enviados para crear doctor:', data);
      return createDoctor(data);
    },
    onSuccess: (data) => {
      console.log('Doctor creado exitosamente:', data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [DOCTORS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error al crear doctor:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
};

/**
 * Hook para actualizar un doctor
 */
export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log(`Actualizando doctor ${id} con datos:`, data);
      return updateDoctor(id, data);
    },
    onSuccess: (data, variables) => {
      console.log('Doctor actualizado exitosamente:', data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [DOCTORS_QUERY_KEY] });
      // Actualizar doctor específico en la cache
      queryClient.setQueryData([DOCTORS_QUERY_KEY, variables.id], data);
    },
    onError: (error) => {
      console.error('Error al actualizar doctor:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
};

/**
 * Hook para eliminar un doctor
 */
export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      console.log(`Eliminando doctor con ID: ${id}`);
      return deleteDoctor(id);
    },
    onSuccess: (_, id) => {
      console.log(`Doctor con ID ${id} eliminado exitosamente`);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [DOCTORS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error al eliminar doctor:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
};
