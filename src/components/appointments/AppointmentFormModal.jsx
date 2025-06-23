import React, { Fragment, useEffect, useState } from 'react';
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
import { motion } from 'framer-motion';

// Esquema de validación
const appointmentSchema = z.object({
  patient: z.coerce.number().int().positive('Debe seleccionar un paciente'),
  doctor: z.coerce.number().int().positive('Debe seleccionar un doctor'),
  specialty: z.coerce.number().int().positive('Debe seleccionar una especialidad'),
  appointment_date: z.string().min(1, 'La fecha es obligatoria'),
  start_time: z.string().min(1, 'La hora es obligatoria'),
  reason: z.string().min(5, 'Mínimo 5 caracteres').max(500, 'Máximo 500 caracteres'),
  status: z.string().optional(),
});

// Función para formatear la fecha mientras se escribe (DD/MM/AAAA)
const formatDateInput = (value) => {
  // Eliminar cualquier carácter que no sea número
  let cleaned = value.replace(/[^\d]/g, '');
  
  // Limitar a 8 dígitos (DDMMAAAA)
  cleaned = cleaned.slice(0, 8);
  
  // Formatear como DD/MM/AAAA
  let formatted = '';
  
  if (cleaned.length > 0) {
    formatted = cleaned.slice(0, 2);
    
    if (cleaned.length > 2) {
      formatted += '/' + cleaned.slice(2, 4);
      
      if (cleaned.length > 4) {
        formatted += '/' + cleaned.slice(4, 8);
      }
    }
  }
  
  return formatted;
};

// Función para convertir de DD/MM/AAAA a YYYY-MM-DD (formato backend)
const convertToISODate = (dateString) => {
  if (!dateString) return '';
  
  // Verificar si ya está en formato ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  
  const parts = dateString.split('/');
  if (parts.length !== 3) return '';
  
  const day = parts[0];
  const month = parts[1];
  const year = parts[2];
  
  // Validar partes de la fecha
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) return '';
  
  return `${year}-${month}-${day}`;
};

// Función para convertir de YYYY-MM-DD a DD/MM/AAAA (formato de visualización)
const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  // Verificar si ya está en formato DD/MM/AAAA
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString;
  
  try {
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  } catch (error) {
    console.error('Error al formatear fecha para mostrar:', error);
    return dateString;
  }
};

// Generar horarios disponibles (cada 30 minutos desde 8:00 hasta 20:00)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 20; hour++) {
    const hourFormatted = hour.toString().padStart(2, '0');
    slots.push(`${hourFormatted}:00`);
    if (hour < 20) {
      slots.push(`${hourFormatted}:30`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const STATUS_OPTIONS = [
  { id: 'SCHEDULED', name: 'Programada' },
  { id: 'CONFIRMED', name: 'Confirmada' },
  { id: 'COMPLETED', name: 'Completada' },
  { id: 'CANCELLED', name: 'Cancelada' },
  { id: 'NO_SHOW', name: 'No se presentó' },
  { id: 'RESCHEDULED', name: 'Reprogramada' },
];

function AppointmentFormModal({ isOpen, onClose, appointment = null }) {
  const { theme } = useTheme();
  const isEditing = !!appointment;
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Hooks para obtener datos
  const { data: specialties, isLoading: isLoadingSpecialties } = useGetSpecialties();
  const { data: patients, isLoading: isLoadingPatients } = useGetPatients();
  const { data: doctorsBySpecialty, isLoading: isLoadingDoctors } = useGetDoctorsBySpecialty(selectedSpecialty);
  const { data: availableSlots, isLoading: isLoadingSlots } = useGetAvailableSlots(
    selectedDoctor, 
    selectedDate
  );
  
  // Hooks para crear/actualizar citas
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset,
    setValue,
    watch,
    control
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient: '',
      doctor: '',
      specialty: '',
      appointment_date: '',
      start_time: '',
      reason: '',
      status: 'SCHEDULED'
    }
  });

  // Observar valores de campos
  const appointmentDateValue = watch('appointment_date');
  const specialtyValue = watch('specialty');
  const startTimeValue = watch('start_time');
  const doctorValue = watch('doctor');

  // Efecto para actualizar el estado local cuando cambia la fecha
  useEffect(() => {
    if (appointmentDateValue) {
      setSelectedDate(appointmentDateValue);
      console.log('Fecha seleccionada:', appointmentDateValue);
    }
  }, [appointmentDateValue]);

  // Efecto para actualizar el estado local cuando cambia la hora
  useEffect(() => {
    if (startTimeValue) {
      setSelectedTime(startTimeValue);
      console.log('Hora seleccionada:', startTimeValue);
    }
  }, [startTimeValue]);

  // Efecto para actualizar el estado local cuando cambia el doctor
  useEffect(() => {
    if (doctorValue) {
      setSelectedDoctor(Number(doctorValue));
      console.log('Doctor seleccionado:', doctorValue);
    }
  }, [doctorValue]);

  // Efecto para actualizar la lista de doctores cuando cambia la especialidad
  useEffect(() => {
    if (specialtyValue) {
      setDoctorsLoading(true);
      setSelectedSpecialty(Number(specialtyValue));
      
      // Limpiar doctor seleccionado cuando cambia la especialidad
      if (!isEditing) {
        setValue('doctor', '');
      }
    }
  }, [specialtyValue, setValue, isEditing]);

  // Efecto para manejar la carga de doctores
  useEffect(() => {
    if (doctorsBySpecialty) {
      setDoctorsLoading(false);
      console.log('Doctores cargados:', doctorsBySpecialty);
    }
  }, [doctorsBySpecialty]);

  // Cargar datos de la cita para edición
  useEffect(() => {
    if (isEditing && appointment) {
      setValue('patient', appointment.patient || '');
      setValue('doctor', appointment.doctor || '');
      setSelectedDoctor(appointment.doctor);
      setValue('specialty', appointment.specialty || '');
      setSelectedSpecialty(appointment.specialty);
      
      // Usar directamente el formato ISO para el input type="date"
      if (appointment.appointment_date) {
        setValue('appointment_date', appointment.appointment_date);
        setSelectedDate(appointment.appointment_date);
        console.log('Fecha cargada para edición:', appointment.appointment_date);
      }
      
      if (appointment.start_time) {
        setValue('start_time', appointment.start_time);
        setSelectedTime(appointment.start_time);
        console.log('Hora cargada para edición:', appointment.start_time);
      }
      
      setValue('reason', appointment.reason || '');
      setValue('status', appointment.status || 'SCHEDULED');
    } else {
      reset();
      setSelectedDate('');
      setSelectedTime('');
      setSelectedDoctor(null);
    }
  }, [appointment, isEditing, setValue, reset]);

  // Manejar cambio de fecha directamente
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setValue('appointment_date', newDate);
    setSelectedDate(newDate);
    console.log('Nueva fecha seleccionada:', newDate);
  };

  // Manejar cambio de hora directamente
  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setValue('start_time', newTime);
    setSelectedTime(newTime);
    console.log('Nueva hora seleccionada:', newTime);
  };

  const onSubmit = async (data) => {
    try {
      // Preparar datos
      const appointmentData = {
        ...data,
        patient: data.patient ? Number(data.patient) : null,
        doctor: data.doctor ? Number(data.doctor) : null,
        specialty: data.specialty ? Number(data.specialty) : null,
        // No necesitamos convertir la fecha ya que el input type="date" ya devuelve formato YYYY-MM-DD
        appointment_date: data.appointment_date
      };

      console.log('📤 Datos de la cita ANTES de enviar:', appointmentData);
      
      if (isEditing) {
        await updateAppointment.mutateAsync({ 
          id: appointment.id, 
          data: appointmentData 
        });
        toast.success('✅ Cita actualizada exitosamente');
      } else {
        await createAppointment.mutateAsync(appointmentData);
        toast.success('✅ Cita creada exitosamente');
      }
      
      onClose();
      reset();
    } catch (error) {
      console.error('❌ Error:', error);
      
      // Manejar errores específicos del backend
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log('📋 Datos del error completo:', errorData);
        
        if (errorData.detail) {
          toast.error(errorData.detail);
        } else if (errorData.non_field_errors) {
          toast.error(errorData.non_field_errors[0] || 'Error de validación');
        } else {
          // Mostrar todos los errores de validación
          const allErrors = Object.entries(errorData).map(([field, errors]) => 
            `${field}: ${Array.isArray(errors) ? errors[0] : errors}`
          ).join(', ');
          toast.error(`Errores: ${allErrors}`);
        }
      } else {
        toast.error('Error de conexión. Verifica que el servidor esté funcionando.');
      }
    }
  };

  // Verificar si una hora está disponible
  const isTimeSlotAvailable = (timeSlot) => {
    if (!availableSlots || !selectedDoctor || !selectedDate) return true;
    
    // Si tenemos datos de disponibilidad, verificar si el horario está disponible
    if (availableSlots.available_slots && Array.isArray(availableSlots.available_slots)) {
      return availableSlots.available_slots.includes(timeSlot);
    }
    
    // Si tenemos datos de horarios ocupados, verificar que el horario no esté ocupado
    if (availableSlots.busy_slots && Array.isArray(availableSlots.busy_slots)) {
      return !availableSlots.busy_slots.includes(timeSlot);
    }
    
    return true; // Si no hay datos de disponibilidad, asumir que está disponible
  };

  // Obtener los horarios disponibles
  const getAvailableTimeSlots = () => {
    if (!availableSlots) return TIME_SLOTS;
    
    // Si tenemos datos de disponibilidad, filtrar los horarios disponibles
    if (availableSlots.available_slots && Array.isArray(availableSlots.available_slots)) {
      return availableSlots.available_slots;
    }
    
    // Si tenemos datos de horarios ocupados, filtrar los horarios no ocupados
    if (availableSlots.busy_slots && Array.isArray(availableSlots.busy_slots)) {
      return TIME_SLOTS.filter(slot => !availableSlots.busy_slots.includes(slot));
    }
    
    return TIME_SLOTS; // Si no hay datos de disponibilidad, mostrar todos los horarios
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop con animación */}
        <Transition.Child
          as={Fragment}
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full max-w-2xl transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${
                theme === 'dark' ? 'bg-neutral-800' : 'bg-white'
              }`}>
                <div className={`flex justify-between items-center border-b pb-4 mb-4 ${
                  theme === 'dark' ? 'border-neutral-700' : 'border-gray-200'
                }`}>
                  <Dialog.Title
                    as="h3"
                    className={`text-lg font-medium leading-6 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {isEditing ? 'Editar Cita' : 'Nueva Cita'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className={`rounded-md focus:outline-none ${
                      theme === 'dark' ? 'text-neutral-400 hover:text-neutral-300' : 'text-gray-400 hover:text-gray-500'
                    }`}
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Nota informativa sobre el flujo del formulario */}
                <div className={`mb-4 p-3 rounded-md ${
                  theme === 'dark' 
                    ? 'bg-blue-900/20 border border-blue-500/20' 
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-start">
                    <InformationCircleIcon className={`h-5 w-5 mr-2 mt-0.5 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      Primero seleccione una especialidad médica, luego podrá elegir un doctor disponible para esa especialidad.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Paciente */}
                    <div>
                      <label htmlFor="patient" className={`block text-sm font-medium ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                      }`}>
                        Paciente *
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserCircleIcon className={`h-5 w-5 ${
                            theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
                          }`} />
                        </div>
                        <select
                          id="patient"
                          className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors ${
                            errors.patient 
                              ? theme === 'dark' ? 'border-red-500 bg-red-900/10' : 'border-red-300' 
                              : theme === 'dark' ? 'border-neutral-600 bg-neutral-700' : 'border-gray-300'
                          } ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                          {...register('patient', { 
                            setValueAs: value => value ? Number(value) : null 
                          })}
                          disabled={isLoadingPatients || isEditing}
                        >
                          <option value="" className={theme === 'dark' ? 'bg-neutral-800' : ''}>Seleccionar paciente</option>
                          {patients?.results?.map(patient => (
                            <option key={patient.id} value={patient.id} className={theme === 'dark' ? 'bg-neutral-800' : ''}>
                              {patient.full_name || `${patient.first_name} ${patient.last_name}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.patient && (
                        <p className={`mt-1 text-sm ${
                          theme === 'dark' ? 'text-red-400' : 'text-red-600'
                        }`}>{errors.patient.message}</p>
                      )}
                    </div>

                    {/* Especialidad */}
                    <div>
                      <label htmlFor="specialty" className={`block text-sm font-medium ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                      }`}>
                        Especialidad *
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <TagIcon className={`h-5 w-5 ${
                            theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
                          }`} />
                        </div>
                        <select
                          id="specialty"
                          className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors ${
                            errors.specialty 
                              ? theme === 'dark' ? 'border-red-500 bg-red-900/10' : 'border-red-300' 
                              : theme === 'dark' ? 'border-neutral-600 bg-neutral-700' : 'border-gray-300'
                          } ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                          {...register('specialty', { 
                            setValueAs: value => value ? Number(value) : null 
                          })}
                          disabled={isLoadingSpecialties}
                        >
                          <option value="" className={theme === 'dark' ? 'bg-neutral-800' : ''}>Seleccionar especialidad</option>
                          {specialties?.results?.map(specialty => (
                            <option key={specialty.id} value={specialty.id} className={theme === 'dark' ? 'bg-neutral-800' : ''}>
                              {specialty.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.specialty && (
                        <p className={`mt-1 text-sm ${
                          theme === 'dark' ? 'text-red-400' : 'text-red-600'
                        }`}>{errors.specialty.message}</p>
                      )}
                    </div>

                    {/* Doctor */}
                    <div>
                      <label htmlFor="doctor" className={`block text-sm font-medium ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                      }`}>
                        Doctor *
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className={`h-5 w-5 ${
                            theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
                          }`} />
                        </div>
                        <select
                          id="doctor"
                          className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors ${
                            errors.doctor 
                              ? theme === 'dark' ? 'border-red-500 bg-red-900/10' : 'border-red-300' 
                              : theme === 'dark' ? 'border-neutral-600 bg-neutral-700' : 'border-gray-300'
                          } ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                          {...register('doctor', { 
                            setValueAs: value => value ? Number(value) : null 
                          })}
                          disabled={!selectedSpecialty || isLoadingDoctors || doctorsLoading}
                        >
                          <option value="" className={theme === 'dark' ? 'bg-neutral-800' : ''}>
                            {doctorsLoading 
                              ? "Cargando doctores..." 
                              : !selectedSpecialty 
                                ? "Primero seleccione una especialidad" 
                                : "Seleccionar doctor"}
                          </option>
                          {doctorsBySpecialty?.map(doctor => (
                            <option key={doctor.id} value={doctor.id} className={theme === 'dark' ? 'bg-neutral-800' : ''}>
                              {doctor.full_name || `Dr. ${doctor.first_name} ${doctor.last_name}`}
                            </option>
                          ))}
                        </select>
                        {doctorsLoading && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <div className="animate-spin h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                          </div>
                        )}
                      </div>
                      {errors.doctor && (
                        <p className={`mt-1 text-sm ${
                          theme === 'dark' ? 'text-red-400' : 'text-red-600'
                        }`}>{errors.doctor.message}</p>
                      )}
                      {!selectedSpecialty && !doctorsLoading && (
                        <p className={`mt-1 text-xs ${
                          theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'
                        }`}>
                          Primero seleccione una especialidad
                        </p>
                      )}
                      {doctorsBySpecialty?.length === 0 && selectedSpecialty && !doctorsLoading && (
                        <p className={`mt-1 text-xs ${
                          theme === 'dark' ? 'text-red-400' : 'text-red-500'
                        }`}>
                          No hay doctores disponibles para esta especialidad
                        </p>
                      )}
                    </div>

                    {/* Fecha de la cita */}
                    <div>
                      <label htmlFor="appointment_date" className={`block text-sm font-medium ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                      }`}>
                        Fecha de la cita *
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CalendarIcon className={`h-5 w-5 ${
                            theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
                          }`} />
                        </div>
                        <input
                          type="date"
                          id="appointment_date"
                          className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors ${
                            errors.appointment_date 
                              ? theme === 'dark' ? 'border-red-500 bg-red-900/10' : 'border-red-300' 
                              : theme === 'dark' ? 'border-neutral-600 bg-neutral-700' : 'border-gray-300'
                          } ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                          value={selectedDate}
                          onChange={handleDateChange}
                          min={new Date().toISOString().split('T')[0]} // No permitir fechas anteriores a hoy
                        />
                      </div>
                      {errors.appointment_date && (
                        <p className={`mt-1 text-sm ${
                          theme === 'dark' ? 'text-red-400' : 'text-red-600'
                        }`}>{errors.appointment_date.message}</p>
                      )}
                      {selectedDate && (
                        <p className={`mt-1 text-xs ${
                          theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        }`}>
                          Fecha seleccionada: {formatDateForDisplay(selectedDate)}
                        </p>
                      )}
                    </div>

                    {/* Hora de inicio */}
                    <div>
                      <label htmlFor="start_time" className={`block text-sm font-medium ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                      }`}>
                        Hora de la cita *
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <ClockIcon className={`h-5 w-5 ${
                            theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
                          }`} />
                        </div>
                        <select
                          id="start_time"
                          className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors ${
                            errors.start_time 
                              ? theme === 'dark' ? 'border-red-500 bg-red-900/10' : 'border-red-300' 
                              : theme === 'dark' ? 'border-neutral-600 bg-neutral-700' : 'border-gray-300'
                          } ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                          value={selectedTime}
                          onChange={handleTimeChange}
                          disabled={!selectedDate || !selectedSpecialty || !selectedDoctor || isLoadingSlots}
                        >
                          <option value="" className={theme === 'dark' ? 'bg-neutral-800' : ''}>
                            {isLoadingSlots 
                              ? "Cargando horarios disponibles..." 
                              : !selectedDate || !selectedDoctor 
                                ? "Primero seleccione fecha y doctor" 
                                : "Seleccionar hora"}
                          </option>
                          {(isLoadingSlots ? TIME_SLOTS : getAvailableTimeSlots()).map(slot => (
                            <option 
                              key={slot} 
                              value={slot}
                              disabled={!isTimeSlotAvailable(slot)}
                              className={theme === 'dark' ? 'bg-neutral-800' : ''}
                            >
                              {slot}
                            </option>
                          ))}
                        </select>
                        {isLoadingSlots && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <div className="animate-spin h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                          </div>
                        )}
                      </div>
                      {errors.start_time && (
                        <p className={`mt-1 text-sm ${
                          theme === 'dark' ? 'text-red-400' : 'text-red-600'
                        }`}>{errors.start_time.message}</p>
                      )}
                      {!selectedDate && (
                        <p className={`mt-1 text-xs ${
                          theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'
                        }`}>
                          Primero seleccione una fecha
                        </p>
                      )}
                      {!selectedDoctor && selectedDate && (
                        <p className={`mt-1 text-xs ${
                          theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'
                        }`}>
                          Seleccione un doctor para ver horarios disponibles
                        </p>
                      )}
                      {selectedTime && (
                        <p className={`mt-1 text-xs ${
                          theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        }`}>
                          Hora seleccionada: {selectedTime}
                        </p>
                      )}
                      {availableSlots && availableSlots.available_slots && availableSlots.available_slots.length === 0 && (
                        <p className={`mt-1 text-xs ${
                          theme === 'dark' ? 'text-red-400' : 'text-red-500'
                        }`}>
                          No hay horarios disponibles para este doctor en la fecha seleccionada
                        </p>
                      )}
                    </div>

                    {/* Estado (solo para edición) */}
                    {isEditing && (
                      <div>
                        <label htmlFor="status" className={`block text-sm font-medium ${
                          theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                        }`}>
                          Estado
                        </label>
                        <div className="mt-1">
                          <select
                            id="status"
                            className={`block w-full px-3 py-2 border rounded-md focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors ${
                              errors.status 
                                ? theme === 'dark' ? 'border-red-500 bg-red-900/10' : 'border-red-300' 
                                : theme === 'dark' ? 'border-neutral-600 bg-neutral-700' : 'border-gray-300'
                            } ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                            {...register('status')}
                          >
                            {STATUS_OPTIONS.map(option => (
                              <option key={option.id} value={option.id} className={theme === 'dark' ? 'bg-neutral-800' : ''}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors.status && (
                          <p className={`mt-1 text-sm ${
                            theme === 'dark' ? 'text-red-400' : 'text-red-600'
                          }`}>{errors.status.message}</p>
                        )}
                      </div>
                    )}

                    {/* Motivo de la consulta - ocupa 2 columnas */}
                    <div className="md:col-span-2">
                      <label htmlFor="reason" className={`block text-sm font-medium ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                      }`}>
                        Motivo de la consulta *
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DocumentTextIcon className={`h-5 w-5 ${
                            theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
                          }`} />
                        </div>
                        <textarea
                          id="reason"
                          rows={4}
                          className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors ${
                            errors.reason 
                              ? theme === 'dark' ? 'border-red-500 bg-red-900/10' : 'border-red-300' 
                              : theme === 'dark' ? 'border-neutral-600 bg-neutral-700' : 'border-gray-300'
                          } ${
                            theme === 'dark' ? 'text-white placeholder-neutral-500' : 'text-gray-900 placeholder-gray-400'
                          }`}
                          placeholder="Describa el motivo de la consulta"
                          {...register('reason')}
                        />
                      </div>
                      {errors.reason && (
                        <p className={`mt-1 text-sm ${
                          theme === 'dark' ? 'text-red-400' : 'text-red-600'
                        }`}>{errors.reason.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                        theme === 'dark' 
                          ? 'border-neutral-600 text-neutral-300 hover:bg-neutral-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={onClose}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition-colors"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
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