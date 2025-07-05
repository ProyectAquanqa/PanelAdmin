import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '../../services/appointment/appointmentApiService';

/**
 * Hook para obtener una lista simplificada de citas para usar en selectores.
 * @param {object} params - Parámetros para filtrar las citas (ej. search, status).
 */
export const useGetAppointmentsForSelect = (params = {}) => {
  return useQuery({
    queryKey: ['appointmentsForSelect', params],
    queryFn: () => getAppointments({ ...params, page_size: 20 }), // Limitar a 20 resultados para selectores
    staleTime: 5 * 60 * 1000, // 5 minutos
    select: (data) => {
      // Formatear los datos para que sean compatibles con el componente SelectField
      return data?.results.map(appointment => ({
        id: appointment.id,
        name: `Cita #${appointment.id} - ${appointment.patient?.full_name || 'N/A'} - ${appointment.appointment_date}`
      })) || [];
    },
  });
}; 