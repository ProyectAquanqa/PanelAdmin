import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createAppointment, 
  updateAppointment, 
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
  markNoShow
} from '../../services/appointment';

// Clave para la cache de citas
const APPOINTMENTS_QUERY_KEY = 'appointments';

/**
 * Hook para crear una nueva cita
 */
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => {
      console.log('Datos enviados para crear cita:', data);
      return createAppointment(data);
    },
    onSuccess: (data) => {
      console.log('Cita creada exitosamente:', data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, 'today'] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, 'upcoming'] });
    },
    onError: (error) => {
      console.error('Error al crear cita:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
};

/**
 * Hook para actualizar una cita
 */
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log(`Actualizando cita ${id} con datos:`, data);
      return updateAppointment(id, data);
    },
    onSuccess: (data, variables) => {
      console.log('Cita actualizada exitosamente:', data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, 'today'] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, 'upcoming'] });
      // Actualizar cita específica en la cache
      queryClient.setQueryData([APPOINTMENTS_QUERY_KEY, variables.id], data);
    },
    onError: (error) => {
      console.error('Error al actualizar cita:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
};

/**
 * Hook para cancelar una cita
 */
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }) => {
      console.log(`Cancelando cita ${id} con razón:`, reason);
      return cancelAppointment(id, { reason });
    },
    onSuccess: (data, variables) => {
      console.log(`Cita ${variables.id} cancelada exitosamente:`, data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, 'today'] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, 'upcoming'] });
      // Actualizar cita específica en la cache
      queryClient.setQueryData([APPOINTMENTS_QUERY_KEY, variables.id], data);
    },
    onError: (error) => {
      console.error('Error al cancelar cita:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
};

/**
 * Hook para reprogramar una cita
 */
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log(`Reprogramando cita ${id} con datos:`, data);
      return rescheduleAppointment(id, data);
    },
    onSuccess: (data, variables) => {
      console.log(`Cita ${variables.id} reprogramada exitosamente:`, data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, 'today'] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, 'upcoming'] });
      // Actualizar cita específica en la cache
      queryClient.setQueryData([APPOINTMENTS_QUERY_KEY, variables.id], data);
    },
    onError: (error) => {
      console.error('Error al reprogramar cita:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
};

/**
 * Hook para marcar una cita como completada
 */
export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      console.log(`Marcando cita ${id} como completada`);
      return completeAppointment(id);
    },
    onSuccess: (data, id) => {
      console.log(`Cita ${id} completada exitosamente:`, data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, 'today'] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, 'upcoming'] });
      // Actualizar cita específica en la cache
      queryClient.setQueryData([APPOINTMENTS_QUERY_KEY, id], data);
    },
    onError: (error) => {
      console.error('Error al completar cita:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
};

/**
 * Hook para marcar una cita como no presentada
 */
export const useMarkNoShow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      console.log(`Marcando cita ${id} como no presentada`);
      return markNoShow(id);
    },
    onSuccess: (data, id) => {
      console.log(`Cita ${id} marcada como no presentada exitosamente:`, data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, 'today'] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, 'upcoming'] });
      // Actualizar cita específica en la cache
      queryClient.setQueryData([APPOINTMENTS_QUERY_KEY, id], data);
    },
    onError: (error) => {
      console.error('Error al marcar cita como no presentada:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
}; 