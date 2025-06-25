// ============================================================================
// 🏥 COMPONENTE: PatientForm - Formulario Reutilizable para Pacientes
// Componente de formulario para crear y editar pacientes
// ============================================================================

import React, { forwardRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from '../../context/ThemeContext';
import FormField from '../common/FormField';

// Esquema de validación para pacientes
const patientSchema = z.object({
  first_name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  last_name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  second_last_name: z.string().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(8, 'Mínimo 8 caracteres').optional(),
  document_number: z.string().min(8, 'Mínimo 8 caracteres').max(20, 'Máximo 20 caracteres'),
  birth_date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: 'Fecha de nacimiento inválida'
  }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).default('OTHER'),
  phone: z
    .string()
    .min(9, 'Mínimo 9 dígitos')
    .max(15, 'Máximo 15 dígitos')
    .refine((val) => /^\+?1?\d{9,15}$/.test(val), {
      message: 'Formato de teléfono inválido'
    }),
  address: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  emergency_contact_name: z.string().max(200, 'Máximo 200 caracteres').optional().or(z.literal('')),
  emergency_contact_phone: z
    .string()
    .min(9, 'Mínimo 9 dígitos')
    .max(15, 'Máximo 15 dígitos')
    .refine((val) => /^\+?1?\d{9,15}$/.test(val), {
      message: 'Formato de teléfono inválido'
    })
    .optional()
    .or(z.literal('')),
  blood_type: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']).optional().or(z.literal('')),
});

const PatientForm = forwardRef(function PatientForm({ patient, onSubmit, isLoading }, ref) {
  const { theme } = useTheme();
  const isEditing = !!patient;

  // Inicializar useForm con schema de zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      second_last_name: '',
      email: '',
      password: '',
      document_number: '',
      birth_date: '',
      gender: 'OTHER',
      phone: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      blood_type: '',
    }
  });

  // Cargar datos del paciente para edición
  useEffect(() => {
    if (isEditing && patient) {
      console.log('🔄 Cargando datos del paciente para edición:', patient);
      console.log('🔑 ID del paciente:', patient.id);
      
      // Obtener el email del paciente
      const email = patient.user?.email || patient.email || '';
      
      // Mapeo de tipos de sangre
      const bloodTypeMap = {
        'A+': 'A_POSITIVE',
        'A-': 'A_NEGATIVE',
        'B+': 'B_POSITIVE',
        'B-': 'B_NEGATIVE',
        'AB+': 'AB_POSITIVE',
        'AB-': 'AB_NEGATIVE',
        'O+': 'O_POSITIVE',
        'O-': 'O_NEGATIVE',
      };
      
      // Mapeo inverso para valores codificados
      const inverseBloodTypeMap = {
        'A_POSITIVE': 'A_POSITIVE',
        'A_NEGATIVE': 'A_NEGATIVE',
        'B_POSITIVE': 'B_POSITIVE',
        'B_NEGATIVE': 'B_NEGATIVE',
        'AB_POSITIVE': 'AB_POSITIVE',
        'AB_NEGATIVE': 'AB_NEGATIVE',
        'O_POSITIVE': 'O_POSITIVE',
        'O_NEGATIVE': 'O_NEGATIVE',
      };
      
      // Determinar el valor correcto para blood_type
      let bloodType = '';
      if (patient.blood_type) {
        bloodType = bloodTypeMap[patient.blood_type] || inverseBloodTypeMap[patient.blood_type] || '';
        console.log('🩸 Tipo de sangre detectado:', patient.blood_type, '→', bloodType);
      }
      
      // Mapeo de valores de género
      const genderMap = {
        'M': 'MALE',
        'F': 'FEMALE',
        'O': 'OTHER',
        'MALE': 'MALE',
        'FEMALE': 'FEMALE',
        'OTHER': 'OTHER',
      };
      
      // Determinar el valor correcto para gender
      const gender = genderMap[patient.gender] || 'OTHER';
      console.log('⚧️ Género detectado:', patient.gender, '→', gender);
      
      // Formatear fecha si es necesario
      let birthDate = patient.birth_date || '';
      if (birthDate && !birthDate.includes('-')) {
        // Intentar convertir formatos de fecha
        try {
          const date = new Date(birthDate);
          if (!isNaN(date.getTime())) {
            birthDate = date.toISOString().split('T')[0];
          }
        } catch (error) {
          console.warn('⚠️ Error al formatear fecha de nacimiento:', error);
        }
      }
      
      // Asignar valores al formulario
      reset({
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        second_last_name: patient.second_last_name || '',
        email: email,
        document_number: patient.document_number || '',
        birth_date: birthDate,
        gender: gender,
        phone: patient.phone || '',
        address: patient.address || '',
        emergency_contact_name: patient.emergency_contact_name || '',
        emergency_contact_phone: patient.emergency_contact_phone || '',
        blood_type: bloodType,
        // Pasar el ID para asegurar que se actualice el paciente correcto
        id: patient.id
      });
      
      console.log('✅ Formulario inicializado con datos del paciente');
    } else {
      console.log('🔄 Inicializando formulario para nuevo paciente');
      reset({
        first_name: '',
        last_name: '',
        second_last_name: '',
        email: '',
        password: '',
        document_number: '',
        birth_date: '',
        gender: 'OTHER',
        phone: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        blood_type: '',
      });
    }
  }, [patient, isEditing, setValue, reset]);

  // Exponer el método reset al componente padre
  useEffect(() => {
    if (ref) {
      ref.current = {
        reset: () => reset()
      };
    }
  }, [ref, reset]);

  const genderOptions = [
    { value: 'MALE', label: 'Masculino' },
    { value: 'FEMALE', label: 'Femenino' },
    { value: 'OTHER', label: 'Otro' },
  ];

  const bloodTypeOptions = [
    { value: 'A_POSITIVE', label: 'A+' },
    { value: 'A_NEGATIVE', label: 'A-' },
    { value: 'B_POSITIVE', label: 'B+' },
    { value: 'B_NEGATIVE', label: 'B-' },
    { value: 'AB_POSITIVE', label: 'AB+' },
    { value: 'AB_NEGATIVE', label: 'AB-' },
    { value: 'O_POSITIVE', label: 'O+' },
    { value: 'O_NEGATIVE', label: 'O-' },
  ];

  const onFormSubmit = (data) => {
    console.log('📝 Datos del formulario a enviar:', data);
    
    // Asegurarnos de que se incluye el ID si estamos editando
    if (isEditing && patient?.id) {
      console.log('🔑 Asegurando que se incluye el ID del paciente:', patient.id);
      data.id = patient.id;
    }
    
    // Validar campos críticos
    console.log('🔍 Valores de campos críticos:');
    console.log('- gender:', data.gender, typeof data.gender);
    console.log('- blood_type:', data.blood_type, typeof data.blood_type);
    
    // Si no hay tipo de sangre, asegurarse de que sea una cadena vacía
    if (!data.blood_type) {
      data.blood_type = '';
    }
    
    // Validar que gender tiene un valor permitido
    const validGenders = ['MALE', 'FEMALE', 'OTHER'];
    if (!validGenders.includes(data.gender)) {
      console.warn('⚠️ Valor de género no válido:', data.gender);
      data.gender = 'OTHER';
    }
    
    console.log('📤 Enviando datos finales:', data);
    onSubmit(data);
  };

  // Clases base para elementos de formulario
  const inputClassName = `w-full rounded-lg border ${
    theme === 'dark'
      ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500`;

  const selectClassName = `w-full rounded-lg border ${
    theme === 'dark'
      ? 'bg-neutral-900 border-neutral-700 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500`;

  const labelClassName = `block mb-1 text-sm font-medium ${
    theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
  }`;

  const errorClassName = 'mt-1 text-sm text-red-600 dark:text-red-400';
  
  const buttonClassName = `w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
    isLoading ? 'opacity-70 cursor-not-allowed' : ''
  }`;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Sección de datos de cuenta */}
      <div className={`rounded-lg border p-4 mb-6 ${
        theme === 'dark' ? 'border-neutral-700 bg-neutral-800/50' : 'border-gray-200 bg-gray-50'
      }`}>
        <h3 className={`text-lg font-medium mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Datos de la cuenta
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Email"
            error={errors.email?.message}
            required
          >
            <input
              {...register('email')}
              type="email"
              className={inputClassName}
              placeholder="ejemplo@hospital.com"
              disabled={isEditing}
            />
          </FormField>
          
          {!isEditing && (
            <FormField
              label="Contraseña"
              error={errors.password?.message}
              required={!isEditing}
            >
              <input
                {...register('password')}
                type="password"
                className={inputClassName}
                placeholder="Mínimo 8 caracteres"
              />
            </FormField>
          )}
        </div>
      </div>

      {/* Sección de datos personales */}
      <div className={`rounded-lg border p-4 mb-6 ${
        theme === 'dark' ? 'border-neutral-700 bg-neutral-800/50' : 'border-gray-200 bg-gray-50'
      }`}>
        <h3 className={`text-lg font-medium mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Datos personales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Número de documento"
            error={errors.document_number?.message}
            required
          >
            <input
              {...register('document_number')}
              type="text"
              className={inputClassName}
              placeholder="Ej: 12345678"
            />
          </FormField>
          
          <FormField
            label="Nombres"
            error={errors.first_name?.message}
            required
          >
            <input
              {...register('first_name')}
              type="text"
              className={inputClassName}
              placeholder="Nombres"
            />
          </FormField>
          
          <FormField
            label="Apellido paterno"
            error={errors.last_name?.message}
            required
          >
            <input
              {...register('last_name')}
              type="text"
              className={inputClassName}
              placeholder="Apellido paterno"
            />
          </FormField>
          
          <FormField
            label="Apellido materno"
            error={errors.second_last_name?.message}
          >
            <input
              {...register('second_last_name')}
              type="text"
              className={inputClassName}
              placeholder="Apellido materno"
            />
          </FormField>
          
          <FormField
            label="Fecha de nacimiento"
            error={errors.birth_date?.message}
            required
          >
            <input
              {...register('birth_date')}
              type="date"
              className={inputClassName}
            />
          </FormField>
          
          <FormField
            label="Género"
            error={errors.gender?.message}
            required
          >
            <select
              {...register('gender')}
              className={selectClassName}
            >
              <option value="" disabled>Seleccione un género</option>
              {genderOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>

      {/* Sección de datos de contacto */}
      <div className={`rounded-lg border p-4 mb-6 ${
        theme === 'dark' ? 'border-neutral-700 bg-neutral-800/50' : 'border-gray-200 bg-gray-50'
      }`}>
        <h3 className={`text-lg font-medium mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Datos de contacto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Teléfono"
            error={errors.phone?.message}
            required
          >
            <input
              {...register('phone')}
              type="tel"
              className={inputClassName}
              placeholder="Ej: 987654321"
            />
          </FormField>
          
          <FormField
            label="Dirección"
            error={errors.address?.message}
          >
            <input
              {...register('address')}
              type="text"
              className={inputClassName}
              placeholder="Dirección completa"
            />
          </FormField>
          
          <FormField
            label="Nombre contacto de emergencia"
            error={errors.emergency_contact_name?.message}
          >
            <input
              {...register('emergency_contact_name')}
              type="text"
              className={inputClassName}
              placeholder="Nombre completo"
            />
          </FormField>
          
          <FormField
            label="Teléfono contacto de emergencia"
            error={errors.emergency_contact_phone?.message}
          >
            <input
              {...register('emergency_contact_phone')}
              type="tel"
              className={inputClassName}
              placeholder="Ej: 987654321"
            />
          </FormField>
        </div>
      </div>

      {/* Sección de datos médicos */}
      <div className={`rounded-lg border p-4 mb-6 ${
        theme === 'dark' ? 'border-neutral-700 bg-neutral-800/50' : 'border-gray-200 bg-gray-50'
      }`}>
        <h3 className={`text-lg font-medium mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Datos médicos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Tipo de sangre"
            error={errors.blood_type?.message}
          >
            <select
              {...register('blood_type')}
              className={selectClassName}
            >
              <option value="">Seleccione tipo de sangre</option>
              {bloodTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={isLoading}
          className={buttonClassName}
        >
          {isLoading ? 'Procesando...' : isEditing ? 'Actualizar paciente' : 'Crear paciente'}
        </button>
      </div>
    </form>
  );
});

export default PatientForm;
