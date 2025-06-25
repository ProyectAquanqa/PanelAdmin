import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  CalendarIcon, 
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  UserCircleIcon,
  TagIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAppointment, useUpdateAppointment, useGetDoctorsBySpecialty, useGetAvailableSlots } from '../../hooks/useAppointments';
import { useGetSpecialties } from '../../hooks/useSpecialties';
import { useGetPatients } from '../../hooks/usePatients';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

// Validation schema actualizado para el modelo de Django
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

// Opciones de bloques horarios según el modelo de Django
const TIME_BLOCK_OPTIONS = [
  { id: 'MORNING', name: 'Mañana (8:00 - 12:00)' },
  { id: 'AFTERNOON', name: 'Tarde (14:00 - 18:00)' },
];

const STATUS_OPTIONS = [
  { id: 'SCHEDULED', name: 'Programada' },
  { id: 'IN_CONSULTATION', name: 'En consulta' },
  { id: 'COMPLETED', name: 'Completada' },
  { id: 'CANCELLED', name: 'Cancelada' },
  { id: 'NO_SHOW', name: 'No se presentó' },
];

const PAYMENT_STATUS_OPTIONS = [
  { id: 'PROCESSING', name: 'En proceso' },
  { id: 'COMPLETED', name: 'Completado' },
  { id: 'FAILED', name: 'Fallido' },
  { id: 'REFUNDED', name: 'Reembolsado' },
];

// Reusable form field components
const FormField = ({ label, error, children, icon: Icon }) => {
  const { theme } = useTheme();
  return (
    <div>
      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <div className="mt-1 relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 ${theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'}`} />
          </div>
        )}
        {children}
      </div>
      {error && (
        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
          {error}
        </p>
      )}
    </div>
  );
};

const SelectField = ({ options, value, onChange, disabled, placeholder, icon: Icon, darkMode }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border rounded-md focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors
        ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'border-gray-300 text-gray-900'}`}
    >
      <option value="" className={darkMode ? 'bg-neutral-800' : ''}>
        {placeholder}
      </option>
      {options.map(option => (
        <option 
          key={option.id} 
          value={option.id}
          className={darkMode ? 'bg-neutral-800' : ''}
        >
          {option.name || option.full_name}
        </option>
      ))}
    </select>
  );
};

function AppointmentFormModal({ isOpen, onClose, appointment = null }) {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const isEditing = !!appointment;

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
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

  // Custom hooks for data fetching
  const { data: specialties, isLoading: isLoadingSpecialties } = useGetSpecialties();
  const { data: patients, isLoading: isLoadingPatients } = useGetPatients();
  const { data: doctorsBySpecialty, isLoading: isLoadingDoctors } = useGetDoctorsBySpecialty(watch('specialty'));
  const { data: availableSlots, isLoading: isLoadingSlots } = useGetAvailableSlots(
    watch('doctor'),
    watch('appointment_date')
  );

  // Mutations
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  // Load appointment data for editing
  React.useEffect(() => {
    if (isEditing && appointment) {
      Object.entries(appointment).forEach(([key, value]) => {
        setValue(key, value);
      });
    } else {
      reset();
    }
  }, [appointment, isEditing, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      const appointmentData = {
        ...data,
        patient: Number(data.patient),
        doctor: Number(data.doctor),
        specialty: Number(data.specialty),
      };

      console.log('Enviando datos de cita:', appointmentData);

      if (isEditing) {
        await updateAppointment.mutateAsync({ id: appointment.id, data: appointmentData });
        toast.success('✅ Cita actualizada exitosamente');
      } else {
        await createAppointment.mutateAsync(appointmentData);
        toast.success('✅ Cita creada exitosamente');
      }
      
      onClose();
      reset();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.detail || 'Error al procesar la solicitud');
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full max-w-2xl rounded-2xl p-6 shadow-xl ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {isEditing ? 'Editar Cita' : 'Nueva Cita'}
                  </Dialog.Title>
                  <button onClick={onClose} className={`rounded-md ${darkMode ? 'text-neutral-400 hover:text-neutral-300' : 'text-gray-400 hover:text-gray-500'}`}>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className={`mb-4 p-3 rounded-md ${darkMode ? 'bg-blue-900/20 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start">
                    <InformationCircleIcon className={`h-5 w-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      Primero seleccione una especialidad médica, luego podrá elegir un doctor disponible.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Paciente *" error={errors.patient?.message} icon={UserCircleIcon}>
                      <SelectField
                        {...register('patient')}
                        options={patients?.results || []}
                        disabled={isLoadingPatients || isEditing}
                        placeholder="Seleccionar paciente"
                        darkMode={darkMode}
                        icon={UserCircleIcon}
                      />
                    </FormField>

                    <FormField label="Especialidad *" error={errors.specialty?.message} icon={TagIcon}>
                      <SelectField
                        {...register('specialty')}
                        options={specialties?.results || []}
                        disabled={isLoadingSpecialties}
                        placeholder="Seleccionar especialidad"
                        darkMode={darkMode}
                        icon={TagIcon}
                      />
                    </FormField>

                    <FormField label="Doctor *" error={errors.doctor?.message} icon={UserIcon}>
                      <SelectField
                        {...register('doctor')}
                        options={doctorsBySpecialty || []}
                        disabled={!watch('specialty') || isLoadingDoctors}
                        placeholder={!watch('specialty') ? "Primero seleccione una especialidad" : "Seleccionar doctor"}
                        darkMode={darkMode}
                        icon={UserIcon}
                      />
                    </FormField>

                    <FormField label="Fecha *" error={errors.appointment_date?.message} icon={CalendarIcon}>
                      <input
                        type="date"
                        {...register('appointment_date')}
                        min={new Date().toISOString().split('T')[0]}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'border-gray-300'}`}
                      />
                    </FormField>

                    <FormField label="Bloque Horario *" error={errors.time_block?.message} icon={ClockIcon}>
                      <SelectField
                        {...register('time_block')}
                        options={TIME_BLOCK_OPTIONS}
                        disabled={!watch('appointment_date') || !watch('doctor') || isLoadingSlots}
                        placeholder="Seleccionar bloque horario"
                        darkMode={darkMode}
                        icon={ClockIcon}
                      />
                    </FormField>

                    {isEditing && (
                      <FormField label="Estado" error={errors.status?.message}>
                        <SelectField
                          {...register('status')}
                          options={STATUS_OPTIONS}
                          darkMode={darkMode}
                        />
                      </FormField>
                    )}

                    {isEditing && (
                      <FormField label="Estado de Pago" error={errors.payment_status?.message}>
                        <SelectField
                          {...register('payment_status')}
                          options={PAYMENT_STATUS_OPTIONS}
                          darkMode={darkMode}
                        />
                      </FormField>
                    )}

                    <div className="md:col-span-2">
                      <FormField label="Motivo de la consulta *" error={errors.reason?.message} icon={DocumentTextIcon}>
                        <textarea
                          {...register('reason')}
                          rows={4}
                          placeholder="Describa el motivo de la consulta"
                          className={`block w-full pl-10 pr-3 py-2 border rounded-md ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'border-gray-300'}`}
                        />
                      </FormField>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className={`px-4 py-2 border rounded-md text-sm font-medium ${darkMode ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-md text-sm font-medium"
                    >
                      {isEditing ? 'Actualizar' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default AppointmentFormModal;
