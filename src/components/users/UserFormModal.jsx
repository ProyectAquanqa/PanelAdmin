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
  ShieldCheckIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUser, useUpdateUser } from '../../hooks/useUsers';
import { toast } from 'react-hot-toast';

// Esquema de validación dinámico
const createUserSchema = (isEditing = false) => z.object({
  first_name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  last_name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  email: z.string().email('Email inválido').toLowerCase(),
  // Contraseña condicional: solo requerida al crear, opcional al editar
  password: isEditing 
    ? z.string().optional().or(z.literal(''))  // Al editar: opcional o vacía
    : z.string().min(8, 'Mínimo 8 caracteres'), // Al crear: obligatoria
  phone: z.string().min(9, 'Teléfono inválido').optional().or(z.literal('')),
  role: z.string().min(1, 'Seleccione un rol'),
  is_active: z.boolean().optional(),
});

// Lista de roles con información detallada
const ROLES = [
  { 
    id: 'PATIENT', 
    name: 'Paciente', 
    description: 'Usuario que recibe atención médica',
    icon: UserIcon,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    selectedColor: 'border-emerald-500 bg-emerald-50',
  },
  { 
    id: 'DOCTOR', 
    name: 'Doctor', 
    description: 'Profesional médico del hospital',
    icon: ShieldCheckIcon,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    selectedColor: 'border-blue-500 bg-blue-50',
  },
  { 
    id: 'ADMIN', 
    name: 'Administrador', 
    description: 'Gestiona el sistema hospitalario',
    icon: UserGroupIcon,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    selectedColor: 'border-purple-500 bg-purple-50',
  },
];

function UserFormModal({ isOpen, onClose, user = null }) {
  const isEditing = !!user;
  const [showPassword, setShowPassword] = useState(false);
  
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset,
    setValue,
    watch,
    clearErrors
  } = useForm({
    resolver: zodResolver(createUserSchema(isEditing)),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      role: '',
      is_active: true,
    }
  });

  // Cargar datos del usuario para edición
  useEffect(() => {
    if (isEditing && user) {
      setValue('first_name', user.first_name || '');
      setValue('last_name', user.last_name || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
      setValue('role', user.role || '');
      setValue('is_active', user.is_active ?? true);
      setValue('password', '');
    } else {
      reset({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        role: '',
        is_active: true,
      });
    }
  }, [user, isEditing, setValue, reset]);

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      // Preparar datos
      const userData = { ...data };

      // Limpiar campos vacíos opcionales
      if (!userData.phone || userData.phone.trim() === '') {
        delete userData.phone;
      }
      
      console.log('📤 Datos del usuario ANTES de enviar:', userData);
      
      if (isEditing) {
        // Para edición: eliminar contraseña si está vacía
        if (!userData.password || userData.password.trim() === '') {
          delete userData.password;
          console.log('📝 Editando sin cambiar contraseña');
        } else {
          console.log('🔐 Editando CON nueva contraseña');
        }
        
        await updateUser.mutateAsync({ 
          id: user.id, 
          data: userData 
        });
        toast.success('✅ Usuario actualizado exitosamente');
      } else {
        // Para creación: verificar que tenga contraseña
        if (!userData.password || userData.password.length < 8) {
          toast.error('La contraseña es obligatoria y debe tener al menos 8 caracteres');
          return;
        }
        
        console.log('🚀 Creando nuevo usuario con contraseña');
        await createUser.mutateAsync(userData);
        toast.success('✅ Usuario creado exitosamente');
      }
      
      onClose();
      reset();
    } catch (error) {
      console.error('❌ Error:', error);
      
      // Manejo específico de errores del backend
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log('📋 Datos del error completo:', errorData);
        
        if (errorData.email) {
          toast.error(`Email: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`);
        } else if (errorData.detail) {
          toast.error(errorData.detail);
        } else if (errorData.non_field_errors) {
          toast.error(Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors);
        } else {
          // Mostrar todos los errores de validación
          const allErrors = Object.entries(errorData)
            .filter(([_, value]) => !!value) // Filtrar solo valores con error
            .map(([field, errors]) => 
              `${field}: ${Array.isArray(errors) ? errors[0] : errors}`
            ).join(', ');
          
          if (allErrors) {
            toast.error(`Errores: ${allErrors}`);
          } else {
            toast.error('Error al procesar la solicitud');
          }
        }
      } else {
        toast.error('Error de conexión. Verifica que el servidor esté funcionando.');
      }
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header con colores del proyecto */}
                <div className="bg-gradient-to-r from-[#033662] to-[#044b88] px-6 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full bg-white/20 p-2">
                        <UserIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-semibold text-white">
                          {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </Dialog.Title>
                        <p className="text-blue-100 text-sm">
                          {isEditing ? 'Actualiza la información del usuario' : 'Crea una nueva cuenta de usuario'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
                      onClick={onClose}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                  <div className="space-y-6">
                    {/* Información Personal */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-500 mr-2" />
                        Información Personal
                      </h3>

                      {/* Estado Activo/Inactivo - Solo visible en edición */}
                      {isEditing && (
                        <div className="mb-6 flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                          <div className="flex-1">
                            <label className="flex items-center cursor-pointer">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  {...register('is_active')}
                                  className="sr-only"
                                />
                                <div className={`block w-14 h-8 rounded-full transition-colors duration-200 ease-in-out ${
                                  watch('is_active') ? 'bg-green-500' : 'bg-gray-400'
                                }`}>
                                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out ${
                                    watch('is_active') ? 'transform translate-x-6' : ''
                                  }`} />
                                </div>
                              </div>
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-900">Estado de la cuenta</span>
                                <p className="text-sm text-gray-500">
                                  {watch('is_active') ? 'Cuenta activa' : 'Cuenta inactiva'}
                                </p>
                              </div>
                            </label>
                          </div>
                          <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                            watch('is_active') ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {watch('is_active') ? (
                              <CheckCircleIcon className="h-5 w-5" />
                            ) : (
                              <XCircleIcon className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nombre */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Nombre *
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              {...register('first_name')}
                              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                                errors.first_name ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-500'
                              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                              placeholder="Ingresa el nombre"
                            />
                            {errors.first_name && (
                              <p className="mt-2 text-sm text-red-600">{errors.first_name.message}</p>
                            )}
                          </div>
                        </div>

                        {/* Apellido */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Apellido *
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              {...register('last_name')}
                              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                                errors.last_name ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-500'
                              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                              placeholder="Ingresa el apellido"
                            />
                            {errors.last_name && (
                              <p className="mt-2 text-sm text-red-600">{errors.last_name.message}</p>
                            )}
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Email *
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              {...register('email')}
                              className={`block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ${
                                errors.email ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-500'
                              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                              placeholder="usuario@ejemplo.com"
                            />
                          </div>
                          {errors.email && (
                            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                          )}
                        </div>

                        {/* Teléfono */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Teléfono
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <PhoneIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="tel"
                              {...register('phone')}
                              className={`block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ${
                                errors.phone ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-500'
                              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                              placeholder="999999999"
                            />
                          </div>
                          {errors.phone && (
                            <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contraseña */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <IdentificationIcon className="h-5 w-5 text-gray-500 mr-2" />
                        {isEditing ? 'Cambiar Contraseña' : 'Contraseña'}
                      </h3>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...register('password')}
                          className={`block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.password ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-500'
                          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                          placeholder={isEditing ? 'Dejar vacío para mantener la actual' : 'Mínimo 8 caracteres'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                      )}
                      {isEditing && (
                        <p className="mt-2 text-sm text-gray-500">
                          Solo llena este campo si deseas cambiar la contraseña actual
                        </p>
                      )}
                    </div>

                    {/* Rol del Usuario */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <ShieldCheckIcon className="h-5 w-5 text-gray-500 mr-2" />
                        Rol del Usuario
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {ROLES.map((role) => {
                          const Icon = role.icon;
                          const isSelected = selectedRole === role.id;
                          
                          return (
                            <label
                              key={role.id}
                              className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors ${
                                isSelected 
                                  ? role.selectedColor
                                  : 'border-gray-200 bg-white hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="radio"
                                {...register('role')}
                                value={role.id}
                                className="sr-only"
                              />
                              <div className="flex flex-col">
                                <div className="flex items-center justify-between">
                                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${role.color}`}>
                                    <Icon className="h-6 w-6" />
                                  </div>
                                  {isSelected && (
                                    <div className="shrink-0">
                                      <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                  )}
                                </div>
                                <div className="mt-4">
                                  <div className="text-sm font-medium text-gray-900">{role.name}</div>
                                  <div className="mt-1 text-sm text-gray-500">{role.description}</div>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      {errors.role && (
                        <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Footer con botones */}
                  <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-sm font-semibold leading-6 text-gray-900"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting && (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
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

export default UserFormModal;