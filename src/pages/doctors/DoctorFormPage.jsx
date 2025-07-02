import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useCreateDoctor, useUpdateDoctor, useGetDoctorById } from '../../hooks/useDoctors';
import useMedicalSpecialties from '../../hooks/useMedicalSpecialties';
import { UserIcon, EnvelopeIcon, PhoneIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { debugSpecialties } from '../../services/doctor/doctorTransformService';

// Esquema de validación simplificado para pruebas
const doctorSchema = z.object({
  first_name: z.string().min(2, 'El nombre es requerido'),
  last_name: z.string().min(2, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
  cmp_number: z.string().optional(),
  phone: z.string().optional(),
  specialties: z.array(z.number()).min(1, 'Debe seleccionar al menos una especialidad'),
  doctor_type: z.string().optional(),
  is_active: z.boolean().optional(),
});

function DoctorFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const { doctor, isLoading: loadingDoctor } = useGetDoctorById(id, { enabled: isEditing });
  const { specialties, isLoading: loadingSpecialties } = useMedicalSpecialties();
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      cmp_number: '',
      phone: '',
      specialties: [],
      doctor_type: 'SPECIALIST',
      is_active: true,
    }
  });
  
  // Establecer valores iniciales cuando se carga el doctor
  useEffect(() => {
    if (isEditing && doctor) {
      console.log('🔄 Cargando datos del doctor:', doctor);
      
      // Depurar especialidades
      debugSpecialties(doctor.specialties);
      
      setValue('first_name', doctor.first_name || '');
      setValue('last_name', doctor.last_name || '');
      setValue('email', doctor.user?.email || doctor.email || '');
      setValue('cmp_number', doctor.cmp_number || '');
      setValue('phone', doctor.phone || '');
      setValue('doctor_type', doctor.doctor_type || 'SPECIALIST');
      setValue('is_active', doctor.is_active !== undefined ? Boolean(doctor.is_active) : true);
      
      // Procesar especialidades
      if (doctor.specialties) {
        let specialtyIds = [];
        
        if (Array.isArray(doctor.specialties)) {
          specialtyIds = doctor.specialties.map(spec => {
            // Si es un objeto con id
            if (typeof spec === 'object' && spec.id) {
              return spec.id;
            }
            // Si es un objeto con specialty anidado
            if (typeof spec === 'object' && spec.specialty) {
              if (typeof spec.specialty === 'object') {
                return spec.specialty.id;
              } else {
                return spec.specialty;
              }
            }
            // Si es un objeto con specialty_id
            if (typeof spec === 'object' && spec.specialty_id) {
              return spec.specialty_id;
            }
            // Si ya es un número
            if (typeof spec === 'number') {
              return spec;
            }
            // Si es string que parece número
            if (typeof spec === 'string' && /^\d+$/.test(spec)) {
              return parseInt(spec, 10);
            }
            return null;
          }).filter(Boolean);
        }
        
        console.log('✅ Especialidades procesadas:', specialtyIds);
        setValue('specialties', specialtyIds);
      }
    }
  }, [doctor, isEditing, setValue]);
  
  const onSubmit = async (data) => {
    try {
      console.log('📝 Datos del formulario:', data);
      
      if (isEditing) {
        await updateDoctor.mutateAsync({ id, data });
        toast.success('Doctor actualizado correctamente');
      } else {
        await createDoctor.mutateAsync(data);
        toast.success('Doctor creado correctamente');
      }
      
      navigate('/doctors');
    } catch (error) {
      console.error('❌ Error:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log('📋 Detalles del error:', errorData);
        
        // Mostrar errores específicos
        Object.entries(errorData).forEach(([field, errors]) => {
          const errorMsg = Array.isArray(errors) ? errors[0] : errors;
          toast.error(`${field}: ${errorMsg}`);
        });
      } else {
        toast.error(error.message || 'Error al procesar el formulario');
      }
    }
  };
  
  // Manejar cambios en especialidades
  const handleSpecialtyToggle = (specialtyId) => {
    const currentSpecialties = watch('specialties') || [];
    const isSelected = currentSpecialties.includes(specialtyId);
    
    if (isSelected) {
      // Quitar especialidad
      setValue('specialties', currentSpecialties.filter(id => id !== specialtyId));
    } else {
      // Agregar especialidad
      setValue('specialties', [...currentSpecialties, specialtyId]);
    }
  };
  
  if (loadingDoctor && isEditing) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-pulse">Cargando datos del doctor...</div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {isEditing ? 'Editar Doctor' : 'Crear Nuevo Doctor'}
      </h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información Personal */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="flex items-center text-lg font-medium mb-4">
            <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
            Información Personal
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Apellidos *
              </label>
              <input
                type="text"
                {...register('last_name')}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Ej: García López"
              />
              {errors.last_name && (
                <p className="mt-1 text-xs text-red-600">{errors.last_name.message}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Información de Contacto */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="flex items-center text-lg font-medium mb-4">
            <EnvelopeIcon className="h-5 w-5 mr-2 text-blue-600" />
            Información de Contacto
          </h2>
          
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
                <input
                  type="password"
                  {...register('password')}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Mínimo 8 caracteres"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  {...register('phone')}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ej: 955123456"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CMP
              </label>
              <div className="relative">
                <AcademicCapIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  {...register('cmp_number')}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ej: 12345"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Especialidades */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="flex items-center text-lg font-medium mb-4">
            <AcademicCapIcon className="h-5 w-5 mr-2 text-blue-600" />
            Especialidades *
          </h2>
          
          {loadingSpecialties ? (
            <div className="py-4 text-center">
              <div className="animate-pulse">Cargando especialidades...</div>
            </div>
          ) : specialties?.results?.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {specialties.results.map((specialty) => {
                const specId = typeof specialty.id === 'string' 
                  ? parseInt(specialty.id, 10) 
                  : specialty.id;
                
                const isSelected = watch('specialties')?.includes(specId);
                
                return (
                  <div 
                    key={specId} 
                    onClick={() => handleSpecialtyToggle(specId)}
                    className={`
                      cursor-pointer rounded-lg p-2 border transition-colors
                      ${isSelected 
                        ? 'bg-blue-100 border-blue-300' 
                        : 'border-gray-200 hover:bg-gray-100'}
                    `}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label className="ml-2 text-sm font-medium">
                        {specialty.name || `Especialidad ${specId}`}
                      </label>
                    </div>
                    {specialty.description && (
                      <div className="ml-6 text-xs text-gray-500">
                        {specialty.description.substring(0, 60)}
                        {specialty.description.length > 60 ? '...' : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-4 text-center text-red-500">
              No se encontraron especialidades
            </div>
          )}
          
          {errors.specialties && (
            <p className="mt-2 text-xs text-red-600">{errors.specialties.message}</p>
          )}
        </div>
        
        {/* Botones */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/doctors')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={createDoctor.isLoading || updateDoctor.isLoading}
          >
            {createDoctor.isLoading || updateDoctor.isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DoctorFormPage; 