import { prepareUserDataForSubmit } from '../../services/user/userTransformService';

const userSchema = z.object({
  email: z.string().email('Ingrese un email válido'),
  role: z.string().min(1, 'Seleccione un rol'),
  password: isEditMode 
    ? z.string().optional() 
    : z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: isEditMode 
    ? z.string().optional() 
    : z.string().min(8, 'Confirme la contraseña'),
  first_name: z.string().min(2, 'Ingrese un nombre válido'),
  last_name: z.string().min(2, 'Ingrese un apellido válido'),
  dni: z.string().max(8, 'El DNI debe tener máximo 8 dígitos').optional(),
  is_active: z.boolean().optional()
}).refine(data => {
  if (!isEditMode || (data.password && data.password.length > 0)) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

<FormField
  label="DNI/Cédula"
  name="dni"
  register={register}
  error={errors.dni}
  maxLength={8}
/>

const onSubmit = async (formData) => {
  console.log('📤 Datos del usuario ANTES de enviar:', formData);
  
  try {
    setIsSubmitting(true);
    
    const { confirmPassword, ...userData } = formData;
    
    const preparedData = prepareUserDataForSubmit 
      ? prepareUserDataForSubmit(userData)
      : userData;
    
    let result;
    
    if (isEditMode && user) {
      if (!userData.password) {
        console.log('📝 Editando sin cambiar contraseña');
        const { password, ...dataWithoutPassword } = preparedData;
        result = await updateUser(user.id, dataWithoutPassword);
      } else {
        console.log('📝 Editando y cambiando contraseña');
        result = await updateUser(user.id, preparedData);
      }
      console.log('Usuario actualizado exitosamente:', result);
      toast.success('Usuario actualizado correctamente');
    } else {
      console.log('🚀 Creando nuevo usuario con contraseña');
      result = await createUser(preparedData);
      console.log('Usuario creado exitosamente:', result);
      toast.success('Usuario creado correctamente');
    }
    
    onClose();
    refetch();
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('📋 Datos del error completo:', error.response?.data || error);
    toast.error(error.response?.data?.detail || 'Error al procesar la solicitud');
  } finally {
    setIsSubmitting(false);
  }
}; 