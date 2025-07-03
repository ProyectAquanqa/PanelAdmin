import { useQuery } from '@tanstack/react-query';
import { getAllDoctors } from '../../services/doctor/doctorApiService';

const DOCTORS_QUERY_KEY = 'doctors';

export const useGetDoctors = (params) => {
  return useQuery({
    queryKey: [DOCTORS_QUERY_KEY, params],
    queryFn: () => getAllDoctors(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true,
    select: (data) => {
      if (!data?.results) {
        return { ...data, results: [] };
      }
      
      const formattedResults = data.results.map(doctor => ({
        value: doctor.id,
        label: doctor.full_name || `Dr. ${doctor.first_name} ${doctor.last_name}`,
      }));
      
      return {
        ...data,
        results: formattedResults
      };
    }
  });
}; 