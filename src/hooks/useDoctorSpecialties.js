import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import adminApiClient from '../api/adminApiClient';

// Clave de caché para especialidades
const SPECIALTIES_QUERY_KEY = 'specialties';

/**
 * Normaliza los datos de una especialidad
 * @param {Object|number} specialty - Datos de la especialidad
 * @returns {Object} Especialidad normalizada
 */
const normalizeSpecialty = (specialtyData) => {
  if (!specialtyData) return null;

  // El formato más común es un objeto de relación que contiene un objeto 'specialty'.
  if (typeof specialtyData === 'object' && specialtyData.specialty && typeof specialtyData.specialty === 'object') {
    const specialty = specialtyData.specialty;
    const id = specialty.id ? parseInt(specialty.id, 10) : null;
    if (id === null || isNaN(id)) {
      console.warn('❌ Se encontró un objeto de especialidad anidado pero sin un ID válido:', specialty);
      return null;
    }
    return {
      id,
      name: specialty.name || `Especialidad ${id}`,
      description: specialty.description || '',
      is_active: specialty.is_active !== undefined ? specialty.is_active : true,
    };
  }

  // Fallback para cuando la data es la especialidad directamente
  if (typeof specialtyData === 'object' && specialtyData.id) {
     const id = parseInt(specialtyData.id, 10);
     if (isNaN(id)) return null;
     return {
        id,
        name: specialtyData.name || `Especialidad ${id}`,
        description: specialtyData.description || '',
        is_active: specialtyData.is_active !== undefined ? specialtyData.is_active : true,
     }
  }

  // Fallback para cuando es solo un ID
  if (typeof specialtyData === 'number') {
    return { id: specialtyData, name: `Especialidad ${specialtyData}`, is_active: true };
  }
  if (typeof specialtyData === 'string' && /^\d+$/.test(specialtyData)) {
    const id = parseInt(specialtyData, 10);
    return { id, name: `Especialidad ${id}`, is_active: true };
  }
  
  console.warn('⚠️ No se pudo normalizar la especialidad con formato desconocido:', specialtyData);
  return null;
};

/**
 * Hook para obtener todas las especialidades
 * @returns {Object} Resultado de la consulta
 */
export const useGetAllSpecialties = () => {
  return useQuery({
    queryKey: [SPECIALTIES_QUERY_KEY],
    queryFn: async () => {
      try {
        console.log('🔍 Obteniendo todas las especialidades');
        
        // Intentar primero con el endpoint de catálogos (según endpints.md)
        const response = await adminApiClient.get('/api/catalogs/specialties/');
        console.log('✅ Especialidades obtenidas (raw):', response.data);
        
        // Normalizar respuesta
        let specialties = [];
        
        if (Array.isArray(response.data)) {
          specialties = response.data;
        } else if (response.data && response.data.results) {
          specialties = response.data.results;
        } else if (response.data && typeof response.data === 'object') {
          // Si es un objeto pero no tiene .results, intentar extraer valores
          specialties = Object.values(response.data);
        }
        
        // Verificar si hay datos válidos
        if (!specialties || specialties.length === 0) {
          console.warn('⚠️ No se encontraron especialidades en la respuesta principal');
          
          // Intentar con endpoint alternativo
          const alternativeResponse = await adminApiClient.get('/api/doctors/specialties/');
          console.log('✅ Especialidades obtenidas (alternativo):', alternativeResponse.data);
          
          if (Array.isArray(alternativeResponse.data)) {
            specialties = alternativeResponse.data;
          } else if (alternativeResponse.data && alternativeResponse.data.results) {
            specialties = alternativeResponse.data.results;
          }
        }
        
        // Normalizar cada especialidad
        const normalizedSpecialties = specialties.map(normalizeSpecialty).filter(Boolean);
        
        console.log('✅ Especialidades normalizadas:', normalizedSpecialties);
        
        return {
          results: normalizedSpecialties,
          count: normalizedSpecialties.length
        };
      } catch (error) {
        console.error('❌ Error al obtener especialidades:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false
  });
};

/**
 * Hook para obtener especialidades de un doctor específico
 * @param {number} doctorId - ID del doctor
 * @returns {Object} Resultado de la consulta
 */
export const useGetDoctorSpecialties = (doctorId) => {
  return useQuery({
    queryKey: [SPECIALTIES_QUERY_KEY, 'doctor', doctorId],
    queryFn: async () => {
      if (!doctorId) {
        console.log('⚠️ No se proporcionó ID de doctor');
        return { results: [], ids: [] };
      }
      
      try {
        console.log(`🔍 Obteniendo especialidades del doctor ${doctorId}`);
        // Usar el endpoint correcto según endpints.md
        const response = await adminApiClient.get(`/api/doctors/specialties/by_doctor/?doctor_id=${doctorId}`);
        console.log(`✅ Especialidades del doctor ${doctorId} (raw):`, response.data);
        
        // Normalizar respuesta
        let specialties = [];
        if (Array.isArray(response.data)) {
          specialties = response.data;
        } else if (response.data && response.data.results) {
          specialties = response.data.results;
        }
        
        console.log('Especialidades antes de normalizar:', JSON.stringify(specialties, null, 2));
        
        // Extraer IDs de la especialidad del doctor
        const doctorSpecialtyIds = specialties
          .map(s => s.specialty?.id || s.specialty)
          .map(id => typeof id === 'string' ? parseInt(id, 10) : id)
          .filter(id => !isNaN(id));
        
        console.log('IDs de especialidades del doctor:', doctorSpecialtyIds);
        
        // Normalizar cada especialidad
        const normalizedSpecialties = specialties
          .map(normalizeSpecialty)
          .filter(Boolean);
        
        console.log(`✅ Especialidades normalizadas del doctor ${doctorId}:`, normalizedSpecialties);
        console.log(`✅ IDs de especialidades del doctor ${doctorId}:`, doctorSpecialtyIds);
        
        return {
          results: normalizedSpecialties,
          ids: doctorSpecialtyIds,
          count: normalizedSpecialties.length
        };
      } catch (error) {
        console.error(`❌ Error al obtener especialidades del doctor ${doctorId}:`, error);
        return { results: [], ids: [], count: 0 };
      }
    },
    enabled: !!doctorId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2
  });
};

/**
 * Hook para obtener doctores por especialidad
 * @param {number} specialtyId - ID de la especialidad
 * @returns {Object} Resultado de la consulta
 */
export const useGetDoctorsBySpecialty = (specialtyId) => {
  return useQuery({
    queryKey: ['doctors-by-specialty', specialtyId],
    queryFn: async () => {
      try {
        if (!specialtyId) {
          return { results: [], count: 0 };
        }
        
        console.log(`🔍 Obteniendo doctores por especialidad ${specialtyId}`);
        // Usar el endpoint exacto mencionado en endpints.md
        const response = await adminApiClient.get(`/api/doctors/doctors/by_specialty/?specialty=${specialtyId}`);
        console.log(`✅ Doctores por especialidad ${specialtyId}:`, response.data);
        
        let doctors = [];
        if (Array.isArray(response.data)) {
          doctors = response.data;
        } else if (response.data && response.data.results) {
          doctors = response.data.results;
        }
        
        return {
          results: doctors,
          count: doctors.length
        };
      } catch (error) {
        console.error(`❌ Error al obtener doctores por especialidad ${specialtyId}:`, error);
        throw error;
      }
    },
    enabled: !!specialtyId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2
  });
};

/**
 * Hook para agregar una especialidad a un doctor
 * @returns {Object} Mutación para agregar especialidad
 */
export const useAddSpecialtyToDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ doctorId, specialtyId }) => {
      console.log(`🔄 Agregando especialidad ${specialtyId} al doctor ${doctorId}`);
      
      const response = await adminApiClient.post('/api/doctors/specialties/', {
        doctor: doctorId,
        specialty: specialtyId,
      });

      console.log('✅ Respuesta de agregar especialidad:', response.data);
      return response.data;
    },
    onSuccess: (data, { doctorId }) => {
      queryClient.invalidateQueries({ queryKey: [SPECIALTIES_QUERY_KEY, 'doctor', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctors', doctorId] });
      toast.success('Especialidad agregada correctamente');
    },
    onError: (error) => {
      console.error('❌ Error al agregar especialidad:', error);
      toast.error('Error al agregar especialidad');
    }
  });
};

/**
 * Hook para eliminar una especialidad de un doctor
 * @returns {Object} Mutación para eliminar especialidad
 */
export const useRemoveSpecialtyFromDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ doctorId, specialtyId }) => {
      console.log(`🗑️ Eliminando especialidad ${specialtyId} del doctor ${doctorId}`);
      
      // Encontrar el ID de la relación Doctor-Especialidad
      const doctorSpecialtiesResponse = await adminApiClient.get(`/api/doctors/specialties/?doctor=${doctorId}&specialty=${specialtyId}`);
      const relation = doctorSpecialtiesResponse.data.results?.[0];
      
      if (!relation) {
        throw new Error('No se encontró la relación de especialidad para eliminar.');
      }

      const response = await adminApiClient.delete(`/api/doctors/specialties/${relation.id}/`);

      console.log('✅ Respuesta de eliminar especialidad:', response);
      return response.data;
    },
    onSuccess: (_, { doctorId }) => {
      queryClient.invalidateQueries({ queryKey: [SPECIALTIES_QUERY_KEY, 'doctor', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctors', doctorId] });
      toast.success('Especialidad eliminada correctamente');
    },
    onError: (error) => {
      console.error('❌ Error al eliminar especialidad:', error);
      toast.error('Error al eliminar especialidad');
    }
  });
};

/**
 * Hook para actualizar las especialidades de un doctor
 * @returns {Object} Mutation para actualizar especialidades
 */
export const useUpdateDoctorSpecialties = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ doctorId, specialtyIds }) => {
      console.log(`🔄 Actualizando especialidades para el doctor ${doctorId}:`, specialtyIds);
      
      const response = await adminApiClient.put(`/api/doctors/doctors/${doctorId}/`, {
        specialties: specialtyIds
      });

      console.log('✅ Respuesta de actualizar especialidades:', response.data);
      return response.data;
    },
    onSuccess: (data, { doctorId }) => {
      queryClient.invalidateQueries({ queryKey: [SPECIALTIES_QUERY_KEY, 'doctor', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctors', doctorId] });
      
      toast.success('Especialidades actualizadas correctamente');
    },
    onError: (error) => {
      console.error('Error al actualizar especialidades:', error);
      toast.error('Error al actualizar especialidades');
    }
  });
};