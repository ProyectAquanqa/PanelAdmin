import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '../../services/appointment/appointmentApiService';

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

export const useGetAppointmentsForSelect = (params) => {
  return useQuery({
    queryKey: ['appointmentsForSelect', params],
    queryFn: () => getAppointments(params),
    staleTime: STALE_TIME,
    keepPreviousData: true,
    select: (data) => {
      if (!data?.results) {
        return { ...data, results: [] };
      }
      
      const formattedResults = data.results.map(appointment => ({
        value: appointment.id,
        label: `${appointment.patient.user.full_name} - ${appointment.specialty.name} - ${new Date(appointment.start_time).toLocaleString()}`
      }));
      
      return {
        ...data,
        results: formattedResults
      };
    }
  });
}; 