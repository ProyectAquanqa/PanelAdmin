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
  errors = {},
  darkMode = false,
  isEditing = false,
  doctors = [],
  loadingDoctors = false,
  availableTimeBlocks = [],
  loadingTimeBlocks = false,
  availabilityInfo = null,
  selectedSpecialty = '',
  selectedDoctor = '',
  selectedDate = '',
  patients = [],
  loadingPatients = false,
  register,
  handleInputChange,
  formData,
  watch,
}) => {
  const { data: specialties, isLoading: isLoadingSpecialties } = useGetSpecialties();
  
  // Utilizar el hook de pacientes solo si no se proporcionan pacientes desde las props
  const { data: fallbackPatients, isLoading: isLoadingFallbackPatients } = patients?.length ? 
    { data: null, isLoading: false } : useGetPatients();
  
  // Combinar pacientes de props o del hook
  const patientsList = patients?.length ? patients : (fallbackPatients?.results || []);
  const isLoadingPatientData = loadingPatients || isLoadingFallbackPatients;

  const handleTimeBlockSelect = (timeBlockId) => {
    handleInputChange({ target: { name: 'time_block', value: timeBlockId } });
  };

  // Mapear doctores a formato para SelectField
  const doctorOptions = doctors?.map(doc => ({
    id: doc.id,
    name: doc.full_name || `${doc.first_name || ''} ${doc.last_name || ''}`.trim() || `Doctor #${doc.id}`
  })) || [];

  // Mapear bloques horarios a formato para SelectField
  const timeBlockOptions = availableTimeBlocks?.map(block => ({
    id: block.id,
    name: `${block.name} (${block.available_slots} cupos)`
  })) || [];

  const renderErrorMessage = (fieldName) => {
    return errors[fieldName] && (
      <p className={`mt-1 text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
        {errors[fieldName]?.message}
      </p>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormField 
            label="Paciente *" 
            name="patient"
            error={errors?.patient?.message}
            isDark={darkMode}>
            <Controller
              name="patient"
              control={control}
              rules={{ required: 'Debe seleccionar un paciente' }}
              render={({ field }) => (
                <SelectField
                  {...field}
                  options={patientsList}
                  disabled={isLoadingPatientData || isEditing}
                  placeholder={isLoadingPatientData ? "Cargando..." : "Seleccionar paciente"}
                  darkMode={darkMode}
                  icon={UserCircleIcon}
                />
              )}
            />
          </FormField>
        </div>

        <div>
          <FormField 
            label="Especialidad *" 
            name="specialty"
            error={errors?.specialty?.message}
            isDark={darkMode}>
            <Controller
              name="specialty"
              control={control}
              rules={{ required: 'Debe seleccionar una especialidad' }}
              render={({ field }) => (
                <SelectField
                  {...field}
                  options={specialties?.results || []}
                  disabled={isLoadingSpecialties}
                  placeholder={isLoadingSpecialties ? "Cargando..." : "Seleccionar especialidad"}
                  darkMode={darkMode}
                  icon={TagIcon}
                />
              )}
            />
          </FormField>
        </div>

        <div>
          <FormField 
            label="Doctor *" 
            name="doctor"
            error={errors?.doctor?.message}
            isDark={darkMode}>
            <Controller
              name="doctor"
              control={control}
              rules={{ required: 'Debe seleccionar un doctor' }}
              render={({ field }) => (
                <SelectField
                  {...field}
                  options={doctorOptions}
                  disabled={!selectedSpecialty || loadingDoctors}
                  placeholder={
                    loadingDoctors ? "Cargando..." : 
                    !selectedSpecialty ? "Seleccione especialidad primero" : 
                    "Seleccionar doctor"
                  }
                  darkMode={darkMode}
                  icon={UserIcon}
                />
              )}
            />
          </FormField>
        </div>

        <div>
          <FormField 
            label="Fecha *" 
            name="appointment_date"
            error={errors?.appointment_date?.message}
            isDark={darkMode}>
            <Controller
              name="appointment_date"
              control={control}
              rules={{ required: 'La fecha es obligatoria' }}
              render={({ field }) => (
                <div className="relative">
                  {darkMode && <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />}
                  <input
                    type="date"
                    {...field}
                    min={new Date().toISOString().split('T')[0]}
                    className={`block w-full ${darkMode ? 'pl-10' : 'pl-3'} py-2 px-3 border rounded-md ${
                      darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>
              )}
            />
          </FormField>
        </div>

        {/* Horario como campo select cuando no se puede mostrar el componente visual */}
        {(!selectedDoctor || !selectedDate) && (
          <div>
            <FormField 
              label="Horario *" 
              name="time_block"
              error={errors?.time_block?.message}
              isDark={darkMode}>
              <Controller
                name="time_block"
                control={control}
                rules={{ required: 'Debe seleccionar un horario' }}
                render={({ field }) => (
                  <SelectField
                    {...field}
                    options={timeBlockOptions}
                    disabled={!selectedDoctor || !selectedDate || loadingTimeBlocks}
                    placeholder={
                      loadingTimeBlocks ? "Cargando..." : 
                      !selectedDoctor || !selectedDate ? "Seleccione doctor y fecha primero" : 
                      "Seleccionar horario"
                    }
                    darkMode={darkMode}
                    icon={ClockIcon}
                  />
                )}
              />
            </FormField>
          </div>
        )}

        {isEditing && (
          <div>
            <FormField 
              label="Estado" 
              name="status"
              error={errors?.status?.message}
              isDark={darkMode}>
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
          </div>
        )}

        {isEditing && (
          <div>
            <FormField 
              label="Estado de Pago" 
              name="payment_status"
              error={errors?.payment_status?.message}
              isDark={darkMode}>
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
          </div>
        )}
      </div>

      {selectedDoctor && selectedDate && (
        <div className="col-span-1 md:col-span-2">
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Horario Disponible *
          </label>
          <AvailabilityDisplay
            loading={loadingTimeBlocks}
            error={errors?.time_block}
            availabilityInfo={availabilityInfo}
            availableTimeBlocks={availableTimeBlocks}
            onTimeBlockSelect={handleTimeBlockSelect}
            selectedValue={formData?.time_block}
          />
          {errors?.time_block?.message && (
            <p className={`mt-2 text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              {errors.time_block.message}
            </p>
          )}
        </div>
      )}
      
      <div className="col-span-1 md:col-span-2">
        <FormField 
          label="Motivo de la consulta *" 
          name="reason"
          error={errors?.reason?.message}
          isDark={darkMode}
          register={register}>
          <div className="relative">
            {darkMode && <DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />}
            <textarea
              {...register("reason", { required: 'El motivo es obligatorio' })}
              rows={4}
              placeholder="Describa el motivo de la consulta"
              className={`block w-full ${darkMode ? 'pl-10' : 'pl-3'} py-2 px-3 border rounded-md ${
                darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'border-gray-300'
              }`}
            />
          </div>
        </FormField>
      </div>
    </div>
  );
};

export default AppointmentFormFields;