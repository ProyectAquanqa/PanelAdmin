import { useAppointmentFormState } from './useAppointmentFormState';
import { useAppointmentDoctors } from './useAppointmentDoctors';
import { useAppointmentAvailability } from './useAppointmentAvailability';
import { useAppointmentPatients } from './useAppointmentPatients';
import { useForm } from 'react-hook-form';

/**
 * Hook principal para el formulario de citas
 * Combina los hooks específicos para el estado del formulario, doctores y disponibilidad
 * @param {Object} appointment - Datos de la cita para edición (opcional)
 * @returns {Object} Estado y funciones combinadas para el formulario de citas
 */
export const useAppointmentForm = (appointment) => {
  const isEditing = !!appointment?.id;

  const formMethods = useForm({
    defaultValues: {
      patient: appointment?.patient?.id || '',
      specialty: appointment?.specialty?.id || '',
      doctor: appointment?.doctor?.id || '',
      appointment_date: appointment?.appointment_date || '',
      time_block: appointment?.time_block || '',
      reason: appointment?.reason || '',
      status: appointment?.status || 'SCHEDULED',
    },
  });

  const { watch, setValue } = formMethods;

  // Estado del formulario
  const {
    form,
    selectedSpecialty,
    selectedDoctor,
    selectedDate,
    reset
  } = useAppointmentFormState(appointment);

  // Doctores por especialidad
  const {
    doctors,
    loadingDoctors,
    fetchDoctorsBySpecialty
  } = useAppointmentDoctors(selectedSpecialty);

  // Disponibilidad de horarios
  const {
    availableTimeBlocks,
    loadingTimeBlocks,
    availabilityInfo,
    refreshAvailability
  } = useAppointmentAvailability(selectedDoctor, selectedDate);

  // Pacientes
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
    reset,
    
    // Doctores
    doctors,
    loadingDoctors,
    fetchDoctorsBySpecialty,
    
    // Disponibilidad
    availableTimeBlocks,
    loadingTimeBlocks,
    availabilityInfo,
    refreshAvailability,

    // Pacientes
    patients,
    loadingPatients,
  };
}; 