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
  UserGroupIcon
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
    resolver: zodResolver(createUserSchema(isEditing)), // Esquema dinámico
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      role: '',
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
      // NO cargar la contraseña al editar - dejar vacía
      setValue('password', '');
    } else {
      reset();
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nombre */}
                        <div>
                          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre *
                          </label>
                          <input
                            type="text"
                            id="first_name"
                            className={`block w-full pl-3 pr-3 py-2.5 border rounded-lg transition-colors ${
                              errors.first_name 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-[#033662] focus:border-[#033662]'
                            }`}
                            placeholder="Ingresa el nombre"
                            {...register('first_name')}
                          />
                          {errors.first_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                          )}
                        </div>

                        {/* Apellidos */}
                        <div>
                          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                            Apellidos *
                          </label>
                          <input
                            type="text"
                            id="last_name"
                            className={`block w-full pl-3 pr-3 py-2.5 border rounded-lg transition-colors ${
                              errors.last_name 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-[#033662] focus:border-[#033662]'
                            }`}
                            placeholder="Ingresa los apellidos"
                            {...register('last_name')}
                          />
                          {errors.last_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Información de Contacto */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <EnvelopeIcon className="h-5 w-5 text-gray-500 mr-2" />
                        Información de Contacto
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email */}
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              id="email"
                              className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg transition-colors ${
                                errors.email 
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                  : 'border-gray-300 focus:ring-[#033662] focus:border-[#033662]'
                              }`}
                              placeholder="usuario@ejemplo.com"
                              {...register('email')}
                            />
                          </div>
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                          )}
                        </div>

                        {/* Teléfono */}
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <PhoneIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="tel"
                              id="phone"
                              className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg transition-colors ${
                                errors.phone 
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                  : 'border-gray-300 focus:ring-[#033662] focus:border-[#033662]'
                              }`}
                              placeholder="+51 999 999 999"
                              {...register('phone')}
                            />
                          </div>
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Contraseña */}
                      <div className="mt-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                          {isEditing ? (
                            <span className="flex items-center">
                              🔄 Cambiar Contraseña 
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Opcional
                              </span>
                            </span>
                          ) : (
                            <span className="flex items-center">
                              Contraseña 
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                Requerida
                              </span>
                            </span>
                          )}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IdentificationIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg transition-colors ${
                              errors.password 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-[#033662] focus:border-[#033662]'
                            }`}
                            placeholder={isEditing ? "Dejar vacío para mantener contraseña actual" : "Contraseña segura"}
                            {...register('password')}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
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
                        {!isEditing && (
                          <p className="mt-1 text-xs text-gray-500">
                            Mínimo 8 caracteres. Se recomienda incluir números y símbolos.
                          </p>
                        )}
                        {isEditing && (
                          <p className="mt-1 text-xs text-blue-600">
                            💡 Dejar en blanco para mantener la contraseña actual
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Rol del Usuario */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <ShieldCheckIcon className="h-5 w-5 text-gray-500 mr-2" />
                        Rol del Usuario
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {ROLES.map((role) => {
                          const IconComponent = role.icon;
                          const isSelected = selectedRole === role.id;
                          
                          return (
                            <div
                              key={role.id}
                              className={`
                                relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md
                                ${isSelected 
                                  ? role.selectedColor + ' shadow-md' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white'}
                              `}
                              onClick={() => {
                                setValue('role', role.id, { shouldValidate: true });
                                clearErrors('role');
                              }}
                            >
                              <div className="flex flex-col items-center text-center space-y-2">
                                <div className={`rounded-full p-3 ${isSelected ? role.color : 'bg-gray-100'}`}>
                                  <IconComponent className={`h-6 w-6 ${isSelected ? '' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{role.name}</h4>
                                  <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                                </div>
                                {isSelected && (
                                  <div className="absolute top-2 right-2">
                                    <div className="rounded-full bg-green-500 p-1">
                                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {errors.role && (
                        <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#033662] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#033662] to-[#044b88] rounded-lg hover:from-[#022a52] hover:to-[#033d73] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#033662] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <span>{isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}</span>
                      )}
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