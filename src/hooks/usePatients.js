import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatients, getPatientById, createPatient, updatePatient, deletePatient } from '../services/patientService';
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

/**
 * Hook para crear un nuevo paciente
 */
export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => {
      console.log('Datos enviados para crear paciente:', data);
      
      // Asegurar que tenemos los campos obligatorios
      const requiredFields = ['email', 'password', 'first_name', 'last_name'];
      requiredFields.forEach(field => {
        if (!data[field]) {
          throw new Error(`El campo ${field} es obligatorio`);
        }
      });
      
      // Asegurar que document_type es un número
      if (typeof data.document_type === 'string') {
        data.document_type = parseInt(data.document_type) || 1;
      }
      
      // Asegurar que gender tiene un valor válido
      if (!data.gender) {
        data.gender = 'OTHER';
      }
      
      // Asegurar que document_number tiene un valor
      if (!data.document_number) {
        data.document_number = '00000000';
      }
      
      return createPatient(data);
    },
    onSuccess: (data) => {
      console.log('Paciente creado exitosamente:', data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error al crear paciente:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
};

/**
 * Hook para actualizar un paciente
 */
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log(`Actualizando paciente ${id} con datos:`, data);
      
      // Asegurar que document_type es un número
      if (typeof data.document_type === 'string') {
        data.document_type = parseInt(data.document_type) || 1;
      }
      
      // Asegurar que gender tiene un valor válido
      if (!data.gender) {
        data.gender = 'OTHER';
      }
      
      return updatePatient(id, data);
    },
    onSuccess: (data, variables) => {
      console.log('Paciente actualizado exitosamente:', data);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });
      // Actualizar paciente específico en la cache
      queryClient.setQueryData([PATIENTS_QUERY_KEY, variables.id], data);
    },
    onError: (error) => {
      console.error('Error al actualizar paciente:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
};

/**
 * Hook para eliminar un paciente
 */
export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      console.log(`Eliminando paciente con ID: ${id}`);
      return deletePatient(id);
    },
    onSuccess: (_, id) => {
      console.log(`Paciente con ID ${id} eliminado exitosamente`);
      // Invalidar la cache para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error al eliminar paciente:', error);
      // No mostrar toast aquí, se maneja en el componente
    },
  });
}; 