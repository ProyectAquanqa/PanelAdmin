import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUser, useUpdateUser } from '../../hooks/useUsers';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import FormActions from '../common/FormActions';
import UserAuthInfoSection from './UserAuthInfoSection';
import UserRoleSelector from './UserRoleSelector';

// Esquema de validación dinámico y simplificado
const createUserSchema = (isEditing = false) => z.object({
  dni: z.string()
    .length(8, 'El DNI debe tener 8 dígitos.')
    .regex(/^\d{8}$/, 'El DNI solo debe contener números.'),
  email: z.string().email('Email inválido').toLowerCase(),
  password: isEditing 
    ? z.string().optional().or(z.literal(''))
    : z.string().min(8, 'Mínimo 8 caracteres'),
  role: z.enum(['ADMIN', 'RECEPTIONIST'], {
    errorMap: () => ({ message: 'Debe seleccionar un rol válido.' })
  }),
  is_active: z.boolean().optional(),
});

function UserFormModal({ isOpen, onClose, user = null }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isEditing = !!user;
  
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset,
    setValue,
    control
  } = useForm({
    resolver: zodResolver(createUserSchema(isEditing)),
    defaultValues: {
      dni: '',
      email: '',
      password: '',
      role: 'RECEPTIONIST',
      is_active: true,
    }
  });

  useEffect(() => {
    if (isEditing && user) {
      setValue('dni', user.dni || '');
      setValue('email', user.email || '');
      setValue('role', user.role || 'RECEPTIONIST');
      setValue('is_active', user.is_active ?? true);
      setValue('password', '');
    } else {
      reset({
        dni: '',
        email: '',
        password: '',
        role: 'RECEPTIONIST',
        is_active: true,
      });
    }
  }, [user, isEditing, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      // Construimos el payload explícitamente para asegurar que todos los campos van
      const userData = {
        dni: data.dni,
        email: data.email,
        role: data.role,
        is_active: data.is_active,
      };

      // Si se está creando o se ha introducido una nueva contraseña, la añadimos
      if (!isEditing || (isEditing && data.password)) {
        userData.password = data.password;
      }
      
      if (isEditing) {
        await updateUser.mutateAsync({ id: user.id, data: userData });
        toast.success('Usuario actualizado exitosamente');
      } else {
        await createUser.mutateAsync(userData);
        toast.success('Usuario creado exitosamente');
      }
      handleClose();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.email?.[0] || 'Error al procesar la solicitud.';
      toast.error(errorMsg);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-60" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className={`w-full max-w-lg transform rounded-2xl ${isDark ? 'bg-neutral-900' : 'bg-gray-50'} text-left align-middle shadow-xl transition-all flex flex-col`}>
                <div className={`sticky top-0 z-10 px-6 py-4 border-b ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}>
                  <Dialog.Title as="h3" className={`text-xl font-bold leading-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {isEditing ? 'Editar Usuario de Sistema' : 'Crear Nuevo Usuario de Sistema'}
                        </Dialog.Title>
                  <button type="button" className={`absolute top-4 right-4 p-2 rounded-full ${isDark ? 'text-gray-400 hover:bg-neutral-700' : 'text-gray-400 hover:bg-gray-100'}`} onClick={handleClose}>
                    <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="px-6 py-6 space-y-6">
                      <UserRoleSelector control={control} isDark={isDark} />
                      <UserAuthInfoSection register={register} errors={errors} control={control} isDark={isDark} isEditing={isEditing} />
                    </div>
                    <div className={`sticky bottom-0 z-10 px-6 py-4 border-t ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}>
                      <FormActions 
                        isSubmitting={isSubmitting} 
                        onCancel={handleClose} 
                        isEditing={isEditing} 
                        isDark={isDark}
                        createText="Crear Usuario"
                        saveText="Actualizar Usuario"
                      />
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

export default UserFormModal;