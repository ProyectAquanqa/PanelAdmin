import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDoctor, useUpdateDoctor } from '../../hooks/useDoctors';
import { useGetSpecialties } from '../../hooks/useSpecialties';
import { toast } from 'react-hot-toast';

// Esquema de validación
const doctorSchema = z.object({
  first_name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  last_name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(8, 'Mínimo 8 caracteres').optional(),
  cmp_number: z.string().min(5, 'Mínimo 5 caracteres').max(20, 'Máximo 20 caracteres'),
  phone: z.string().min(9, 'Teléfono inválido').optional().or(z.literal('')),
  contact_phone: z.string().min(9, 'Teléfono inválido').optional().or(z.literal('')),
  consultation_room: z.string().max(10, 'Máximo 10 caracteres').optional().or(z.literal('')),
  second_last_name: z.string().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
  doctor_type: z.enum(['PRIMARY', 'SPECIALIST']).default('SPECIALIST'),
  is_external: z.boolean().default(false),
  can_refer: z.boolean().default(false),
  specialties: z.array(z.number()).min(1, 'Seleccione al menos una especialidad'),
});

function DoctorFormModal({ isOpen, onClose, doctor = null }) {
  const isEditing = !!doctor;
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Obtener especialidades
  const { data: specialtiesData, isLoading: loadingSpecialties } = useGetSpecialties();
  const specialties = specialtiesData?.results || [];
  
  // Hooks para crear/actualizar doctor
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    setValue,
    watch,
    control
  } = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      cmp_number: '',
      phone: '',
      contact_phone: '',
      consultation_room: '',
      second_last_name: '',
      doctor_type: 'SPECIALIST',
      is_external: false,
      can_refer: false,
      specialties: [],
    }
  });

  // Observar especialidades seleccionadas
  const selectedSpecialties = watch('specialties') || [];

  // Cargar datos del doctor para edición
  useEffect(() => {
    if (isEditing && doctor) {
      console.log('Cargando datos del doctor para edición:', doctor);
      
      // Datos básicos
      setValue('first_name', doctor.first_name || '');
      setValue('last_name', doctor.last_name || '');
      setValue('email', doctor.user?.email || doctor.email || '');
      setValue('cmp_number', doctor.cmp_number || '');
      setValue('phone', doctor.phone || '');
      setValue('contact_phone', doctor.contact_phone || '');
      setValue('consultation_room', doctor.consultation_room || '');
      setValue('second_last_name', doctor.second_last_name || '');
      setValue('doctor_type', doctor.doctor_type || 'SPECIALIST');
      setValue('is_external', doctor.is_external || false);
      setValue('can_refer', doctor.can_refer || false);
      
      // Procesar especialidades
      if (doctor.specialties) {
        let specialtyIds = [];
        
        // Manejar diferentes formatos de especialidades
        if (Array.isArray(doctor.specialties)) {
          specialtyIds = doctor.specialties.map(spec => {
            // Si es un objeto con id directo
            if (typeof spec === 'object' && spec.id) {
              return spec.id;
            }
            // Si es un objeto con specialty anidado
            if (typeof spec === 'object' && spec.specialty && spec.specialty.id) {
              return spec.specialty.id;
            }
            // Si es un número directo
            if (typeof spec === 'number') {
              return spec;
            }
            return null;
          }).filter(Boolean);
        }
        
        console.log('Especialidades procesadas:', specialtyIds);
        setValue('specialties', specialtyIds);
      }
    } else {
      reset();
    }
  }, [doctor, isEditing, setValue, reset]);

  // Manejar selección de especialidades
  const handleSpecialtyToggle = (specialtyId) => {
    const currentSpecialties = [...selectedSpecialties];
    
    if (currentSpecialties.includes(specialtyId)) {
      // Quitar especialidad
      setValue('specialties', currentSpecialties.filter(id => id !== specialtyId));
    } else {
      // Agregar especialidad
      setValue('specialties', [...currentSpecialties, specialtyId]);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      console.log('Datos del formulario:', data);
      
      // Verificar que haya al menos una especialidad
      if (!data.specialties || data.specialties.length === 0) {
        toast.error('Debe seleccionar al menos una especialidad');
        setIsSubmitting(false);
        return;
      }

      // Limpiar campos vacíos opcionales
      const cleanData = { ...data };
      if (!cleanData.phone || cleanData.phone.trim() === '') delete cleanData.phone;
      if (!cleanData.contact_phone || cleanData.contact_phone.trim() === '') delete cleanData.contact_phone;
      if (!cleanData.consultation_room || cleanData.consultation_room.trim() === '') delete cleanData.consultation_room;
      if (!cleanData.second_last_name || cleanData.second_last_name.trim() === '') delete cleanData.second_last_name;

      console.log('Datos procesados para enviar:', cleanData);
      
      if (isEditing) {
        // Para edición, no enviar password si está vacío
        if (!cleanData.password || cleanData.password.trim() === '') {
          delete cleanData.password;
        }
        
        await updateDoctor.mutateAsync({ 
          id: doctor.id, 
          data: cleanData 
        });
        toast.success('Doctor actualizado exitosamente');
      } else {
        // Para creación, verificar que tenga password
        if (!cleanData.password || cleanData.password.length < 8) {
          cleanData.password = 'temporal123';
          toast.info('Se ha generado una contraseña temporal');
        }
        
        await createDoctor.mutateAsync(cleanData);
        toast.success('Doctor creado exitosamente');
      }
      
      onClose();
      reset();
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
      
      // Manejar errores específicos del backend
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log('Datos del error:', errorData);
        
        if (errorData.email) {
          toast.error(`Email: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`);
        } else if (errorData.cmp_number) {
          toast.error(`CMP: ${Array.isArray(errorData.cmp_number) ? errorData.cmp_number[0] : errorData.cmp_number}`);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-[#033662] to-[#044b88] px-6 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-bold">
                          {isEditing ? 'Editar Doctor' : 'Nuevo Doctor'}
                        </Dialog.Title>
                        <p className="text-sm text-blue-100">
                          {isEditing ? 'Actualizar información del doctor' : 'Agregar un nuevo doctor al sistema'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30"
                      onClick={onClose}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="px-6 py-5 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    
                    {/* Información Personal */}
                    <div className="space-y-3">
                      <h3 className="flex items-center space-x-2 font-medium text-gray-800">
                        <UserIcon className="h-4 w-4 text-[#033662]" />
                        <span>Información Personal</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombres *
                          </label>
                          <input
                            type="text"
                            {...register('first_name')}
                            className={`w-full px-3 py-2 border rounded-lg ${
                              errors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Ej: Carlos Eduardo"
                          />
                          {errors.first_name && (
                            <p className="mt-1 text-xs text-red-600">{errors.first_name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Apellido Paterno *
                          </label>
                          <input
                            type="text"
                            {...register('last_name')}
                            className={`w-full px-3 py-2 border rounded-lg ${
                              errors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Ej: García"
                          />
                          {errors.last_name && (
                            <p className="mt-1 text-xs text-red-600">{errors.last_name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Apellido Materno
                          </label>
                          <input
                            type="text"
                            {...register('second_last_name')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Ej: López"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Información de Contacto */}
                    <div className="space-y-3">
                      <h3 className="flex items-center space-x-2 font-medium text-gray-800">
                        <EnvelopeIcon className="h-4 w-4 text-[#033662]" />
                        <span>Información de Contacto</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <div className="relative">
                            <EnvelopeIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                              type="email"
                              {...register('email')}
                              className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="doctor@hospital.com"
                            />
                          </div>
                          {errors.email && (
                            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                          )}
                        </div>

                        {!isEditing && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Contraseña *
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                className={`w-full px-3 py-2 pr-10 border rounded-lg ${
                                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Mínimo 8 caracteres"
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-2.5 text-gray-400"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeSlashIcon className="h-4 w-4" />
                                ) : (
                                  <EyeIcon className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            {errors.password && (
                              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                            )}
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono Principal
                          </label>
                          <div className="relative">
                            <PhoneIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              {...register('phone')}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="+51 987 654 321"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono Adicional
                          </label>
                          <div className="relative">
                            <PhoneIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              {...register('contact_phone')}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="Teléfono alternativo"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información Profesional */}
                    <div className="space-y-3">
                      <h3 className="flex items-center space-x-2 font-medium text-gray-800">
                        <IdentificationIcon className="h-4 w-4 text-[#033662]" />
                        <span>Información Profesional</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número CMP *
                          </label>
                          <input
                            type="text"
                            {...register('cmp_number')}
                            className={`w-full px-3 py-2 border rounded-lg ${
                              errors.cmp_number ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="CMP12345"
                          />
                          {errors.cmp_number && (
                            <p className="mt-1 text-xs text-red-600">{errors.cmp_number.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Consultorio
                          </label>
                          <div className="relative">
                            <BuildingOfficeIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              {...register('consultation_room')}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="Ej: 101, A-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Doctor *
                          </label>
                          <select
                            {...register('doctor_type')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="PRIMARY">Médico Principal</option>
                            <option value="SPECIALIST">Especialista</option>
                          </select>
                        </div>
                        
                        <div className="flex flex-col space-y-2 justify-center">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="is_external"
                              {...register('is_external')}
                              className="h-4 w-4 text-[#033662] border-gray-300 rounded"
                            />
                            <label htmlFor="is_external" className="ml-2 block text-sm text-gray-700">
                              Es médico externo
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="can_refer"
                              {...register('can_refer')}
                              className="h-4 w-4 text-[#033662] border-gray-300 rounded"
                            />
                            <label htmlFor="can_refer" className="ml-2 block text-sm text-gray-700">
                              Puede derivar pacientes
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Especialidades */}
                    <div className="space-y-3">
                      <h3 className="flex items-center space-x-2 font-medium text-gray-800">
                        <AcademicCapIcon className="h-4 w-4 text-[#033662]" />
                        <span>Especialidades Médicas *</span>
                      </h3>
                      
                      {loadingSpecialties ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">Cargando especialidades...</p>
                        </div>
                      ) : specialties.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No hay especialidades disponibles</p>
                        </div>
                      ) : (
                        <>
                          <Controller
                            name="specialties"
                            control={control}
                            render={({ field }) => (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {specialties.map((specialty) => (
                                  <button
                                    key={specialty.id}
                                    type="button"
                                    onClick={() => handleSpecialtyToggle(specialty.id)}
                                    className={`p-2 rounded-lg border flex items-center ${
                                      selectedSpecialties.includes(specialty.id)
                                        ? 'border-[#033662] bg-[#033662]/10 text-[#033662]'
                                        : 'border-gray-300 text-gray-700'
                                    }`}
                                  >
                                    {selectedSpecialties.includes(specialty.id) && (
                                      <CheckCircleIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                    )}
                                    <span className="text-sm truncate">{specialty.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          />
                          
                          {errors.specialties && (
                            <p className="mt-1 text-xs text-red-600">{errors.specialties.message}</p>
                          )}
                          
                          <div className="text-xs text-gray-500">
                            {selectedSpecialties.length > 0 ? (
                              <p>
                                {selectedSpecialties.length} especialidad(es) seleccionada(s)
                              </p>
                            ) : (
                              <p>Seleccione al menos una especialidad</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end pt-4 border-t">
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                          disabled={isSubmitting}
                        >
                          Cancelar
                        </button>
                        
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-2 bg-[#033662] text-white rounded-lg disabled:opacity-50 flex items-center"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Guardando...
                            </>
                          ) : isEditing ? 'Guardar Cambios' : 'Crear Doctor'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default DoctorFormModal;
