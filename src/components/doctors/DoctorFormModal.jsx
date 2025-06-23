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
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDoctor, useUpdateDoctor } from '../../hooks/useDoctors';
import { toast } from 'react-hot-toast';

// Esquema de validación actualizado
const doctorSchema = z.object({
  first_name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  last_name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(8, 'Mínimo 8 caracteres').optional(),
  cmp_number: z.string().min(5, 'Mínimo 5 caracteres').max(20, 'Máximo 20 caracteres'),
  phone: z.string().min(9, 'Teléfono inválido').optional().or(z.literal('')),
  consultation_room: z.string().max(10, 'Máximo 10 caracteres').optional().or(z.literal('')),
  second_last_name: z.string().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
  specialties: z.array(z.number()).optional(),
});

// Lista de especialidades con colores actualizados para #033662
const SPECIALTIES = [
  { id: 1, name: 'Cardiología', color: 'bg-red-100 text-red-800', icon: '❤️' },
  { id: 2, name: 'Dermatología', color: 'bg-pink-100 text-pink-800', icon: '🧴' },
  { id: 3, name: 'Endocrinología', color: 'bg-purple-100 text-purple-800', icon: '🧬' },
  { id: 4, name: 'Medicina General', color: 'bg-blue-100 text-blue-800', icon: '🩺' },
  { id: 5, name: 'Pediatría', color: 'bg-yellow-100 text-yellow-800', icon: '👶' },
  { id: 6, name: 'Neurología', color: 'bg-indigo-100 text-indigo-800', icon: '🧠' },
  { id: 7, name: 'Traumatología', color: 'bg-orange-100 text-orange-800', icon: '🦴' },
  { id: 8, name: 'Ginecología', color: 'bg-rose-100 text-rose-800', icon: '👩‍⚕️' },
];

function DoctorFormModal({ isOpen, onClose, doctor = null }) {
  const isEditing = !!doctor;
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset,
    setValue,
    watch,
    trigger
  } = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      cmp_number: '',
      phone: '',
      consultation_room: '',
      second_last_name: '',
      specialties: [],
    }
  });

  // Cargar datos del doctor para edición
  useEffect(() => {
    if (isEditing && doctor) {
      setValue('first_name', doctor.first_name || '');
      setValue('last_name', doctor.last_name || '');
      setValue('email', doctor.user?.email || doctor.email || '');
      setValue('cmp_number', doctor.cmp_number || '');
      setValue('phone', doctor.phone || '');
      setValue('consultation_room', doctor.consultation_room || '');
      setValue('second_last_name', doctor.second_last_name || '');
      
      if (doctor.specialties && Array.isArray(doctor.specialties)) {
        const specialtyIds = doctor.specialties.map(s => s.specialty?.id || s.id).filter(Boolean);
        setSelectedSpecialties(specialtyIds);
        setValue('specialties', specialtyIds);
      }
    } else {
      reset();
      setSelectedSpecialties([]);
      setCurrentStep(1);
    }
  }, [doctor, isEditing, setValue, reset]);

  // Manejar selección de especialidades
  const handleSpecialtyToggle = (specialtyId) => {
    const newSelection = selectedSpecialties.includes(specialtyId)
      ? selectedSpecialties.filter(id => id !== specialtyId)
      : [...selectedSpecialties, specialtyId];
    
    setSelectedSpecialties(newSelection);
    setValue('specialties', newSelection);
  };

  // Validar paso actual
  const validateCurrentStep = async () => {
    if (currentStep === 1) {
      return await trigger(['first_name', 'last_name', 'second_last_name']);
    } else if (currentStep === 2) {
      return await trigger(['email', 'phone', 'password']);
    } else if (currentStep === 3) {
      return await trigger(['cmp_number', 'consultation_room']);
    }
    return true;
  };

  // Navegar pasos
  const nextStep = async () => {
    if (await validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    try {
      // Preparar datos con especialidades
      const doctorData = {
        ...data,
        specialties: selectedSpecialties,
      };

      // Limpiar campos vacíos opcionales
      if (!doctorData.phone || doctorData.phone.trim() === '') delete doctorData.phone;
      if (!doctorData.consultation_room || doctorData.consultation_room.trim() === '') delete doctorData.consultation_room;
      if (!doctorData.second_last_name || doctorData.second_last_name.trim() === '') delete doctorData.second_last_name;

      console.log('📤 Datos del doctor ANTES de enviar:', doctorData);
      
      if (isEditing) {
        // Para edición, no enviar password si está vacío
        if (!doctorData.password || doctorData.password.trim() === '') {
          delete doctorData.password;
        }
        await updateDoctor.mutateAsync({ 
          id: doctor.id, 
          data: doctorData 
        });
        toast.success('✅ Doctor actualizado exitosamente');
      } else {
        // Para creación, verificar que tenga password
        if (!doctorData.password || doctorData.password.length < 8) {
          doctorData.password = 'temporal123';
          console.log('⚠️ Usando password temporal');
        }
        
        // Verificar que tenga al menos una especialidad
        if (!doctorData.specialties || doctorData.specialties.length === 0) {
          toast.error('Debe seleccionar al menos una especialidad');
          return;
        }
        
        await createDoctor.mutateAsync(doctorData);
        toast.success('✅ Doctor creado exitosamente');
      }
      
      onClose();
      reset();
      setSelectedSpecialties([]);
      setCurrentStep(1);
    } catch (error) {
      console.error('❌ Error:', error);
      
      // Manejar errores específicos del backend
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log('📋 Datos del error completo:', errorData);
        
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
    }
  };

  // Indicador de progreso
  const ProgressIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold ${
              step <= currentStep 
                ? 'bg-[#033662] text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`h-1 w-20 mx-2 ${
                step < currentStep ? 'bg-[#033662]' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Personal</span>
        <span>Contacto</span>
        <span>Profesional</span>
        <span>Especialidades</span>
      </div>
    </div>
  );

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                
                {/* Header con gradiente #033662 */}
                <div className="bg-gradient-to-r from-[#033662] to-[#044b88] px-8 py-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                        {isEditing ? (
                          <UserIcon className="h-6 w-6" />
                        ) : (
                          <AcademicCapIcon className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <Dialog.Title className="text-2xl font-bold">
                          {isEditing ? 'Editar Doctor' : 'Nuevo Doctor'}
                        </Dialog.Title>
                        <p className="text-blue-100">
                          {isEditing ? 'Actualizar información del doctor' : 'Agregar un nuevo doctor al sistema'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
                      onClick={onClose}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  
                  {/* Progress indicator */}
                  {!isEditing && <ProgressIndicator />}
                </div>

                {/* Form Content */}
                <div className="px-8 py-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Paso 1: Información Personal */}
                    {(currentStep === 1 || isEditing) && (
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                          <UserIcon className="h-5 w-5 text-[#033662]" />
                          <span>Información Personal</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nombres *
                            </label>
                            <input
                              type="text"
                              {...register('first_name')}
                              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#033662]/20 focus:border-[#033662] ${
                                errors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                              }`}
                              placeholder="Ej: Carlos Eduardo"
                            />
                            {errors.first_name && (
                              <p className="mt-1 text-sm text-red-600 flex items-center">
                                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                {errors.first_name.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Apellido Paterno *
                            </label>
                            <input
                              type="text"
                              {...register('last_name')}
                              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#033662]/20 focus:border-[#033662] ${
                                errors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                              }`}
                              placeholder="Ej: García"
                            />
                            {errors.last_name && (
                              <p className="mt-1 text-sm text-red-600 flex items-center">
                                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                {errors.last_name.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Apellido Materno
                            </label>
                            <input
                              type="text"
                              {...register('second_last_name')}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#033662]/20 focus:border-[#033662] hover:border-gray-300"
                              placeholder="Ej: López"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Paso 2: Información de Contacto */}
                    {(currentStep === 2 || isEditing) && (
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                          <EnvelopeIcon className="h-5 w-5 text-[#033662]" />
                          <span>Información de Contacto</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email *
                            </label>
                            <div className="relative">
                              <EnvelopeIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                              <input
                                type="email"
                                {...register('email')}
                                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#033662]/20 focus:border-[#033662] ${
                                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                                placeholder="doctor@hospital.com"
                              />
                            </div>
                            {errors.email && (
                              <p className="mt-1 text-sm text-red-600 flex items-center">
                                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                {errors.email.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Teléfono
                            </label>
                            <div className="relative">
                              <PhoneIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                              <input
                                type="text"
                                {...register('phone')}
                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#033662]/20 focus:border-[#033662] hover:border-gray-300"
                                placeholder="+51 987 654 321"
                              />
                            </div>
                          </div>

                          {!isEditing && (
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña *
                              </label>
                              <div className="relative">
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  {...register('password')}
                                  className={`w-full px-4 py-3 pr-11 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#033662]/20 focus:border-[#033662] ${
                                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  placeholder="Mínimo 8 caracteres"
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                  ) : (
                                    <EyeIcon className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                              {errors.password && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                  {errors.password.message}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Paso 3: Información Profesional */}
                    {(currentStep === 3 || isEditing) && (
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                          <IdentificationIcon className="h-5 w-5 text-[#033662]" />
                          <span>Información Profesional</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Número CMP *
                            </label>
                            <input
                              type="text"
                              {...register('cmp_number')}
                              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#033662]/20 focus:border-[#033662] ${
                                errors.cmp_number ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                              }`}
                              placeholder="CMP12345"
                            />
                            {errors.cmp_number && (
                              <p className="mt-1 text-sm text-red-600 flex items-center">
                                <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                {errors.cmp_number.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Consultorio
                            </label>
                            <div className="relative">
                              <BuildingOfficeIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                              <input
                                type="text"
                                {...register('consultation_room')}
                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#033662]/20 focus:border-[#033662] hover:border-gray-300"
                                placeholder="Ej: 101, A-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Paso 4: Especialidades */}
                    {(currentStep === 4 || isEditing) && (
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                          <AcademicCapIcon className="h-5 w-5 text-[#033662]" />
                          <span>Especialidades Médicas</span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {SPECIALTIES.map((specialty) => (
                            <button
                              key={specialty.id}
                              type="button"
                              onClick={() => handleSpecialtyToggle(specialty.id)}
                              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                                selectedSpecialties.includes(specialty.id)
                                  ? 'border-[#033662] bg-[#033662]/10 shadow-md scale-105'
                                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{specialty.icon}</span>
                                <span className="text-sm font-medium">{specialty.name}</span>
                              </div>
                              {selectedSpecialties.includes(specialty.id) && (
                                <div className="mt-2">
                                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-[#033662] text-white">
                                    Seleccionada
                                  </span>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        
                        {selectedSpecialties.length > 0 && (
                          <div className="bg-[#033662]/10 p-4 rounded-xl">
                            <p className="text-sm text-[#033662]">
                              <strong>{selectedSpecialties.length}</strong> especialidad{selectedSpecialties.length > 1 ? 'es' : ''} seleccionada{selectedSpecialties.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t">
                      <div>
                        {!isEditing && currentStep > 1 && (
                          <button
                            type="button"
                            onClick={prevStep}
                            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            ← Anterior
                          </button>
                        )}
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                        
                        {!isEditing && currentStep < 4 ? (
                          <button
                            type="button"
                            onClick={nextStep}
                            className="px-6 py-3 bg-[#033662] text-white rounded-xl hover:bg-[#022a52] transition-colors"
                          >
                            Siguiente →
                          </button>
                        ) : (
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-gradient-to-r from-[#033662] to-[#044b88] text-white rounded-xl hover:from-[#022a52] hover:to-[#033d73] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                          >
                            {isSubmitting ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Guardando...
                              </span>
                            ) : (
                              <span className="flex items-center">
                                {isEditing ? '💾 Guardar Cambios' : '✨ Crear Doctor'}
                              </span>
                            )}
                          </button>
                        )}
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
