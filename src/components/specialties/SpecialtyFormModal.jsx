import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  AcademicCapIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  TagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateSpecialty, useUpdateSpecialty } from '../../hooks/useSpecialties';
import { toast } from 'react-hot-toast';

// Esquema de validación
const specialtySchema = z.object({
  name: z.string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' }),
  description: z.string()
    .max(255, { message: 'La descripción no puede exceder 255 caracteres' })
    .optional(),
  consultation_price: z.coerce.number()
    .min(0, { message: 'El precio no puede ser negativo' })
    .optional(),
  discount_percentage: z.coerce.number()
    .min(0, { message: 'El descuento no puede ser negativo' })
    .max(100, { message: 'El descuento no puede exceder 100%' })
    .optional(),
  is_active: z.boolean().optional(),
  is_primary: z.boolean().optional(),
  requires_referral: z.boolean().optional()
});

function SpecialtyFormModal({ isOpen, onClose, specialty = null }) {
  const isEditing = !!specialty;
  const [isDirty, setIsDirty] = useState(false);
  
  const createSpecialty = useCreateSpecialty();
  const updateSpecialty = useUpdateSpecialty();

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting, dirtyFields }, 
    reset,
    setValue,
    watch,
    clearErrors
  } = useForm({
    resolver: zodResolver(specialtySchema),
    defaultValues: {
      name: '',
      description: '',
      consultation_price: 0,
      discount_percentage: 0,
    },
    mode: 'onChange' // Validación en tiempo real
  });

  // Watch para calcular precio final y detectar cambios
  const consultationPrice = watch('consultation_price');
  const discountPercentage = watch('discount_percentage');
  const formValues = watch();
  
  const finalPrice = (consultationPrice || 0) * (1 - (discountPercentage || 0) / 100);

  // Detectar si el formulario ha cambiado
  useEffect(() => {
    const hasChanges = Object.keys(dirtyFields).length > 0;
    setIsDirty(hasChanges);
  }, [dirtyFields]);

  // Cargar datos de la especialidad para edición
  useEffect(() => {
    if (isOpen) {
      if (isEditing && specialty) {
        // Cargar datos con un pequeño delay para asegurar que el modal esté abierto
        setTimeout(() => {
          setValue('name', specialty.name || '');
          setValue('description', specialty.description || '');
          setValue('consultation_price', parseFloat(specialty.consultation_price) || 0);
          setValue('discount_percentage', parseFloat(specialty.discount_percentage) || 0);
          setValue('is_active', specialty.is_active);
          clearErrors();
          setIsDirty(false);
        }, 100);
      } else {
        // Resetear formulario para nuevo registro
        reset({
          name: '',
          description: '',
          consultation_price: 0,
          discount_percentage: 0,
          is_active: true,
        });
        setIsDirty(false);
      }
    }
  }, [specialty, isEditing, isOpen, setValue, reset, clearErrors]);

  // Manejar cierre del modal con confirmación si hay cambios
  const handleClose = () => {
    if (isDirty && !isSubmitting) {
      if (window.confirm('¿Estás seguro? Los cambios no guardados se perderán.')) {
        onClose();
        setIsDirty(false);
      }
    } else {
      onClose();
      setIsDirty(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Preparar datos para enviar al servidor
      const specialtyData = {
        name: data.name.trim(),
        description: data.description.trim(),
        consultation_price: parseFloat(data.consultation_price),
        discount_percentage: parseFloat(data.discount_percentage) || 0,
        is_active: data.is_active,
      };
      
      console.log('📤 Datos a enviar:', specialtyData);
      
      if (isEditing) {
        await updateSpecialty.mutateAsync({ 
          id: specialty.id, 
          data: specialtyData 
        });
        toast.success('✅ Especialidad actualizada exitosamente', {
          duration: 4000,
          position: 'top-right',
        });
      } else {
        await createSpecialty.mutateAsync(specialtyData);
        toast.success('✅ Especialidad creada exitosamente', {
          duration: 4000,
          position: 'top-right',
        });
      }
      
      onClose();
      setIsDirty(false);
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      
      // Manejo mejorado de errores
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log('📋 Error completo del servidor:', errorData);
        
        if (errorData.name) {
          const nameError = Array.isArray(errorData.name) ? errorData.name[0] : errorData.name;
          toast.error(`Error en el nombre: ${nameError}`);
        } else if (errorData.consultation_price) {
          const priceError = Array.isArray(errorData.consultation_price) ? errorData.consultation_price[0] : errorData.consultation_price;
          toast.error(`Error en el precio: ${priceError}`);
        } else if (errorData.detail) {
          toast.error(errorData.detail);
        } else if (errorData.non_field_errors) {
          toast.error(errorData.non_field_errors[0] || 'Error de validación');
        } else {
          // Mostrar todos los errores
          const allErrors = Object.entries(errorData)
            .map(([field, errors]) => {
              const errorMsg = Array.isArray(errors) ? errors[0] : errors;
              return `${field}: ${errorMsg}`;
            })
            .join('\n');
          toast.error(`Errores de validación:\n${allErrors}`);
        }
      } else if (error.code === 'NETWORK_ERROR') {
        toast.error('Error de conexión. Verifica que el servidor esté funcionando.');
      } else {
        toast.error(error.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la especialidad`);
      }
    }
  };

  // Función para formatear el precio
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Componente para el interruptor de estado
  function ToggleSwitch({ label, description, enabled, setEnabled, register, name }) {
    return (
      <div
        onClick={() => setEnabled(!enabled)}
        className="flex items-center justify-between cursor-pointer p-4 rounded-lg hover:bg-gray-50"
      >
        <div>
          <h4 className="font-medium text-gray-800">{label}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            enabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </div>
        <input type="checkbox" {...register(name)} checked={enabled} className="hidden" />
      </div>
    );
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                {/* Header mejorado */}
                <div className="bg-gradient-to-r from-[#033662] to-[#044b88] px-6 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full bg-white/20 p-2">
                        <AcademicCapIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-semibold text-white">
                          {isEditing ? `Editar Especialidad` : 'Nueva Especialidad'}
                        </Dialog.Title>
                        <p className="text-blue-100 text-sm">
                          {isEditing 
                            ? `Actualiza la información de "${specialty?.name}"`
                            : 'Crea una nueva especialidad médica'
                          }
                        </p>
                      </div>
                    </div>
                    {/* Indicador de cambios no guardados */}
                    <div className="flex items-center space-x-2">
                      {isDirty && (
                        <div className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-100 text-xs px-2 py-1 rounded-full">
                          <ExclamationTriangleIcon className="h-3 w-3" />
                          <span>Sin guardar</span>
                        </div>
                      )}
                      <button
                        type="button"
                        className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
                        onClick={handleClose}
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div className="md:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Especialidad *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          className={`block w-full pl-10 pr-3 py-3 border rounded-lg transition-all ${
                            errors.name 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                              : dirtyFields.name
                              ? 'border-green-300 focus:ring-[#033662] focus:border-[#033662] bg-green-50'
                              : 'border-gray-300 focus:ring-[#033662] focus:border-[#033662]'
                          }`}
                          placeholder="Ej: Cardiología, Neurología, Pediatría..."
                          {...register('name')}
                        />
                        {dirtyFields.name && !errors.name && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          </div>
                        )}
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Precio de Consulta */}
                    <div>
                      <label htmlFor="consultation_price" className="block text-sm font-medium text-gray-700 mb-2">
                        Precio de Consulta (S/) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id="consultation_price"
                          step="0.01"
                          min="0"
                          className={`block w-full pl-10 pr-3 py-3 border rounded-lg transition-all ${
                            errors.consultation_price 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                              : dirtyFields.consultation_price
                              ? 'border-green-300 focus:ring-[#033662] focus:border-[#033662] bg-green-50'
                              : 'border-gray-300 focus:ring-[#033662] focus:border-[#033662]'
                          }`}
                          placeholder="150.00"
                          {...register('consultation_price', { valueAsNumber: true })}
                        />
                        {dirtyFields.consultation_price && !errors.consultation_price && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          </div>
                        )}
                      </div>
                      {errors.consultation_price && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          {errors.consultation_price.message}
                        </p>
                      )}
                    </div>

                    {/* Descuento */}
                    <div>
                      <label htmlFor="discount_percentage" className="block text-sm font-medium text-gray-700 mb-2">
                        Descuento (%) <span className="text-gray-500">- Opcional</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <TagIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id="discount_percentage"
                          step="0.01"
                          min="0"
                          max="100"
                          className={`block w-full pl-10 pr-3 py-3 border rounded-lg transition-all ${
                            errors.discount_percentage 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                              : dirtyFields.discount_percentage
                              ? 'border-green-300 focus:ring-[#033662] focus:border-[#033662] bg-green-50'
                              : 'border-gray-300 focus:ring-[#033662] focus:border-[#033662]'
                          }`}
                          placeholder="10.00"
                          {...register('discount_percentage', { valueAsNumber: true })}
                        />
                        {dirtyFields.discount_percentage && !errors.discount_percentage && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          </div>
                        )}
                      </div>
                      {errors.discount_percentage && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          {errors.discount_percentage.message}
                        </p>
                      )}
                    </div>

                    {/* Precio Final (Calculado) - Versión mejorada */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resumen de Precios
                      </label>
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Precio Base</div>
                            <div className="text-lg font-semibold text-gray-700">
                              {formatCurrency(consultationPrice)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Descuento</div>
                            <div className="text-lg font-semibold text-orange-600">
                              {discountPercentage || 0}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Ahorro</div>
                            <div className="text-lg font-semibold text-green-600">
                              -{formatCurrency((consultationPrice || 0) * ((discountPercentage || 0) / 100))}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Precio Final</div>
                            <div className="text-xl font-bold text-[#033662]">
                              {formatCurrency(finalPrice)}
                            </div>
                          </div>
                        </div>
                        {discountPercentage > 0 && (
                          <div className="mt-3 text-xs text-gray-600 text-center">
                            El paciente pagará {formatCurrency(finalPrice)} en lugar de {formatCurrency(consultationPrice)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción *
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                          id="description"
                          rows={4}
                          className={`block w-full pl-10 pr-3 py-3 border rounded-lg transition-all resize-none ${
                            errors.description 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                              : dirtyFields.description
                              ? 'border-green-300 focus:ring-[#033662] focus:border-[#033662] bg-green-50'
                              : 'border-gray-300 focus:ring-[#033662] focus:border-[#033662]'
                          }`}
                          placeholder="Describe brevemente esta especialidad médica. Incluye los tipos de condiciones que trata, procedimientos que realiza, etc."
                          {...register('description')}
                        ></textarea>
                        {dirtyFields.description && !errors.description && (
                          <div className="absolute top-3 right-3 flex items-start">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          </div>
                        )}
                      </div>
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          {errors.description.message}
                        </p>
                      )}
                      <div className="mt-1 text-xs text-gray-500">
                        {watch('description')?.length || 0}/255 caracteres
                      </div>
                    </div>

                    {/* Sección de Configuración Adicional */}
                    {isEditing && (
                      <div className="mt-6 border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900">Configuraciones Adicionales</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Controla el estado y comportamiento de la especialidad.
                        </p>
                        <div className="mt-4 space-y-2">
                           <ToggleSwitch
                            label="Especialidad Activa"
                            description="Si está inactiva, no se podrá usar para nuevas citas."
                            enabled={watch('is_active')}
                            setEnabled={(value) => setValue('is_active', value, { shouldDirty: true })}
                            register={register}
                            name="is_active"
                           />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer mejorado */}
                  <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#033662] disabled:opacity-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || Object.keys(errors).length > 0}
                      className="w-full sm:w-auto px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#033662] to-[#044b88] rounded-lg hover:from-[#022a52] hover:to-[#033d73] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#033662] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>{isEditing ? 'Actualizando...' : 'Creando...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{isEditing ? 'Actualizar Especialidad' : 'Crear Especialidad'}</span>
                          {isDirty && <span className="text-xs">(Hay cambios)</span>}
                        </>
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

export default SpecialtyFormModal;