import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAppointments, 
  getAppointmentById, 
  createAppointment, 
  updateAppointment, 
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
  markNoShow,
  getTodayAppointments,
  getUpcomingAppointments,
  getAvailableSlots,
  getDoctorsBySpecialty
} from '../services/appointmentService';
import { toast } from 'react-hot-toast';

// Clave para la cache de citas
const APPOINTMENTS_QUERY_KEY = 'appointments';

/**
 * Hook para obtener la lista de citas
 */
export const useGetAppointments = (params = {}) => {
  return useQuery({
    queryKey: [APPOINTMENTS_QUERY_KEY, params],
    queryFn: () => getAppointments(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1, // Solo intentar una vez más si falla
    refetchOnWindowFocus: false, // No recargar al cambiar de pestaña
    onError: (error) => {
      console.error('Error al obtener citas:', error);
      toast.error('Error al cargar la lista de citas');
    }
  });
};

/**
 * Hook para obtener las citas de hoy
 */
export const useGetTodayAppointments = () => {
  return useQuery({
    queryKey: [APPOINTMENTS_QUERY_KEY, 'today'],
    queryFn: () => getTodayAppointments(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Error al obtener citas de hoy:', error);
      toast.error('Error al cargar las citas de hoy');
    }
  });
};

/**
 * Hook para obtener las citas próximas
 */
export const useGetUpcomingAppointments = () => {
  return useQuery({
    queryKey: [APPOINTMENTS_QUERY_KEY, 'upcoming'],
    queryFn: () => getUpcomingAppointments(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Error al obtener citas próximas:', error);
      toast.error('Error al cargar las citas próximas');
    }
  });
};

/**
 * Hook para obtener una cita por su ID
 */
export const useGetAppointmentById = (id) => {
  return useQuery({
    queryKey: [APPOINTMENTS_QUERY_KEY, id],
    queryFn: () => getAppointmentById(id),
    enabled: !!id, // Solo ejecutar si hay un ID
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error(`Error al obtener la cita con ID ${id}:`, error);
      toast.error('Error al cargar los datos de la cita');
    }
  });
};

/**
 * Hook para obtener horarios disponibles
 */
export const useGetAvailableSlots = (doctorId, date) => {
  return useQuery({
    queryKey: ['availableSlots', doctorId, date],
    queryFn: () => getAvailableSlots({ doctor_id: doctorId, date }),
    enabled: !!doctorId && !!date, // Solo ejecutar si hay un ID de doctor y una fecha
    retry: 1,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log(`Horarios disponibles para doctor ${doctorId} en fecha ${date}:`, data);
    },
    onError: (error) => {
      console.error('Error al obtener horarios disponibles:', error);
      toast.error('Error al cargar los horarios disponibles');
    }
  });
};

/**
 * Hook para obtener doctores por especialidad
 */
export const useGetDoctorsBySpecialty = (specialtyId) => {
  return useQuery({
    queryKey: ['doctors', 'bySpecialty', specialtyId],
    queryFn: () => getDoctorsBySpecialty(specialtyId),
    enabled: !!specialtyId, // Solo ejecutar si hay un ID de especialidad
    retry: 1,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log(`Doctores encontrados para especialidad ${specialtyId}:`, data);
    },
    onError: (error) => {
      console.error(`Error al obtener doctores para especialidad ${specialtyId}:`, error);
      toast.error('Error al cargar los doctores por especialidad');
    }
  });
};

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
      console.log(`Cita ${id} marcada como completada exitosamente:`, data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, 'today'] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, 'upcoming'] });
      // Actualizar cita específica en la cache
      queryClient.setQueryData([APPOINTMENTS_QUERY_KEY, id], data);
    },
    onError: (error) => {
      console.error('Error al marcar cita como completada:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
};

/**
 * Hook para marcar una cita como "no se presentó"
 */
export const useMarkNoShow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      console.log(`Marcando cita ${id} como "no se presentó"`);
      return markNoShow(id);
    },
    onSuccess: (data, id) => {
      console.log(`Cita ${id} marcada como "no se presentó" exitosamente:`, data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, 'today'] });
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY, 'upcoming'] });
      // Actualizar cita específica en la cache
      queryClient.setQueryData([APPOINTMENTS_QUERY_KEY, id], data);
    },
    onError: (error) => {
      console.error('Error al marcar cita como "no se presentó":', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
}; 