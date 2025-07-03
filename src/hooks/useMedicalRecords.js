import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as medicalService from '../services/medical/medicalRecordService';
import { toast } from 'react-hot-toast';

const MEDICAL_RECORDS_QUERY_KEY = 'medicalRecords';

/**
 * Hook para obtener la lista de historiales médicos.
 * @param {Object} params - Parámetros de filtro y paginación.
 */
export const useGetMedicalRecords = (params = {}) => {
  return useQuery({
    queryKey: [MEDICAL_RECORDS_QUERY_KEY, params],
    queryFn: () => medicalService.getMedicalRecords(params),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutos
    onError: (error) => {
      console.error('Error al obtener historiales médicos:', error);
      toast.error('No se pudieron cargar los historiales médicos.');
    },
  });
};

/**
 * Hook para obtener un historial médico por su ID.
 * @param {string|number} id - El ID del historial.
 */
export const useGetMedicalRecordById = (id) => {
  return useQuery({
    queryKey: [MEDICAL_RECORDS_QUERY_KEY, id],
    queryFn: () => medicalService.getMedicalRecordById(id),
    enabled: !!id, // Solo se ejecuta si el ID es válido
    onError: (error) => {
      console.error(`Error al obtener el historial médico ${id}:`, error);
      toast.error('No se pudo cargar el historial médico.');
    },
  });
};

/**
 * Hook para crear un nuevo historial médico.
 */
export const useCreateMedicalRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: medicalService.createMedicalRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEDICAL_RECORDS_QUERY_KEY] });
      toast.success('Historial médico creado exitosamente.');
    },
    onError: (error) => {
      console.error('Error al crear historial médico:', error);
      toast.error(error.response?.data?.detail || 'Error al crear el historial.');
    },
  });
};

/**
 * Hook para actualizar un historial médico.
 */
export const useUpdateMedicalRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => medicalService.updateMedicalRecord(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [MEDICAL_RECORDS_QUERY_KEY] });
      queryClient.setQueryData([MEDICAL_RECORDS_QUERY_KEY, id], data);
      toast.success('Historial médico actualizado exitosamente.');
    },
    onError: (error) => {
      console.error('Error al actualizar historial médico:', error);
      toast.error(error.response?.data?.detail || 'Error al actualizar el historial.');
    },
  });
};

/**
 * Hook para eliminar un historial médico.
 */
export const useDeleteMedicalRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: medicalService.deleteMedicalRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEDICAL_RECORDS_QUERY_KEY] });
      toast.success('Historial médico eliminado exitosamente.');
    },
    onError: (error) => {
      console.error('Error al eliminar historial médico:', error);
      toast.error('Error al eliminar el historial.');
    },
  });
};

/**
 * Hook para añadir un adjunto a un historial médico.
 */
export const useAddAttachmentToRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ recordId, formData }) => medicalService.addAttachmentToRecord(recordId, formData),
        onSuccess: (data, { recordId }) => {
            // Invalida la query del historial específico para que se recargue con los nuevos adjuntos.
            queryClient.invalidateQueries({ queryKey: [MEDICAL_RECORDS_QUERY_KEY, recordId] });
            toast.success('Archivo adjuntado exitosamente.');
        },
        onError: (error) => {
            console.error('Error al adjuntar archivo:', error);
            toast.error(error.response?.data?.detail || 'Error al subir el archivo.');
        },
    });
}; 