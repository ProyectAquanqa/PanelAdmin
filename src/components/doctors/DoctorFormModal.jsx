import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ExclamationTriangleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDoctor, useUpdateDoctor, useGetDoctorById } from '../../hooks/useDoctors';
import { useGetAllSpecialties, useGetDoctorSpecialties } from '../../hooks/useDoctorSpecialties';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

// Componentes
import DoctorPersonalInfo from './DoctorPersonalInfo';
import DoctorProfessionalInfo from './DoctorProfessionalInfo';
import DoctorSpecialtiesSection from './DoctorSpecialtiesSection';
import FormActions from '../common/FormActions';

// Esquema de validación
const doctorSchema = z.object({
  first_name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  last_name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(8, 'Mínimo 8 caracteres')
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),
  cmp_number: z.string().min(5, 'Mínimo 5 caracteres').max(20, 'Máximo 20 caracteres'),
  phone: z.string().min(9, 'Teléfono inválido').optional().or(z.literal('')),
  contact_phone: z.string().min(9, 'Teléfono inválido').optional().or(z.literal('')),
  consultation_room: z.string().max(10, 'Máximo 10 caracteres').optional().or(z.literal('')),
  second_last_name: z.string().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
  doctor_type: z.enum(['PRIMARY', 'SPECIALIST'], {
    errorMap: () => ({ message: "Debe seleccionar un tipo de doctor." }),
  }).default('SPECIALIST'),
  is_external: z.boolean().default(false),
  can_refer: z.boolean().default(false),
  is_active: z.boolean().default(true),
  specialties: z.array(z.number()).min(1, 'Seleccione al menos una especialidad'),
  primary_specialty_id: z.number().nullable().optional(),
  id: z.number().optional()
});

// Agregar un componente de alerta para la disponibilidad
const AvailabilityAlert = ({ isEditing, doctorId }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  
  const handleNavigateToAvailability = () => {
    if (isEditing && doctorId) {
      navigate(`/doctors/availability/${doctorId}`);
    }
  };
  
  return (
    <div className={`mt-6 p-4 rounded-lg border ${
      isDark ? 'border-amber-500/30 bg-amber-900/20' : 'border-amber-200 bg-amber-50'
    }`}>
      <div className="flex">
        <ExclamationTriangleIcon className={`h-5 w-5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
            Recordatorio importante
          </h3>
          <div className={`mt-2 text-sm ${isDark ? 'text-amber-200' : 'text-amber-700'}`}>
            <p>
              {isEditing 
                ? 'Recuerde configurar los horarios de disponibilidad del doctor para que pueda recibir citas.'
                : 'Después de crear el doctor, deberá configurar sus horarios de disponibilidad para que pueda recibir citas.'}
            </p>
            {isEditing && doctorId && (
              <button
                type="button"
                onClick={handleNavigateToAvailability}
                className={`mt-3 inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                  isDark 
                    ? 'border-amber-500/50 text-amber-300 hover:bg-amber-900/30' 
                    : 'border-amber-300 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <CalendarDaysIcon className="w-4 h-4 mr-1" />
                Configurar horarios
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal para crear o editar un doctor
 */
function DoctorFormModal({ isOpen, onClose, doctor = null, onSuccess }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isEditing = !!doctor;
  const [isLoading, setIsLoading] = useState(false);
  
  // Obtener datos del doctor si estamos editando
  const { 
    data: doctorDetails, 
    isLoading: loadingDoctorDetails 
  } = useGetDoctorById(doctor?.id, { 
    enabled: isEditing && !!doctor?.id 
  });

  // Obtener todas las especialidades disponibles
  const { 
    data: specialtiesData, 
    isLoading: loadingSpecialties, 
    error: specialtiesError,
    refetch: refetchSpecialties
  } = useGetAllSpecialties();

  // Obtener especialidades del doctor si estamos editando
  const {
    data: doctorSpecialtiesData,
    isLoading: loadingDoctorSpecialties,
    refetch: refetchDoctorSpecialties
  } = useGetDoctorSpecialties(doctor?.id);

  // Hooks para crear/actualizar doctor
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();

  // React Hook Form
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
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
      is_active: true,
      specialties: [],
      primary_specialty_id: null,
    }
  });

  // Observar especialidades seleccionadas
  const selectedSpecialties = watch('specialties') || [];

  // Debug: Mostrar información sobre especialidades
  useEffect(() => {
    console.log('🔍 DEBUG DOCTOR FORM:');
    console.log('Especialidades disponibles:', specialtiesData?.results);
    console.log('Especialidades del doctor:', doctorSpecialtiesData);
    console.log('Especialidades seleccionadas:', selectedSpecialties);
    
    // Verificar si hay discrepancias entre las especialidades del doctor y las seleccionadas
    if (doctorSpecialtiesData?.ids && selectedSpecialties.length > 0) {
      const missingIds = doctorSpecialtiesData.ids.filter(id => !selectedSpecialties.includes(id));
      const extraIds = selectedSpecialties.filter(id => !doctorSpecialtiesData.ids.includes(id));
      
      if (missingIds.length > 0) {
        console.warn('⚠️ Especialidades del doctor que no están seleccionadas:', missingIds);
      }
      
      if (extraIds.length > 0) {
        console.warn('⚠️ Especialidades seleccionadas que no están en el doctor:', extraIds);
      }
    }
  }, [specialtiesData, doctorSpecialtiesData, selectedSpecialties]);

  // Cargar datos del doctor para edición
  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      
      // Si tenemos datos detallados del doctor, usarlos
      const doctorData = doctorDetails || doctor;
      
      if (doctorData) {
        // Cargar datos básicos del doctor
      const formData = {
          first_name: doctorData.first_name || '',
          last_name: doctorData.last_name || '',
          email: doctorData.user?.email || doctorData.email || '',
          cmp_number: doctorData.cmp_number || doctorData.license_number || '',
          phone: doctorData.phone || '',
          contact_phone: doctorData.contact_phone || '',
          consultation_room: doctorData.consultation_room || '',
          second_last_name: doctorData.second_last_name || '',
          doctor_type: doctorData.doctor_type || 'SPECIALIST',
          is_external: Boolean(doctorData.is_external),
          can_refer: Boolean(doctorData.can_refer),
          is_active: doctorData.is_active !== undefined ? Boolean(doctorData.is_active) : true,
          id: doctorData.id
        };
        
        // Establecer datos básicos
      Object.entries(formData).forEach(([key, value]) => {
        setValue(key, value);
      });
      }
      
      setIsLoading(false);
    } else {
      // Para nuevo doctor, resetear el formulario
      reset();
    }
  }, [doctor, doctorDetails, isEditing, setValue, reset]);

  // Cargar especialidades del doctor
  useEffect(() => {
    // Se ejecuta al editar y cuando tanto las especialidades del doctor como las disponibles se han cargado.
    if (isEditing && doctorSpecialtiesData?.ids && specialtiesData?.results) {
      console.log('🔄 Cargando y validando especialidades del doctor:', {
        doctorSpecialties: doctorSpecialtiesData.ids,
        availableSpecialties: specialtiesData.results.map(s => s.id)
      });
      
      // Los IDs ya vienen procesados desde el hook useGetDoctorSpecialties.
      const doctorSpecialtyIds = doctorSpecialtiesData.ids
        .map(id => parseInt(id, 10))
        .filter(id => !isNaN(id));
      
      const availableIds = specialtiesData.results.map(s => parseInt(s.id, 10));
      
      // Filtrar los IDs del doctor para asegurar que están en la lista de disponibles.
      const validIds = doctorSpecialtyIds.filter(id => availableIds.includes(id));
      
      if (validIds.length !== doctorSpecialtyIds.length) {
        console.warn('⚠️ Algunos IDs de especialidades del doctor no están en la lista de especialidades disponibles:', {
          doctorIds: doctorSpecialtyIds,
          availableIds,
          invalidIds: doctorSpecialtyIds.filter(id => !availableIds.includes(id))
        });
      }
      
      console.log('✅ IDs de especialidades validados para el formulario:', validIds);
      setValue('specialties', validIds, { shouldValidate: true });
    }
  }, [isEditing, doctorSpecialtiesData, specialtiesData, setValue]);

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    try {
      // Validar especialidades
      if (!data.specialties?.length) {
        toast.error('Debe seleccionar al menos una especialidad');
        return;
      }

      // Preparar datos
      const doctorData = {
        ...data,
        // Solo incluir password si se está creando o si se ha modificado
        password: isEditing ? undefined : data.password,
        id: isEditing ? doctor.id : undefined
      };

      // Eliminar campos vacíos
      Object.keys(doctorData).forEach(key => {
        if (doctorData[key] === '') {
          delete doctorData[key];
        }
      });

      console.log('Enviando datos del doctor:', doctorData);

      // Crear o actualizar doctor
      const mutation = isEditing ? updateDoctor : createDoctor;
      const response = await mutation.mutateAsync(doctorData);
      
      // Refrescar datos de especialidades
      if (isEditing) {
        await refetchDoctorSpecialties();
      }
      
      toast.success(
        isEditing 
          ? 'Doctor actualizado correctamente' 
          : 'Doctor creado correctamente'
      );
      
      // Mostrar mensaje sobre la configuración de disponibilidad
      toast.success(
        isEditing
          ? 'Recuerde configurar la disponibilidad del doctor'
          : 'Doctor creado. Ahora puede configurar su disponibilidad',
        { duration: 5000 }
      );
      
      onSuccess?.();
      onClose();
      reset();
    } catch (error) {
      console.error('Error al guardar doctor:', error);
      
      // Manejar errores específicos
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.specialties) {
          toast.error(`Error en especialidades: ${Array.isArray(errorData.specialties) 
            ? errorData.specialties[0] 
            : errorData.specialties}`);
        } else if (errorData.email) {
          toast.error(`Email: ${errorData.email}`);
        } else if (errorData.detail) {
          toast.error(errorData.detail);
        } else {
          toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} doctor`);
        }
      } else {
        toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} doctor: ${error.message || 'Intente nuevamente'}`);
      }
    }
  };

  // Manejar selección de especialidad
  const handleSpecialtyToggle = (specialtyId) => {
    const currentSpecialties = selectedSpecialties || [];
    let newSpecialties;
    
    if (currentSpecialties.includes(specialtyId)) {
      // Quitar especialidad si ya está seleccionada
      newSpecialties = currentSpecialties.filter(id => id !== specialtyId);
    } else {
      // Agregar especialidad si no está seleccionada
      newSpecialties = [...currentSpecialties, specialtyId];
    }
    
    setValue('specialties', newSpecialties, { shouldValidate: true });
  };

  // Mostrar error si no se pudieron cargar las especialidades
  useEffect(() => {
    if (specialtiesError) {
      toast.error('No se pudieron cargar las especialidades. Intente nuevamente.');
    }
  }, [specialtiesError]);

  // Determinar si estamos cargando datos
  const isLoadingData = isLoading || loadingDoctorDetails || loadingDoctorSpecialties;

  const handleClose = () => {
    reset();
    onClose();
  };

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
          <div className="fixed inset-0 bg-black bg-opacity-60" />
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
              <Dialog.Panel className={`w-full max-w-4xl transform rounded-2xl ${isDark ? 'bg-neutral-900' : 'bg-gray-50'} text-left align-middle shadow-xl transition-all flex flex-col`}>
                <div className={`sticky top-0 z-10 px-6 py-4 border-b ${isDark ? 'border-neutral-800 bg-neutral-900' : 'border-gray-200 bg-white'} rounded-t-2xl`}>
                  <Dialog.Title as="h3" className={`text-xl font-bold leading-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {isEditing ? 'Editar Doctor' : 'Crear Nuevo Doctor'}
                  </Dialog.Title>
                  <p className={`mt-1 text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                    {isEditing ? 'Actualice la información del doctor.' : 'Complete el formulario para añadir un nuevo doctor.'}
                  </p>
                  <button
                    type="button"
                    className={`absolute top-4 right-4 p-2 rounded-full ${isDark ? 'text-gray-400 hover:bg-neutral-700' : 'text-gray-400 hover:bg-gray-100'}`}
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="px-6 py-6 space-y-8">
                      <DoctorPersonalInfo register={register} errors={errors} isDark={isDark} />
                      <DoctorProfessionalInfo register={register} errors={errors} control={control} isDark={isDark} />
                      <DoctorSpecialtiesSection
                        selectedSpecialties={selectedSpecialties}
                        specialtiesData={specialtiesData}
                        handleSpecialtyToggle={handleSpecialtyToggle}
                        loadingSpecialties={loadingSpecialties}
                        specialtiesError={specialtiesError}
                        isDark={isDark}
                        watch={watch}
                        setValue={setValue}
                      />
                      <AvailabilityAlert isEditing={isEditing} doctorId={doctor?.id} />
                    </div>
                    
                    <div className={`sticky bottom-0 z-10 px-6 py-4 border-t ${isDark ? 'border-neutral-800 bg-neutral-900' : 'border-gray-200 bg-white'} rounded-b-2xl`}>
                      <FormActions
                        isSubmitting={isSubmitting || isLoading}
                        onCancel={handleClose}
                        isEditing={isEditing}
                        isDark={isDark}
                        createText="Crear Doctor"
                        saveText="Guardar Cambios"
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

export default DoctorFormModal;
