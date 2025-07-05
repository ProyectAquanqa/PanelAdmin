// components/appointments/AppointmentFormFields.jsx
import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
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
import AvailabilityDisplay from './AvailabilityDisplay';
import { useGetActiveSpecialties } from '../../hooks/useSpecialties';
import { useGetPatients } from '../../hooks/usePatients';
import { useAppointmentDoctors } from '../../hooks/appointment/useAppointmentDoctors';
import { useAppointmentAvailability } from '../../hooks/appointment/useAppointmentAvailability';

const STATUS_OPTIONS = [
  { id: 'SCHEDULED', name: 'Programada' },
  { id: 'IN_CONSULTATION', name: 'En consulta' },
  { id: 'COMPLETED', name: 'Completada' },
  { id: 'CANCELLED', name: 'Cancelada' },
  { id: 'NO_SHOW', name: 'No se presentó' },
];

const PAYMENT_STATUS_OPTIONS = [
  { id: 'PENDING', name: 'Pendiente' },
  { id: 'PROCESSING', name: 'En proceso' },
  { id: 'COMPLETED', name: 'Completado' },
  { id: 'FAILED', name: 'Fallido' },
  { id: 'REFUNDED', name: 'Reembolsado' },
];

const AppointmentFormFields = ({ control, errors, darkMode, isEditing, setValue }) => {
  // Hooks para obtener datos
  const { data: activeSpecialties, isLoading: isLoadingSpecialties } = useGetActiveSpecialties();
  const { data: patientsData, isLoading: isLoadingPatients } = useGetPatients();
  
  // Observar cambios en los campos del formulario
  const specialtyId = useWatch({ control, name: 'specialty' });
  const doctorId = useWatch({ control, name: 'doctor' });
  const appointmentDate = useWatch({ control, name: 'appointment_date' });

  // Hooks dependientes de los campos observados
  const { doctors, loadingDoctors } = useAppointmentDoctors(specialtyId);
  const { availableTimeBlocks, loadingTimeBlocks, availabilityInfo } = useAppointmentAvailability(doctorId, appointmentDate);

  // Formatear opciones para los selectores
  const patientOptions = patientsData?.results.map(p => ({ id: p.id, name: p.user.full_name })) || [];
  const specialtyOptions = activeSpecialties?.map(s => ({ id: s.id, name: s.name })) || [];
  const doctorOptions = doctors?.map(d => ({ id: d.id, name: d.full_name })) || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Paciente */}
        <Controller
          name="patient"
          control={control}
          rules={{ required: 'El paciente es obligatorio' }}
          render={({ field }) => (
            <SelectField
              {...field}
              label="Paciente"
              options={patientOptions}
              placeholder="Seleccione un paciente"
              isLoading={isLoadingPatients}
              disabled={isEditing}
              error={errors.patient}
              darkMode={darkMode}
              icon={UserCircleIcon}
            />
          )}
        />
        
        {/* Especialidad */}
        <Controller
          name="specialty"
          control={control}
          rules={{ required: 'La especialidad es obligatoria' }}
          render={({ field }) => (
            <SelectField
              {...field}
              label="Especialidad"
              options={specialtyOptions}
              placeholder="Seleccione una especialidad"
              isLoading={isLoadingSpecialties}
              error={errors.specialty}
              darkMode={darkMode}
              icon={TagIcon}
            />
          )}
        />
        
        {/* Doctor */}
        <Controller
          name="doctor"
          control={control}
          rules={{ required: 'El doctor es obligatorio' }}
          render={({ field }) => (
            <SelectField
              {...field}
              label="Doctor"
              options={doctorOptions}
              placeholder={!specialtyId ? 'Seleccione especialidad primero' : 'Seleccione un doctor'}
              isLoading={loadingDoctors}
              disabled={!specialtyId || loadingDoctors}
              error={errors.doctor}
              darkMode={darkMode}
              icon={UserIcon}
            />
          )}
        />

        {/* Fecha */}
        <Controller
          name="appointment_date"
          control={control}
          rules={{ required: 'La fecha es obligatoria' }}
          render={({ field }) => (
            <FormField label="Fecha de la Cita" error={errors.appointment_date} isDark={darkMode}>
                <input
                  type="date"
                  {...field}
                  min={new Date().toISOString().split("T")[0]}
                  className={`mt-1 block w-full rounded-md shadow-sm ${darkMode ? 'bg-neutral-700 border-neutral-600' : 'border-gray-300'}`}
                />
            </FormField>
          )}
        />
      </div>

      {/* Bloques horarios */}
      {doctorId && appointmentDate && (
        <Controller
          name="time_block"
          control={control}
          rules={{ required: 'El bloque horario es obligatorio' }}
          render={({ field, fieldState: { error } }) => (
            <AvailabilityDisplay
              {...field}
              availabilityInfo={availabilityInfo}
              availableTimeBlocks={availableTimeBlocks}
              loading={loadingTimeBlocks}
              error={error}
            />
          )}
        />
      )}

      {/* Razón de la consulta */}
      <Controller
        name="reason"
        control={control}
        render={({ field }) => (
          <FormField label="Razón de la Consulta" error={errors.reason} isDark={darkMode}>
            <textarea
              {...field}
              rows={3}
              className={`mt-1 block w-full rounded-md shadow-sm ${darkMode ? 'bg-neutral-700 border-neutral-600' : 'border-gray-300'}`}
            />
          </FormField>
        )}
      />

      {/* Campos de edición */}
      {isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <SelectField {...field} label="Estado" options={STATUS_OPTIONS} darkMode={darkMode} />
            )}
          />
          <Controller
            name="payment_status"
            control={control}
            render={({ field }) => (
              <SelectField {...field} label="Estado del Pago" options={PAYMENT_STATUS_OPTIONS} darkMode={darkMode} />
            )}
          />
        </div>
      )}
    </div>
  );
};

export default AppointmentFormFields;