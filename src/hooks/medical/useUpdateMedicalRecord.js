import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMedicalRecord } from '../../services/medical/medicalRecordService';

/**
 * Hook para actualizar un historial médico existente.
 * @returns {Object} La mutación para actualizar el historial.
 */
export const useUpdateMedicalRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, recordData }) => updateMedicalRecord(id, recordData),
    onSuccess: () => {
      // Invalidar y refetchear la lista de historiales para mostrar los cambios.
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
    },
    onError: (error) => {
      // Podrías añadir un toast o notificación aquí
      console.error('Error en useUpdateMedicalRecord:', error);
    },
  });
}; 