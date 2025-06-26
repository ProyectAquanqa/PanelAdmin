// ============================================================================
// 🏥 COMPONENTE: PatientFormModal - Modal Mejorado para Pacientes
// Modal con formulario completo para crear y editar pacientes
// ============================================================================

import React, { useRef, useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import PatientForm from './PatientForm';
import { useCreatePatient, useUpdatePatient } from '../../hooks/usePatients';
import { toast } from 'react-hot-toast';

const PatientFormModal = ({ isOpen, onClose, patient = null }) => {
  const { theme } = useTheme();
  const formRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mutations
  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  
  // Estado para controlar si estamos en modo edición
  const isEditing = Boolean(patient?.id);
  
  useEffect(() => {
    // Reiniciar estado al abrir/cerrar el modal
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      console.log(`🔄 PatientFormModal: ${isEditing ? 'Actualizando' : 'Creando'} paciente con datos:`, formData);
      
      // Validar datos básicos
      if (!formData.first_name || !formData.last_name) {
        throw new Error('Los nombres y apellidos son obligatorios');
      }
      
      if (isEditing) {
        if (!patient?.id) {
          throw new Error('ID de paciente no disponible para actualización');
        }
        
        // Preparar datos para actualización
        const updateData = {
          ...formData,
          id: patient.id,
          // Mantener el estado presencial original si no se modifica
          is_presential: formData.is_presential ?? patient.is_presential
        };
        
        // Si es presencial, asegurar que no se envían credenciales
        if (updateData.is_presential) {
          delete updateData.email;
          delete updateData.password;
        }
        
        // Limpiar campos vacíos o nulos
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === '' || updateData[key] === null || updateData[key] === undefined) {
            delete updateData[key];
          }
        });
        
        console.log(`🔄 Enviando actualización para paciente ID: ${patient.id}`, updateData);
        const updatedPatient = await updatePatientMutation.mutateAsync({
          id: patient.id,
          data: updateData
        });
        
        console.log('✅ Paciente actualizado:', updatedPatient);
        toast.success('Paciente actualizado correctamente');
        onClose(); // Cerrar el modal después de éxito
      } else {
        const newPatient = await createPatientMutation.mutateAsync(formData);
        console.log('✅ Paciente creado:', newPatient);
        toast.success('Paciente creado correctamente');
        onClose(); // Cerrar el modal después de éxito
      }
      
    } catch (error) {
      console.error(`❌ Error al ${isEditing ? 'actualizar' : 'crear'} paciente:`, error);
      
      // Mejorar el mensaje de error
      let errorMessage = error.response?.data?.detail || 
                        error.response?.data?.email?.[0] || 
                        error.message || 
                        'Ha ocurrido un error inesperado';
      
      // Manejar errores específicos
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Buscar el primer error en cualquier campo
          for (const field in errorData) {
            const fieldError = errorData[field];
            if (Array.isArray(fieldError) && fieldError.length > 0) {
              errorMessage = `${field}: ${fieldError[0]}`;
              break;
            } else if (typeof fieldError === 'string') {
              errorMessage = `${field}: ${fieldError}`;
              break;
            }
          }
        }
      }
      
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => !isSubmitting && onClose()}
      className="relative z-50"
    >
      {/* Overlay de fondo */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Contenedor del modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`w-full max-w-3xl rounded-lg shadow-xl ${
          theme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-white text-gray-900'
        } p-6 overflow-y-auto max-h-[90vh]`}>
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold">
              {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
            </Dialog.Title>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className={`rounded-full p-1 ${
                theme === 'dark' 
                  ? 'hover:bg-neutral-700 text-neutral-300' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <PatientForm
            ref={formRef}
            patient={patient}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PatientFormModal;