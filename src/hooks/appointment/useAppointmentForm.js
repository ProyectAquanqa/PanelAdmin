import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema } from './useAppointmentFormState';
import { useAppointmentDoctors } from './useAppointmentDoctors';
import { useAppointmentAvailability } from './useAppointmentAvailability';
import { useAppointmentPatients } from './useAppointmentPatients';

/**
 * Hook principal para el formulario de citas
 * Combina los hooks específicos para el estado del formulario, doctores y disponibilidad
 * @param {Object} appointment - Datos de la cita para edición (opcional)
 * @returns {Object} Estado y funciones combinadas para el formulario de citas
 */
export const useAppointmentForm = (appointment = null) => {
  const isEditing = !!appointment;

  const formMethods = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient: '',
      doctor: '',
      specialty: '',
      appointment_date: '',
      time_block: '',
      reason: '',
      status: 'SCHEDULED',
      payment_status: 'PROCESSING'
    }
  });

  const { watch, setValue, reset } = formMethods;

  const selectedSpecialty = watch('specialty');
  const selectedDoctor = watch('doctor');
  const selectedDate = watch('appointment_date');

  useEffect(() => {
    if (isEditing && appointment) {
      const defaultValues = {
        patient: appointment.patient?.id || appointment.patient || '',
        specialty: appointment.specialty?.id || appointment.specialty || '',
        appointment_date: appointment.appointment_date || '',
        time_block: appointment.time_block || '',
        reason: appointment.reason || '',
        status: appointment.status || 'SCHEDULED',
        payment_status: appointment.payment_status || 'PROCESSING',
        doctor: appointment.doctor?.id || appointment.doctor || ''
      };
      reset(defaultValues);
    } else if (!isEditing) {
      reset();
    }
  }, [isEditing, appointment, reset]);
  
  // Clear doctor and time_block field when specialty changes, but not when initially setting for editing
  useEffect(() => {
    if (!isEditing) {
      setValue('doctor', '');
      setValue('time_block', '');
    }
  }, [selectedSpecialty, setValue, isEditing]);

  const { doctors, loadingDoctors } = useAppointmentDoctors(selectedSpecialty);
  const { availableTimeBlocks, loadingTimeBlocks, availabilityInfo, refreshAvailability } = useAppointmentAvailability(selectedDoctor, selectedDate);
  const { patients, loadingPatients } = useAppointmentPatients();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setValue(name, value, { shouldValidate: true });
  };

  return {
    ...formMethods,
    formData: watch(),
    handleInputChange,
    isEditing,
    selectedSpecialty,
    selectedDoctor,
    selectedDate,
    doctors,
    loadingDoctors,
    availableTimeBlocks,
    loadingTimeBlocks,
    availabilityInfo,
    refreshAvailability,
    patients,
    loadingPatients,
  };
}; 