import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  IdentificationIcon,
  EyeIcon,
  EyeSlashIcon,
  MapPinIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePatient, useUpdatePatient } from '../../hooks/usePatients';
import { toast } from 'react-hot-toast';

// Esquema de validación
const patientSchema = z.object({
  first_name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  last_name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(8, 'Mínimo 8 caracteres').optional(),
  document_number: z.string().min(5, 'Mínimo 5 caracteres').max(20, 'Máximo 20 caracteres'),
  gender: z.string().default('O'),
  phone: z.string().min(9, 'Teléfono inválido').optional().or(z.literal('')),
  address: z.string().max(200, 'Máximo 200 caracteres').optional().or(z.literal('')),
  second_last_name: z.string().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
  birth_date: z.string().optional().or(z.literal('')),
  blood_type: z.string().optional().or(z.literal('')),
});

// Lista de tipos de sangre
const BLOOD_TYPES = [
  { id: 'A+', name: 'A+' },
  { id: 'A-', name: 'A-' },
  { id: 'B+', name: 'B+' },
  { id: 'B-', name: 'B-' },
  { id: 'AB+', name: 'AB+' },
  { id: 'AB-', name: 'AB-' },
  { id: 'O+', name: 'O+' },
  { id: 'O-', name: 'O-' },
];

// Lista de géneros
const GENDER_OPTIONS = [
  { id: 'M', name: 'Masculino' },
  { id: 'F', name: 'Femenino' },
  { id: 'O', name: 'Otro' },
];

function PatientFormModal({ isOpen, onClose, patient = null }) {
  const isEditing = !!patient;
  const [showPassword, setShowPassword] = useState(false);
  
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

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

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset,
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      document_number: '',
      gender: 'O',
      phone: '',
      address: '',
      second_last_name: '',
      birth_date: '',
      blood_type: '',
    }
  });

  // Observar el valor del campo de fecha para formatearlo
  const birthDateValue = watch('birth_date');

  // Efecto para formatear la fecha mientras se escribe
  useEffect(() => {
    if (birthDateValue) {
      const formatted = formatDateInput(birthDateValue);
      if (formatted !== birthDateValue) {
        setValue('birth_date', formatted);
      }
    }
  }, [birthDateValue, setValue]);

  // Cargar datos del paciente para edición
  useEffect(() => {
    if (isEditing && patient) {
      setValue('first_name', patient.first_name || '');
      setValue('last_name', patient.last_name || '');
      setValue('email', patient.user?.email || patient.email || '');
      setValue('document_number', patient.document_number || '');
      setValue('gender', patient.gender || 'O');
      setValue('phone', patient.phone || '');
      setValue('address', patient.address || '');
      setValue('second_last_name', patient.second_last_name || '');
      
      // Convertir fecha ISO a formato DD/MM/AAAA para mostrar
      if (patient.birth_date) {
        try {
          const dateParts = patient.birth_date.split('-');
          if (dateParts.length === 3) {
            const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            setValue('birth_date', formattedDate);
          } else {
            setValue('birth_date', '');
          }
        } catch (error) {
          setValue('birth_date', '');
        }
      } else {
        setValue('birth_date', '');
      }
      
      setValue('blood_type', patient.blood_type || '');
    } else {
      reset();
    }
  }, [patient, isEditing, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      // Preparar datos
      const patientData = {
        ...data,
      };

      console.log('Datos del formulario:', data);
      console.log('Tipo de sangre seleccionado:', data.blood_type);

      // Asegurar campos requeridos por el backend
      if (!patientData.gender) {
        patientData.gender = 'O';
      }

      if (!patientData.document_number) {
        patientData.document_number = '00000000';
      }

      // Convertir fecha de DD/MM/AAAA a YYYY-MM-DD para el backend
      if (patientData.birth_date) {
        patientData.birth_date = convertToISODate(patientData.birth_date);
      }

      if (!patientData.birth_date) {
        // Fecha actual en formato YYYY-MM-DD
        patientData.birth_date = new Date().toISOString().split('T')[0];
      }

      // Limpiar campos vacíos opcionales
      if (!patientData.phone || patientData.phone.trim() === '') delete patientData.phone;
      if (!patientData.address || patientData.address.trim() === '') delete patientData.address;
      if (!patientData.second_last_name || patientData.second_last_name.trim() === '') delete patientData.second_last_name;
      if (!patientData.blood_type || patientData.blood_type.trim() === '') delete patientData.blood_type;

      console.log('📤 Datos del paciente ANTES de enviar:', patientData);
      console.log('Tipo de sangre a enviar:', patientData.blood_type);
      
      if (isEditing) {
        // Para edición, no enviar password si está vacío
        if (!patientData.password || patientData.password.trim() === '') {
          delete patientData.password;
        }
        await updatePatient.mutateAsync({ 
          id: patient.id, 
          data: patientData 
        });
        toast.success('✅ Paciente actualizado exitosamente');
      } else {
        // Para creación, verificar que tenga password
        if (!patientData.password || patientData.password.length < 8) {
          patientData.password = 'temporal123';
          console.log('⚠️ Usando password temporal');
        }
        
        await createPatient.mutateAsync(patientData);
        toast.success('✅ Paciente creado exitosamente');
      }
      
      onClose();
      reset();
    } catch (error) {
      console.error('❌ Error:', error);
      
      // Manejar errores específicos del backend
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log('📋 Datos del error completo:', errorData);
        
        if (errorData.email) {
          toast.error(`Email: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`);
        } else if (errorData.document_number) {
          toast.error(`Documento: ${Array.isArray(errorData.document_number) ? errorData.document_number[0] : errorData.document_number}`);
        } else if (errorData.detail) {
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Información Personal */}
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                        Nombre *
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="first_name"
                          className={`block w-full pl-10 pr-3 py-2 border ${errors.first_name ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#033662] focus:border-[#033662] sm:text-sm`}
                          placeholder="Nombre"
                          {...register('first_name')}
                        />
                      </div>
                      {errors.first_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                        Apellido Paterno *
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="last_name"
                          className={`block w-full px-3 py-2 border ${errors.last_name ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#033662] focus:border-[#033662] sm:text-sm`}
                          placeholder="Apellido Paterno"
                          {...register('last_name')}
                        />
                      </div>
                      {errors.last_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="second_last_name" className="block text-sm font-medium text-gray-700">
                        Apellido Materno
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="second_last_name"
                          className={`block w-full px-3 py-2 border ${errors.second_last_name ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#033662] focus:border-[#033662] sm:text-sm`}
                          placeholder="Apellido Materno (opcional)"
                          {...register('second_last_name')}
                        />
                      </div>
                      {errors.second_last_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.second_last_name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                        Género *
                      </label>
                      <div className="mt-1">
                        <select
                          id="gender"
                          className={`block w-full px-3 py-2 border ${errors.gender ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#033662] focus:border-[#033662] sm:text-sm`}
                          {...register('gender')}
                        >
                          {GENDER_OPTIONS.map(option => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.gender && (
                        <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                      )}
                    </div>

                    {/* Información de Contacto */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#033662] focus:border-[#033662] sm:text-sm`}
                          placeholder="correo@ejemplo.com"
                          {...register('email')}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Teléfono
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          className={`block w-full pl-10 pr-3 py-2 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#033662] focus:border-[#033662] sm:text-sm`}
                          placeholder="999999999"
                          {...register('phone')}
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>

                    {!isEditing && (
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Contraseña {isEditing ? '' : '*'}
                        </label>
                        <div className="mt-1 relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            className={`block w-full pr-10 py-2 px-3 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#033662] focus:border-[#033662] sm:text-sm`}
                            placeholder={isEditing ? 'Dejar en blanco para mantener' : 'Mínimo 8 caracteres'}
                            {...register('password')}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                              {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                      </div>
                    )}

                    {/* Documentos */}
                    <div>
                      <label htmlFor="document_number" className="block text-sm font-medium text-gray-700">
                        Número de documento *
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IdentificationIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="document_number"
                          className={`block w-full pl-10 pr-3 py-2 border ${errors.document_number ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#033662] focus:border-[#033662] sm:text-sm`}
                          placeholder="Número de documento"
                          {...register('document_number')}
                        />
                      </div>
                      {errors.document_number && (
                        <p className="mt-1 text-sm text-red-600">{errors.document_number.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">
                        Fecha de Nacimiento
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type="text"
                          id="birth_date"
                          className={`block w-full px-3 py-2 border ${errors.birth_date ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#033662] focus:border-[#033662] sm:text-sm`}
                          placeholder="DD/MM/AAAA "
                          maxLength="10"
                          {...register('birth_date')}
                        />
                      </div>
                      {errors.birth_date && (
                        <p className="mt-1 text-sm text-red-600">{errors.birth_date.message}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Formato: día/mes/año
                      </p>
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Dirección
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPinIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="address"
                          className={`block w-full pl-10 pr-3 py-2 border ${errors.address ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#033662] focus:border-[#033662] sm:text-sm`}
                          placeholder="Dirección completa"
                          {...register('address')}
                        />
                      </div>
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                      )}
                    </div>

                    {/* Información Médica */}
                    <div>
                      <label htmlFor="blood_type" className="block text-sm font-medium text-gray-700">
                        Tipo de sangre
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <HeartIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          id="blood_type"
                          className={`block w-full pl-10 pr-3 py-2 border ${errors.blood_type ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-[#033662] focus:border-[#033662] sm:text-sm`}
                          {...register('blood_type')}
                          onChange={(e) => {
                            console.log('Tipo de sangre seleccionado:', e.target.value);
                          }}
                        >
                          <option value="">Seleccionar tipo de sangre</option>
                          {BLOOD_TYPES.map(type => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.blood_type && (
                        <p className="mt-1 text-sm text-red-600">{errors.blood_type.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#033662]"
                      onClick={onClose}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#033662] border border-transparent rounded-md text-sm font-medium text-white hover:bg-[#022b4f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#033662]"
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

export default PatientFormModal; 