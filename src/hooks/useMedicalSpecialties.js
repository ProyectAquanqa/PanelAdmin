import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllSpecialties, getSpecialtyById, getSpecialtiesByDoctor } from '../services/medical/specialtyService';

/**
 * Hook para obtener todas las especialidades médicas
 * @param {Object} options - Opciones adicionales para el query
 * @returns {Object} Resultado del query
 */
export const useGetAllSpecialties = (options = {}) => {
  return useQuery({
    queryKey: ['medical-specialties'],
    queryFn: () => getAllSpecialties(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    ...options
  });
};

/**
 * Hook para obtener una especialidad por su ID
 * @param {number} id - ID de la especialidad
 * @param {Object} options - Opciones adicionales para el query
 * @returns {Object} Resultado del query
 */
export const useGetSpecialtyById = (id, options = {}) => {
  return useQuery({
    queryKey: ['medical-specialties', id],
    queryFn: () => getSpecialtyById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    ...options
  });
};

/**
 * Hook para obtener especialidades de un doctor
 * @param {number} doctorId - ID del doctor
 * @param {Object} options - Opciones adicionales para el query
 * @returns {Object} Resultado del query
 */
export const useGetSpecialtiesByDoctor = (doctorId, options = {}) => {
  return useQuery({
    queryKey: ['doctor-specialties', doctorId],
    queryFn: () => getSpecialtiesByDoctor(doctorId),
    enabled: !!doctorId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    ...options
  });
};

/**
 * Hook para invalidar la caché de especialidades
 * @returns {Function} Función para invalidar la caché
 */
export const useInvalidateSpecialtiesCache = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['medical-specialties'] });
    queryClient.invalidateQueries({ queryKey: ['doctor-specialties'] });
  };
};

/**
 * Hook combinado para manejar especialidades médicas
 * @returns {Object} Funciones y datos para manejar especialidades
 */
export const useMedicalSpecialties = () => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetAllSpecialties();
  
  const invalidateCache = useInvalidateSpecialtiesCache();
  
  return {
    specialties: data || { results: [], count: 0 },
    isLoading,
    error,
    refetch,
    invalidateCache,
    getById: (id) => data?.results?.find(s => {
      const specId = typeof s.id === 'string' ? parseInt(s.id, 10) : s.id;
      const searchId = typeof id === 'string' ? parseInt(id, 10) : id;
      return specId === searchId;
    }) || null
  };
};

export default useMedicalSpecialties; 