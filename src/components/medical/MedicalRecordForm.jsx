import React, { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import FormField from '../common/FormField';
import SelectField from '../common/SelectField';
import FormCheckbox from '../common/FormCheckbox';
import FormActions from '../common/FormActions';
import Accordion from '../common/Accordion';
import { HeartIcon, DocumentTextIcon, ClipboardDocumentListIcon, ShareIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useGetAppointmentsForSelect } from '../../hooks/appointment/useGetAppointmentsForSelect';

const SEVERITY_OPTIONS = [
  { id: 'LOW', name: 'Bajo' },
  { id: 'MEDIUM', name: 'Medio' },
  { id: 'HIGH', name: 'Alto' },
  { id: 'CRITICAL', name: 'Crítico' },
];

const getLocalISOString = (date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 16);
};

const MedicalRecordForm = ({ record, appointmentId, onSave, onCancel, isLoading }) => {
  console.log("Datos del registro recibidos en el formulario:", record);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      appointment: appointmentId || '',
      record_date: getLocalISOString(new Date()),
      chief_complaint: '',
      symptoms: '',
      diagnosis: '',
      treatment_plan: '',
      notes: '',
      followup_required: false,
      followup_date: '',
      severity: 'LOW',
      is_referral_record: false,
      referral_notes: '',
      height_cm: '',
      weight_kg: '',
      blood_pressure: '',
      temperature: '',
      heart_rate: '',
      respiratory_rate: '',
      oxygen_saturation: '',
      allergies: '',
    },
  });

  useEffect(() => {
    // When the 'record' prop changes, reset the form with the new data.
    if (record) {
      // Create a copy to avoid mutating the original object
      const recordToEdit = { ...record };
      
      // Convert any null values to empty strings for controlled inputs
      Object.keys(recordToEdit).forEach(key => {
        if (recordToEdit[key] === null) {
          recordToEdit[key] = '';
        }
      });
      
      // Ensure date fields are formatted correctly for their respective inputs
      if (recordToEdit.record_date) {
        recordToEdit.record_date = getLocalISOString(new Date(recordToEdit.record_date));
      }
      if (recordToEdit.followup_date) {
        recordToEdit.followup_date = new Date(recordToEdit.followup_date).toISOString().split('T')[0];
      }
      
      reset(recordToEdit);
    } else {
      // If creating (no record), reset to initial empty state but keep appointmentId
      reset({
        appointment: appointmentId || '',
        record_date: getLocalISOString(new Date()),
        chief_complaint: '',
        symptoms: '',
        diagnosis: '',
        treatment_plan: '',
        notes: '',
        followup_required: false,
        followup_date: '',
        severity: 'LOW',
        is_referral_record: false,
        referral_notes: '',
        height_cm: '',
        weight_kg: '',
        blood_pressure: '',
        temperature: '',
        heart_rate: '',
        respiratory_rate: '',
        oxygen_saturation: '',
        allergies: '',
      });
    }
  }, [record, appointmentId, reset]);

  const { data: appointmentOptions, isLoading: isLoadingAppointments } = useGetAppointmentsForSelect();
  const followupRequired = useWatch({ control, name: 'followup_required' });
  const isReferralRecord = useWatch({ control, name: 'is_referral_record' });

  const onSubmit = (data) => {
    const payload = { ...data };
    const numericFields = [
      'height_cm', 'weight_kg', 'temperature', 
      'heart_rate', 'respiratory_rate', 'oxygen_saturation'
    ];

    Object.keys(payload).forEach(key => {
      // For numeric fields, parse if not empty, otherwise set to null.
      if (numericFields.includes(key)) {
        const value = payload[key];
        payload[key] = (value === '' || value === null) ? null : parseFloat(value);
      } 
      // For other fields, just ensure empty strings become null.
      else if (payload[key] === '') {
        payload[key] = null;
      }
    });

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">
          {record ? 'Editar' : 'Nuevo'} Historial Médico
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Gestionando el registro para la Cita ID: <span className="font-semibold">{appointmentId}</span>
        </p>
      </div>

      <div className="p-6 space-y-6 flex-grow overflow-y-auto">
        {/* Información Principal */}
        <Accordion title="Información Principal" defaultOpen icon={<DocumentTextIcon />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selector de Cita Condicional */}
              {!appointmentId ? (
                <Controller
                  name="appointment"
                  control={control}
                  rules={{ required: 'Debe seleccionar una cita' }}
                  render={({ field }) => (
                    <SelectField
                      {...field}
                      label="Seleccionar Cita"
                      options={appointmentOptions}
                      placeholder="Busque y seleccione una cita..."
                      isLoading={isLoadingAppointments}
                      error={errors.appointment}
                    />
                  )}
                />
              ) : (
                <FormField label="ID de Cita">
                    <input type="text" value={appointmentId} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 px-3 py-2" />
                </FormField>
              )}
              <Controller
                  name="record_date"
                  control={control}
                  rules={{ required: 'La fecha es obligatoria' }}
                  render={({ field }) => (
                      <FormField label="Fecha y Hora del Registro" error={errors.record_date}>
                          <input type="datetime-local" {...field} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                      </FormField>
                  )}
              />
              <Controller
                  name="chief_complaint"
                  control={control}
                  rules={{ required: 'El motivo es obligatorio' }}
                  render={({ field }) => (
                      <FormField label="Motivo Principal de Consulta" error={errors.chief_complaint}>
                          <textarea {...field} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                      </FormField>
                  )}
              />
          </div>
        </Accordion>

        {/* Signos Vitales */}
        <Accordion title="Signos Vitales" icon={<HeartIcon />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                <Controller name="height_cm" control={control} render={({ field }) => <FormField label="Altura (cm)" type="number" placeholder="170" {...field} />} />
                <Controller name="weight_kg" control={control} render={({ field }) => <FormField label="Peso (kg)" type="number" placeholder="70.5" step="0.1" {...field} />} />
                <Controller name="blood_pressure" control={control} render={({ field }) => <FormField label="Presión Arterial" placeholder="120/80" {...field} />} />
                <Controller name="temperature" control={control} render={({ field }) => <FormField label="Temperatura (°C)" type="number" step="0.1" placeholder="37.0" {...field} />} />
                <Controller name="heart_rate" control={control} render={({ field }) => <FormField label="Frec. Cardíaca" type="number" placeholder="80" {...field} />} />
                <Controller name="respiratory_rate" control={control} render={({ field }) => <FormField label="Frec. Respiratoria" type="number" placeholder="16" {...field} />} />
                <Controller name="oxygen_saturation" control={control} render={({ field }) => <FormField label="Sat. Oxígeno (%)" type="number" placeholder="98" {...field} />} />
            </div>
        </Accordion>

        {/* Diagnóstico y Tratamiento */}
        <Accordion title="Diagnóstico y Tratamiento" icon={<ClipboardDocumentListIcon />}>
          <div className="space-y-4">
            <Controller name="symptoms" control={control} render={({ field }) => <FormField label="Síntomas"><textarea {...field} rows={3} /></FormField>} />
            <Controller name="diagnosis" control={control} render={({ field }) => <FormField label="Diagnóstico"><textarea {...field} rows={3} /></FormField>} />
            <Controller name="treatment_plan" control={control} render={({ field }) => <FormField label="Plan de Tratamiento"><textarea {...field} rows={3} /></FormField>} />
            <Controller name="allergies" control={control} render={({ field }) => <FormField label="Alergias Conocidas"><textarea {...field} rows={3} /></FormField>} />
            <Controller name="notes" control={control} render={({ field }) => <FormField label="Notas Adicionales"><textarea {...field} rows={3} /></FormField>} />
            <Controller name="severity" control={control} render={({ field }) => <SelectField label="Severidad" options={SEVERITY_OPTIONS} {...field} />} />
          </div>
        </Accordion>

        {/* Seguimiento y Derivación */}
        <Accordion title="Seguimiento y Derivación" icon={<ShareIcon />}>
            <div className="space-y-4">
                <Controller
                    name="followup_required"
                    control={control}
                    render={({ field }) => <FormCheckbox {...field} checked={field.value} onChange={e => field.onChange(e.target.checked)}>Requiere seguimiento</FormCheckbox>}
                />
                {followupRequired && (
                    <Controller
                        name="followup_date"
                        control={control}
                        render={({ field }) => (
                            <FormField label="Fecha de Seguimiento">
                                <input type="date" {...field} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </FormField>
                        )}
                    />
                )}
                <Controller
                    name="is_referral_record"
                    control={control}
                    render={({ field }) => <FormCheckbox {...field} checked={field.value} onChange={e => field.onChange(e.target.checked)}>Es un registro de derivación</FormCheckbox>}
                />
                {isReferralRecord && (
                    <Controller
                        name="referral_notes"
                        control={control}
                        render={({ field }) => (
                            <FormField label="Notas de Derivación">
                                <textarea {...field} rows={3} />
                            </FormField>
                        )}
                    />
                )}
            </div>
        </Accordion>
      </div>

      <div className="p-6 border-t mt-auto">
        <FormActions onCancel={onCancel} isLoading={isLoading} />
      </div>
    </form>
  );
};

export default MedicalRecordForm; 