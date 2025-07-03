import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTheme } from '../../context/ThemeContext';
import { useUpdatePatient } from '../../hooks/usePatients';
import FormField from '../common/FormField';
import FormActions from '../common/FormActions';
import { toast } from 'react-hot-toast';

const GENDER_CHOICES = [
  { value: 'MALE', label: 'Masculino' },
  { value: 'FEMALE', label: 'Femenino' },
  { value: 'OTHER', label: 'Otro' },
];

const BLOOD_TYPE_CHOICES = [
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'A_NEGATIVE', label: 'A-' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'B_NEGATIVE', label: 'B-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'O_NEGATIVE', label: 'O-' },
];

// Esquema de validación con Zod
const patientSchema = z.object({
  dni: z.string().length(8, 'El DNI debe tener 8 caracteres').optional().or(z.literal('')),
  first_name: z.string().min(2, 'El nombre es requerido'),
  last_name: z.string().min(2, 'El apellido es requerido'),
  second_last_name: z.string().optional(),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  address: z.string().optional(),
  gender: z.string().optional(),
  blood_type: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

const PatientEditForm = ({ patient, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const updatePatientMutation = useUpdatePatient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
        dni: patient?.document_number || '',
        first_name: patient?.first_name || '',
        last_name: patient?.last_name || '',
        second_last_name: patient?.second_last_name || '',
        phone: patient?.phone || '',
        birth_date: patient?.birth_date || '',
        address: patient?.address || '',
        gender: patient?.gender || '',
        blood_type: patient?.blood_type || '',
        emergency_contact_name: patient?.emergency_contact_name || '',
        emergency_contact_phone: patient?.emergency_contact_phone || '',
    },
  });

  // Resetear el formulario si el paciente cambia
  useEffect(() => {
    if (patient) {
      reset({
        dni: patient.document_number || '',
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        second_last_name: patient.second_last_name || '',
        phone: patient.phone || '',
        birth_date: patient.birth_date || '',
        address: patient.address || '',
        gender: patient.gender || '',
        blood_type: patient.blood_type || '',
        emergency_contact_name: patient.emergency_contact_name || '',
        emergency_contact_phone: patient.emergency_contact_phone || '',
      });
    }
  }, [patient, reset]);

  const onSubmit = async (data) => {
    toast.loading('Actualizando paciente...');
    const payload = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== null && v !== '')
    );

    try {
      await updatePatientMutation.mutateAsync({ id: patient.id, ...payload });
      toast.dismiss();
      toast.success('Paciente actualizado con éxito');
      onClose(); // Cerrar el modal en caso de éxito
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.detail || 'No se pudo actualizar el paciente');
    }
  };

  const formFieldStyles = isDark
    ? 'bg-gray-700 border-gray-600 text-white'
    : 'bg-white border-gray-300 text-gray-900';
  const labelStyles = isDark ? 'text-gray-300' : 'text-gray-700';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Nombres"
          name="first_name"
          type="text"
          register={register}
          error={errors.first_name}
          isDark={isDark}
        />
        <FormField
          label="Apellido Paterno"
          name="last_name"
          type="text"
          register={register}
          error={errors.last_name}
          isDark={isDark}
        />
        <FormField
          label="Apellido Materno"
          name="second_last_name"
          type="text"
          register={register}
          error={errors.second_last_name}
          isDark={isDark}
        />
        <FormField
          label="DNI"
          name="dni"
          type="text"
          register={register}
          error={errors.dni}
          isDark={isDark}
        />
        <FormField
          label="Teléfono"
          name="phone"
          type="tel"
          register={register}
          error={errors.phone}
          isDark={isDark}
        />
        <FormField
          label="Fecha de Nacimiento"
          name="birth_date"
          type="date"
          register={register}
          error={errors.birth_date}
          isDark={isDark}
        />
        <div>
            <label htmlFor="gender" className={`block text-sm font-medium ${labelStyles}`}>Género</label>
            <select
                id="gender"
                {...register('gender')}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${formFieldStyles}`}
            >
                <option value="">Seleccione...</option>
                {GENDER_CHOICES.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
        <div>
            <label htmlFor="blood_type" className={`block text-sm font-medium ${labelStyles}`}>Tipo de Sangre</label>
            <select
                id="blood_type"
                {...register('blood_type')}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${formFieldStyles}`}
            >
                <option value="">Seleccione...</option>
                {BLOOD_TYPE_CHOICES.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
        <FormField
            label="Dirección"
            name="address"
            type="text"
            register={register}
            error={errors.address}
            isDark={isDark}
            className="md:col-span-2"
        />
        <FormField
          label="Contacto de Emergencia (Nombre)"
          name="emergency_contact_name"
          type="text"
          register={register}
          error={errors.emergency_contact_name}
          isDark={isDark}
        />
        <FormField
          label="Contacto de Emergencia (Teléfono)"
          name="emergency_contact_phone"
          type="tel"
          register={register}
          error={errors.emergency_contact_phone}
          isDark={isDark}
        />
      </div>
      <FormActions
        onCancel={onClose}
        isSubmitting={isSubmitting}
        isDark={isDark}
        isEditing={true}
      />
    </form>
  );
};

export default PatientEditForm; 