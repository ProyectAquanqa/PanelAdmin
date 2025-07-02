import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

// Esquema de validación para el formulario de citas
const appointmentSchema = z.object({
  patient: z.coerce.number().int().positive('Debe seleccionar un paciente'),
  doctor: z.coerce.number().int().positive('Debe seleccionar un doctor'),
  specialty: z.coerce.number().int().positive('Debe seleccionar una especialidad'),
  appointment_date: z.string().min(1, 'La fecha es obligatoria'),
  time_block: z.string().min(1, 'El bloque horario es obligatorio'),
  reason: z.string().min(5, 'Mínimo 5 caracteres').max(500, 'Máximo 500 caracteres'),
  status: z.string().optional(),
  payment_status: z.string().optional(),
});

/**
 * Hook para manejar el estado del formulario de citas
 * @param {Object} appointment - Datos de la cita para edición (opcional)
 * @returns {Object} Estado y funciones del formulario
 */
export const useAppointmentFormState = (appointment = null) => {
  const isEditing = !!appointment;
  
  // Form hook
  const form = useForm({
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

  const { setValue, watch, reset } = form;
  
  // Valores observados para uso en dependencias
  const selectedSpecialty = watch('specialty');
  const selectedDoctor = watch('doctor');
  const selectedDate = watch('appointment_date');

  // Cargar datos de la cita si estamos en modo edición
  useEffect(() => {
    if (isEditing && appointment) {
      console.log('📝 Cargando datos de la cita para edición:', appointment);
      
      // Establecer valores del formulario
      setValue('patient', appointment.patient?.id || appointment.patient || '');
      setValue('doctor', appointment.doctor?.id || appointment.doctor || '');
      setValue('specialty', appointment.specialty?.id || appointment.specialty || '');
      setValue('appointment_date', appointment.appointment_date || '');
      setValue('time_block', appointment.time_block || '');
      setValue('reason', appointment.reason || '');
      
      if (appointment.status) {
        setValue('status', appointment.status);
      }
      
      if (appointment.payment_status) {
        setValue('payment_status', appointment.payment_status);
      }
    }
  }, [isEditing, appointment, setValue]);

  return {
    form,
    isEditing,
    selectedSpecialty,
    selectedDoctor,
    selectedDate,
    reset
  };
}; 