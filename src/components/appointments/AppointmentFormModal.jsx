// components/appointments/AppointmentFormModal.jsx
import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { useCreateAppointment, useUpdateAppointment } from '../../hooks/appointment/useAppointmentMutations';
import { useAppointmentForm } from '../../hooks/appointment';
import AppointmentFormFields from './AppointmentFormFields';

function AppointmentFormModal({ isOpen, onClose, appointment = null }) {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  
  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    register,
    handleInputChange,
    formData,
    doctors,
    loadingDoctors,
    availableTimeBlocks,
    loadingTimeBlocks,
    availabilityInfo,
    selectedSpecialty,
    selectedDoctor,
    selectedDate,
    patients,
    loadingPatients,
  } = useAppointmentForm(appointment);

  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const onSubmit = async (data) => {
    try {
      console.log('📝 Datos del formulario:', data);
      
      if (!data.patient || !data.doctor || !data.specialty || !data.appointment_date || !data.time_block) {
        toast.error('Por favor complete todos los campos requeridos');
        return;
      }
      
      // Construct the data payload with only the fields expected by the backend
      const appointmentData = {
        patient: Number(data.patient),
        doctor: Number(data.doctor),
        specialty: Number(data.specialty),
        appointment_date: data.appointment_date,
        time_block: data.time_block,
        reason: data.reason,
      };

      if (appointment) {
        // For updates, include status fields if they exist
        appointmentData.status = data.status;
        appointmentData.payment_status = data.payment_status;
      }

      console.log('📤 Enviando datos de cita:', appointmentData);

      if (appointment) {
        await updateAppointment.mutateAsync({ id: appointment.id, appointmentData });
      } else {
        await createAppointment.mutateAsync(appointmentData);
      }
      
      // No toast needed here, react-query's onSuccess handles it
      onClose();
      reset();
    } catch (error) {
      console.error('❌ Error en onSubmit:', error);
      // No toast needed here, react-query's onError handles it
    }
  };

  const isLoading = createAppointment.isLoading || updateAppointment.isLoading;

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
              <Dialog.Panel className={`w-full max-w-3xl rounded-2xl p-6 shadow-xl ${
                darkMode ? 'bg-neutral-800' : 'bg-white'
              }`}>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className={`text-lg font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {appointment ? 'Editar Cita' : 'Nueva Cita'}
                  </Dialog.Title>
                  <button 
                    onClick={onClose} 
                    className={`rounded-md ${
                      darkMode ? 'text-neutral-400 hover:text-neutral-300' : 'text-gray-400 hover:text-gray-500'
                    }`}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Info Banner */}
                <div className={`mb-4 p-3 rounded-md ${
                  darkMode ? 'bg-blue-900/20 border-blue-500/20' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start">
                    <InformationCircleIcon className={`h-5 w-5 mr-2 ${
                      darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                    <p className={`text-sm ${
                      darkMode ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      ✅ <strong>Sistema mejorado:</strong> Ahora puede agendar múltiples citas por doctor por día. 
                      El sistema muestra los cupos disponibles en tiempo real.
                    </p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <AppointmentFormFields
                    formData={formData}
                    handleInputChange={handleInputChange}
                    errors={errors || {}}
                    watch={watch}
                    register={register}
                    control={control}
                    darkMode={darkMode}
                    isEditing={!!appointment}
                    doctors={doctors || []}
                    loadingDoctors={loadingDoctors || false}
                    availableTimeBlocks={availableTimeBlocks || []}
                    loadingTimeBlocks={loadingTimeBlocks || false}
                    availabilityInfo={availabilityInfo || null}
                    selectedSpecialty={selectedSpecialty || ''}
                    selectedDoctor={selectedDoctor || ''}
                    selectedDate={selectedDate || ''}
                    patients={patients || []}
                    loadingPatients={loadingPatients || false}
                  />

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className={`px-4 py-2 border rounded-md text-sm font-medium ${
                        darkMode 
                          ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                        </span>
                      ) : (
                        appointment ? 'Actualizar Cita' : 'Crear Cita'
                      )}
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