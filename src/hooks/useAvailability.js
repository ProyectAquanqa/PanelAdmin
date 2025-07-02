import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getDoctorAvailability, 
  createDoctorAvailability, 
  updateDoctorAvailability,
  deleteDoctorAvailability,
  getAvailabilityByDay
} from '../services/doctor/doctorAvailabilityService';
import { toast } from 'react-hot-toast';

// Clave para la cache de disponibilidad
const AVAILABILITY_QUERY_KEY = 'availability';

/**
 * Hook para obtener la disponibilidad de un doctor
 * @param {number} doctorId - ID del doctor
 * @returns {Object} Resultado del query
 */
export const useGetDoctorAvailability = (doctorId, options = {}) => {
  const queryResult = useQuery({
    queryKey: ['availability', doctorId],
    queryFn: async () => {
      try {
        const data = await getDoctorAvailability(doctorId);
        // Asegurar que siempre devolvemos un objeto con un array results
        if (!data) return { results: [], count: 0 };
        if (Array.isArray(data)) return { results: data, count: data.length };
        if (!data.results) return { results: [], count: 0 };
        return data;
      } catch (error) {
        console.error(`Error al obtener disponibilidad del doctor ${doctorId}:`, error);
        return { results: [], count: 0 };
      }
    },
    enabled: !!doctorId && (options?.enabled !== false), // Solo ejecutar si hay un ID
    // staleTime: 0 asegura que los datos se consideren obsoletos inmediatamente
    // y se vuelvan a cargar en cada navegación/montaje del componente.
    staleTime: 0,
    retry: 1,
    refetchOnWindowFocus: true, // Refresca si el usuario vuelve a la ventana
    onError: (error) => {
      console.error(`Error al obtener disponibilidad del doctor ${doctorId}:`, error);
      // No mostrar toast para no molestar al usuario
    }
  });

  return {
    ...queryResult,
    refetch: queryResult.refetch,
  };
};

/**
 * Hook para obtener la disponibilidad por día de la semana
 * @param {number} dayOfWeek - Día de la semana (1-7)
 */
export const useGetAvailabilityByDay = (dayOfWeek) => {
  return useQuery({
    queryKey: [AVAILABILITY_QUERY_KEY, 'day', dayOfWeek],
    queryFn: () => getAvailabilityByDay(dayOfWeek),
    enabled: !!dayOfWeek,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error(`Error al obtener disponibilidad para el día ${dayOfWeek}:`, error);
      toast.error('Error al cargar los horarios disponibles');
    }
  });
};

/**
 * Hook para crear disponibilidad de doctor
 */
export const useCreateAvailability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => {
      console.log('📤 Creando disponibilidad:', data);
      return createDoctorAvailability(data);
    },
    onSuccess: (data, variables) => {
      console.log('✅ Disponibilidad creada:', data);
      // Invalidar la cache para que se recargue la lista
      if (variables.doctor_id) {
        queryClient.invalidateQueries({ queryKey: ['availability', variables.doctor_id] });
      }
    },
    onError: (error) => {
      console.error('Error al crear disponibilidad:', error);
      toast.error('Error al guardar disponibilidad del doctor');
    }
  });
};

/**
 * Hook para actualizar disponibilidad de doctor
 */
export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log(`📤 Actualizando disponibilidad ${id}:`, data);
      return updateDoctorAvailability(id, data);
    },
    onSuccess: (data, variables) => {
      console.log('✅ Disponibilidad actualizada:', data);
      // Invalidar la cache para que se recargue la lista
      if (variables.data && variables.data.doctor_id) {
        queryClient.invalidateQueries({ queryKey: ['availability', variables.data.doctor_id] });
      }
    },
    onError: (error) => {
      console.error('Error al actualizar disponibilidad:', error);
      toast.error('Error al actualizar disponibilidad del doctor');
    }
  });
};

/**
 * Hook para eliminar disponibilidad de doctor
 */
export const useDeleteAvailability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, doctorId }) => {
      console.log(`🗑️ Eliminando disponibilidad ${id}`);
      return deleteDoctorAvailability(id);
    },
    onSuccess: (_, variables) => {
      console.log(`✅ Disponibilidad ${variables.id} eliminada`);
      // Invalidar la cache para que se recargue la lista
      if (variables.doctorId) {
        queryClient.invalidateQueries({ queryKey: ['availability', variables.doctorId] });
      }
    },
    onError: (error) => {
      console.error('Error al eliminar disponibilidad:', error);
      toast.error('Error al eliminar disponibilidad del doctor');
    }
  });
};

/**
 * Hook para gestionar múltiples disponibilidades a la vez
 */
export const useManageAvailabilities = () => {
  const createAvailability = useCreateAvailability();
  const updateAvailability = useUpdateAvailability();
  const deleteAvailability = useDeleteAvailability();
  const queryClient = useQueryClient();
  
  const updateMultiple = async (doctorId, availabilities) => {
    console.log(`📤 Actualizando ${availabilities.length} disponibilidades para doctor ${doctorId}`);
    
    // Verificar que haya datos para actualizar
    if (!availabilities || availabilities.length === 0) {
      console.log('⚠️ No hay disponibilidades para actualizar');
      toast.warning('No hay cambios en los horarios para guardar');
      return [];
    }
    
    // Verificar que doctorId sea un número válido
    if (!doctorId || isNaN(parseInt(doctorId, 10))) {
      console.error('❌ ID de doctor inválido:', doctorId);
      toast.error('ID de doctor inválido');
      throw new Error('ID de doctor inválido');
    }
    
    const numericDoctorId = parseInt(doctorId, 10);
    
    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    // Procesar las promesas secuencialmente para evitar race conditions en la BD
    for (const availability of availabilities) {
      try {
        const formattedAvailability = {
          ...availability,
          doctor_id: numericDoctorId,
          day_of_week: parseInt(availability.day_of_week, 10),
          max_patients: parseInt(availability.max_patients, 10) || 0,
          is_available: Boolean(availability.is_available)
        };

        console.log(`🔄 Procesando secuencialmente: día ${formattedAvailability.day_of_week}, bloque ${formattedAvailability.time_block}, id: ${availability.id}`);

        if (availability.id) {
          await updateAvailability.mutateAsync({ 
            id: availability.id, 
            data: formattedAvailability
          });
        } else {
          await createAvailability.mutateAsync(formattedAvailability);
        }
        successCount++;
      } catch (error) {
        failureCount++;
        const errorMessage = error.response?.data?.detail || error.message || 'Error desconocido';
        errors.push(errorMessage);
        console.error(` Falla en la operación para el horario ${JSON.stringify(availability)}:`, error);
      }
    }

    // Invalidar la cache para refrescar los datos en la UI
    queryClient.invalidateQueries({ queryKey: ['availability', numericDoctorId] });
    queryClient.invalidateQueries({ queryKey: ['doctors'] });
    queryClient.invalidateQueries({ queryKey: ['availability_check', numericDoctorId] });
    
    // Notificar al usuario
    if (failureCount > 0) {
      toast.error(
        `Fallaron ${failureCount} de ${availabilities.length} operaciones. Causa: ${errors[0]}`,
        { duration: 6000 }
      );
      throw new Error(`Fallaron ${failureCount} operaciones.`);
    } else {
      toast.success('Horarios guardados correctamente.');
    }

    return { successCount, failureCount };
  };
  
  return {
    createAvailability,
    updateAvailability,
    deleteAvailability,
    updateMultiple
  };
};

/**
 * Hook para verificar si un doctor tiene horarios configurados
 * @param {number} doctorId - ID del doctor
 * @returns {Object} { hasAvailability, isLoading }
 */
export const useCheckDoctorAvailability = (doctorId) => {
  const { data, isLoading } = useQuery({
    queryKey: ['availability_check', doctorId],
    queryFn: async () => {
      try {
        if (!doctorId) return { hasAvailability: false };
        const data = await getDoctorAvailability(doctorId);
        const results = Array.isArray(data) ? data : (data?.results || []);
        const activeAvailabilities = results.filter(a => a.is_available);
        return { 
          hasAvailability: activeAvailabilities.length > 0,
          availabilityCount: activeAvailabilities.length
        };
      } catch (error) {
        console.error(`Error al verificar disponibilidad del doctor ${doctorId}:`, error);
        return { hasAvailability: false };
      }
    },
    staleTime: 0, // Asegura que esta comprobación siempre sea fresca
    enabled: !!doctorId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
    refetchOnWindowFocus: false
  });

  return {
    hasAvailability: data?.hasAvailability || false,
    availabilityCount: data?.availabilityCount || 0,
    isLoading
  };
};

export default useManageAvailabilities; 