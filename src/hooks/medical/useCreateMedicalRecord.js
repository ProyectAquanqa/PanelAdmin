import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createMedicalRecord } from '../../services/medical/medicalRecordService';

const formatError = (error) => {
  if (!error.response?.data) {
    return 'Error al crear el historial médico. Intente de nuevo.';
  }

  const errors = error.response.data;
  if (typeof errors === 'string') {
    return errors;
  }

  // Formato para errores de validación de Django REST Framework: { field: ['message'] }
  const errorMessages = Object.entries(errors).map(([field, messages]) => {
    const formattedField = field.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
    return `${formattedField}: ${Array.isArray(messages) ? messages.join(' ') : messages}`;
  });

  return errorMessages.join(' | ') || 'Ocurrió un error inesperado.';
};

export const useCreateMedicalRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMedicalRecord,
    onSuccess: (newRecord) => {
      toast.success(`Historial médico para la cita #${newRecord.appointment} creado con éxito.`);
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
      queryClient.invalidateQueries({ queryKey: ['medicalRecord', newRecord.id] });
    },
    onError: (error) => {
      const errorMessage = formatError(error);
      toast.error(errorMessage, { duration: 5000 });
      console.error('Error en useCreateMedicalRecord:', error.response?.data || error);
    },
  });
}; 