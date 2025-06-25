// components/appointments/AppointmentFormFields.jsx
import React from 'react';
import { Controller } from 'react-hook-form';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  UserCircleIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import FormField from '../common/FormField';
import SelectField from '../common/SelectField';
import AvailabilityDisplay from './AvailabilityDisplay'; // ✅ NUEVO: Importar componente
import { useGetSpecialties } from '../../hooks/useSpecialties';
import { useGetPatients } from '../../hooks/usePatients';

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

const AppointmentFormFields = ({
  control,
  errors,
  darkMode,
  isEditing,
  doctors,
  loadingDoctors,
  availableTimeBlocks,
  loadingTimeBlocks,
  availabilityInfo, // ✅ NUEVO: Recibir info de disponibilidad
  selectedSpecialty,
  selectedDoctor,
  selectedDate,
  watch, // ✅ NUEVO: Para obtener el time_block seleccionado
}) => {
  const { data: specialties, isLoading: isLoadingSpecialties } = useGetSpecialties();
  const { data: patients, isLoading: isLoadingPatients } = useGetPatients();

  return (
    <div className="space-y-6">
      {/* Campos del formulario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Paciente */}
        <FormField label="Paciente *" error={errors.patient?.message} icon={UserCircleIcon}>
          <Controller
            name="patient"
            control={control}
            render={({ field }) => (
              <SelectField
                {...field}
                options={patients?.results || []}
                disabled={isLoadingPatients || isEditing}
                placeholder="Seleccionar paciente"
                darkMode={darkMode}
                icon={UserCircleIcon}
              />
            )}
          />
        </FormField>

        {/* Especialidad */}
        <FormField label="Especialidad *" error={errors.specialty?.message} icon={TagIcon}>
          <Controller
            name="specialty"
            control={control}
            render={({ field }) => (
              <SelectField
                {...field}
                options={specialties?.results || []}
                disabled={isLoadingSpecialties || isEditing}
                placeholder="Seleccionar especialidad"
                darkMode={darkMode}
                icon={TagIcon}
              />
            )}
          />
        </FormField>

        {/* Doctor */}
        <FormField label="Doctor *" error={errors.doctor?.message} icon={UserIcon}>
          <Controller
            name="doctor"
            control={control}
            render={({ field }) => (
              <SelectField
                {...field}
                options={doctors}
                disabled={!selectedSpecialty || loadingDoctors || isEditing}
                placeholder={
                  loadingDoctors 
                    ? "🔄 Cargando doctores..." 
                    : !selectedSpecialty 
                      ? "Primero seleccione una especialidad" 
                      : doctors.length === 0 
                        ? "No hay doctores disponibles" 
                        : `Seleccionar doctor (${doctors.length} disponibles)`
                }
                darkMode={darkMode}
                icon={UserIcon}
              />
            )}
          />
        </FormField>

        {/* Fecha */}
        <FormField label="Fecha *" error={errors.appointment_date?.message} icon={CalendarIcon}>
          <Controller
            name="appointment_date"
            control={control}
            render={({ field }) => {
              // Permitir citas desde HOY (incluyendo hoy)
              const today = new Date();
              const minDate = today.toISOString().split('T')[0];
              
              return (
                <input
                  type="date"
                  {...field}
                  min={minDate}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md ${
                    darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'border-gray-300'
                  }`}
                />
              );
            }}
          />
        </FormField>

        {/* Bloque Horario */}
        <FormField label="Bloque Horario *" error={errors.time_block?.message} icon={ClockIcon}>
          <Controller
            name="time_block"
            control={control}
            render={({ field }) => (
              <SelectField
                {...field}
                options={availableTimeBlocks}
                disabled={!selectedDoctor || !selectedDate || loadingTimeBlocks}
                placeholder={
                  loadingTimeBlocks 
                    ? "🔄 Cargando horarios..." 
                    : !selectedDoctor || !selectedDate 
                      ? "Seleccione doctor y fecha primero" 
                      : availableTimeBlocks.length === 0 
                        ? "❌ Doctor no atiende este día - Seleccione otra fecha" 
                        : `Seleccionar horario (${availableTimeBlocks.length} disponibles)`
                }
                darkMode={darkMode}
                icon={ClockIcon}
              />
            )}
          />
        </FormField>

        {/* Estado (solo al editar) */}
        {isEditing && (
          <FormField label="Estado" error={errors.status?.message}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  options={STATUS_OPTIONS}
                  darkMode={darkMode}
                />
              )}
            />
          </FormField>
        )}

        {/* Estado de Pago (solo al editar) */}
        {isEditing && (
          <FormField label="Estado de Pago" error={errors.payment_status?.message}>
            <Controller
              name="payment_status"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  options={PAYMENT_STATUS_OPTIONS}
                  darkMode={darkMode}
                />
              )}
            />
          </FormField>
        )}

        {/* Motivo de consulta */}
        <div className="md:col-span-2">
          <FormField label="Motivo de la consulta *" error={errors.reason?.message} icon={DocumentTextIcon}>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={4}
                  placeholder="Describa el motivo de la consulta"
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md ${
                    darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'border-gray-300'
                  }`}
                />
              )}
            />
          </FormField>
        </div>
      </div>

      {/* ✅ NUEVO: Mostrar información de disponibilidad */}
      {selectedDoctor && selectedDate && (
        <AvailabilityDisplay
          availabilityInfo={availabilityInfo}
          availableTimeBlocks={availableTimeBlocks}
          selectedTimeBlock={watch ? watch('time_block') : null}
          className="mt-4"
        />
      )}
    </div>
  );
};

export default AppointmentFormFields;