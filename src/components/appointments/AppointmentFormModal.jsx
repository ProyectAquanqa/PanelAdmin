// components/appointments/AppointmentFormModal.jsx
import React, { useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { useTheme } from '../../context/ThemeContext';
import { useCreateAppointment, useUpdateAppointment } from '../../hooks/appointment/useAppointmentMutations';
import AppointmentFormFields from './AppointmentFormFields';
import FormActions from '../common/FormActions';

function AppointmentFormModal({ isOpen, onClose, appointment = null }) {
  const { darkMode } = useTheme();
  const isEditing = !!appointment;

  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const isLoading = createAppointment.isLoading || updateAppointment.isLoading;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      patient: '',
      specialty: '',
      doctor: '',
      appointment_date: '',
      time_block: '',
      reason: '',
      status: 'SCHEDULED',
      payment_status: 'PENDING',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && appointment) {
        reset({
          patient: appointment.patient?.id || appointment.patient,
          specialty: appointment.specialty?.id || appointment.specialty,
          doctor: appointment.doctor?.id || appointment.doctor,
          appointment_date: appointment.appointment_date,
          time_block: appointment.time_block,
          reason: appointment.reason || '',
          status: appointment.status,
          payment_status: appointment.payment_status,
        });
      } else {
        reset({
          patient: '',
          specialty: '',
          doctor: '',
          appointment_date: '',
          time_block: '',
          reason: '',
          status: 'SCHEDULED',
          payment_status: 'PENDING',
        });
      }
    }
  }, [isOpen, isEditing, appointment, reset]);

  const onSubmit = async (data) => {
    try {
      const appointmentData = {
        patient: Number(data.patient),
        doctor: Number(data.doctor),
        specialty: Number(data.specialty),
        appointment_date: data.appointment_date,
        time_block: data.time_block,
        reason: data.reason,
        status: data.status,
        payment_status: data.payment_status,
      };

      if (isEditing) {
        await updateAppointment.mutateAsync({ id: appointment.id, appointmentData });
      } else {
        await createAppointment.mutateAsync(appointmentData);
      }
      onClose();
    } catch (error) {
      // Los errores se manejan en el hook de mutación, no es necesario un toast aquí.
      console.error('❌ Error en el envío del formulario de cita:', error);
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
              <Dialog.Panel className={`w-full max-w-3xl rounded-2xl p-6 shadow-xl ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {isEditing ? 'Editar Cita' : 'Nueva Cita'}
                  </Dialog.Title>
                  <button onClick={onClose} className={`rounded-md p-1 ${darkMode ? 'text-neutral-400 hover:bg-neutral-700' : 'text-gray-400 hover:bg-gray-100'}`}>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <AppointmentFormFields
                      control={control}
                      errors={errors}
                      darkMode={darkMode}
                      isEditing={isEditing}
                      setValue={setValue}
                    />
                    <FormActions
                      onCancel={onClose}
                      isSubmitting={isLoading}
                      submitText={isEditing ? 'Guardar Cambios' : 'Crear Cita'}
                      theme={darkMode ? 'dark' : 'light'}
                    />
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default AppointmentFormModal;