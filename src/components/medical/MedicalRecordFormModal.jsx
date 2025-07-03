import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import FormField from '../common/FormField';
import FormActions from '../common/FormActions';
import { useGetAppointmentsForSelect } from '../../hooks/appointment';

const MedicalRecordFormModal = ({ isOpen, onClose, theme, record }) => {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm();
  
  const [appointmentParams, setAppointmentParams] = useState({ page_size: 10 });
  const { 
    data: appointmentsData, 
    isLoading: isLoadingAppointments 
  } = useGetAppointmentsForSelect(appointmentParams);

  const appointmentOptions = appointmentsData?.results || [];
  const isEditMode = Boolean(record);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && record) {
        // In edit mode, we might not need to reset the appointment if it's not editable.
        // Or we might need to fetch the specific appointment details.
        // For now, let's just populate the form with record data.
        reset({
          ...record,
          record_date: record.record_date ? new Date(record.record_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        });
      } else {
        // For new records, reset to default values
        reset({
          record_date: new Date().toISOString().slice(0, 16),
          chief_complaint: '',
          diagnosis: '',
          treatment_plan: '',
          notes: '',
          appointment: null,
        });
      }
    }
  }, [isOpen, isEditMode, record, reset]);

  const onSubmit = (data) => {
    console.log(data);
    onClose(); // Close modal after submission
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className={`relative p-6 rounded-xl shadow-xl w-full max-w-3xl ${
          theme === 'dark' ? 'bg-neutral-800' : 'bg-white'
        }`}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        
        <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {isEditMode ? 'Editar Historial Médico' : 'Nuevo Historial Médico'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          
          <Controller
            name="appointment"
            control={control}
            rules={{ required: 'La cita es obligatoria' }}
            render={({ field }) => (
              <FormField
                label="Cita"
                id="appointment"
                type="select"
                value={field.value}
                onChange={field.onChange}
                error={errors.appointment}
                theme={theme}
                options={appointmentOptions}
                isLoading={isLoadingAppointments}
                disabled={isEditMode} // Disable if editing, as appointment shouldn't change
              />
            )}
          />
          
          <FormField
            label="Fecha del Registro"
            id="record_date"
            type="datetime-local"
            register={register}
            error={errors.record_date}
            theme={theme}
            validation={{ required: 'La fecha es obligatoria' }}
          />

          <FormField
            label="Motivo Principal de Consulta"
            id="chief_complaint"
            type="textarea"
            register={register}
            error={errors.chief_complaint}
            theme={theme}
            validation={{ required: 'El motivo es obligatorio' }}
          />
          
          <FormField
            label="Diagnóstico"
            id="diagnosis"
            type="textarea"
            register={register}
            error={errors.diagnosis}
            theme={theme}
          />

          <FormField
            label="Plan de Tratamiento"
            id="treatment_plan"
            type="textarea"
            register={register}
            error={errors.treatment_plan}
            theme={theme}
          />

          <FormField
            label="Notas Adicionales"
            id="notes"
            type="textarea"
            register={register}
            error={errors.notes}
            theme={theme}
          />
          
          <FormActions
            onCancel={onClose}
            theme={theme}
            submitText={isEditMode ? 'Guardar Cambios' : 'Crear Historial'}
          />
        </form>
      </motion.div>
    </div>
  );
};

export default MedicalRecordFormModal; 