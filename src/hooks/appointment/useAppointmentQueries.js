import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  getAppointments, 
  getAppointmentById, 
  getTodayAppointments,
  getUpcomingAppointments,
  getAvailableSlots,
  getAppointmentsByPatient
} from '../../services/appointment';

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
 * Hook para obtener las citas de un paciente específico
 */
export const useGetAppointmentsByPatient = (patientId) => {
  return useQuery({
    queryKey: [APPOINTMENTS_QUERY_KEY, 'byPatient', patientId],
    queryFn: () => getAppointmentsByPatient(patientId),
    enabled: !!patientId, // Solo ejecutar si hay un ID de paciente
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: 1,
    onError: (error) => {
      console.error(`Error al obtener las citas para el paciente con ID ${patientId}:`, error);
      toast.error('Error al cargar el historial de citas del paciente');
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
      console.log(`Bloques horarios disponibles para doctor ${doctorId} en fecha ${date}:`, data);
    },
    onError: (error) => {
      console.error('Error al obtener bloques horarios disponibles:', error);
      toast.error('Error al cargar los bloques horarios disponibles');
      // En caso de error, devolver un objeto con valores por defecto
      return {
        doctor_id: doctorId,
        date: date,
        available_blocks: ['MORNING', 'AFTERNOON'],
        busy_blocks: []
      };
    }
  });
}; 