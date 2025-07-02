import { useQuery } from '@tanstack/react-query';
import { getDoctorsBySpecialty } from '../services/doctor';

/**
 * Hook para obtener doctores por especialidad con manejo robusto de errores
 * @param {number} specialtyId - ID de la especialidad
 * @param {Object} options - Opciones adicionales para el query
 * @returns {Object} Resultado del query
 */
export const useGetDoctorsBySpecialty = (specialtyId, options = {}) => {
  return useQuery({
    queryKey: ['doctors', 'bySpecialty', specialtyId],
    queryFn: () => getDoctorsBySpecialty(specialtyId),
    enabled: !!specialtyId, // Solo ejecutar si hay un ID de especialidad
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2, // Intentar hasta 2 veces más si falla
    refetchOnWindowFocus: false,
    ...options
  });
};

export default useGetDoctorsBySpecialty; 