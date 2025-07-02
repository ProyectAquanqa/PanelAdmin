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
import AvailabilityDisplay from './AvailabilityDisplay';
import { useGetSpecialties } from '../../hooks/useSpecialties';

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
  availabilityInfo,
  selectedSpecialty,
  selectedDoctor,
  selectedDate,
  patients,
  loadingPatients,
  register,
  handleInputChange,
  formData,
  watch,
}) => {
  const { data: specialties, isLoading: isLoadingSpecialties } = useGetSpecialties();

  const handleTimeBlockSelect = (timeBlockId) => {
    handleInputChange({ target: { name: 'time_block', value: timeBlockId } });
  };

  const doctorOptions = doctors?.map(doc => ({
    id: doc.id,
    name: `${doc.first_name} ${doc.last_name}`
  })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Paciente *" error={errors.patient?.message}>
          <Controller
            name="patient"
            control={control}
            render={({ field }) => (
              <SelectField
                {...field}
                options={patients || []}
                disabled={loadingPatients || isEditing}
                placeholder={loadingPatients ? "Cargando..." : "Seleccionar paciente"}
                darkMode={darkMode}
                icon={UserCircleIcon}
              />
            )}
          />
        </FormField>

        <FormField label="Especialidad *" error={errors.specialty?.message}>
          <Controller
            name="specialty"
            control={control}
            render={({ field }) => (
              <SelectField
                {...field}
                options={specialties?.results || []}
                disabled={isLoadingSpecialties}
                placeholder="Seleccionar especialidad"
                darkMode={darkMode}
                icon={TagIcon}
              />
            )}
          />
        </FormField>

        <FormField label="Doctor *" error={errors.doctor?.message}>
          <Controller
            name="doctor"
            control={control}
            render={({ field }) => (
              <SelectField
                {...field}
                options={doctorOptions}
                disabled={!selectedSpecialty || loadingDoctors}
                placeholder={loadingDoctors ? "Cargando..." : "Seleccionar doctor"}
                darkMode={darkMode}
                icon={UserIcon}
              />
            )}
          />
        </FormField>

        <FormField label="Fecha *" error={errors.appointment_date?.message}>
          <Controller
            name="appointment_date"
            control={control}
            render={({ field }) => (
              <input
                type="date"
                {...field}
                min={new Date().toISOString().split('T')[0]}
                className={`block w-full py-2 px-3 border rounded-md ${
                  darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'border-gray-300'
                }`}
              />
            )}
          />
        </FormField>

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
      </div>

      {selectedDoctor && selectedDate && (
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Horario Disponible *</label>
          <AvailabilityDisplay
            loading={loadingTimeBlocks}
            error={errorTimeBlocks}
            availabilityInfo={availabilityInfo}
            availableTimeBlocks={availableTimeBlocks}
            onTimeBlockSelect={handleTimeBlockSelect}
            selectedValue={formData?.time_block}
          />
          {errors.time_block && <p className="mt-2 text-sm text-red-600">{errors.time_block.message}</p>}
        </div>
      )}
      
      <div className="col-span-1 md:col-span-2">
        <FormField label="Motivo de la consulta *" error={errors.reason?.message}>
            <textarea
              {...register("reason")}
              rows={4}
              placeholder="Describa el motivo de la consulta"
              className={`block w-full py-2 px-3 border rounded-md ${
                darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'border-gray-300'
              }`}
            />
        </FormField>
      </div>
    </div>
  );
};

export default AppointmentFormFields;