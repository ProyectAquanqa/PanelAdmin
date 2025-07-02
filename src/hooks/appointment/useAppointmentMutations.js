import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import * as appointmentService from '../../services/appointment/appointmentApiService';

// Clave para la cache de citas
const APPOINTMENTS_QUERY_KEY = 'appointments';

/**
 * Hook para crear una nueva cita
 */
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: appointmentService.createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error al crear cita:', error);
      toast.error(error.response?.data?.detail || 'Error al crear la cita');
    },
  });
};

/**
 * Hook para actualizar una cita
 */
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, appointmentData }) => appointmentService.updateAppointment(id, appointmentData),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, id] });
    },
    onError: (error) => {
      console.error('Error al actualizar cita:', error);
      toast.error(error.response?.data?.detail || 'Error al actualizar la cita');
    },
  });
};

/**
 * Hook para cancelar una cita
 */
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }) => appointmentService.cancelAppointment(id, { reason }),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, id] });
      toast.success('Cita cancelada exitosamente');
    },
    onError: (error) => {
      console.error('Error al cancelar cita:', error);
      toast.error(error.response?.data?.detail || 'Error al cancelar la cita');
    },
  });
};

/**
 * Hook para reprogramar una cita
 */
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => appointmentService.rescheduleAppointment(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, id] });
      toast.success('Cita reprogramada exitosamente');
    },
    onError: (error) => {
      console.error('Error al reprogramar cita:', error);
      toast.error(error.response?.data?.detail || 'Error al reprogramar la cita');
    },
  });
};

/**
 * Hook para marcar una cita como completada
 */
export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => appointmentService.completeAppointment(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, id] });
      toast.success('Cita marcada como completada');
    },
    onError: (error) => {
      console.error('Error al completar cita:', error);
      toast.error(error.response?.data?.detail || 'Error al completar la cita');
    },
  });
};

/**
 * Hook para marcar una cita como no presentada
 */
export const useMarkNoShow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => appointmentService.markNoShow(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, id] });
      toast.success('Cita marcada como no presentada');
    },
    onError: (error) => {
      console.error('Error al marcar cita como no presentada:', error);
      toast.error(error.response?.data?.detail || 'Error al marcar la cita');
    },
  });
}; 