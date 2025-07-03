// ============================================================================
// 🏥 COMPONENTE: PatientFormModal - Modal Mejorado para Pacientes
// Modal con formulario completo para crear y editar pacientes
// ============================================================================

import React from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import PatientForm from './PatientForm';
import PatientEditForm from './PatientEditForm';

const PatientFormModal = ({ isOpen, onClose, patient = null, mode = 'view' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isEditing = mode === 'edit';

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Overlay de fondo */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Contenedor del modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`w-full max-w-3xl rounded-lg shadow-xl ${
          isDark ? 'bg-neutral-800 text-white' : 'bg-white text-gray-900'
        } p-6 overflow-y-auto max-h-[90vh]`}>
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold">
              {isEditing ? 'Editar Paciente' : 'Detalles del Paciente'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className={`rounded-full p-1 ${
                isDark 
                  ? 'hover:bg-neutral-700 text-neutral-300' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          {isEditing ? (
            <PatientEditForm patient={patient} onClose={onClose} />
          ) : (
            <PatientForm patient={patient} />
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PatientFormModal;