import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as doctorApiService from '../services/doctor/doctorApiService';
import { prepareDoctorDataForSubmit } from '../services/doctor/doctorTransformService';
import { toast } from 'react-hot-toast';

// Clave de caché para doctores
const DOCTORS_QUERY_KEY = 'doctors';

/**
 * Hook para obtener todos los doctores
 * @param {Object} options - Opciones para la consulta
 * @returns {Object} Resultado de la consulta
 */
export const useGetDoctors = () => {
  const queryResult = useQuery({
    queryKey: [DOCTORS_QUERY_KEY],
    queryFn: () => doctorApiService.getAllDoctors(),
    enabled: true,
    refetchOnWindowFocus: false,
    retry: 1,
    onError: (error) => {
      console.error('Error al obtener doctores:', error);
      toast.error('No se pudieron cargar los doctores');
    }
  });

  return {
    ...queryResult,
    refetch: queryResult.refetch,
  };
};

/**
 * Hook para obtener un doctor por ID
 * @param {number} id - ID del doctor
 * @param {Object} options - Opciones para la consulta
 * @returns {Object} Resultado de la consulta
 */
export const useGetDoctorById = (id, options = {}) => {
  const { enabled = !!id } = options;
  
  return useQuery({
    queryKey: [DOCTORS_QUERY_KEY, id],
    queryFn: () => doctorApiService.getDoctorById(id),
    enabled,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error(`Error al obtener doctor ${id}:`, error);
      toast.error('No se pudo cargar la información del doctor');
    }
  });
};

/**
 * Hook para crear un nuevo doctor
 * @returns {Object} Mutación para crear doctor
 */
export const useCreateDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (doctorData) => {
      // Preparar datos para el envío
      const preparedData = prepareDoctorDataForSubmit(doctorData);
      return doctorApiService.createDoctor(preparedData);
    },
    onSuccess: () => {
      // Invalidar consultas de doctores para refrescar la lista
      queryClient.invalidateQueries({ queryKey: [DOCTORS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error al crear doctor:', error);
      
      // Manejar errores específicos
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Error de especialidades
        if (errorData.specialties) {
          const errorMsg = Array.isArray(errorData.specialties) 
            ? errorData.specialties[0] 
            : errorData.specialties;
          toast.error(`Error en especialidades: ${errorMsg}`);
          
          // Intentar detectar el formato correcto de especialidades para futuros envíos
          localStorage.removeItem('specialtiesFormat');
          return;
        }
        
        // Otros errores comunes
        if (errorData.email) {
          toast.error(`Email: ${errorData.email}`);
        } else if (errorData.detail) {
          toast.error(errorData.detail);
        } else {
          toast.error('Error al crear el doctor');
        }
      } else {
        toast.error('Error al crear el doctor');
      }
    }
  });
};

/**
 * Hook para actualizar un doctor
 * @returns {Object} - Mutación para actualizar un doctor
 */
export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (doctorData) => {
      // La función `updateDoctor` ahora espera un solo objeto que contenga el id.
      // Ya no se pasa el ID como un argumento separado.
      console.log('🔄 Hook useUpdateDoctor ejecutando mutación con:', doctorData);
      return doctorApiService.updateDoctor(doctorData);
    },
    onSuccess: (data) => {
      toast.success('Doctor actualizado correctamente');
      
      // Se añade un pequeño retraso para dar tiempo a la base de datos del servidor a procesar
      // la actualización antes de volver a solicitar los datos. Esto previene ver datos obsoletos.
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [DOCTORS_QUERY_KEY] });
        if (data?.id) {
          queryClient.invalidateQueries({ queryKey: [DOCTORS_QUERY_KEY, data.id] });
        }
      }, 500); // 500ms de retraso
    },
    onError: (error) => {
      console.error('❌ Error al actualizar doctor:', error);
      toast.error(error.message || 'No se pudo actualizar el doctor.');
    }
  });
};

/**
 * Hook para eliminar un doctor
 * @returns {Object} Mutación para eliminar doctor
 */
export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => doctorApiService.deleteDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCTORS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error al eliminar doctor:', error);
      toast.error('No se pudo eliminar el doctor');
    }
  });
};
