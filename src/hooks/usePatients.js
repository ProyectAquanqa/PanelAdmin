import { useQuery } from '@tanstack/react-query';
import { getPatients, getPatientById } from '../services/user';
import { toast } from 'react-hot-toast';

// Clave para la cache de pacientes
const PATIENTS_QUERY_KEY = 'patients';

/**
 * Hook para obtener la lista de pacientes
 */
export const useGetPatients = (params = {}) => {
  return useQuery({
    queryKey: [PATIENTS_QUERY_KEY, params],
    queryFn: () => getPatients(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1, // Solo intentar una vez más si falla
    refetchOnWindowFocus: false, // No recargar al cambiar de pestaña
    onError: (error) => {
      console.error('Error al obtener pacientes:', error);
      toast.error('Error al cargar la lista de pacientes');
    }
  });
};

/**
 * Hook para obtener un paciente por su ID
 */
export const useGetPatientById = (id) => {
  return useQuery({
    queryKey: [PATIENTS_QUERY_KEY, id],
    queryFn: () => getPatientById(id),
    enabled: !!id, // Solo ejecutar si hay un ID
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error(`Error al obtener el paciente con ID ${id}:`, error);
      toast.error('Error al cargar los datos del paciente');
    }
  });
}; 