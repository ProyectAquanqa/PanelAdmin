import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSpecialties, getSpecialtyById, createSpecialty, updateSpecialty, deleteSpecialty, getActiveSpecialties } from '../services/specialtyService';
import { toast } from 'react-hot-toast';

// Clave para la cache de especialidades
const SPECIALTIES_QUERY_KEY = 'specialties';
const ACTIVE_SPECIALTIES_QUERY_KEY = 'activeSpecialties';

/**
 * Hook para obtener la lista de especialidades
 */
export const useGetSpecialties = (params = {}) => {
  return useQuery({
    queryKey: [SPECIALTIES_QUERY_KEY, params],
    queryFn: () => getSpecialties(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2, // Intentar 2 veces más si falla
    refetchOnWindowFocus: false, // No recargar al cambiar de pestaña
    select: (data) => {
      // Asegurar que siempre devolvemos el formato esperado
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
      console.error('Error al obtener especialidades:', error);
      // Solo mostrar toast si es un error no relacionado con conectividad inicial
      if (error.response && error.response.status !== 404) {
        toast.error('Error al cargar la lista de especialidades');
      }
    }
  });
};

/**
 * Hook para obtener la lista de especialidades ACTIVAS (para formularios).
 * No recibe parámetros y apunta a un endpoint específico.
 */
export const useGetActiveSpecialties = () => {
  return useQuery({
    queryKey: [ACTIVE_SPECIALTIES_QUERY_KEY],
    queryFn: getActiveSpecialties, // Llama a la nueva función del servicio
    staleTime: 1000 * 60 * 10, // 10 minutos de cache
    retry: 1,
    refetchOnWindowFocus: false,
    // NORMALIZACIÓN: Asegurar que siempre devolvemos un array
    select: (data) => {
      if (Array.isArray(data)) {
        return data; // Si ya es un array, lo devolvemos
      }
      if (data && data.results && Array.isArray(data.results)) {
        return data.results; // Si es un objeto paginado, devolvemos los resultados
      }
      return []; // En cualquier otro caso, devolver un array vacío
    },
    onError: (error) => {
      console.error('Error al obtener especialidades activas:', error);
      toast.error('No se pudieron cargar las especialidades disponibles.');
    }
  });
};

/**
 * Hook para obtener una especialidad por su ID
 */
export const useGetSpecialtyById = (id) => {
  return useQuery({
    queryKey: [SPECIALTIES_QUERY_KEY, id],
    queryFn: () => getSpecialtyById(id),
    enabled: !!id, // Solo ejecutar si hay un ID
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error(`Error al obtener la especialidad con ID ${id}:`, error);
      toast.error('Error al cargar los datos de la especialidad');
    }
  });
};

/**
 * Hook para crear una nueva especialidad
 */
export const useCreateSpecialty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => {
      console.log('Datos enviados para crear especialidad:', data);
      return createSpecialty(data);
    },
    onSuccess: (data) => {
      console.log('Especialidad creada exitosamente:', data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [SPECIALTIES_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error al crear especialidad:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
};

/**
 * Hook para actualizar una especialidad
 */
export const useUpdateSpecialty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log(`Actualizando especialidad ${id} con datos:`, data);
      return updateSpecialty(id, data);
    },
    onSuccess: (data, variables) => {
      console.log('Especialidad actualizada exitosamente:', data);
      // Invalidar AMBAS caches para que se recarguen las listas donde sea necesario
      queryClient.invalidateQueries({ queryKey: [SPECIALTIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ACTIVE_SPECIALTIES_QUERY_KEY] });
      
      // Actualizar especialidad específica en la cache para una UI más rápida
      queryClient.setQueryData([SPECIALTIES_QUERY_KEY, variables.id], data);
    },
    onError: (error) => {
      console.error('Error al actualizar especialidad:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
};

/**
 * Hook para eliminar una especialidad
 */
export const useDeleteSpecialty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      console.log(`Eliminando especialidad con ID: ${id}`);
      return deleteSpecialty(id);
    },
    onSuccess: (_, id) => {
      console.log(`Especialidad con ID ${id} eliminada exitosamente`);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [SPECIALTIES_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error al eliminar especialidad:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
};
